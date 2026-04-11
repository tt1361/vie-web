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
    app.directive('mulEquDimension', ['$window', 'ngDialog', 'CONSTANT', 'dialogService', function ($window, ngDialog, CONSTANT, dialogService) {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                item: '=',
                condition: '='
            },
            templateUrl: 'report/detail/dimension/mulEqu-directive.htm',
            link: function (scope, element, attrs) {
                if (!scope.item.isNegate) {
                    scope.item.isNegate = 0;
                }
                else {
                    scope.item.isNegate = 1;
                }

                var excludeType = angular.copy(scope.item.isNegate);
                // 展示维度选取框
                scope.name = getName();

                scope.dialogShow = false;

                // 获取该维度下所有的值
                // 为了保护directive 的 维度对象，采用clone的方式返回维度对象
                scope.dimensions = angular.copy(scope.item).value;

                scope.removeAll = function () {
                    scope.dimensions = [];
                };

                // 新增
                scope.addNew = function () {
                    scope.dimensions.push({
                        name: ''
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

                    angular.forEach(scope.dimensions, function (item) {
                        if (item.name !== '') {
                            if (!CONSTANT.negateReplace.test(item.name)) {
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
                        excludeType = angular.copy(scope.item.isNegate);
                        // radio点击确认时有默认值
                        // if(result.conditions.length > 0){
                        scope.item.value = result.dimensions;
                        scope.item.selectValue = getName() === '未选择' ? '' : getName();
                        // }
                        // 设置条件
                        var haveSetCondition = false;
                        angular.forEach(scope.condition, function (item) {
                            if (item.filed === scope.item.key) {
                                // if(result.conditions.length > 0){
                                item.value = result.conditions;
                                // }
                                haveSetCondition = true;
                                item.isNegate = excludeType;
                            }

                        });
                        if (!haveSetCondition) {
                            scope.condition.push({
                                filed: scope.item.key,
                                type: scope.item.type,
                                value: result.conditions,
                                isNegate: excludeType
                            });
                        }

                        scope.name = getName();
                        scope.dialogShow = false;
                    }
                    else {
                        dialogService.error('输入中含有特殊字符');
                    }
                };

                scope.showSelectDimension = function () {
                    scope.dialogShow = !scope.dialogShow;
                    if (scope.dialogShow) {
                        scope.dimensions = angular.copy(scope.item).value;
                        if (!scope.dimensions.length) {
                            scope.dimensions.push({
                                name: ''
                            });
                        }
                    }

                };

                // 排除与包含的切换
                scope.changeType = function () {
                    scope.item.isNegate = 1 - scope.item.isNegate;
                };

                function getName(type) {

                    var result = [];

                    angular.forEach(scope.item.value, function (item) {
                        result.push(item.name);
                    });

                    return !result.length ? '未选择' : scope.item.isNegate ? '!(' + result.join(',') + ')' : result.join(',');
                }

                // 关闭弹框
                $(window.document).click(function (event) {
                    if (!angular.element(event.target).parents('.dialog-wrap').length
                        && !angular.element(event.target).parents('.ngdialog-tooltip-dialog').length
                        && !angular.element(event.target).hasClass('dimension-button')
                        && !angular.element(event.target).hasClass('picture-select-down')
                        && !angular.element(event.target).hasClass('icon-del-gray')
                        && scope.dialogShow) {
                        scope.dialogShow = false;
                        scope.item.isNegate = angular.copy(excludeType);
                    }

                    scope.$apply();
                });
            }
        };

    }
    ]);

});
