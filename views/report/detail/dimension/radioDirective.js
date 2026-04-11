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
    app.directive('radioDimension', [
        '$http', '$window', '$q', 'ngDialog', function ($http, $window, $q, ngDialog) {
            return {
                restrict: 'EA',
                replace: true,
                scope: {
                    item: '=',
                    condition: '='
                },
                templateUrl: 'report/detail/dimension/radio-directive.htm',
                link: function (scope, element, attrs) {

                    // 获取该维度下所有的值
                    // 为了保护directive 的 维度对象，采用clone的方式返回维度对象
                    scope.dimensions = angular.copy(scope.item).value;

                    // 展示维度选取框
                    scope.name = getName();

                    scope.selectValue = '';

                    scope.dialogShow = false;

                    scope.checkedThis = function (name) {
                        scope.selectValue = name;
                    };

                    scope.changeDimension = function () {
                        var result = {
                            dimensions: scope.dimensions,
                            conditions: []
                        };
                        angular.forEach(scope.dimensions, function (item) {
                            item.isSelect = item.key === scope.selectValue;
                            if (item.isSelect) {
                                result.conditions.push({
                                    key: item.key,
                                    value: item.value
                                });
                            }

                        });

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
                        if (scope.dialogShow) {
                            scope.dimensions = angular.copy(scope.item).value;
                        }

                    };

                    function getName() {
                        var result = [];
                        angular.forEach(scope.item.value, function (item) {
                            if (angular.isDefined(item.value) && item.isSelect) {
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

                    // 关闭弹框
                    $(window.document).click(function (event) {
                        if (!angular.element(event.target).parents('.dialog-wrap').length
                            && !angular.element(event.target).hasClass('dimension-button')
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
