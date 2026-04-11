/**
 * 自定义专题首页
 * @update yancai2
 * @mail yancai2@iflytek
 * @time 2017/7/13
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
    app.controller('listCtrl', [
        '$scope',
        '$q',
        '$timeout',
        'ngDialog',
        '$document',
        'dialogService',
        'winHeightService',
        'topicService',
        'customIndexService',
        'CONSTANT', function ($scope, $q, $timeout, ngDialog, $document, dialogService, winHeightService, topicService, customIndexService, CONSTANT) {
            $document.find('input').placeholder();
            $scope.addAuth = false; // 是否有新增权限
            $scope.delAuth = false; // 是否有删除权限
            var keywordObj = '';
            // 默认时间参数
            $scope.timesRange = {
                defaultStart: $scope.systemDate && $scope.systemDate != '${systemDate}' ? $.datepicker.formatDate('yy-mm-dd', new Date(new Date($scope.systemDate).getTime() - 6 * 24 * 3600 * 1000)) : $.datepicker.formatDate('yy-mm-dd', new Date(new Date().getTime() - 6 * 24 * 3600 * 1000)),
                defaultEnd: $scope.systemDate && $scope.systemDate != '${systemDate}' ? $scope.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date())
            };

            /**
             *  分页的的相关参数
             *  默认由directive 去控制，
             *  如果传入则使用controller 数据
             *  pageSize: 15,
             *  pageNum: 1
             */
            $scope.pageOptions = {
                pageNum: 1,
                pageSize: 15
            };
            // 默认全不选
            $scope.allchecked = false;

            // 获取专题列表
            $scope.getAnalysisList = function (paramsInit) {
                if (!$scope.validKeyWord(keywordObj)) {
                    return;
                }
                // 判断搜过框是否符合规范，为翻页同时搜索做处理
                var params = $.extend(params, {
                    keyword: keywordObj
                }, $scope.pageOptions);
                return topicService.findAllTopics(params)
                    .then(function (result) { // 正常返回结果
                        if (result) { // 错误返回时不做继续获取处理
                            $scope.allchecked = false;
                            $scope.topics = result.value.rows || [];
                            $scope.counts = result.value.totalRows || 0;
                            angular.forEach($scope.topics, function (topic) {
                                var topicCondition = eval('(' + topic.topicCondition + ')');
                                var screening = [];
                                angular.forEach(topicCondition, function (condition) {
                                    screening.push(condition.name + ':' + condition.inputValue);
                                });
                                topic.screening = screening.join(',');
                            });
                            if ($scope.topics.length) {
                                return $q.reject(result);
                            }

                            if ($scope.pageOptions.pageNum === 1 && result.value.totalRows === 0) {
                                return $q.reject(result);
                            }

                            return result;
                        }

                    }).then(function () {
                    $scope.pageOptions.pageNum = $scope.pageOptions.pageNum - 1;
                    if ($scope.pageOptions.pageNum > 0) {
                        $scope.getAnalysisList();
                    }
                    else {
                        $scope.pageOptions.pageNum = 1;
                    }
                });
            };

            /**
             * 搜索框监听Enter键
             *
             */
            $scope.enterKey = function (event) {
                event = event || window.event;
                if (event.keyCode == 13) {
                    keywordObj = $scope.keyword;
                    $scope.search();
                }

            };

            /**
             * 搜索功能, 在发起请求的时候， 重置 分页参数
             * @params: None
             *
             *
             **/
            $scope.search = function () {
                keywordObj = $scope.keyword;
                if (!$scope.validKeyWord(keywordObj)) {
                    return;
                }

                $scope.pageOptions.pageNum = 1;
                $scope.counts = 0;
                $scope.getAnalysisList();
            };

            // 校验搜索关键词规范
            $scope.validKeyWord = function (keyword) {
                if (keyword) {
                    if (keyword.replace(/[^\x00-\xff]/g, 'xx').length > 20) {
                        dialogService.alert('搜索字段不能超过20个字符');
                        return false;
                    }

                    if (CONSTANT.textReplace.test(keyword)) {
                        dialogService.alert('搜索字段不能包含特殊字符');
                        return false;
                    }
                }

                return true;
            };

            // 全选功能
            $scope.checkAll = function () {
                $scope.allchecked = !$scope.allchecked;
                angular.forEach($scope.topics, function (item) {
                    item.checked = $scope.allchecked;
                });
            };

            // 删除自定义首页相关模块
            $scope.deleteModuleFromHomePage = function (id) {
                return customIndexService.deleteModuleFromHomePage({moduleType: 4, moduleIds: id, moduleDetailInfo: ''});
            };

            // 删除专题
            $scope.remove = function (id, topicNames) {

                /*石勇 新增 删除最后一页的所有专题时，跳转至删除过后的最后一页*/
                if ($scope.pageOptions.pageNum == Math.ceil($scope.counts / $scope.pageOptions.pageSize) && $scope.allchecked) {
                    $scope.pageOptions.pageNum = $scope.pageOptions.pageNum - 1;
                }

                topicService.deleteTopics({topicId: id, topicNames: topicNames})
                    .then(function (result) {
                        $scope.getAnalysisList();
                        // 调用接口删除该专题下的所有自定义首页模块
                        $scope.deleteModuleFromHomePage(id);
                    });
            };

            // 批量删除
            $scope.batchRemove = function () {
                var ids = [];
                var topicNames = [];
                $.each($scope.topics, function (key, item) {
                    if (item.checked) {
                        ids.push(item.topicId);
                        topicNames.push(item.topicName);
                    }

                });
                if (ids.length) {
                    dialogService.confirm('关联的自定义数据概览同时删除，是否确定删除？')
                        .then(function () {
                            $scope.remove(ids.join(','), topicNames.join(','));
                        });
                }
                else {
                    dialogService.alert('至少选择一个专题');
                    return;
                }
            };

            // 单个删除
            $scope.oneRemove = function (id, topicName) {
                $('#opo-wrap_' + id).removeClass('hidden');
                dialogService.confirmTo('关联的自定义数据概览同时删除，是否确定删除？')
                    .then(function (value) {
                        $('#opo-wrap_' + id).addClass('hidden');
                        if (value) {
                            $scope.remove(id, topicName);
                        }

                    });
            };

            /***
             *
             *  选中单个
             */
            $scope.checkedThis = function (item) {
                if (!item.checked) {
                    $scope.allchecked = false;
                    return;
                }

                var allchecked = true;
                $.each($scope.topics, function (key, item) {
                    if (!item.checked) {
                        allchecked = false;
                        return false;
                    }

                });

                $scope.allchecked = allchecked;
            };

            /**
             * 获取选中的项
             */
            // $scope.getCheckedIds = function() {
            //     var deferred = $q.defer();
            //     $timeout(function() {
            //         var ids = [];
            //         var topicNames = []
            //         $.each($scope.topics, function(key, item) {
            //             if (item.checked) {
            //                 ids.push(item.topicId);
            //                 topicNames.push(item.topicName);
            //             }
            //         });
            //         if (ids.length) {
            //             deferred.resolve(ids,topicNames);
            //         } else {
            //             dialogService.alert('至少选择一个专题');
            //             deferred.reject(ids,topicNames);
            //         }
            //     });
            //     return deferred.promise;
            // }

            // 获取列表　
            $scope.getAnalysisList();

            // 初始化调用
            winHeightService.calculate();

            // 浏览器窗口大小改变
            angular.element(window).resize(function () {
                winHeightService.calculate();
            });

            // 监听表格渲染完成(列表有数据才会循环，才有判断)
            $scope.$on('colResizable', function (ngRepeatFinishedEvent) {
                winHeightService.calculate();
                // 浏览器窗口大小改变
                angular.element(window).resize(function () {
                    winHeightService.calculate();
                });
            });

            // 功能权限
            $scope.$watch('$parent.resources', function (newValue, oldValue) {
                if (!newValue) {
                    return;
                }

                angular.forEach(newValue, function (resource) {
                    if (resource.link === '/analysis') { // 专题
                        angular.forEach(resource.childRes, function (item) {
                            if (item.link === '/analysis.do') {
                                $scope.optAciton = item.optAction || [];
                                if ($.inArray('add', $scope.optAciton) > -1) {
                                    $scope.addAuth = true;
                                }

                                if ($.inArray('delete', $scope.optAciton) > -1) {
                                    $scope.delAuth = true;
                                }

                                return;
                            }

                        });
                        return;
                    }

                });
            });

            // 新增专题
            $scope.addTopic = function () {
                $scope.typeFrom = 'add';
                ngDialog.open({
                    id: 'onlineDialog',
                    template: 'analysis/detail/multi-dimensional-directive.htm',
                    controller: 'multiDimensionalCtrl',
                    scope: $scope,
                    showClose: false,
                    closeByEscape: false,
                    closeByDocument: false,
                    disableAnimation: true,
                    className: 'ngdialog-theme-default ngdialog-theme-model newTopic'
                }).closePromise.then(function (dialog) {
                    // 当弹出层关闭后，自动更新 维度对象
                    if (angular.isUndefined(dialog.value) || dialog.value == '$document') {
                        return;
                    }

                    window.location.href = '#/analysis/detail/' + dialog.value.topicId + '/0/1/0';
                });
            };
        }
    ]);

});
