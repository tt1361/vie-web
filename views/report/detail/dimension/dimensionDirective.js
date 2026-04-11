/**
    *  本文件中的Controller 实现报表详情所有维度的接口
    *   dimensionMulSelCtrl 多选维度
    *   dimensionTimeRangeCtrl 时间维度
    *   dimensionMulEquCtrl 文本维度
    *   dimensionRangeCtrl 范围维度
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
    app.controller('mulSelDimensionCtrl', [
        '$scope', '$timeout', function ($scope, $timeout) {
            // 获取该维度下所有的值
            $scope.dimensions = $scope.$parent.getDimension().value;

            // 是否全部选中，默认全选中
            $scope.allChecked = true;

            // 当有一个未选中是，全选未选中
            angular.forEach($scope.dimensions, function (item) {
                if (!item.isSelect) {
                    $scope.allChecked = false;
                    return;
                }

            });

            // content
            $scope.content = '';

            // 全选切换
            $scope.toggleAllChecked = function () {
                $scope.allChecked = !$scope.allChecked;
                angular.forEach($scope.dimensions, function (item) {
                    item.isSelect = $scope.allChecked;
                });
            };

            $scope.checkedThis = function (item) {
                if (!item.isSelect) {

                    $scope.allChecked = false;
                    return;
                }

                var allchecked = true;
                $.each($scope.dimensions, function (key, item) {
                    if (!item.isSelect) {
                        allchecked = false;
                        return false;
                    }

                });

                $scope.allChecked = allchecked;
            };

            $scope.changeDimension = function () {
                // 组装新的数组
                var result = {
                    dimensions: [],
                    conditions: []
                };

                angular.forEach($scope.$parent.getDimension().value, function (item) {
                    var isPushed = false;
                    angular.forEach($scope.dimensions, function (selectedItem) {
                        if (item.key === selectedItem.key) {
                            result.dimensions.push(selectedItem);
                            if (selectedItem.isSelect) {
                                result.conditions.push(selectedItem.key);
                            }

                            isPushed = true;
                        }

                    });

                    if (!isPushed) {
                        item.isSelect = false;
                        result.dimensions.push(item);
                    }

                });
                $scope.closeThisDialog(result);
            };
        }
    ])
        .controller('radioDimensionCtrl', [
            '$scope', function ($scope) {
                // 获取该维度下所有的值
                $scope.dimensions = $scope.$parent.getDimension().value;

                $scope.selectValue = '';

                $scope.checkedThis = function (name) {
                    $scope.selectValue = name;
                };

                $scope.changeDimension = function () {
                    var result = {
                        dimensions: $scope.dimensions,
                        conditions: []
                    };
                    angular.forEach($scope.dimensions, function (item) {
                        item.isSelect = item.key === $scope.selectValue;
                        if (item.isSelect) {
                            result.conditions.push({
                                key: item.key,
                                value: item.value
                            });
                        }

                    });

                    $scope.closeThisDialog(result);
                };
            }
        ])
        .controller('timeRangeDimensionCtrl', [
            '$scope', function ($scope) {
                // 获取该维度下所有的值
                $scope.dimensions = $scope.$parent.getDimension().value;
                if (!$scope.dimensions.length) {
                    $scope.dimensions.push({
                        low: '',
                        up: ''
                    });
                }

                // 移除所有
                $scope.removeAll = function () {
                    $scope.dimensions = [];
                };

                // 新增
                $scope.addNew = function () {
                    $scope.dimensions.push({
                        low: '',
                        up: ''
                    });
                };

                // 删除一个

                $scope.remove = function (index) {
                    $scope.dimensions.splice(index, 1);
                };

                $scope.changeDimension = function () {
                    var result = {
                        dimensions: [],
                        conditions: []
                    };

                    angular.forEach($scope.dimensions, function (item) {
                        if (item.low !== '' && item.up !== '') {
                            result.dimensions.push(item);
                            result.conditions.push([item.low, item.up].join('|'));
                        }

                    });
                    $scope.closeThisDialog(result);
                };

            }
        ])
        .controller('mulEquDimensionCtrl', [
            '$scope', '$window', 'CONSTANT', function ($scope, $window, CONSTANT) {
                // 获取该维度下所有的值
                $scope.dimensions = $scope.$parent.getDimension().value;
                if (!$scope.dimensions.length) {
                    $scope.dimensions.push({
                        name: ''
                    });
                }

                $scope.removeAll = function () {
                    $scope.dimensions = [];
                };

                // 新增
                $scope.addNew = function () {
                    $scope.dimensions.push({
                        name: ''
                    });
                };

                // 删除一个
                $scope.remove = function (index) {
                    $scope.dimensions.splice(index, 1);
                };

                $scope.changeDimension = function () {
                    var result = {
                        dimensions: [],
                        conditions: []
                    };
                    var isErrorFormate = false;
                    angular.forEach($scope.dimensions, function (item) {
                        if (item.name !== '') {
                            if (!CONSTANT.textReplace.test(item.name)) {
                                result.dimensions.push({
                                    name: item.name
                                });
                                result.conditions.push(item.name);
                            }
                            else {
                                isErrorFormate = true;
                            }
                        }

                    });
                    if (!isErrorFormate) {
                        $scope.closeThisDialog(result);
                    }
                    else {
                        $window.alert('输入中含有特殊字符');
                    }
                };
            }
        ])
        .controller('rangeDimensionCtrl', [
            '$scope', '$window', 'CONSTANT', function ($scope, $window, CONSTANT) {
                // 获取该维度下所有的值
                $scope.dimensions = $scope.$parent.getDimension().value;
                if (!$scope.dimensions.length) {
                    $scope.dimensions.push({
                        low: '',
                        up: ''
                    });
                    $('.dialog-content').mCustomScrollbar({
                        theme: 'minimal-dark'
                    });
                }

                // 移除所有
                $scope.removeAll = function () {
                    $scope.dimensions = [];
                };

                // 新增
                $scope.addNew = function () {
                    $scope.dimensions.push({
                        low: '',
                        up: ''
                    });
                    $('.dialog-content').mCustomScrollbar({
                        theme: 'minimal-dark'
                    });
                };

                // 删除一个
                $scope.remove = function (index) {
                    $scope.dimensions.splice(index, 1);
                };

                $scope.changeDimension = function () {
                    var result = {
                        dimensions: [],
                        conditions: []
                    };

                    var isErrorFormate = false;

                    angular.forEach($scope.dimensions, function (item) {
                        if (item.low !== '' && item.up !== '' && item.low.length < 30 && item.up.length < 30) {
                            if ((CONSTANT.number.test(item.low) || item.low == '0') && (CONSTANT.number.test(item.up) || item.up == '0')) {
                                if (parseFloat(item.low) > parseFloat(item.up)) {
                                    isErrorFormate = true;
                                }
                                else {
                                    result.dimensions.push(item);
                                    result.conditions.push([item.low, item.up].join('|'));
                                }
                            }
                            else {
                                isErrorFormate = true;
                            }
                        }
                        else {
                            isErrorFormate = true;
                        }
                    });
                    if (!isErrorFormate) {
                        $scope.closeThisDialog(result);
                    }
                    else {
                        $window.alert('请输入30位以内的正确区间数字');
                    }

                };
            }
        ])
        .controller('offLineTagIdDimensionCtrl', [
            '$scope', '$timeout', function ($scope, $timeout) {
                // 获取该维度下所有的值
                $scope.dimensions = $scope.$parent.getDimension().value;

                $scope.$on('dimensionRender', function (ngRepeatFinishedEvent) {
                    $('.dialog-content').mCustomScrollbar({
                        theme: 'minimal-dark'
                    });
                });

                // 是否全部选中，默认全选中
                $scope.allChecked = true;
                // 当有一个未选中是，全选未选中
                angular.forEach($scope.dimensions, function (item) {
                    angular.forEach(item.value, function (value) {
                        if (!value.isSelect) {
                            $scope.allChecked = false;
                            return;
                        }

                    });
                });

                // 全选切换
                $scope.toggleAllChecked = function () {
                    $scope.allChecked = !$scope.allChecked;
                    angular.forEach($scope.dimensions, function (item) {
                        angular.forEach(item.value, function (i) {
                            i.isSelect = $scope.allChecked;
                        });
                    });
                };

                $scope.checkedThis = function (item) {
                    if (!item.isSelect) {
                        $scope.allChecked = false;
                        return;
                    }

                    var allchecked = true;
                    $.each($scope.dimensions, function (key, item) {
                        angular.forEach(item.value, function (i) {
                            if (!i.isSelect) {
                                allchecked = false;
                                return false;
                            }

                        });

                    });

                    $scope.allChecked = allchecked;
                };

                // 展开收起
                $scope.toggleOpened = function (index) {
                    $scope.dimensions[index].isOpen = !$scope.dimensions[index].isOpen;
                    $('.dialog-content').mCustomScrollbar({
                        theme: 'minimal-dark'
                    });
                };

                $scope.changeDimension = function () {
                    var result = {
                        dimensions: $scope.dimensions,
                        conditions: []
                    };
                    angular.forEach($scope.dimensions, function (item) {
                        item.isOpen = false;
                        angular.forEach(item.value, function (i) {
                            if (i.isSelect) {
                                item.isOpen = true;
                                result.conditions.push({
                                    key: i.key,
                                    value: i.value
                                });
                            }

                        });

                    });

                    $scope.closeThisDialog(result);
                };

            }
        ]);

    /**
    *  本文件中的directives 实现维度选取组件
    * @ item: 维度的详细信息
    *
    */
    app.directive('dimension', [
        '$http', '$window', '$q', 'ngDialog', function ($http, $window, $q, ngDialog) {

            return {
                restrict: 'EA',
                replace: true,
                scope: {
                    item: '=',
                    condition: '=',
                    reset: '@'
                },
                controller: function ($scope, $element) {
                    var type = $scope.item.type === 'mulEqu' ? 'mulEqu' :
                        $scope.item.type === 'radio' || $scope.item.type === 'timeDim' ? 'radio' :
                            $scope.item.type === 'mulSel' || $scope.item.type === 'model' ? 'mulSel' : $scope.item.type;
                    return type + 'DimensionCtrl';
                },
                template: '<div ng-include="getContentUrl()"></div>',
                link: function (scope, element, attrs) {
                    // 展示维度选取框
                    scope.name = getName();

                    scope.getContentUrl = function () {
                        var type = scope.item.type === 'mulEqu' ? 'mulEqu' :
                            scope.item.type === 'radio' || scope.item.type === 'timeDim' ? 'radio' :
                                scope.item.type === 'mulSel' || scope.item.type === 'model' ? 'mulSel' : scope.item.type;
                        return 'report/detail/dimension/' + type + '-directive.htm';
                    };

                    scope.showSelectDimension = function (event) {
                        var type = scope.item.type === 'mulEqu' ? 'mulEqu' :
                            scope.item.type === 'radio' || scope.item.type === 'timeDim' ? 'radio' :
                                scope.item.type === 'mulSel' || scope.item.type === 'model' ? 'mulSel' : scope.item.type;
                        ngDialog.open({
                            template: 'report/detail/dimension/' + type + '-directive.htm',
                            controller: type + 'DimensionCtrl',
                            className: 'dialog-dimension ngdialog-theme-default',
                            scope: scope,
                            showClose: false,
                            closeByEscape: false,
                            closeByDocument: true,
                            disableAnimation: true
                        }).closePromise.then(function (dialog) {
                            // 当弹出层关闭后，自动更新 维度对象
                            if (angular.isUndefined(dialog.value) || dialog.value == '$document') {
                                return;
                            }

                            // radio点击确认时有默认值
                            if (type != 'radio' || dialog.value.conditions.length > 0) {
                                scope.item.value = dialog.value.dimensions;
                                scope.item.selectValue = getName() === '未选择' ? '' : getName();
                            }

                            // 设置条件
                            var haveSetCondition = false;
                            angular.forEach(scope.condition, function (item) {
                                if (item.filed === scope.item.key) {
                                    if (type != 'radio' || dialog.value.conditions.length > 0) {
                                        item.value = dialog.value.conditions;
                                    }

                                    haveSetCondition = true;
                                }

                            });
                            if (!haveSetCondition) {
                                scope.condition.push({
                                    filed: scope.item.key,
                                    type: scope.item.type,
                                    value: dialog.value.conditions
                                });
                            }

                            scope.name = getName();

                        });
                    };
                    // 为了保护directive 的 维度对象，采用clone的方式返回维度对象
                    scope.getDimension = function () {
                        return angular.copy(scope.item);
                    };

                    function getName(type) {
                        var result = [];

                        angular.forEach(scope.item.value, function (item) {
                            if (angular.isDefined(item.name)) {
                                result.push(item.name);
                            }
                            else if (angular.isDefined(item.low) && angular.isDefined(item.up)) {
                                result.push(item.low + '~' + item.up);
                            }
                            else if (angular.isDefined(item.value) && item.isSelect) {
                                result.push(item.value);
                            }
                            else {
                                angular.forEach(item.value, function (i) {
                                    if (i.isSelect) {
                                        result.push(i.value);
                                    }

                                });
                            }
                        });

                        return result.length ? result.join(',') : '未选择';
                    }
                }
            };

        }
    ]);

});
