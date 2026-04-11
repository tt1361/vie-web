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
    app.directive('rangeDimension', ['$window', 'ngDialog', 'CONSTANT', 'dialogService', function ($window, ngDialog, CONSTANT, dialogService) {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                item: '=',
                condition: '='
            },
            templateUrl: 'report/detail/dimension/range-directive.htm',
            link: function (scope, element, attrs) {

                // 展示维度选取框
                scope.name = getName();

                scope.dialogShow = false;

                // 获取该维度下所有的值
                // 为了保护directive 的 维度对象，采用clone的方式返回维度对象
                scope.dimensions = angular.copy(scope.item).value;

                // 移除所有
                scope.removeAll = function () {
                    scope.dimensions = [];
                };

                // 新增
                scope.addNew = function () {
                    scope.dimensions.push({
                        low: '',
                        up: ''
                    });
                };

                // 删除一个

                scope.remove = function (index) {
                    scope.dimensions.splice(index, 1);
                };

                scope.changeDimension = function () {
                    var result = {
                        dimensions: [],
                        conditions: []
                    };

                    var isErrorFormate = false;
                    var reg = new RegExp('^[0-9]*$');

                    angular.forEach(scope.dimensions, function (item) {
                        if (item.low !== '' && item.up !== '' && item.low.length < 30 && item.up.length < 30) {
                            if (reg.test(item.low) && (CONSTANT.number.test(item.low) || item.low == '0') && reg.test(item.up) && (CONSTANT.number.test(item.up) || item.up == '0')) {
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
                    }
                    else {
                        dialogService.error('请输入30位以内的正确区间数字');
                    }

                };

                scope.showSelectDimension = function () {
                    scope.dialogShow = !scope.dialogShow;
                    if (scope.dialogShow) {
                        scope.dimensions = angular.copy(scope.item).value;
                        if (!scope.dimensions.length) {
                            scope.dimensions.push({
                                low: '',
                                up: ''
                            });
                        }
                    }

                };

                function getName(type) {

                    var result = [];

                    angular.forEach(scope.item.value, function (item) {
                        if (angular.isDefined(item.low) && angular.isDefined(item.up)) {
                            result.push(item.low + '~' + item.up);
                        }

                    });

                    return result.length ? result.join(',') : '未选择';
                }

                // 关闭弹框
                $(window.document).click(function (event) {
                    if (!angular.element(event.target).parents('.dialog-wrap').length
                        && !angular.element(event.target).hasClass('dimension-button')
                        && !angular.element(event.target).hasClass('icon-del-gray')
                        && !angular.element(event.target).parents('.ngdialog-tooltip-dialog').length
                        && !angular.element(event.target).hasClass('picture-select-down')
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
