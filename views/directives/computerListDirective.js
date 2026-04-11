/**
 * 计算项列表
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
    app.directive('computerlist', [
        '$timeout', '$document', 'reportService', 'CONSTANT', function ($timeout, $document, reportService, CONSTANT) {
            return {
                restrict: 'EA',
                templateUrl: 'directives/computerList-directive.htm',
                replace: true,
                scope: {
                    mdcomputers: '=',
                    tableDefault: '=',
                    searchContent: '=',
                    value: '='
                },
                link: function (scope, element, attrs) {
                    $timeout(function () {
                        $document.find('input').placeholder();
                    }, 500);
                    scope.showC = true;

                    scope.showCreate = false;

                    scope.isPie = scope.tableDefault.type === 'pieChart';
                    scope.isColum = scope.tableDefault.type === 'lineColumChart';

                    var computerIndex = -1; // 判断新增or修改

                    scope.showTypeList = [{
                        id: 'value',
                        text: '值'
                    }, {
                        id: 'percent',
                        text: '百分比'
                    }];

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
                        else {
                            for (var i = 0; i < scope.mdcomputers.length; i++) {
                                if (scope.mdcomputers[i].text == computer.text && (scope.mdcomputers[i].filed != computer.filed || scope.mdcomputers[i].measure != computer.measure)) {
                                    message = '计算项名称已存在';
                                    break;
                                }

                            }
                        }
                        return message;
                    }

                    scope.showCom = function () {
                        scope.showC = !scope.showC;
                    };

                    scope.addComputer = function (index) {
                        if (scope.showCreate) {
                            return;
                        }

                        computerIndex = -1;
                        scope.showCreate = !scope.showCreate;
                        reportService.getComputerField().success(function (data) {
                            if (!data.success) {
                                scope.message = message;
                                $timeout(function () {
                                    scope.message = '';
                                }, 2000);
                                return;
                            }

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
                                scope.showTypeText = '值';
                            }
                            else {
                                scope.computer = {
                                    text: '',
                                    expression: '',
                                    showType: 'value',
                                    filed: data.value
                                };
                                scope.showTypeText = '值';
                            }
                            if (!angular.isUndefined(index)) {
                                scope.computer = angular.copy(scope.mdcomputers[index]);
                                if (scope.computer.showType == 'value') {
                                    scope.showTypeText = '值';
                                }
                                else {
                                    scope.showTypeText = '百分比';
                                }
                                computerIndex = index;
                            }

                        });
                    };

                    scope.$on('addComputer', function (event, param) {
                        scope.addComputer(param.i);
                        scope.$parent.isPreview = false;
                    });

                    scope.$on('saveColumn', function (event, param) {
                        scope.$parent.isPreview = false;
                        if (scope.showCreate) {
                            scope.message = '计算项未保存';
                            $timeout(function () {
                                scope.message = '';
                            }, 2000);
                        }
                        else {
                            scope.$emit('computerSaved');
                        }

                    });

                    // 保存计算项
                    scope.saveComputer = function (computer) {
                        var message = checkComputer(computer);
                        if (message) {
                            scope.message = message;
                            $timeout(function () {
                                scope.message = '';
                            }, 2000);
                        }
                        else {
                            reportService.checkExpress({
                                expression: computer.expression
                            }).success(function (data) {
                                if (!data.success) {
                                    scope.message = '计算项表达式不合法';
                                    $timeout(function () {
                                        scope.message = '';
                                    }, 2000);
                                }
                                else {
                                    if (computerIndex >= 0) {
                                        if (scope.tableDefault.type === 'pieChart') {
                                            var measure = scope.mdcomputers[computerIndex].measure;
                                            scope.mdcomputers[computerIndex] = angular.copy(scope.computer);
                                            scope.mdcomputers[computerIndex].measure = measure;

                                        /*if(scope.tableDefault.measureOrcomputer == 'computer' && scope.tableDefault.measure == measure){
                                            scope.$emit('computerChanged',{text:scope.mdcomputers[computerIndex].text,expression:scope.mdcomputers[computerIndex].expression});
                                        }*/
                                        }
                                        else if (scope.tableDefault.type === 'lineColumChart') {
                                            scope.mdcomputers[computerIndex].text = scope.computer.text;
                                            scope.mdcomputers[computerIndex].expression = scope.computer.expression;
                                            scope.mdcomputers[computerIndex].showType = scope.computer.showType;
                                            var mainAxis = angular.copy(scope.$parent.mainAxis);
                                            var secondaryAxis = angular.copy(scope.$parent.secondaryAxis);
                                            for (var i = 0; i < mainAxis.length; i++) {
                                                var column = mainAxis[i];
                                                if (column.type == 'computer' && column.filed == scope.mdcomputers[computerIndex].filed) {
                                                    column.text = scope.mdcomputers[computerIndex].text;
                                                    column.expression = scope.mdcomputers[computerIndex].expression;
                                                    column.showType = scope.mdcomputers[computerIndex].showType;
                                                    scope.$emit('computerChanged', {type: 'mainAxis', column: column});
                                                }

                                            }
                                            for (var i = 0; i < secondaryAxis.length; i++) {
                                                var column = secondaryAxis[i];
                                                if (column.type == 'computer' && column.filed == scope.mdcomputers[computerIndex].filed) {
                                                    column.text = scope.mdcomputers[computerIndex].text;
                                                    column.expression = scope.mdcomputers[computerIndex].expression;
                                                    column.showType = scope.mdcomputers[computerIndex].showType;
                                                    scope.$emit('computerChanged', {type: 'secondaryAxis', column: column});
                                                }

                                            }
                                        }
                                        else {
                                            var filed = scope.mdcomputers[computerIndex].filed;
                                            var hasAdd = scope.mdcomputers[computerIndex].hasAdd;
                                            scope.mdcomputers[computerIndex] = angular.copy(scope.computer);
                                            scope.mdcomputers[computerIndex].filed = filed;
                                            scope.mdcomputers[computerIndex].hasAdd = hasAdd;
                                            var columns = angular.copy(scope.$parent.column);
                                            for (var i = 0; i < columns.length; i++) {
                                                var column = columns[i];
                                                if (column.type == 'computer' && column.filed == filed) {
                                                    column.name = scope.mdcomputers[computerIndex].text;
                                                    column.text = column.name;
                                                    column.expression = scope.mdcomputers[computerIndex].expression;
                                                    column.showType = scope.mdcomputers[computerIndex].showType;
                                                    scope.$emit('computerChanged', {
                                                        column: column
                                                    });
                                                }

                                            }
                                        }
                                    }
                                    else {
                                        scope.mdcomputers.push(angular.copy(scope.computer));
                                    }
                                    scope.showCreate = false;
                                }
                            });
                        }

                    };

                    // 放弃编辑
                    scope.abandonOperation = function (computer) {
                        scope.message = '';
                        scope.showCreate = false;
                    };

                    // 添加到表格
                    scope.addTotable = function (key, name, valueType, item, index) {
                        if (scope.tableDefault.type === 'pieChart') {
                            scope.$parent.setDimension(item, index, 'computer');
                        }
                        else if (scope.tableDefault.type === 'table') {
                            scope.$parent.addTotable(key, name, valueType, item);
                        }

                    };

                    // 删除computer
                    scope.onComputerDelete = function (index, computer) {
                        if (computer.hasAdd) {
                            if (scope.tableDefault.type === 'pieChart') {
                                scope.$parent.setDimension(computer, index, 'computer');
                            }
                            else if (scope.tableDefault.type === 'table') {
                                scope.$parent.addTotable(computer.filed, computer.text, 'computer', computer);
                            }
                        }

                        scope.mdcomputers.splice(index, 1);
                    };
                }
            };
        }]);
});
