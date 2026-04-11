/**
    *  本文件中的directives 实现维度选取组件
    * @ item: 维度的详细信息
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
    app.directive('offLineTagIdDimension', ['$window', 'ngDialog', '$timeout', '$document', 'CONSTANT', 'commonFilterService', function ($window, ngDialog, $timeout, $document, CONSTANT, commonFilterService) {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                item: '=',
                condition: '='
            },
            templateUrl: 'report/detail/dimension/offLineTagId-directive.htm',
            link: function (scope, element, attrs) {

                /*石勇 新增 筛选器中切换模型规则下拉框*/
                scope.$on('empty-model', function () {
                    scope.name = '';
                    scope.allChecked = false;
                    angular.forEach(scope.dimensions, function (item) {
                        angular.forEach(item.value, function (data) {
                            data.isSelect = false;
                        });
                    });
                    return;
                });

                /**/
                scope.$on('reload', function (e, m) {
                    scope.name = getName(m);
                    function getName(m) {
                        var result = [];
                        angular.forEach(m, function (item) {
                            if (item.key == 'offLineTagId') {
                                angular.forEach(item.dimension.value, function (items) {
                                    angular.forEach(items.value, function (i) {
                                        if (i.isSelect) {
                                            result.push(i.value);
                                        }

                                    });
                                });
                            }

                        });
                        return result.length ? result.join(',') : '未选择';
                    }
                });

                $timeout(function () {
                    $document.find('input').placeholder();
                }, 500);
                // 展示维度选取框
                scope.name = getName();

                scope.dialogShow = false;

                // 获取该维度下所有的值
                // 为了保护directive 的 维度对象，采用clone的方式返回维度对象
                scope.dimensions = angular.copy(scope.item).value;
                // 是否全部选中，默认全选中
                scope.allChecked = true;

                scope.content = '';

                // 当有一个未选中是，全选未选中
                angular.forEach(scope.dimensions, function (item) {
                    angular.forEach(item.value, function (value) {
                        if (!value.isSelect) {
                            scope.allChecked = false;
                            return;
                        }

                    });
                });

                // 全选切换
                scope.toggleAllChecked = function () {
                    scope.allChecked = !scope.allChecked;
                    angular.forEach(scope.dimensions, function (item) {
                        angular.forEach(item.value, function (i) {
                            if (!scope.content) {
                                i.isSelect = scope.allChecked;
                            }
                            else if (i.value.indexOf(scope.content) > -1) {
                                i.isSelect = scope.allChecked;
                            }

                        });
                    });
                };

                scope.checkedThis = function (item) {
                    if (!item.isSelect) {
                        scope.allChecked = false;
                        return;
                    }

                    var allchecked = true;
                    angular.forEach(scope.dimensions, function (item, key) {
                        angular.forEach(item.value, function (i) {
                            if (!i.isSelect) {
                                allchecked = false;
                                return false;
                            }

                        });

                    });

                    scope.allChecked = allchecked;
                };

                // 展开收起
                scope.toggleOpened = function (index) {
                    scope.dimensions[index].isOpen = !scope.dimensions[index].isOpen;
                };

                scope.changeDimension = function () {
                    var result = {
                        dimensions: scope.dimensions,
                        conditions: []
                    };
                    angular.forEach(scope.dimensions, function (item) {
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
                        if (scope.$parent.filter) {
                            scope.$parent.filter.value = [];
                            angular.forEach(result.conditions, function (item) {
                                scope.$parent.filter.value.push(item.key);
                            });
                        }

                    });

                    // radio点击确认时有默认值

                    scope.item.value = result.dimensions;
                    scope.item.selectValue = getName() === '未选择' ? '' : getName();
                    // 设置条件
                    var haveSetCondition = false;
                    angular.forEach(scope.condition, function (item) {
                        if (item.filed === scope.item.key) {
                            item.value = result.conditions;
                            haveSetCondition = true;
                        }

                    });
                    if (!haveSetCondition) {
                        scope.condition.push({
                            filed: scope.item.key,
                            type: scope.item.type,
                            value: result.conditions
                        });
                    }

                    scope.name = getName();
                    scope.dialogShow = false;
                };

                scope.showSelectDimension = function () {
                    scope.dialogShow = !scope.dialogShow;
                    scope.content = '';
                    if (scope.dialogShow) {
                        scope.dimensions = angular.copy(scope.item).value;
                        scope.allChecked = true;
                        // 当有一个未选中是，全选未选中
                        angular.forEach(scope.dimensions, function (item) {
                            angular.forEach(item.value, function (value) {
                                if (!value.isSelect) {
                                    scope.allChecked = false;
                                    return;
                                }

                            });
                        });
                    }

                };

                function getName(type) {
                    var result = [];
                    angular.forEach(scope.item.value, function (item) {
                        angular.forEach(item.value, function (i) {
                            if (i.isSelect) {
                                result.push(i.value);
                            }

                        });
                    });
                    return result.length ? result.join(',') : '未选择';
                }

                // 关闭弹框
                $(window.document).click(function (event) {
                    if (!angular.element(event.target).parents('.dialog-wrap').length
                        && !angular.element(event.target).hasClass('dimension-button')
                        && !angular.element(event.target).hasClass('picture-select-down')
                        && !angular.element(event.target).hasClass('normal')
                        && scope.dialogShow) {
                        scope.dialogShow = false;
                    }

                    scope.$apply();
                });
            }
        };

    }
    ]);

});
