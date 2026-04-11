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
    app.controller('reportDetailCtrl', [
        '$scope',
        '$state',
        '$stateParams',
        '$q',
        '$timeout',
        'ngDialog',
        'dialogService',
        'reportService',
        'dimensionService', function ($scope, $state, $stateParams, $q, $timeout, ngDialog, dialogService, reportService, dimensionService) {

            $scope.downloadAuth = false; // 是否有下载权限
            $scope.returnAuth = false; // 是否有返回权限

            /* $scope.previewAuth = false;//是否有预览权限*/
            $scope.saveAuth = false; // 是否有保存权限

            $scope.hasChanged = false; // 是否修改

            // 接受所已创建的计算项（未加入图表或图）
            $scope.createComputer = [];

            $scope.conditionDimensions = [];

            // 添加到首页标志
            $scope.opType = 'add';

            // 来源  1：常用报表   0：报表管理
            $scope.fromType = $stateParams.fromType;

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

                    var codTims = [];
                    angular.forEach($scope.conditionDimensions, function (item) {
                        var index = $scope.myInArray(dialog.value.pushDim, 'key', item.key);
                        if (index >= 0) {
                            codTims.push(item);
                        }

                    });
                    $scope.conditionDimensions = codTims;

                    var conDim = $scope.condition;
                    angular.forEach($scope.conditionDimensions, function (item) {
                        var index = $scope.myInArray($scope.condition, 'key', item.key);
                        if (index >= 0) {
                            conDim.push($scope.condition[index]);
                        }

                    });
                    var conDimNew = [];
                    angular.forEach($scope.conditionDimensions, function (item) {
                        var index = $scope.myInArray(conDim, 'filed', item.key);
                        if (index >= 0) {
                            conDimNew.push(conDim[index]);
                        }

                    });
                    $scope.condition = conDimNew;
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
                     * 查询所有指标的接口，改接口在所有的tabs 中都可以使用
                     *
                     */
                    reportService.getAllMeasure()
                        .then(function (result) {
                            $scope.allMeasures = result.value || [];
                            reportService.getReportGroupExpCom()
                                .then(function (result) {
                                    $scope.reportGroups = result.value || [];

                                    /**
                                     * 获取表格数据
                                     *
                                     */
                                    if ($stateParams.id) {
                                        reportService.getReportByID({
                                            reportId: $stateParams.id
                                        })
                                            .then(function (result) {
                                                $scope.tableData = eval('(' + result.value + ')');
                                                $scope.timesRange = {
                                                    defaultStart: $scope.tableData.startTime,
                                                    defaultEnd: $scope.tableData.endTime === 'uptonow' ? $.datepicker.formatDate('yy-mm-dd', new Date()) : $scope.tableData.endTime,
                                                    isToNow: $scope.tableData.endTime === 'uptonow',
                                                    timeType: $scope.tableData.timeType ? $scope.tableData.timeType : 2,
                                                    timeValue: $scope.tableData.timeValue ? $scope.tableData.timeValue : -7
                                                };

                                                $scope.showTime = true;
                                                angular.forEach($scope.reportGroups, function (item) {
                                                    if ($scope.tableData.reportGroupID == item.id) {
                                                        $scope.reportGroupName = item.name;
                                                    }

                                                });
                                                $scope.result = $scope.tableData.reportConfig || [];

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

                                                $scope.conditionAdd = $scope.tableData.reportCondition || [];
                                                $scope.condition = $scope.tableData.reportCondition || [];

                                                for (var i = 0; i < $scope.allDimensions.length; i++) {
                                                    var dimension = $scope.allDimensions[i];
                                                    $scope.setCondition(dimension, $scope.conditionAdd);
                                                }
                                            });
                                    }
                                    else {
                                        $scope.timesRange = {
                                            defaultStart: $scope.systemDate && $scope.systemDate != '${systemDate}' ? $.datepicker.formatDate('yy-mm-dd', new Date(new Date($scope.systemDate).getTime() - 7 * 24 * 3600 * 1000)) : $.datepicker.formatDate('yy-mm-dd', new Date(new Date().getTime() - 7 * 24 * 3600 * 1000)),
                                            defaultEnd: $scope.systemDate && $scope.systemDate != '${systemDate}' ? $scope.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date()),
                                            isToNow: false
                                        };
                                        $scope.showTime = true;
                                        $scope.tableData = {
                                            startTime: $scope.timesRange.defaultStart,
                                            endTime: $scope.timesRange.defaultEnd,
                                            reportName: $stateParams.name,
                                            reportGroupID: $stateParams.group * 1,
                                            reportConfig: [],
                                            reportCondition: [],
                                            comment: ''
                                        };
                                        $scope.conditionAdd = $scope.tableData.reportCondition;
                                        $scope.condition = $scope.tableData.reportCondition;
                                        angular.forEach($scope.reportGroups, function (item) {
                                            if ($scope.tableData.reportGroupID == item.id) {
                                                $scope.reportGroupName = item.name;
                                            }

                                        });
                                        $scope.result = $scope.tableData.reportConfig;
                                        // 保存模板时提交参数
                                        $scope.paramter = angular.copy($scope.result);
                                        // 预览时保存参数
                                        $scope.view = angular.copy($scope.result);
                                        $scope.currentTorC = [];
                                        $scope.addTab();
                                    }
                                });
                        });
                });

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
                $scope.condition = [];
                angular.forEach($scope.conditionDimensions, function (item) {
                    angular.forEach($scope.conditionAdd, function (i) {
                        if (item.key === i.filed) {
                            $scope.condition.push(i);
                        }

                    });
                });

            };

            // 新建图表
            $scope.addTab = function () {
                if ($scope.result && $scope.result.length > 9) {
                    dialogService.alert('最多只能拥有10个报表！');
                    return $q.reject(false);
                }

                if ($scope.result.length && $scope.result[$scope.result.length - 1].type === 'blank') {
                    dialogService.alert('请完成已有新建表格！');
                    return $q.reject(false);
                }

                var item = {
                    type: 'blank'
                };
                $scope.result.push(item);
                $scope.paramter.push(angular.copy(item));
                $scope.view.push(angular.copy(item));
                $scope.altDirective($scope.result.length - 1);
            };

            // 保存修改评论内容
            $scope.changeComment = function (value) {
                if (value.replace(/[^\x00-\xff]/g, 'xx').length > 2000) {
                    dialogService.alert('评论内容不能超过2000字符');
                }
                else {
                    ngDialog.close('editComment', value);
                }
            };

            // 修改评论内容
            $scope.editComment = function () {
                $scope.comment = $scope.tableData.comment;
                ngDialog.open({
                    id: 'editComment',
                    template: 'report/detail/editComment.htm',
                    scope: $scope,
                    className: 'edit-comment ngdialog-theme-default',
                    showClose: false,
                    closeByEscape: false,
                    closeByDocument: true,
                    disableAnimation: true
                }).closePromise.then(function (dialog) {
                    if (angular.isUndefined(dialog.value) || dialog.value == '$document') {
                        return;
                    }

                    $scope.tableData.comment = dialog.value;
                    $scope.hasChanged = true;
                });
            };

            // 修改报表信息
            $scope.editDetail = function () {
                $scope.reportName = $scope.tableData.reportName;
                $scope.reportGroupID = $scope.tableData.reportGroupID * 1;
                ngDialog.open({
                    id: 'editDetail',
                    template: 'report/detail/reportDetail.htm',
                    controller: 'manageNewCreate',
                    scope: $scope,
                    className: 'report-detail ngdialog-theme-default',
                    showClose: false,
                    closeByEscape: false,
                    closeByDocument: true,
                    disableAnimation: true
                }).closePromise.then(function (dialog) {
                    if (angular.isUndefined(dialog.value) || dialog.value == '$document') {
                        return;
                    }

                    $scope.tableData.reportName = dialog.value.reportName;
                    $scope.tableData.reportGroupID = dialog.value.reportGroupID;
                    $scope.reportGroupName = dialog.value.reportGroupName;
                    $scope.hasChanged = true;
                });
            };

            // 删除表格或图表
            $scope.deleteTab = function (index, event) {
                $scope.result.splice(index, 1);
                $scope.paramter.splice(index, 1);
                $scope.view.splice(index, 1);
                if (index > 0) {
                    $scope.altDirective(index - 1);
                }
                else {
                    $scope.altDirective(index);
                }
                $scope.hasChanged = true;

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

            var reportid = $stateParams.id;

            // 保存模板
            $scope.saveTemplate = function () {

                for (var i = 0; i < $scope.result.length; i++) {
                    $scope.result[i].hasChanged = false;
                    if ($scope.result[i].type == 'blank') {
                        dialogService.alert('请完成图表新建');
                        return $q.reject(false);
                        break;
                    }
                    else if ($scope.result[i].type == 'table') {
                        var hasDimension = false;
                        for (var j = 0; j < $scope.result[i].column.length; j++) {
                            if (hasDimension) {
                                break;
                            }

                            if ($scope.result[i].column[j].type == 'dimension') {
                                hasDimension = true;
                            }

                        }
                        if (!hasDimension) {
                            dialogService.alert('请确认所有表格均已选择维度');
                            return $q.reject(false);
                            break;
                        }
                    }
                    else if ($scope.result[i].type == 'lineColumChart') {
                        if (!$scope.result[i].xAxis || ($scope.result[i].secondaryAxis.length == 0 && $scope.result[i].mainAxis.length == 0)) {
                            dialogService.alert('请确认所有柱折图均已选择XY轴');
                            return $q.reject(false);
                            break;
                        }
                    }
                    else {
                        if (!$scope.result[i].legend || !$scope.result[i].measure) {
                            dialogService.alert('请确认所有饼状图均已选择类别和参数');
                            return $q.reject(false);
                            break;
                        }
                    }
                }

                var paramter = {
                    reportId: reportid ? reportid : -1,
                    reportName: $scope.tableData.reportName,
                    reportGroupId: $scope.tableData.reportGroupID,
                    timeType: $scope.timesRange.timeType,
                    timeValue: $scope.timesRange.timeValue,
                    startTime: $scope.timesRange.defaultStart,
                    endTime: $scope.timesRange.isToNow ? 'uptonow' : $scope.timesRange.defaultEnd,
                    comment: $scope.tableData.comment,
                    reportConfig: JSON.stringify(angular.copy($scope.result)),
                    reportCondition: JSON.stringify($scope.condition)
                };

                /*石勇 新增 增加默认传值*/
                if (paramter.startTime.length < 11) {
                    paramter.startTime = paramter.startTime + ' 00:00:00';
                    paramter.endTime = paramter.endTime + ' 23:59:59';
                }

                // 
                // 提交
                reportService.updateReport(paramter)
                    .then(function (result) {
                        reportid = result.value;
                        dialogService.success('报表保存成功！');
                        $timeout(function () {
                            ngDialog.close('successDialog');
                        }, 1500);
                        for (var i = 0; i < $scope.result.length; i++) {
                            $scope.result[i].hasChanged = false;
                        }
                        $scope.hasChanged = false;
                    });
            };

            // 返回
            $scope.goBack = function (id) {
                var hasChanged = false;
                for (var i = 0; i < $scope.result.length; i++) {
                    if ($scope.result[i].hasChanged) {
                        hasChanged = true;
                        break;
                    }

                }
                if ($scope.hasChanged || hasChanged) {
                    dialogService.confirm('修改信息未保存，确认放弃修改？').then(function () {
                        if ($stateParams.fromType == '0') {
                            $state.go('main.report.manage.list', {group: $scope.tableData.reportGroupID, edit: 1}, {
                                reload: true
                            });
                        }
                        else if ($stateParams.fromType == '1') {
                            $state.go('main.report.favorite', {
                                reload: true
                            });
                        }
                        else {
                            window.location.href = '#index/system';
                        }
                    });
                }
                else {
                    if ($stateParams.fromType == '0') {
                        $state.go('main.report.manage.list', {group: $scope.tableData.reportGroupID, edit: 1}, {
                            reload: true
                        });
                    }
                    else if ($stateParams.fromType == '1') {
                        $state.go('main.report.favorite', {
                            reload: true
                        });
                    }
                    else {
                        window.location.href = '#index/system';
                    }
                }
            };

            // 下载模板
            $scope.downloadReport = function () {
                var downloadResult = angular.copy($scope.view);
                $.each(downloadResult, function (key, value) {
                    value.title = $scope.result[key].title;
                });
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
                        if (klen === 0) {
                            dialogService.alert('请确认所有图表在操作后均已预览');
                            return $q.reject(false);
                            break;
                        }
                        else {
                            for (var k = 0; k < klen; k++) {
                                var jlen = downloadResult[i].condition ? downloadResult[i].condition.length : 0;
                                for (var j = 0; j < jlen; j++) {
                                    if (downloadResult[i].column[k].filed === 'timeDim' && downloadResult[i].condition[j].filed === 'timeDim') {
                                        downloadResult[i].column[k].filed = downloadResult[i].condition[j].value[0].key;
                                        break;
                                    }

                                }

                            }
                        }
                    }

                }

                var paramter = {
                    reportName: $scope.tableData.reportName,
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
                        $scope.optAciton = resource.optAction || [];
                        if ($.inArray('download', $scope.optAciton) > -1) {
                            $scope.downloadAuth = true;
                        }

                        if ($.inArray('return', $scope.optAciton) > -1) {
                            $scope.returnAuth = true;
                        }

                        if ($.inArray('save', $scope.optAciton) > -1) {
                            $scope.saveAuth = true;
                        }

                        return;
                    }

                });
            });
        }
    ]);
});
