/**
 * 添加维度、指标、计算值
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
    app.directive('addcolumn', ['$window', '$parse', '$document', '$timeout', '$rootScope', function ($window, $parse, $document, $timeout, $rootScope) {
        return {
            restrict: 'EA',
            templateUrl: 'directives/addColumn-directive.htm',
            replace: true,
            scope: {
                measures: '=',
                dimensions: '=',
                computers: '=',
                tableDefault: '=',
                hasTimeDim: '='
            },
            link: function (scope, element, attrs) {
                $timeout(function () {
                    $document.find('input').placeholder();
                }, 500);
                scope.showdialog = false;

                scope.column;

                var left = 0;
                scope.left = {
                    left: left
                };

                scope.showPre = false;
                scope.showD = true;
                scope.showM = true;

                scope.showDi = function () {
                    scope.showD = !scope.showD;
                };

                scope.showMe = function () {
                    scope.showM = !scope.showM;
                };

                scope.addColumn = function () {
                    // 对未切换时做判断，判断是否对指标计算项或计算项继续处理，陈磊@2017-11-23
                    scope.$watch('tableDefault.tableType', function (newVal, oldVal) {
                        // 根据切换标记对指标项、计算项是否选中进行处理，陈磊@2017-07-29                     
                        if ($rootScope.switchTostats == 'stats' && newVal != oldVal) {
                            for (var j = 0; j < scope.measures.length; j++) {
                                scope.measures[j].hasAdd = false;
                            }
                            for (var k = 0; k < scope.computers.length; k++) {
                                scope.computers[k].hasAdd = false;
                            }
                        }

                    });
                    if (!scope.showdialog) {
                        scope.mdmeasures = angular.copy(scope.measures); // measureDirective内部measures
                        scope.mddimensions = angular.copy(scope.dimensions);
                        if (scope.tableDefault.tableType == 'stats') {
                            // var i = -1, k = -1;
                            // angular.forEach(scope.mddimensions,function(item,index){
                            //     if(item.key == 'keyword'){
                            //         i = index;
                            //     }
                            // });
                            // if(i>-1){
                            //     scope.mddimensions.splice(i,1);
                            // }
                            // angular.forEach(scope.mddimensions,function(item,index){
                            //     if(item.key === 'voiceId'){
                            //         k = index;
                            //     }
                            // });
                            // if(k>-1){
                            //     scope.mddimensions.splice(k,1);
                            // }
                            var mddimensions = [];
                            angular.forEach(scope.mddimensions, function (item, index) {

                                // 石勇 增加判断条件 统计报表维度标签保留时间和模型
                                if (item.analysis === 1 || item.analysis === 0 && item.key === 'offLineTagId' || item.key === 'timeDim') {

                                    i = index;
                                    mddimensions.push(item);
                                }

                            });
                            scope.mddimensions = mddimensions;
                        }

                        scope.mdcomputers = angular.copy(scope.computers);
                        scope.column = angular.copy(scope.tableDefault.column);
                    }

                    scope.showdialog = !scope.showdialog;
                };

                scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {

                    scope.length = $('.Axis.column:last')[0].offsetLeft + $('.Axis.column:last')[0].offsetWidth;

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

                // 向后翻页
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

                // 删除列表项
                scope.onColumnDelete = function (index, type, filed) {
                    var indexArray1 = -1;
                    if (type == 'dimension') {
                        indexArray1 = scope.$parent.$parent.myInArray(scope[type + 's'], 'key', scope.tableDefault.column[index].filed);
                        if (filed == 'timeDim') {
                            scope.hasTimeDim = false;
                        }
                    }
                    else if (type == 'measure') {
                        indexArray1 = scope.$parent.$parent.myInArray(scope[type + 's'], 'measure', scope.tableDefault.column[index].filed);
                    }
                    else if (type == 'computer') {
                        indexArray1 = scope.$parent.$parent.myInArray(scope[type + 's'], 'filed', scope.tableDefault.column[index].filed);
                    }

                    scope.tableDefault.column.splice(index, 1);
                    scope[type + 's'][indexArray1].hasAdd = false;
                    if (scope.$parent.viewConfig.order == filed || (filed == 'timeDim' && (scope.$parent.viewConfig.order == 'dimHour' || scope.$parent.viewConfig.order == 'dimMonth' || scope.$parent.viewConfig.order == 'dimDay' || scope.$parent.viewConfig.order == 'dimYear'))) {
                        scope.$parent.viewConfig.order = '';
                    }

                    scope.tableDefault.hasChanged = true;
                    scope.$parent.isPreview = false;
                };

                // 拖拽排序
                scope.stop = function () {
                    $('.Axis.column').each(function (index, item) {
                        scope.tableDefault.column[index] = eval('(' + $(item).attr('drag-data') + ')');
                    });
                    scope.tableDefault.hasChanged = true;
                };

                // 全选
                scope.selectAll = false;
                scope.searchContent = '';
                scope.toggleAllChecked = function () {
                    scope.selectAll = !scope.selectAll;
                    if (scope.searchContent == '') {
                        scope.column = [];
                        hasTimeDim = scope.selectAll;
                        angular.forEach(scope.mddimensions, function (item) {
                            if (scope.selectAll) {
                                scope.column.push({
                                    name: item.name,
                                    text: item.name,
                                    expression: item.key,
                                    type: 'dimension',
                                    filed: item.key,
                                    dtype: item.type
                                });
                            }

                            item.hasAdd = scope.selectAll;
                        });

                        if (scope.tableDefault.tableType == 'stats') {
                            angular.forEach(scope.mdmeasures, function (item) {
                                if (scope.selectAll) {
                                    scope.column.push({
                                        name: item.measureName,
                                        text: item.measureName,
                                        type: 'measure',
                                        filed: item.measure,
                                        expression: item.measure,
                                        dtype: ''
                                    });
                                }

                                item.hasAdd = scope.selectAll;
                            });

                            angular.forEach(scope.mdcomputers, function (item) {
                                if (scope.selectAll) {
                                    scope.column.push({
                                        name: item.text,
                                        text: item.text,
                                        type: 'computer',
                                        filed: item.filed,
                                        expression: item.expression,
                                        showType: item.showType,
                                        dtype: ''
                                    });
                                }

                                item.hasAdd = scope.selectAll;
                            });
                        }
                    }
                    else {
                        var hasCol = false;
                        var index = -1;
                        angular.forEach(scope.mddimensions, function (item) {
                            if (item.name.indexOf(scope.searchContent) >= 0) {
                                angular.forEach(scope.column, function (col, i) {
                                    if (col.filed == item.key) {
                                        hasCol = true;
                                        index = i;
                                    }

                                });
                                if (scope.selectAll) {
                                    if (!hasCol) {
                                        scope.column.push({
                                            name: item.name,
                                            text: item.name,
                                            type: 'dimension',
                                            filed: item.key,
                                            expression: item.key,
                                            dtype: item.type
                                        });
                                    }
                                }
                                else {
                                    if (hasCol) {
                                        scope.column.splice(index, 1);
                                    }
                                }
                                item.hasAdd = scope.selectAll;
                            }

                        });
                        if (scope.tableDefault.tableType == 'stats') {
                            hasCol = false;
                            index = -1;
                            angular.forEach(scope.mdmeasures, function (item) {
                                if (item.measureName.indexOf(scope.searchContent) >= 0) {
                                    angular.forEach(scope.column, function (col, i) {
                                        if (col.filed == item.measure) {
                                            hasCol = true;
                                            index = i;
                                        }

                                    });
                                    if (scope.selectAll) {
                                        if (!hasCol) {
                                            scope.column.push({
                                                name: item.measureName,
                                                text: item.measureName,
                                                type: 'measure',
                                                filed: item.measure,
                                                expression: item.measure,
                                                dtype: ''
                                            });
                                        }
                                    }
                                    else {
                                        if (hasCol) {
                                            scope.column.splice(index, 1);
                                        }
                                    }
                                    item.hasAdd = scope.selectAll;
                                }

                            });

                            hasCol = false;
                            index = -1;
                            angular.forEach(scope.mdcomputers, function (item) {
                                if (item.name.indexOf(scope.searchContent) >= 0) {
                                    angular.forEach(scope.column, function (col, i) {
                                        if (col.filed == item.filed) {
                                            hasCol = true;
                                            index = i;
                                        }

                                    });
                                    if (scope.selectAll) {
                                        if (!hasCol) {
                                            scope.column.push({
                                                name: item.name,
                                                text: item.name,
                                                type: 'computer',
                                                filed: item.filed,
                                                expression: item.expression,
                                                showType: item.showType,
                                                dtype: ''
                                            });
                                        }
                                    }
                                    else {
                                        if (hasCol) {
                                            scope.column.splice(index, 1);
                                        }
                                    }
                                    item.hasAdd = scope.selectAll;
                                }

                            });
                        }
                    }

                };

                // 添加左侧到表格
                var hasTimeDim = scope.hasTimeDim;
                scope.addTotable = function (key, name, valueType, item) {
                    if (item.hasAdd) {
                        var indexArray = scope.$parent.$parent.myInArray(scope.column, 'filed', key, valueType);
                        scope.column.splice(indexArray, 1);
                        if (scope.$parent.viewConfig.order == key || (key == 'timeDim' && (scope.$parent.viewConfig.order == 'dimHour' || scope.$parent.viewConfig.order == 'dimMonth' || scope.$parent.viewConfig.order == 'dimDay' || scope.$parent.viewConfig.order == 'dimYear'))) {
                            scope.$parent.viewConfig.order = '';
                        }

                        item.hasAdd = false;
                        if (key == 'timeDim') {
                            hasTimeDim = false;
                        }
                    }
                    else {
                        scope.column.push({
                            name: name,
                            text: name,
                            type: valueType,
                            filed: key,
                            expression: item.expression || key,
                            showType: item.showType || 'value',
                            dtype: item.type
                        });
                        item.hasAdd = true;
                        if (key == 'timeDim') {
                            hasTimeDim = true;
                        }
                    }
                };

                // 编辑计算项
                scope.$on('computerChanged', function (event, param) {
                    angular.forEach(scope.column, function (item) {
                        if (item.filed == param.column.filed) {
                            item.name = param.column.text;
                            item.text = param.column.name;
                            item.expression = param.column.expression;
                            item.showType = param.column.showType;
                        }

                    });
                });

                // 自动更新指标
                scope.saveColumn = function () {
                    // 石勇 新增 报表模块的维度选择项显示问题，显示其最左侧
                    scope.left.left = 0;
                    left = 0;
                    scope.showPre = false;
                    // 
                    scope.$broadcast('saveColumn');
                    scope.$parent.isPreview = false;
                };

                scope.$on('computerSaved', function (event, param) {
                    scope.measures = angular.copy(scope.mdmeasures);

                    /*scope.dimensions = angular.copy(scope.mddimensions);*/
                    angular.forEach(scope.dimensions, function (dim) {
                        angular.forEach(scope.mddimensions, function (item) {
                            if (dim.key === item.key) {
                                dim.hasAdd = item.hasAdd;
                            }

                        });
                    });
                    scope.computers = angular.copy(scope.mdcomputers);
                    scope.tableDefault.column = angular.copy(scope.column);
                    scope.hasTimeDim = hasTimeDim;
                    scope.$parent.viewConfig.svg = '';
                    scope.showdialog = false;
                    scope.tableDefault.hasChanged = true;
                });

                // 关闭弹框
                $(window.document).click(function (event) {
                    if (!angular.element(event.target).parents('.add-dialog').length
                        && !angular.element(event.target).hasClass('add-a')
                        && !angular.element(event.target).hasClass('add-dialog')
                        && !angular.element(event.target).hasClass('computer-delete')
                        && scope.showdialog) {
                        scope.showdialog = false;
                    }

                    scope.$apply();
                });

            }
        };
    }]);
});
