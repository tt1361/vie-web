/**
 * 添加指标
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
    app.directive('addmeasure', ['$window', '$parse', '$document', function ($window, $parse, $document) {
        return {
            restrict: 'EA',
            templateUrl: 'directives/addMeasure-directive.htm',
            replace: true,
            scope: {
                measures: '=',
                computers: '=',
                tableDefault: '=',
                selvalue: '=',
                value: '@'
            },
            link: function (scope, element, attrs) {
                // uncodeuid;
                scope.uid = Math.floor(Math.random() * 1000) + 1000;
                scope.showMdialog = false;

                scope.showM = true;

                scope.showMe = function () {
                    scope.showM = !scope.showM;
                };

                scope.mainAxis;
                scope.secondaryAxis;

                var left = 0;
                scope.left = {
                    left: left
                };

                scope.showPre = false;

                scope.addMeasure = function () {
                    if (!scope.showMdialog) {
                        scope.mdMeasures = angular.copy(scope.measures); // measureDirective内部measures
                        scope.mdcomputers = angular.copy(scope.computers); // measureDirective内部measures
                        scope.mainAxis = angular.copy(scope.tableDefault.mainAxis);
                        scope.secondaryAxis = angular.copy(scope.tableDefault.secondaryAxis);
                    }

                    scope.showMdialog = !scope.showMdialog;
                };

                scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
                    if (scope.value == '1') {
                        scope.length = $('.Axis.main:last')[0].offsetLeft + $('.Axis.main:last')[0].offsetWidth;
                    }
                    else {
                        scope.length = $('.Axis.secondary:last')[0].offsetLeft + $('.Axis.secondary:last')[0].offsetWidth;
                    }
                    if (scope.length <= $('.swiper-container').width()) {
                        scope.showNext = false;
                    }
                    else {
                        scope.showNext = true;
                    }
                });

                // 向后翻页
                scope.nextPage = function () {
                    if (!scope.showNext) {
                        return;
                    }

                    left -= 160;
                    if ($('.swiper-container').width() - left > scope.length) {
                        left = -scope.length + $('.swiper-container').width();
                        scope.showNext = false;
                    }

                    scope.left.left = left + 'px';
                    scope.showPre = true;
                };

                // 向前翻页
                scope.prePage = function () {
                    if (!scope.showPre) {
                        return;
                    }

                    left += 160;
                    if (left > 0) {
                        left = 0;
                        scope.showPre = false;
                    }

                    scope.left.left = left + 'px';
                    scope.showNext = true;
                };

                // 删除指标或者计算项
                scope.onAxisDelete = function (item, mOrc, type, index) {
                    var type = type + 'Axis';
                    if (mOrc == 'measure') {
                        for (var i = 0; i < scope.measures.length; i++) {
                            var measure = scope.measures[i];
                            if (measure.measure == item.measure) {
                                measure.hasAdd = '0';
                            }

                        }
                    }
                    else {
                        for (var i = 0; i < scope.computers.length; i++) {
                            var computer = scope.computers[i];
                            if (computer.filed == item.filed) {
                                computer.hasAdd = '0';
                            }

                        }
                    }
                    scope.tableDefault[type].splice(index, 1);
                    scope.$parent.viewConfig.svg = '';
                    scope.tableDefault.hasChanged = true;
                    scope.$parent.isPreview = false;
                };

                // 编辑计算项
                scope.$on('computerChanged', function (event, param) {
                    if (param.type == 'mainAxis') {
                        angular.forEach(scope.mainAxis, function (item) {
                            if (item.filed == param.column.filed) {
                                item.text = param.column.text;
                                item.expression = param.column.expression;
                                item.showType = param.column.showType;
                            }

                        });
                    }
                    else {
                        angular.forEach(scope.secondaryAxis, function (item) {
                            if (item.filed == param.column.filed) {
                                item.text = param.column.text;
                                item.expression = param.column.expression;
                                item.showType = param.column.showType;
                            }

                        });
                    }
                });
                // 设置Y轴指标
                scope.setMeasure = function (index1, key, value) {
                    // 设为0 移除
                    if (value == '0') {
                        var index = scope.$parent.$parent.myInArray(scope.mainAxis, 'measure', key);
                        if (index > -1) {
                            scope.mainAxis.splice(index, 1);
                        }
                        else {
                            index = scope.$parent.$parent.myInArray(scope.secondaryAxis, 'measure', key);
                            if (index > -1) {
                                scope.secondaryAxis.splice(index, 1);
                            }
                        }
                    }
                    else if (value == '1') {
                        var index = scope.$parent.$parent.myInArray(scope.secondaryAxis, 'measure', key);
                        if (index > -1) {
                            scope.secondaryAxis.splice(index, 1);
                        }

                        var measure = scope.measures[index1];
                        scope.mainAxis.push({
                            text: measure.measureName,
                            measure: measure.measure,
                            type: 'measure',
                            chartType: measure.chartType,
                            expression: measure.expressionParam,
                            showType: 'value'
                        });
                    }
                    else {
                        var index = scope.$parent.$parent.myInArray(scope.mainAxis, 'measure', key);
                        if (index > -1) {
                            scope.mainAxis.splice(index, 1);
                        }

                        var measure = scope.measures[index1];
                        scope.secondaryAxis.push({
                            text: measure.measureName,
                            measure: measure.measure,
                            type: 'measure',
                            chartType: measure.chartType,
                            expression: measure.expressionParam,
                            showType: 'value'
                        });
                    }
                };

                // 设置指标图表格式
                scope.setMeasureType = function (index1, measure, type) {
                    var index = scope.$parent.$parent.myInArray(scope.mainAxis, 'measure', measure);
                    if (index > -1) {
                        scope.mainAxis[index].chartType = type;
                    }
                    else {
                        index = scope.$parent.$parent.myInArray(scope.secondaryAxis, 'measure', measure);
                        if (index > -1) {
                            scope.secondaryAxis[index].chartType = type;
                        }
                    }
                };

                // 设置Y轴计算项
                function setComputer(index1, key, value) {
                    // 设为0 移除
                    if (value == '0') {
                        var index = scope.$parent.$parent.myInArray(scope.mainAxis, 'filed', key);
                        if (index > -1) {
                            scope.mainAxis.splice(index, 1);
                        }
                        else {
                            index = scope.$parent.$parent.myInArray(scope.secondaryAxis, 'filed', key);
                            if (index > -1) {
                                scope.secondaryAxis.splice(index, 1);
                            }
                        }
                    }
                    else if (value == '1') {
                        var index = scope.$parent.$parent.myInArray(scope.secondaryAxis, 'filed', key);
                        if (index > -1) {
                            scope.secondaryAxis.splice(index, 1);
                        }

                        var computer = scope.mdcomputers[index1];
                        scope.mainAxis.push({
                            text: computer.text,
                            filed: computer.filed,
                            measure: computer.filed,
                            type: 'computer',
                            chartType: computer.chartType,
                            expression: computer.expression,
                            showType: computer.showType
                        });
                    }
                    else {
                        var index = scope.$parent.$parent.myInArray(scope.mainAxis, 'filed', key);
                        if (index > -1) {
                            scope.mainAxis.splice(index, 1);
                        }

                        var computer = scope.mdcomputers[index1];
                        scope.secondaryAxis.push({
                            text: computer.text,
                            filed: computer.filed,
                            measure: computer.filed,
                            type: 'computer',
                            chartType: computer.chartType,
                            expression: computer.expression,
                            showType: computer.showType
                        });
                    }
                }

                scope.$on('setComputer', function (event, param) {
                    setComputer(param.i, param.k, param.v);
                });

                // 设置计算项图表格式
                function setComputerType(index1, filed, type) {
                    var index = scope.$parent.$parent.myInArray(scope.mainAxis, 'filed', filed);
                    if (index > -1) {
                        scope.mainAxis[index].chartType = type;
                    }
                    else {
                        index = scope.$parent.$parent.myInArray(scope.secondaryAxis, 'filed', filed);
                        if (index > -1) {
                            scope.secondaryAxis[index].chartType = type;
                        }
                    }
                }

                scope.$on('setComputerType', function (event, param) {
                    setComputerType(param.i, param.f, param.t);
                });
                // 自动更新指标
                scope.saveMeasure = function () {
                    // 石勇 新增 报表模块的维度选择项显示问题，显示其最左侧
                    scope.left.left = 0;
                    left = 0;
                    scope.showPre = false;
                    // 
                    scope.$broadcast('saveColumn');
                };

                scope.$on('computerSaved', function (event, param) {
                    scope.measures = angular.copy(scope.mdMeasures);
                    scope.computers = angular.copy(scope.mdcomputers);
                    scope.tableDefault.mainAxis = angular.copy(scope.mainAxis);
                    scope.$parent.orderList = scope.tableDefault.mainAxis;
                    scope.tableDefault.secondaryAxis = angular.copy(scope.secondaryAxis);
                    scope.$parent.secondOrderList = scope.tableDefault.secondaryAxis;
                    scope.$parent.viewConfig.svg = '';
                    scope.tableDefault.hasChanged = true;
                    scope.showMdialog = false;
                });

                // if clicked outside of calendar
                $document.on('click', function (e) {
                    if (!scope.showMdialog) {
                        return;
                    }

                    var i = 0,
                        ele;

                    if (!e.target) {
                        return;
                    }

                    for (ele = e.target; ele; ele = ele.parentNode) {
                        // var nodeName = angular.lowercase(element.nodeName)
                        if (angular.lowercase(ele.nodeName) === 'addmeasure' || ele.nodeType === 9) {
                            break;
                        }

                        var uid = scope.$eval(ele.getAttribute('uid'));
                        if (!!uid && uid === scope.uid || angular.lowercase(ele.className).indexOf('dimension-wrap') > -1) {
                            return;
                        }

                    }

                    scope.showMdialog = false;
                    scope.$apply();
                });

            }
        };
    }]);
});
