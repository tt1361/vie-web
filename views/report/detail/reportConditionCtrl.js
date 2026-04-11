/**
 *  报表详情条件筛选区域
 *
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

    app.controller('reportConditionCtrl', [
        '$scope',
        '$document',
        '$timeout',
        'dimensionService',
        'baseService',
        '$rootScope', function ($scope, $document, $timeout, dimensionService, baseService, $rootScope) {
            $timeout(function () {
                $document.find('input').placeholder();
            }, 500);
            $scope.allChecked = true; // 默认未全选

            // 获取全部维度信息
            $scope.getAllDimInfos = function () {
                if (!baseService.validWord($scope.keyword)) {
                    return;
                }

                dimensionService.searchDim({keyword: '', isReport: 2})
                    .then(function (result) {
                        $scope.dimensions = result.value || [];
                        // 导入维度检测是否有已经选中的维度
                        angular.forEach($scope.dimensions, function (dimension) {
                            // 初始化　dimension
                            if (dimension.type === 'range' || dimension.type === 'timeRange') {
                                dimension.value = [];
                            }
                            else if (dimension.type === 'mulEqu') {
                                dimension.value = [];
                            }
                            else if (dimension.type === 'radio'
                                || dimension.type === 'timeDim'
                                || dimension.type === 'model') {
                                angular.forEach(dimension.value, function (item) {
                                    item.isSelect = false;
                                });
                            }
                            else if (dimension.type === 'mulSel') {
                                var values = dimension.value;
                                dimension.value = [];
                                angular.forEach(values, function (item) {
                                    var key = angular.isObject(item) ? item.key : item;
                                    dimension.value.push({
                                        key: key,
                                        value: key,
                                        isSelect: false
                                    });
                                });
                            }
                            else if (dimension.type === 'offLineTagId') {
                                angular.forEach(dimension.value, function (item) {
                                    item.isOpen = false;
                                    angular.forEach(item.value, function (i) {
                                        i.isSelect = false;
                                    });
                                });
                            }

                            angular.forEach($scope.$parent.conditionDimensions, function (condition) {
                                if (dimension.key === condition.key) {
                                    dimension.checked = true;
                                }

                            });

                            if ($scope.keyword && dimension.name.indexOf($scope.keyword) > -1) {
                                dimension.search = true;
                            }

                        });

                        angular.forEach($scope.dimensions, function (item) {
                            if (!item.checked) {
                                $scope.allChecked = false;
                            }

                        });
                    });
            };

            /**
            * 搜索框监听Enter键
            *
            */
            $scope.enterKey = function (event) {
                event = event || window.event;
                if (event.keyCode == 13) {
                    $scope.getAllDimInfos();
                }

            };

            $scope.searchDimFont = function () {
                $scope.getAllDimInfos();
            };

            // 全选按钮
            $scope.toggleAllChecked = function () {
                $scope.allChecked = !$scope.allChecked;
                if ($scope.allChecked) {
                    angular.forEach($scope.dimensions, function (item) {
                        item.checked = true;
                    });
                }
                else {
                    angular.forEach($scope.dimensions, function (item) {
                        item.checked = false;
                    });
                }

            };

            // 确定按钮
            $scope.pushedDimension = function () {

                var result = {
                    pushDim: []
                };

                // 石勇 新增 按任务分析，去除维度流水号，按录音分析去除任务号
                // $rootScope.isTask ,值为1，按任务，值为0 按录音
                if ($rootScope.isTask) {
                    angular.forEach($scope.dimensions, function (item, index) {
                        if (item.key == 'voiceId') {
                            $scope.dimensions.splice(index, 1);
                        }

                    });
                }
                else {
                    angular.forEach($scope.dimensions, function (item, index) {
                        if (item.key == 'taskId') {
                            $scope.dimensions.splice(index, 1);
                        }

                    });
                }
                // 

                angular.forEach($scope.dimensions, function (item) {
                    if (item.checked) {
                        result.pushDim.push(item);
                    }

                });

                $scope.closeThisDialog(result);
            };

            $scope.$on('colResizable', function (ngRepeatFinishedEvent) {
                var scrollTo = $document.find('.redFont').first();
                var container = $('.push-model-content .content-wrap');
                if (scrollTo.length) {
                    container.scrollTop(
                        scrollTo.offset().top - container.offset().top + container.scrollTop()
                    );
                }

            });

            $scope.getAllDimInfos();
        }
    ]);

});
