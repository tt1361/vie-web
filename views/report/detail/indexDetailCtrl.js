

/**
    *  本文件中的Controller 实现报表详情页面的 控制器逻辑
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

    app.controller('reportIndexDetailCtrl', [
        '$scope',
        '$state',
        '$stateParams',
        '$q',
        '$timeout',
        'ngDialog',
        'dialogService',
        'reportService',
        'dimensionService',
        'customIndexService', function ($scope, $state, $stateParams, $q, $timeout, ngDialog, dialogService, reportService, dimensionService, customIndexService) {
            $scope.id = $stateParams.id; // 首页模块id

            // 更新到首页标志
            $scope.opType = 'update';

            // 接受所有创建的计算项（未加入图表或图）
            $scope.createComputer = [];

            $scope.conditionDimensions = [];

            // 添加条件
            $scope.addCondition = function () {
                ngDialog.open({
                    template: 'analysis/detail/dimension-libs-directive.htm',
                    controller: 'reportConditionCtrl',
                    scope: $scope,
                    showClose: false,
                    closeByEscape: false,
                    closeByDocument: false,
                    disableAnimation: true,
                    className: 'ngdialog-theme-default ngdialog-theme-model-push'
                }).closePromise.then(function (dialog) {
                    // 当弹出层关闭后，自动更新 维度对象
                    if (angular.isUndefined(dialog.value) || dialog.value == '$document') {
                        return;
                    }

                    angular.forEach(dialog.value.pushDim, function (item) {
                        var index = $scope.myInArray($scope.conditionDimensions, 'key', item.key);
                        if (index < 0) {
                            $scope.conditionDimensions.push(item);
                        }

                    });

                    angular.forEach($scope.conditionDimensions, function (item) {
                        var index = $scope.myInArray(dialog.value.pushDim, 'key', item.key);
                        if (index < 0) {
                            $scope.conditionDimensions.splice(item);
                        }

                    });

                    $scope.hasChanged = true;
                    $timeout(function () {
                        $scope.dimensionHeight();
                    }, 500);

                });
            };

            // 设置维度容器的高度
            $scope.dimensionHeight = function () {
                var ulHeight = angular.element('.condition-wrapper').height();
                if (ulHeight > 400) {
                    angular.element('.condition-wrapper').addClass('scroll');
                }
                else {
                    angular.element('.condition-wrapper').removeClass('scroll');
                }
            };

            // 移除条件
            $scope.removeCondition = function (index) {
                angular.forEach($scope.condition, function (item, i) {
                    if (item.filed == $scope.conditionDimensions[index].key) {
                        $scope.condition.splice(i, 1);
                    }

                });
                $scope.conditionDimensions.splice(index, 1);
                $scope.hasChanged = true;
                $timeout(function () {
                    $scope.dimensionHeight();
                }, 500);
            };

            /**
             * 查询所有维度的接口，该接口在所有的tabs 中都可以使用
             *
             */
            $scope.conditionAdd = [];
            dimensionService.searchDim({keyword: '', isReport: 1})
                .then(function (result) {
                    $scope.allDimensions = result.value || [];

                    /**
                     * 查询所有指标的接口，该接口在所有的tabs 中都可以使用
                     *
                     */
                    reportService.getAllMeasure()
                        .then(function (result) {
                            $scope.allMeasures = result.value || [];
                            // 获取首页数据
                            $scope.queryModuleInfoById();
                        });
                });

            // 获取首页数据
            $scope.queryModuleInfoById = function () {
                customIndexService.queryModuleInfoById({
                    id: $scope.id
                })
                    .then(function (result) {
                        $scope.homepageReport = result.value || [];
                        $scope.moduleName = $scope.homepageReport.moduleName;
                        $scope.pageId = $scope.homepageReport.pageId;
                        $scope.tableData = JSON.parse($scope.homepageReport.contentParam);
                        if ($scope.tableData.timeType == 2) {
                            $scope.tableData.startTime = $scope.$parent.systemDate && $scope.$parent.systemDate != '${systemDate}' ? $.datepicker.formatDate('yy-mm-dd', new Date(new Date($scope.$parent.systemDate).getTime() + $scope.tableData.timeValue * 24 * 3600 * 1000)) : $.datepicker.formatDate('yy-mm-dd', new Date(new Date().getTime() + $scope.tableData.timeValue * 24 * 3600 * 1000));
                            $scope.tableData.endTime = $scope.$parent.systemDate && $scope.$parent.systemDate != '${systemDate}' ? $scope.$parent.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date());
                        }

                        $scope.timesRange = {
                            defaultStart: $scope.tableData.startTime,
                            defaultEnd: $scope.tableData.endTime === 'uptonow' ? $.datepicker.formatDate('yy-mm-dd', new Date()) : $scope.tableData.endTime,
                            isToNow: $scope.tableData.endTime === 'uptonow',
                            timeType: $scope.tableData.timeType ? $scope.tableData.timeType : 2,
                            timeValue: $scope.tableData.timeValue ? $scope.tableData.timeValue : -7
                        };
                        $scope.showTime = true;
                        $scope.pageName = $scope.homepageReport.pageName;
                        $scope.type = $stateParams.chartType;
                        var reportConfig = [];

                        // 跟别获取表格和图表的参数
                        if ('table' === $scope.type) {
                            reportConfig.push($scope.tableData.tableParams || []);
                            // 时间颗粒度处理
                            for (var i = 0; i < $scope.tableData.tableParams.column.length; i++) {
                                if ($scope.tableData.tableParams.column[i].filed === 'dimDay' || $scope.tableData.tableParams.column[i].filed === 'dimHour' || $scope.tableData.tableParams.column[i].filed === 'dimManth' || $scope.tableData.tableParams.column[i].filed === 'dimYear') {
                                    $scope.tableData.tableParams.column[i].filed = 'timeDim';
                                }

                            }
                        }
                        else {
                            // 时间颗粒度处理
                            if ($scope.tableData.chartParams.type === 'lineColumChart') {
                                if ($scope.tableData.chartParams.xAxis === 'dimDay' || $scope.tableData.chartParams.xAxis === 'dimHour' || $scope.tableData.chartParams.xAxis === 'dimManth' || $scope.tableData.chartParams.xAxis === 'dimYear') {
                                    $scope.tableData.chartParams.xAxis = 'timeDim';
                                }
                            }

                            if ($scope.tableData.chartParams.type === 'pieChart' || $scope.tableData.chartParams.type === 'measure') {
                                if ($scope.tableData.chartParams.legend === 'dimDay' || $scope.tableData.chartParams.legend === 'dimHour' || $scope.tableData.chartParams.legend === 'dimManth' || $scope.tableData.chartParams.legend === 'dimYear') {
                                    $scope.tableData.chartParams.legend = 'timeDim';
                                }
                            }

                            reportConfig.push($scope.tableData.chartParams || []);
                        }
                        $scope.result = reportConfig;

                        // 保存模板时提交参数
                        $scope.paramter = angular.copy($scope.result);

                        // 预览时保存参数
                        $scope.view = angular.copy($scope.result);

                        $scope.currentTorC = [];
                        if ($scope.result.length) {
                            $scope.currentTorC.push({
                                index: 0,
                                type: $scope.paramter[0].type,
                                config: $scope.result[0],
                                viewConfig: $scope.view[0]
                            });
                        }

                        $scope.condition = reportConfig[0].condition || [];

                        for (var i = 0; i < $scope.allDimensions.length; i++) {
                            var dimension = $scope.allDimensions[i];
                            $scope.setCondition(dimension, $scope.condition);
                        }
                    });
            };

            // 条件筛选收起
            $scope.open = true;

            $scope.showOpen = function () {
                $scope.open = !$scope.open;
            };

            // 获取所有维度的副本
            $scope.getDims = function () {
                return angular.copy($scope.allDimensions);
            };

            // 获取所有指标的副本
            $scope.getMeas = function () {
                return angular.copy($scope.allMeasures);
            };

            // 设置维度范围
            $scope.setCondition = function (dimension, conditions) {
                // 初始化　dimension
                if (dimension.type === 'range' || dimension.type === 'timeRange') {
                    dimension.value = [];
                }
                else if (dimension.type === 'mulEqu') {
                    dimension.value = [];
                }
                else if (dimension.type === 'radio'
                    || dimension.type === 'timeDim'
                    || dimension.type === 'model') {
                    angular.forEach(dimension.value, function (item) {
                        item.isSelect = false;
                    });
                }
                else if (dimension.type === 'mulSel') {
                    var values = dimension.value;
                    dimension.value = [];
                    angular.forEach(values, function (item) {
                        var key = angular.isObject(item) ? item.key : item;
                        dimension.value.push({
                            key: key,
                            value: key,
                            isSelect: false
                        });
                    });
                }
                else if (dimension.type === 'offLineTagId') {
                    angular.forEach(dimension.value, function (item) {
                        item.isOpen = false;
                        angular.forEach(item.value, function (i) {
                            i.isSelect = false;
                        });
                    });
                }

                // 组装数据
                angular.forEach(conditions, function (condition) {
                    if (condition.filed === dimension.key) {
                        if (dimension.type === 'range' || dimension.type === 'timeRange') {
                            angular.forEach(condition.value, function (item) {
                                var index = item.indexOf('|');
                                dimension.value.push({
                                    low: item.substr(0, index),
                                    up: item.substr(index + 1)
                                });
                            });
                        }
                        else if (dimension.type === 'mulEqu') {
                            angular.forEach(condition.value, function (item) {
                                dimension.value.push({
                                    name: item
                                });
                            });
                            dimension.isNegate = condition.isNegate || 0;
                        }
                        else if (dimension.type === 'mulSel') {
                            var dimensions = dimension.value;
                            dimension.value = [];

                            angular.forEach(dimensions, function (name) {
                                var isSelect = false;
                                if (angular.isObject(name)) {
                                    angular.forEach(condition.value, function (seletName) {
                                        if (name.value === seletName) {
                                            isSelect = true;
                                        }

                                    });
                                    dimension.value.push({
                                        key: name.key,
                                        value: name.value,
                                        isSelect: isSelect
                                    });
                                }
                                else {
                                    angular.forEach(condition.value, function (seletName) {
                                        if (name === seletName) {
                                            isSelect = true;
                                        }

                                    });
                                    dimension.value.push({
                                        key: name,
                                        value: name,
                                        isSelect: isSelect
                                    });
                                }

                            });
                        }
                        else if (dimension.type === 'radio'
                            || dimension.type === 'timeDim'
                            || dimension.type === 'model') {
                            angular.forEach(dimension.value, function (item) {
                                item.isSelect = false;
                                angular.forEach(condition.value, function (selectItem) {
                                    if (selectItem.key === item.key) {
                                        item.isSelect = true;
                                    }

                                });
                            });
                        }
                        else if (dimension.type === 'offLineTagId') {
                            angular.forEach(dimension.value, function (item) {
                                item.isOpen = false;
                                angular.forEach(item.value, function (i) {
                                    i.isSelect = false;
                                    angular.forEach(condition.value, function (selectItem) {
                                        if (selectItem.key === i.key) {
                                            item.isOpen = true;
                                            i.isSelect = true;
                                        }

                                    });
                                });
                            });
                        }

                        $scope.conditionDimensions.push(dimension);
                    }

                });
            };

            // 判断数组中是否存在某个维度/指标/计算项
            $scope.myInArray = function (array, key1, key, type) {
                var index = -1;
                for (var i = 0; i < array.length; i++) {
                    var item = array[i];
                    if (type) {
                        if (item[key1] === key && item.type === type) {
                            index = i;
                            break;
                        }
                    }
                    else {
                        if (item[key1] === key) {
                            index = i;
                            break;
                        }
                    }

                }
                return index;
            };

            function GetDateStr(AddDayCount) {
                var dd = new Date();
                dd.setDate(dd.getDate() + AddDayCount); // 获取AddDayCount天后的日期
                var y = dd.getFullYear();
                var m = dd.getMonth() + 1; // 获取当前月份的日期
                var d = dd.getDate();
                return y + '-' + m + '-' + d;
            }

            // 返回
            $scope.goBack = function (id) {
                var hasChanged = false;
                for (var i = 0; i < $scope.result.length; i++) {
                    if ($scope.result[i].hasChanged) {
                        hasChanged = true;
                        break;
                    }

                }
                $state.go('main.index.custom', {
                    id: $scope.pageId
                }, {
                    reload: true
                });
            };

            // 下载模板
            $scope.downloadReport = function () {
                var downloadResult = angular.copy($scope.view);
                var len = downloadResult.length;
                for (var i = 0; i < len; i++) {
                    if (downloadResult[i].type != 'table' && !downloadResult[i].svg) {
                        dialogService.alert('请确认所有图表在操作后均已预览');
                        return $q.reject(false);
                        break;
                    }
                    else if (downloadResult[i].type == 'computer' || downloadResult[i].type == 'measure') {
                        downloadResult[i].type = 'pieChart';
                    }
                    else if (downloadResult[i].type === 'table') {
                        var klen = downloadResult[i].column.length;
                        for (var k = 0; k < klen; k++) {
                            var jlen = downloadResult[i].condition.length;
                            for (var j = 0; j < jlen; j++) {
                                if (downloadResult[i].column[k].filed === 'timeDim' && downloadResult[i].condition[j].filed === 'timeDim') {
                                    downloadResult[i].column[k].filed = downloadResult[i].condition[j].value[0].key;
                                    break;
                                }

                            }

                        }
                    }

                }

                var paramter = {
                    reportName: $scope.moduleName,
                    startTime: $scope.timesRange.defaultStart,
                    endTime: $scope.timesRange.isToNow ? 'uptonow' : $scope.timesRange.defaultEnd,
                    comment: $scope.tableData.comment,
                    reportConfig: JSON.stringify(downloadResult),
                    reportCondition: JSON.stringify($scope.condition)
                };

                /*石勇 新增 增加默认传值*/
                if (paramter.startTime.length < 11) {
                    paramter.startTime = paramter.startTime + ' 00:00:00';
                    paramter.endTime = paramter.endTime + ' 23:59:59';
                }

                // 
                // 提交
                reportService.downloadReport(paramter)
                    .then(function (result) {
                        dialogService.successTo();
                    });
            };

            // 当离开这个页面的时候将定时器清空
            $scope.$on('$destroy', function () {
                ngDialog.closeAll();
            });

            // 切换报表类型
            $scope.altDirective = function (index, event) {
                if (event && $(event.currentTarget).hasClass('active')) {
                    return;
                }

                if ($scope.currentTorC.length) {
                    $scope.currentTorC.splice(0, 1);
                }

                if ($scope.result.length) {
                    $scope.currentTorC.push({
                        index: index,
                        type: $scope.paramter[index].type,
                        config: $scope.result[index],
                        viewConfig: $scope.view[index]
                    });
                }

            };

            // 功能权限
            $scope.$watch('$parent.resources', function (newValue, oldValue) {
                if (!newValue) {
                    return;
                }

                angular.forEach(newValue, function (resource) {
                    if (resource.link === '/report') { // 模型
                        $scope.optAction = resource.optAction || [];
                        if ($.inArray('download', $scope.optAction) > -1) {
                            $scope.downloadAuth = true;
                        }

                        if ($.inArray('return', $scope.optAction) > -1) {
                            $scope.returnAuth = true;
                        }

                        if ($.inArray('save', $scope.optAction) > -1) {
                            $scope.saveAuth = true;
                        }

                        return;
                    }

                });
            });
        }
    ]);

});
