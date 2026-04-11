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

    app.directive('playDimensionLibs', [
        '$http',
        '$document',
        '$timeout',
        'playItemService', function ($http, $document, $timeout, playItemService) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'play/play-dimension-libs-directive.htm',
                link: function ($scope, element, attrs) {
                    $document.find('input').placeholder();
                    $scope.dimensions = [];
                    // 校验搜索关键词规范
                    $scope.validKeyWord = function (keyword) {
                        if (keyword) {
                            if (keyword.replace(/[^\x00-\xff]/g, 'xx').length > 20) {
                                $scope.$emit('listenMsg', {
                                    msg: '搜索字段不能超过20个字符'
                                });
                                return false;
                            }

                            if (playItemService.textReplace.test(keyword)) {
                                $scope.$emit('listenMsg', {
                                    msg: '搜索字段不能包含特殊字符'
                                });
                                return false;
                            }
                        }

                        return true;
                    };

                    $scope.allChecked = true; // 默认全选

                    // 获取全部维度信息
                    $scope.getMulselDimension = function () {
                        playItemService.getMulselDimension({dimensionName: '', dimensionType: 'mulSel'})
                            .then(function (result) {
                                if (result) {
                                    $scope.allDimensions = result.value ? result.value || [] : [];
                                    $scope.searchDim();
                                }

                            });
                    };

                    // 模糊查询
                    $scope.searchDim = function () {
                        if (!$scope.validKeyWord($scope.keyword)) {
                            return;
                        }

                        if ($scope.keyword) {
                            $scope.dimensions = [];
                            angular.forEach($scope.allDimensions, function (dim) {
                                if (dim.dimensionName.indexOf($scope.keyword) > -1) {
                                    $scope.dimensions.push(dim);
                                }

                            });
                        }
                        else {
                            $scope.dimensions = $scope.allDimensions;
                        }
                        // 导入维度检测是否有已经选中的维度
                        var scope = $scope;
                        while (angular.isUndefined(scope.selectDim)) {
                            scope = scope.$parent;
                        }
                        angular.forEach($scope.dimensions, function (item) {
                            angular.forEach(scope.selectDim, function (dimension) {
                                if (item.dimensionId === dimension.dimensionId) {
                                    item.checked = true;
                                    item.dimensionValue = dimension.dimensionValue;
                                }

                            });
                        });
                        angular.forEach($scope.dimensions, function (item) {
                            if (!item.checked) {
                                $scope.allChecked = false;
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
                            $scope.searchDim();
                        }

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
                            pushDim: [],
                            dimeName: []
                        };

                        var scope = $scope;
                        while (angular.isUndefined(scope.selectDim)) {
                            scope = scope.$parent;
                        }
                        angular.forEach($scope.dimensions, function (item) {
                            if (item.checked) {
                                angular.forEach(scope.selectDim, function (dimension) {
                                    if (item.dimensionId === dimension.dimensionId) {
                                        item.checked = true;
                                        item.dimensionValue = dimension.dimensionValue;
                                    }

                                });
                                result.pushDim.push(item);
                                result.dimeName.push(item.dimensionId);
                            }

                        });
                        // if(result.dimeName.length ===0){
                        //     $scope.$emit('listenMsg', {msg: '未选择维度!'});
                        //     return;
                        // }else{
                        $scope.$emit('saveDimension', {
                            result: result
                        });
                        // }
                    };

                    $scope.getMulselDimension();
                }

            };

        }
    ]);

});
