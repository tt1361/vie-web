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
    app.directive('measure', ['$window', '$parse', function ($window, $parse) {
        return {
            restrict: 'EA',
            templateUrl: 'directives/measure-directive.htm',
            replace: true,
            scope: {
                item: '=',
                value: '=',
                index: '='
            },
            link: function (scope, element, attrs) {

                scope.showAnother = false;

                scope.toggleAnotherType = function () {
                    scope.showAnother = !scope.showAnother;
                };

                scope.changeType = function (type) {
                    if (type == 'column') {
                        scope.item.chartType = 'line';
                    }
                    else {
                        scope.item.chartType = 'column';
                    }
                    scope.$parent.setMeasureType(scope.index, scope.item.measure, scope.item.chartType);
                    scope.showAnother = false;
                };

                scope.setMeasure = function (key, value) {
                    if (value == scope.value) {
                        if (scope.$parent.measures[scope.index].hasAdd == scope.value) {
                            scope.item.hasAdd = '0';
                            scope.$parent.setMeasure(scope.index, key, '0');
                        }
                        else {
                            scope.item.hasAdd = scope.$parent.measures[scope.index].hasAdd;
                            scope.$parent.setMeasure(scope.index, key, scope.$parent.measures[scope.index].hasAdd);
                        }
                    }
                    else {
                        scope.item.hasAdd = scope.value;
                        scope.$parent.setMeasure(scope.index, key, scope.value);
                    }
                };

            }
        };
    }]);
});
