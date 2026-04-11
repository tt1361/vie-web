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
    app.directive('myselect', ['$window', '$parse', function ($window, $parse) {
        return {
            restrict: 'EA',
            templateUrl: 'directives/myselect-directive.htm',
            replace: true,
            scope: {
                sel: '=',
                selvalue: '=',
                list: '=',
                type: '@'
            },
            link: function (scope, element, attrs) {

                scope.isOpen = false;

                scope.showOpen = function () {
                    scope.isOpen = !scope.isOpen;
                };

                // 报表管理的报表组的数据绑定
                // scope.selvalue = scope.$parent.$parent.groupListName;

                scope.select = function (item) {
                    if (scope.type == 'yAxis') {
                        scope.sel = item.measure;
                    }
                    else if (scope.type == 'timeDim') {
                        scope.sel = item.key;
                    }
                    else if (scope.type == 'group') {
                        scope.sel = item.id;
                        if (scope.sel = item.id) {
                            scope.selvalue = item.name;
                        }
                    }
                    else {
                        scope.sel = item.id;
                    }

                    if (scope.type == 'timeDim') {
                        scope.selvalue = item.value;
                    }
                    else if (scope.type == 'group') {
                        scope.selvalue = item.name;
                    }
                    else {
                        scope.selvalue = item.text;
                    }
                    scope.isOpen = false;
                };

                scope.$watch('list', function (newVal, oldVal) {
                    var has = false;
                    if (scope.type == 'yAxis' && newVal !== oldVal) {
                        angular.forEach(newVal, function (i) {
                            if (scope.selvalue == i.text) {
                                has = true;
                            }

                        });
                        if (!has) {
                            scope.selvalue = '';
                            scope.sel = '';
                        }
                    }

                }, true);

                // 点击页面其他地方关闭弹窗
                $(window.document).click(function (event) {
                    if (!angular.element(event.target).parents('.my-select').length
                        && !angular.element(event.target).hasClass('picture-select-down')
                        && scope.isOpen) {
                        scope.isOpen = false;
                    }

                    scope.$apply();
                });

            }
        };
    }]);
});
