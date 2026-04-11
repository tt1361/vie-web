/**
 * 添加计算项
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

    app.directive('computerl', [
        'ngDialog',
        'dialogService',
        'reportService',
        'CONSTANT', function (ngDialog, dialogService, reportService, CONSTANT) {
            return {
                restrict: 'EA',
                replace: true,
                template: '<button class="create-computer" ng-click="createComputer()" ng-transclude><span ng-transclude>新建</span></button>',
                transclude: true,
                scope: {
                    computers: '=',
                    tableDefault: '=',
                    computerIndex: '='
                },
                link: function (scope, element, attrs) {
                    var a = attrs;

                    var isUpdate = false;

                    scope.isPie = scope.tableDefault.type === 'pieChart';

                    var index = scope.computerIndex;

                    function checkComputer(computer) {
                        var message = '';
                        if (!computer.text.length) {
                            message = '计算项名称不能为空';
                        }
                        else if (CONSTANT.textReplace.test(computer.text)) {
                            message = '计算项名称不能包含特殊字符';
                        }
                        else if (computer.text.length > 20) {
                            message = '计算项名称不能超过20个字符';
                        }
                        else if (!computer.expression.length) {
                            message = '计算项表达式不能为空';
                        }
                        else if (!isUpdate) {
                            for (var i = 0; i < scope.computers.length; i++) {
                                if (scope.computers[i].text == computer.text) {
                                    message = '计算项名称已存在';
                                    break;
                                }

                            }
                        }

                        return message;
                    }

                    scope.changeComputer = function (computer) {
                        var message = checkComputer(computer);
                        if (message) {
                            dialogService.error(message);
                            return;
                        }

                        reportService.checkExpress({
                            expression: computer.expression
                        })
                            .then(function (result) {
                                if (!result) {
                                    dialogService.error('计算项表达式不合法');
                                    return;
                                }

                                ngDialog.close('createComputer', computer);
                            });
                    };

                    // 新建计算项
                    scope.createComputer = function () {
                        reportService.getComputerField()
                            .then(function (result) {
                                if (scope.tableDefault.type === 'pieChart') {
                                    scope.computer = {
                                        text: '',
                                        expression: '',
                                        hasAdd: false,
                                        measure: data.value
                                    };
                                }
                                else if (scope.tableDefault.type === 'lineColumChart') {
                                    scope.computer = {
                                        text: '',
                                        expression: '',
                                        hasAdd: '0',
                                        showType: 'value',
                                        chartType: 'line',
                                        filed: data.value
                                    };
                                }
                                else {
                                    scope.computer = {
                                        text: '',
                                        expression: '',
                                        showType: 'value',
                                        filed: data.value
                                    };
                                }
                                if (!angular.isUndefined(index)) {
                                    scope.computer = angular.copy(scope.computers[index]);
                                    isUpdate = true;
                                }

                                ngDialog.open({
                                    id: 'createComputer',
                                    template: 'directives/createComputer.htm',
                                    className: 'add-table ngdialog-theme-default',
                                    scope: scope,
                                    showClose: false,
                                    closeByEscape: false,
                                    closeByDocument: false,
                                    disableAnimation: true
                                }).closePromise.then(function (dialog) {
                                    if (angular.isUndefined(dialog.value)) {
                                        return;
                                    }

                                    if (!angular.isUndefined(index)) {
                                        if (scope.tableDefault.type === 'pieChart') {
                                            var measure = scope.computers[index].measure;
                                            scope.computers[index] = angular.copy(scope.computer);
                                            scope.computers[index].measure = measure;
                                            if (scope.tableDefault.measureOrcomputer == 'computer' && scope.tableDefault.measure == measure) {
                                                scope.tableDefault.text = scope.computers[index].text;
                                                scope.tableDefault.expression = scope.computers[index].expression;
                                            }

                                        // scope.viewConfig.svg = "";
                                        }
                                        else if (scope.tableDefault.type === 'lineColumChart') {
                                            scope.computers[index].text = scope.computer.text;
                                            scope.computers[index].expression = scope.computer.expression;
                                            scope.computers[index].showType = scope.computer.showType;
                                            for (var i = 0; i < scope.tableDefault.mainAxis.length; i++) {
                                                var column = scope.tableDefault.mainAxis[i];
                                                if (column.type == 'computer' && column.filed == scope.computers[index].filed) {
                                                    column.text = scope.computers[index].text;
                                                    column.expression = scope.computers[index].expression;
                                                    column.showType = scope.computers[index].showType;
                                                }

                                            }
                                        // scope.viewConfig.svg = "";
                                        }
                                        else {
                                            var filed = scope.computers[index].filed;
                                            scope.computers[index] = angular.copy(scope.computer);
                                            scope.computers[index].filed = filed;
                                            for (var i = 0; i < scope.tableDefault.column.length; i++) {
                                                var column = scope.tableDefault.column[i];
                                                if (column.type == 'computer' && column.filed == filed) {
                                                    column.name = scope.computers[index].text;
                                                    column.text = column.name;
                                                    column.expression = scope.computers[index].expression;
                                                    column.showType = scope.computers[index].showType;
                                                }

                                            }
                                        }
                                    }
                                    else {
                                        scope.computers.push(angular.copy(scope.computer));
                                    }
                                });
                            });
                    };
                }
            };
        }]);
});
