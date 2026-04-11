/**
 * 系统首页热词分析
 */

(function (factory) {
    if (typeof define === 'function' && !!define.amd) {
        define([
            'app'
        ], factory);
    }
    else {
        factory(window.app);
    }
})(function (app) {
    app.directive('hotWord', ['$state', 'systemIndexService', function ($state, systemIndexService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'index/system/hot-word.htm',
            link: function ($scope, element, attrs) {

                $scope.maskShow = false;
                $scope.listChoosed = -1;

                $scope.hotWordTypes = [
                    {
                        name: '系统热词',
                        value: 'systemKwd'
                    },
                    {
                        name: '关注热词',
                        value: 'focusKwd'
                    }
                ];
                // 默认热词分析热词类型名称
                $scope.selectHotWordType = $scope.hotWordTypes[0].name;
                // 默认热词分析热词类型
                $scope.selectHotWordVal = $scope.hotWordTypes[0].value;

                // 表示变化率或是占比，range变化率，percent占比
                $scope.order = 'range';
                // 表示音频或词频，voice音频，kwd词频
                $scope.kwType = 'voice';
                // 热词类型下拉样式
                $scope.vocabularyShow = function () {
                    $scope.optionShowHotWord = !$scope.optionShowHotWord;
                };

                // 下拉列表选择
                $scope.vocabularySelect = function (item) {
                    $scope.selectHotWordType = item.name;
                    $scope.selectHotWordVal = item.value;
                    $scope.vocabularyShow();
                    $scope.initVocabularyList();
                };

                // 请求热词列表数据
                $scope.initVocabularyList = function () {
                    var params = {
                        wordType: $scope.selectHotWordVal,
                        orderType: $scope.order,
                        countType: $scope.kwType,
                        startTime: $scope.minusOneDay($scope.startTime.split(' ')[0]),
                        endTime: $scope.minusOneDay($scope.endTime.split(' ')[0]),
                        selectCenter: $scope.selectCenter,
                        centerFlag: $scope.centerFlag,
                        pageNum: 1,
                        pageSize: 10
                    };
                    systemIndexService.fetchHotWord(params)
                        .then(function (result) {
                            $scope.hotVocabularyList = result.value || [];
                        });
                };

                $scope.isTheSametime = function () {
                    $scope.isSametime = $scope.startTime.split(' ')[0] === $scope.endTime.split(' ')[0] ? true : false;
                };

                // 监听列表词汇删除
                $scope.$on('delVocabulary', function (event, data) {
                    systemIndexService.delHotWord({Word: data.keyword, black: true})
                        .then(function (result) {
                            $scope.initVocabularyList();
                        });
                });

                // 按占比、变化率、词频、音频进行排行
                $scope.toggle = function (order, kwType) {
                    $scope.order = order ? order : $scope.order;
                    $scope.kwType = kwType ? kwType : $scope.kwType;
                    $scope.initVocabularyList();
                };

                // 监听排序
                $scope.$on('rankShow', function (event, data) {
                    $scope.listChoosed = data.index;
                    var params = {
                        keyWord: data.keyword,
                        wordType: $scope.selectHotWordVal,
                        countType: $scope.kwType,
                        selectTime: $scope.selectTime.split(' ')[0],
                        // startTime: $scope.selectTime,
                        // endTime: $scope.selectTime,
                        selectCenter: $scope.selectCenter,
                        centerFlag: $scope.centerFlag
                    };
                    systemIndexService.fetchHistoryWord(params)
                        .then(function (result) {
                            $scope.rankList = result.value || [];
                            $scope.maskShow = true;
                        });
                });

                // 更多
                $scope.gotoMore = function () {
                    $state.go('main.analysis.hotword', {}, {
                        reload: true
                    });
                };

                // 关闭周排行窗口
                $scope.closeDialog = function () {
                    $scope.listChoosed = -1;
                    $scope.maskShow = false;
                };

                // 监听
                $scope.$on('hotWord', function (event, data) {
                    $scope.centerFlag = data.centerFlag;
                    $scope.startTime = data.startTime;
                    $scope.endTime = data.endTime;
                    $scope.selectCenter = data.selectCenter;
                    $scope.isTheSametime();
                    $scope.initVocabularyList();

                });

                $scope.minusOneDay = function (initDay) { // 对日期减一天处理,陈磊,2017/7/11
                    var pretime = initDay;
                    pretime.replace(/-/g, '/');
                    var pre = new Date(pretime);
                    var timeSecond = pre.getTime() - 24 * 3600 * 1000;
                    var now = new Date(timeSecond);
                    var year = now.getFullYear();
                    var month = now.getMonth() + 1;
                    var day = now.getDate();
                    if (month < 10) {
                        month = '0' + month;
                    }

                    if (day < 10) {
                        day = '0' + day;
                    }

                    var fullDay = year + '-' + month + '-' + day;
                    return fullDay;
                };

                // 点击页面其他地方关闭弹窗
                $(window.document).click(function (event) {
                    if (!angular.element(event.target).parents('.fr-hotword.index').length
                        && !angular.element(event.target).hasClass('picture-select-down')
                        && $scope.optionShowHotWord) {
                        $scope.optionShowHotWord = false;
                    }

                    $scope.$apply();
                });
            }
        };
    }]);
});
