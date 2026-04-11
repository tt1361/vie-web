/**
 * 热词配置
 *
 */
(function (factory) {
    if (typeof define === 'function' && !!define.amd) {
        define([
            'app',
            'echarts'
        ], factory);
    }
    else {
        factory(window.app);
    }
})(function (app) {

    app.controller('globalHotWordCtrl', [
        '$scope',
        '$timeout',
        '$document',
        'dialogService',
        'hotWordService', function ($scope, $timeout, $document, dialogService, hotWordService) {
            // 引入placeholder，解决ie8兼容问题
            $document.find('input').placeholder();
            // 用于接收全部白名单集合，因为搜索是前端做的模拟处理，没有跟后台数据交互
            $scope.whiteList_all = [];
            // 实际显示的满足搜索条件的白名单集合
            $scope.whiteList = [];
            // 用于接收全部黑名单集合，因为搜索是前端做的模拟处理，没有跟后台数据交互
            $scope.blackList_all = [];
            // 实际显示的满足搜索条件的黑名单集合
            $scope.blackList = [];
            // 白名单和黑名单的切换，0白名单，1黑名单，默认显示白名单
            $scope.showTab = 0;
            // 输入黑名单白名单的输入字符验证
            var textReplace = new RegExp('^[A-Za-z\\d\\u4E00-\\u9FA5]+$');

            // 校验搜索关键词规范
            $scope.validKeyWord = function (keyword) {
                if (keyword) {
                    // 匹配是否在20个字符内，一个中文作为两个字符
                    if (keyword.replace(/[^\x00-\xff]/g, 'xx').length > 20) {
                        dialogService.alert('搜索字段不能超过20个字符');
                        return false;
                    }
                    // 匹配是否满足输入字符的验证
                    if (!textReplace.test(keyword)) {
                        dialogService.alert('搜索字段不能包含特殊字符');
                        return false;
                    }
                }
                return true;
            };

            // 验证热词
            $scope.validHotWord = function (name) {
                if (!name) {
                    dialogService.alert('热词不能为空');
                    return false;
                }
                else {
                    if (name.replace(/[^\x00-\xff]/g, 'xx').length > 20) {
                        dialogService.alert('输入不能超过20个字符');
                        return false;
                    }

                    // 匹配是否满足输入字符的验证
                    if (!textReplace.test(name)) {
                        dialogService.alert('热词不能包含特殊字符');
                        return false;
                    }
                }
                return true;
            };

            // 切换tab,点击切换后搜索框与输入框置空
            $scope.changeTab = function (type) {
                $scope.showTab = type;
                $scope.keyName = '';
                $scope.keyWord = '';
                $scope.searchHotWord();
            };

            // 搜索框enter键
            $scope.enterSearchKey = function (event) {
                event = event || window.event;
                if (event.keyCode == 13) {
                    $scope.searchHotWord();
                }
            };

            // 搜索按钮
            $scope.searchHotWord = function () {
                // 如果是白名单传递参数isBlack为false,如果是黑名单传递参数isBlack为true
                if ($scope.showTab === 0) {
                    $scope.searchWord(false);
                }
                else {
                    $scope.searchWord(true);
                }
            };

            // 输入enter键
            $scope.submitHotKey = function (event) {
                event = event || window.event;
                // 监听enter键的code码
                if (event.keyCode == 13) {
                    // 输入字符的规则验证
                    if (!$scope.validHotWord($scope.keyWord)) {
                        return;
                    }
                    // 如果是白名单
                    if ($scope.showTab === 0) {
                        $scope.submitWord(false, $scope.whiteList_all, $scope.whiteList, $scope.blackList_all);
                    }
                    else {
                        $scope.submitWord(true, $scope.blackList_all, $scope.blackList, $scope.whiteList_all);
                    }
                }
            };

            // 获取热词
            $scope.searchWord = function (isBlack) {
                if (!$scope.validKeyWord($scope.keyName)) {
                    return;
                }
                hotWordService.searchWord({
                    wordName: '',
                    black: isBlack
                }).then(function (result) {
                    var searhList = result.value || [];
                    var realList = [];
                    if ($scope.keyName) {
                        angular.forEach(searhList, function (item) {
                            if (item.indexOf($scope.keyName) > -1) {
                                realList.push(item);
                            }
                        });
                    }
                    else {
                        realList = searhList;
                    }
                    if (isBlack) {
                        $scope.blackList = realList || [];
                        $scope.blackList_all = searhList || [];
                    }
                    else {
                        $scope.whiteList = realList || [];
                        $scope.whiteList_all = searhList || [];
                    }
                });
            };
            // 提交名单的验证以及确认处理
            $scope.submitWord = function (isBlack, list_all, list_ary, other_list_all) {
                if ($.inArray($scope.keyWord, list_all) > -1
                    || $.inArray($scope.keyWord, list_ary) > -1) {
                    var text = '该热词已经在白名单中，不能重复添加';
                    if (isBlack) {
                        text = '该热词已经在黑名单中，不能重复添加';
                    }
                    dialogService.alert(text);
                    return;
                }
                if ($.inArray($scope.keyWord, other_list_all) > -1) {
                    if (isBlack) {
                        dialogService.confirm('该词在白名单中存在，添加为黑名单则会被屏蔽，是否继续添加')
                            .then(function () {
                                $scope.saveWord(isBlack);
                            });
                    }
                    else {
                        dialogService.confirmTo('该词存在黑名单中，是否将其从黑名单中删除', '确认', '继续添加')
                            .then(function (value) {
                                if (value) {
                                    $scope.deleWord($scope.keyWord, true);
                                }
                                $scope.saveWord(isBlack);
                            });
                    }
                    return;
                }
                else {
                    $scope.saveWord(isBlack);
                }
            };

            // 保存热词
            $scope.saveWord = function (isBlack) {
                var params = {black: isBlack, Word: $scope.keyWord};
                hotWordService.saveWord(params).then(function (result) {
                    if (isBlack) {
                        $scope.blackList.push($scope.keyWord);
                    }
                    else {
                        $scope.whiteList.push($scope.keyWord);
                    }
                    $scope.keyWord = '';
                });
            };

            // 删除热词
            $scope.deleWord = function (name, isBlack) {
                hotWordService.deleteWord({
                    black: isBlack,
                    Word: name
                }).then(function (result) {
                    $scope.searchWord(isBlack);
                });
            };
            // 初始化获取所有白名单与黑名单
            $scope.searchWord(true);
            $scope.searchWord(false);
        }
    ]);
});
