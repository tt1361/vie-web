/**
 * 计算项处理
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
    app.directive('computer', ['$window', '$parse', function ($window, $parse) {
        return {
            restrict: 'EA',
            templateUrl: 'directives/computer-directive.htm',
            replace: true,
            scope: {
                item: '=',
                value: '=',
                index: '=',
                showCreate: '='
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
                    scope.$emit('setComputerType', {i: scope.index, f: scope.item.filed, t: scope.item.chartType});
                    scope.showAnother = false;
                };

                scope.choseComputer = function (key, value) {
                    if (value == scope.value) {
                        if (scope.$parent.mdcomputers[scope.index].hasAdd == scope.value) {
                            scope.item.hasAdd = '0';
                            scope.$emit('setComputer', {i: scope.index, k: key, v: '0'});
                        }
                        else {
                            scope.item.hasAdd = scope.$parent.mdcomputers[scope.index].hasAdd;
                            scope.$emit('setComputer', {i: scope.index, k: key, v: scope.$parent.mdcomputers[scope.index].hasAdd});
                        }
                    }
                    else {
                        scope.item.hasAdd = scope.value;
                        scope.$emit('setComputer', {i: scope.index, k: key, v: scope.value});
                    }
                };

                // 移除计算项
                scope.onComputerDelete = function (item) {
                    scope.$emit('setComputer', {i: scope.index, k: item.filed, v: '0'});
                    scope.$parent.mdcomputers.splice(scope.index, 1);
                };

                scope.addComputer = function () {
                    scope.$emit('addComputer', {
                        i: scope.index
                    });
                };

            }
        };
    }]);
});
