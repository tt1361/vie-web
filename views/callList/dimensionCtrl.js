/**
 * 本文件实现依赖任何一个 Angular 的module, 如果不采用本系统的框架，
 *      可以可以在  factory(window.app) app 修改你所创建的模块名称
 *  @dependece: Angular Module
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

    /**
     * 本controller 模型薪资区域
     *  @params:
     *      $http:  发送http 请求的service
     *      $scope: 双向绑定的媒介， 由 angular 自动实例化
     *
     *
     */

    app.controller('dimensionCtrl', [
        '$scope',
        '$document',
        '$timeout',
        'dimensionService',
        'baseService',
        '$rootScope', function ($scope, $document, $timeout, dimensionService, baseService, $rootScope) {
            $timeout(function () {
                $document.find('input').placeholder();
            }, 500);
            $scope.allChecked = true; // 默认全选
            // 获取全部维度信息
            $scope.searchDim = function () {
                if (!baseService.validWord($scope.keyword)) {
                    return;
                }

                if ($scope.tim === 1) {
                    var params = {keyword: '', reportTypeFlag: 1};
                }
                else {
                    var params = {
                        keyword: ''
                    };
                }
                dimensionService.searchDim(params)
                    .then(function (result) {
                        $scope.allDimensions = result.value || [];
                        $scope.dimensions = [];
                        // 通话列表展示维度
                        angular.forEach($scope.allDimensions, function (item) {
                            if (item.key === 'voiceId' || item.key === 'taskId') {
                                $scope.dimensions.push({
                                    key: item.key,
                                    name: item.name,
                                    checked: true,
                                    isSelect: true
                                });
                            }
                            else {
                                $scope.dimensions.push({
                                    key: item.key,
                                    name: item.name,
                                    checked: false
                                });
                            }
                        });
                        angular.forEach($scope.dimensions, function (item, index) {
                            if ($rootScope.isTask) {
                                if (item.key === 'voiceId') {
                                    $scope.dimensions.splice(index, 1);
                                }
                            }
                            else {
                                if (item.key === 'taskId') {
                                    $scope.dimensions.splice(index, 1);
                                }
                            }
                        });
                        // console.log("$scope.dimensions",$scope.dimensions)
                        // 导入维度检测是否有已经选中的维度
                        if ($rootScope.getData) {
                            angular.forEach($scope.dimensions, function (item) {
                                angular.forEach($rootScope.getData, function (items) {
                                    if (item.key === items.key) {
                                        item.checked = true;
                                    }

                                });
                            });
                        }

                        angular.forEach($scope.dimensions, function (item) {
                            if (!item.checked) {
                                $scope.allChecked = false;
                            }

                        });
                    });

            };

            /**
             * @brief 选择关键词显示
             * @details [long description]
             *
             * @param  [description]
             * @return [description]
             */
            $scope.chooseKeyWord = function (name) {
                var search = false;
                if ($scope.keyword && name.indexOf($scope.keyword) > -1) {
                    search = true;
                    $scope.dimensions.push($scope.contItem('keyword', name, true));
                }

                $scope.dimensions.push($scope.contItem('keyword', name, search));
            };

            /**
             * @brief 组合对象
             * @details [long description]
             *
             * @param e [description]
             * @param h [description]
             *
             * @return [description]
             */
            $scope.contItem = function (key, name, isSearch) {
                var item = {
                    key: key,
                    name: name,
                    checked: true,
                    isSelect: true,
                    search: isSearch
                };
                return item;
            };

            /**
            * 搜索框监听Enter键
            *
            */
            $scope.enterKey = function (event) {
                event = event || window.event;
                if (event.keyCode == 13) {
                    $scope.searchDimFont();
                }

            };

            $scope.searchDimFont = function () {

                /*石勇 新增 通话列表模块维度搜索时原搜索结果清空*/
                angular.forEach($scope.dimensions, function (dim) {
                    dim.search = false;
                });
                // 
                angular.forEach($scope.dimensions, function (item) {
                    if ($scope.keyword && item.name.indexOf($scope.keyword) > -1) {
                        item.search = true;
                    }

                });
            };

            // 全选按钮
            $scope.toggleAllChecked = function () {
                $scope.allChecked = !$scope.allChecked;
                if ($scope.allChecked) {
                    angular.forEach($scope.dimensions, function (item) {
                        item.checked = true;
                    });
                    return;
                }

                angular.forEach($scope.dimensions, function (item) {
                    item.checked = false;
                    if (item.key === 'voiceId') {
                        item.checked = true;
                    }

                    if (item.key === 'taskId') {
                        item.checked = true;
                    }

                });
            };

            // 确定按钮
            $scope.pushedDimension = function () {
                var result = {
                    pushDim: [],
                    dimeName: []
                };
                angular.forEach($scope.dimensions, function (item) {
                    if (item.checked) {
                        result.pushDim.push(item);
                        result.dimeName.push(item.key);
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
            $scope.searchDim();
        }
    ]);

});
