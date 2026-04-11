/**
 * 添加表格
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
    app.directive('addtab', [
        '$window',
        '$parse', 'dialogService', function ($window, $parse, dialogService) {
            return {
                restrict: 'EA',
                templateUrl: 'directives/addTab-directive.htm',
                replace: true,
                scope: {
                    item: '='
                },
                link: function (scope, element, attrs) {
                    var item;

                    scope.addNewChart = function (type) {
                        // scope.newTableCount = new Date().getTime();
                        // 添加表格
                        if (type === 'table') {
                            item = {
                                type: 'table',
                                order: '',
                                orderType: 'asc',
                                column: [],
                                tableType: 'stats',
                                title: '表格'
                            };
                        }
                        else if (type === 'clChart') {
                            item = {
                                type: 'lineColumChart',
                                title: '柱折图',
                                order: '',
                                orderType: 'asc',
                                secondaryAxis: [],
                                xAxis: '',
                                mainAxis: [],
                                svg: ''
                            };
                        }
                        else {
                            item = {
                                type: 'pieChart',
                                title: '饼图',
                                legend: '',
                                measure: '',
                                text: '',
                                expression: '',
                                measureOrcomputer: '',
                                svg: ''
                            };
                        }
                        scope.$parent.result.pop();
                        scope.$parent.result.push(item);
                        scope.$parent.paramter.pop();
                        scope.$parent.paramter.push(angular.copy(item));
                        scope.$parent.view.pop();
                        scope.$parent.view.push(angular.copy(item));
                        scope.$parent.altDirective(scope.$parent.result.length - 1);
                    };
                }
            };
        }
    ]);
});
