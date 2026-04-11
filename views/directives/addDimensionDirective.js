/**
 * 添加维度
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
    app.directive('adddimension', ['$window', '$parse', '$document', function ($window, $parse, $document) {
        return {
            restrict: 'EA',
            templateUrl: 'directives/addDimension-directive.htm',
            replace: true,
            scope: {
                computers: '=',
                items: '=',
                defaultIndex: '=',
                tableDefault: '=',
                value: '@'
            },
            link: function (scope, element, attrs) {
                // uncodeuid;
                scope.uid = Math.floor(Math.random() * 1000) + 1000;
                scope.showDdialog = false;

                scope.showM = true;

                var index = -1;

                scope.showMe = function () {
                    scope.showM = !scope.showM;
                };

                // 增加dialog
                scope.addAxis = function () {
                    if (!scope.showdialog) {
                        scope.mdItems = angular.copy(scope.items);
                        scope.mdcomputers = angular.copy(scope.computers);
                        index = scope.defaultIndex;
                        var i = -1;
                        angular.forEach(scope.mdItems, function (item, index) {
                            if (item.key == 'voiceId') {
                                i = index;
                            }

                        });
                        if (i > -1) {
                            scope.mdItems.splice(i, 1);
                        }
                    }

                    scope.$parent.isPreview = false;
                    scope.showDdialog = !scope.showDdialog;
                };

                // 主轴增加弹框点击
                scope.setDimension = function (item, indexParam, type) {
                    if (!item.hasAdd && index > -1) {
                        if (scope.value == '参数' && scope.tableDefault.measureOrcomputer == 'computer') {
                            scope.mdcomputers[index].hasAdd = false;
                        }
                        else {
                            scope.mdItems[index].hasAdd = false;
                        }
                    }

                    item.hasAdd = !item.hasAdd;
                    if (item.hasAdd) {
                        index = indexParam;
                        if (type == 'computer') { // 指标
                            scope.tableDefault.measureOrcomputer = 'computer';
                        }
                        else if (scope.value == '参数') {
                            scope.tableDefault.measureOrcomputer = 'measure';
                        }
                    }
                    else {
                        index = -1;
                        if (scope.value == '参数') {
                            scope.tableDefault.measureOrcomputer = '';
                        }
                    }
                };

                // 自动更新
                scope.saveAxis = function () {
                    if (scope.value !== '参数') {
                        scope.defaultIndex = index;
                        scope.items = angular.copy(scope.mdItems);
                        if (scope.defaultIndex > -1) {
                            if (scope.value == '类别') {
                                scope.tableDefault.legend = scope.items[scope.defaultIndex].key;
                                scope.tableDefault.legendText = scope.items[scope.defaultIndex].name;
                            }
                            else {
                                scope.tableDefault.xAxis = scope.items[scope.defaultIndex].key;
                                scope.tableDefault.xAxisText = scope.items[scope.defaultIndex].name;
                            }
                        }
                        else {
                            if (scope.value == '类别') {
                                scope.tableDefault.legend = '';
                                scope.tableDefault.legendText = '';
                            }
                            else {
                                scope.tableDefault.xAxis = '';
                                scope.tableDefault.xAxisText = '';
                            }
                        }
                        scope.showDdialog = false;
                        scope.$parent.viewConfig.svg = '';
                        scope.tableDefault.hasChanged = true;
                    }
                    else {
                        scope.$broadcast('saveColumn');
                    }

                };

                // 维度保存
                scope.$on('computerSaved', function (event, param) {
                    scope.defaultIndex = index;
                    scope.items = angular.copy(scope.mdItems);
                    scope.computers = angular.copy(scope.mdcomputers);
                    if (scope.defaultIndex > -1) {
                        if (scope.tableDefault.measureOrcomputer == 'computer') {
                            scope.tableDefault.measure = scope.computers[scope.defaultIndex].measure;
                            scope.tableDefault.text = scope.computers[scope.defaultIndex].text;
                            scope.tableDefault.expression = scope.computers[scope.defaultIndex].expression;
                        }
                        else {
                            scope.tableDefault.measure = scope.items[scope.defaultIndex].measure;
                            scope.tableDefault.expression = scope.tableDefault.text = scope.items[scope.defaultIndex].measureName;
                        }
                    }
                    else {
                        scope.tableDefault.measure = '';
                        scope.tableDefault.text = '';
                        scope.tableDefault.expression = '';
                    }
                    scope.showDdialog = false;
                    scope.$parent.viewConfig.svg = '';
                    scope.tableDefault.hasChanged = true;
                });

                $(document).mouseup(function (e) {
                    var _con = $('.add-dialog '); // 设置目标区域
                    if (!_con.is(e.target) && _con.has(e.target).length === 0) { // Mark 1
                        scope.showDdialog = false;
                    }

                    scope.$apply();
                });
                // if clicked outside of calendar

                /*$document.on('click', function(e) {
                    if (!scope.showDdialog) return;

                    var i = 0,
                      ele;

                    if (!e.target) return;

                    for (ele = e.target; ele; ele = ele.parentNode) {
                        // var nodeName = angular.lowercase(element.nodeName)
                        if (angular.lowercase(ele.nodeName) === 'adddimension' || ele.nodeType === 9) break;

                        var uid = scope.$eval(ele.getAttribute('uid'));
                        if (!!uid && uid === scope.uid || angular.lowercase(ele.className).indexOf('dimension-wrap') > -1 ) {
                            return;
                        }
                    }

                    scope.showDdialog = false;
                    scope.$apply();
                });*/

            }
        };
    }]);
});
