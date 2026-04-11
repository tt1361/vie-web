/**
 * 详情页表格的功能
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

    app.directive('detailtable', [
        '$q',
        '$rootScope',
        'dialogService',
        'reportService', function ($q, $rootScope, dialogService, reportService) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'directives/detailTable-directive.htm',
                transclude: true,
                scope: {
                    tableDefault: '=', // 可修改参数与controller一致
                    viewConfig: '=', // 保留预览参数
                    opType: '=',
                    pageId: '=',
                    moduleName: '=',
                    moduleId: '='
                },
                link: function (scope, element, attrs) {
                    $rootScope.switchTostats = 'init'; // 初始化统计报表、详细报表切换标记，陈磊@2017-07-29

                    scope.isPreview = false;

                    scope.browser = $rootScope.getBowerserInfo();

                    scope.showIsByTaskId = $rootScope.isTask;

                    scope.pageOptions = {
                        pageNum: 1,
                        pageSize: 15
                    };

                    // 获取所有维度
                    scope.dimensions = scope.$parent.getDims();
                    // 是否显示统计周期
                    scope.hasTimeDim = false;
                    // 设置维度是否选中
                    for (var i = 0; i < scope.dimensions.length; i++) {
                        var dimension = scope.dimensions[i];
                        if (dimension.key == 'timeDim') {
                            // 统计周期
                            scope.timeDimList = dimension.value || [];
                        }

                        var index = scope.$parent.myInArray(scope.tableDefault.column, 'filed', dimension.key);
                        if (index > -1) {
                            if (dimension.key == 'timeDim') {
                                scope.hasTimeDim = true;
                            }

                            dimension.hasAdd = true;
                        }
                        else {
                            dimension.hasAdd = false;
                        }
                    }

                    // 所有指标
                    var measures = scope.$parent.getMeas();

                    // 设置指标是否选中
                    for (var i = 0; i < measures.length; i++) {
                        var measure = measures[i];
                        var index = scope.$parent.myInArray(scope.tableDefault.column, 'filed', measure.measure);
                        if (index > -1) {
                            measure.hasAdd = true;
                        }
                        else {
                            measure.hasAdd = false;
                        }
                    }

                    scope.measures = measures;

                    scope.computers = [];

                    // 设置左侧计算项
                    for (var i = 0; i < scope.tableDefault.column.length; i++) {
                        var item = scope.tableDefault.column[i];
                        if (item.type === 'computer') {
                            item.hasAdd = true;
                            scope.computers.push(item);
                        }

                    }

                    function checkParamter() {
                        var hasDimension = false;
                        for (var i = 0; i < scope.viewConfig.column.length; i++) {
                            if (hasDimension) {
                                break;
                            }

                            if (scope.viewConfig.column[i].type == 'dimension') {
                                hasDimension = true;
                            }

                        }
                        return hasDimension;
                    }

                    // 通过tabledefault获取表格数据
                    if (!scope.tableDefault.timeDimText) {
                        scope.tableDefault.timeDimText = scope.timeDimList[2].value;
                        scope.tableDefault.timeDimKey = scope.timeDimList[2].key;
                    }

                    // 钻取参数
                    var condition = angular.copy(scope.$parent.condition);
                    var mDrillCondition = angular.copy(condition);
                    scope.drillViewConfig = angular.copy(scope.viewConfig);
                    scope.drillType = ''; // 维度钻取或者指标项钻取
                    var isDirllBack = false; // 排序时为钻取返回数据
                    var isClickTd = false; // 是否为列表项点击

                    // 面包屑导航
                    var cc = {
                        filed: '',
                        name: '',
                        condition: ''
                    };

                    scope.paramList = [];
                    var timeDimValue = ['dimHour', 'dimMonth', 'dimDay', 'dimYear'];

                    scope.dirllBack = function (index, p, isLast) {
                        if (isLast) {
                            return;
                        }

                        isDirllBack = true;
                        scope.rows = [];
                        scope.counts = 0;
                        scope.drillType = p.type;
                        scope.paramList = scope.paramList.slice(0, index + 1);
                        reportService.getTableData(p.param)
                            .then(function (data) {
                                scope.result = data;
                                var param = JSON.parse(p.param.tableParams);
                                scope.rows = [];
                                for (var i = 0; i < scope.result.value.rows.length; i++) {
                                    var row = [];
                                    var c = param.column;
                                    for (var j = 0; j < c.length; j++) {
                                        var filed = c[j].filed;
                                        row.push({
                                            value: scope.result.value.rows[i][filed],
                                            column: c[j],
                                            valueCopy: scope.result.value.rowsCopy[i][filed]
                                        });
                                    }
                                    scope.rows.push(row);
                                }
                                scope.counts = data.value.totalRows;
                            });
                        // 石勇 新增
                        // 预览后，一层一层搜索时传参进行修改
                        if (scope.paramList.length > 0) {
                            var temp = [];
                            angular.forEach(scope.paramList, function (item1) {
                                angular.forEach(condition, function (item2) {
                                    if (item1.text.filed == item2.filed) {
                                        temp.push(item2);
                                    }

                                });
                            });
                            condition = temp;
                        }

                        // 
                        // 
                    };

                    var isFirst = true;

                    var param;
                    scope.getTableData = function () {
                        // 显示列表
                        if (scope.drillType == 'measure') {
                            scope.drillViewConfig.order = '';
                            for (var i = 0; i < scope.drillViewConfig.column.length; i++) {
                                if (scope.drillViewConfig.column[i].filed === 'timeDim') {
                                    scope.drillViewConfig.column[i].filed = scope.drillViewConfig.timeDimKey;
                                }

                                if ($.inArray(scope.drillViewConfig.order, timeDimValue) > -1
                                    && scope.drillViewConfig.order != scope.drillViewConfig.column[i].filed
                                    && $.inArray(scope.drillViewConfig.column[i].filed, timeDimValue) > -1) {
                                    scope.drillViewConfig.order = scope.drillViewConfig.column[i].filed;
                                }

                            }
                            if (!scope.drillViewConfig.order) {
                                // 设置默认排序
                                scope.drillViewConfig.order = scope.drillViewConfig.column[0].filed;
                                scope.drillViewConfig.orderType = 'asc';
                            }

                            scope.drillViewConfig.condition = mDrillCondition;
                            // 钻取时间不变
                            var t1 = param.startTime;
                            var t2 = param.endTime;
                            param = {
                                startTime: t1,
                                endTime: t2,
                                pageNum: scope.pageOptions.pageNum,
                                pageSize: scope.pageOptions.pageSize,
                                tableParams: JSON.stringify(scope.drillViewConfig)
                            };
                        }
                        else {
                            scope.optionFalse = false;
                            if (!checkParamter()) {
                                // 维度和指标不合法时，隐藏表格内容
                                scope.optionFalse = true;
                                if (!isFirst) {
                                    dialogService.alert('请选择维度!');
                                    scope.counts = 0;
                                }

                                isFirst = false;
                                return $q.reject(false);
                            }

                            isFirst = false;
                            // scope.viewConfig.order = '';
                            for (var i = 0; i < scope.viewConfig.column.length; i++) {
                                if (scope.viewConfig.column[i].filed === 'timeDim') {
                                    scope.viewConfig.column[i].filed = scope.viewConfig.timeDimKey;
                                }

                                if ($.inArray(scope.viewConfig.order, timeDimValue) > -1
                                    && scope.viewConfig.order != scope.viewConfig.column[i].filed
                                    && $.inArray(scope.viewConfig.column[i].filed, timeDimValue) > -1) {
                                    scope.viewConfig.order = scope.viewConfig.column[i].filed;
                                }

                            }

                            var index = scope.$parent.myInArray(scope.viewConfig.column, 'filed', scope.viewConfig.order);

                            if (!scope.viewConfig.order || index === -1) {
                                // 设置默认排序
                                scope.viewConfig.order = scope.viewConfig.column[0].filed;
                                scope.viewConfig.orderType = 'asc';
                            }

                            scope.viewConfig.condition = scope.$parent.condition;
                            var t1 = scope.$parent.timesRange.defaultStart;
                            var t2 = scope.$parent.timesRange.isToNow ? 'uptonow' : scope.$parent.timesRange.defaultEnd;
                            var timeType = scope.$parent.timesRange.timeType ? scope.$parent.timesRange.timeType : 2;
                            var timeValue = scope.$parent.timesRange.timeValue ? scope.$parent.timesRange.timeValue : -7;
                            if (scope.drillType) {
                                scope.viewConfig.condition = condition;
                                // 钻取时间不变
                                t1 = param.startTime;
                                t2 = param.endTime;
                                // timeType = param.timeType;
                                // timeValue = param.timeValue;
                            }

                            param = {
                                timeType: timeType,
                                timeValue: timeValue,
                                startTime: t1,
                                endTime: t2,
                                pageNum: scope.pageOptions.pageNum,
                                pageSize: scope.pageOptions.pageSize,
                                tableParams: JSON.stringify(scope.viewConfig)
                            };
                        }

                        /*石勇 新增 增加默认传值*/
                        if (param.startTime.length < 11) {
                            param.startTime = param.startTime + ' 00:00:00';
                            param.endTime = param.endTime + ' 23:59:59';
                        }

                        // 
                        if (isClickTd) {
                            scope.paramList.push({type: scope.drillType, param: angular.copy(param), text: angular.copy(cc)});
                        }

                        return reportService.getTableData(param)
                            .then(function (data) {
                                scope.result = data;
                                scope.rows = [];
                                if (data.value.rows) {
                                    for (var i = 0; i < scope.result.value.rows.length; i++) {
                                        var row = [];
                                        var c = scope.viewConfig.column;
                                        if (scope.drillType == 'measure') {
                                            c = scope.drillViewConfig.column;
                                        }

                                        if ($rootScope.isTask) {
                                            for (var j = 0; j < c.length; j++) {
                                                var filed = c[j].filed;
                                                row.push({
                                                    value: scope.result.value.rows[i][filed],
                                                    id: scope.result.value.rows[i].id,
                                                    column: c[j],
                                                    valueCopy: scope.result.value.rowsCopy[i][filed]
                                                });
                                            }
                                        }
                                        else {
                                            for (var j = 0; j < c.length; j++) {
                                                var filed = c[j].filed;
                                                row.push({
                                                    value: scope.result.value.rows[i][filed],
                                                    column: c[j],
                                                    valueCopy: scope.result.value.rowsCopy[i][filed]
                                                });
                                            }
                                        }

                                        scope.rows.push(row);
                                    }
                                    scope.counts = data.value.totalRows;
                                }

                                scope.isPreview = true;
                                scope.$broadcast('resize');
                                var height = $('.data-outer-panel').height() - $('.list-title').height() - $('.detail_condition_wrapper').height();
                                if ($('#detail_table').height > height) {
                                    $('.list-wrap').height(height);
                                }

                            });
                    };

                    scope.getTableData();

                    // 移除计算项
                    scope.removeComputer = function (filed, text, index) {
                        if (scope.computers[index].hasAdd) {
                            scope.addTotable(filed, text, 'computer', index, 'del');
                        }

                        scope.computers.splice(index, 1);
                    };

                    // 排序
                    scope.sortByOrder = function (order, orderType) {
                        if (scope.drillType == 'measure') {
                            if (order == scope.drillViewConfig.order && orderType == scope.drillViewConfig.orderType) {
                                return;
                            }
                            else {
                                scope.drillViewConfig.order = order;
                                scope.drillViewConfig.orderType = orderType;
                            }
                        }
                        else {
                            if (order == scope.viewConfig.order && orderType == scope.viewConfig.orderType) {
                                return;
                            }
                            else {
                                scope.viewConfig.order = order;
                                scope.viewConfig.orderType = orderType;
                            }
                        }
                        if (isDirllBack) { // 钻取后排序问题
                            var l = scope.paramList.length;
                            var p = scope.paramList[l - 1];
                            p.param.tableParams = eval('(' + p.param.tableParams + ')');
                            if (order == p.param.tableParams.order && orderType == p.param.tableParams.orderType) {
                                return;
                            }
                            else {
                                p.param.tableParams.order = order;
                                p.param.tableParams.orderType = orderType;
                            }
                            p.param.tableParams = JSON.stringify(p.param.tableParams);
                            p.param.timeType = scope.$parent.timesRange.timeType ? scope.$parent.timesRange.timeType : 2;
                            p.param.timeValue = scope.$parent.timesRange.timeValue ? scope.$parent.timesRange.timeValue : -7;
                            scope.dirllBack(l - 1, p, false);
                        }
                        else {
                            scope.getTableData();
                        }
                    };

                    var keyWordIndex = -1;
                    var keyWord = {};
                    // 石勇
                    // 新增 20170504
                    // 定义一个数组，用来存储切换到统计表格时从详细表格中删除的维度标签
                    var indexArray = [];
                    // 表格类型切换
                    scope.$watch('tableDefault.tableType', function (newVal, oldVal) {
                        if (newVal !== oldVal) {
                            // 石勇 新增
                            // 切换表格类型时，使下方的维度显示在其最左侧
                            if (scope.$$childHead.$$nextSibling.left.left != 0) {
                                scope.$$childHead.$$nextSibling.saveColumn();
                            }

                            // 
                            scope.viewConfig.column = [];
                            scope.viewConfig.order = '';
                            scope.drillViewConfig.column = [];
                            scope.drillViewConfig.order = '';
                            scope.paramList = [];
                            scope.rows = [];
                            scope.counts = 0;
                            if (newVal == 'detail') {
                                var columnTemp = [];
                                for (var i = 0; i < scope.tableDefault.column.length; i++) {

                                    var column = scope.tableDefault.column[i];
                                    if (column.type == 'dimension') {
                                        columnTemp.push(column);
                                    }

                                    if (column.type == 'measure') {
                                        var index = scope.$parent.myInArray(scope.measures, 'measure', column.filed);
                                        scope.measures[index].hasAdd = false;
                                    }

                                    if (column.type == 'computer') {
                                        var index = scope.$parent.myInArray(scope.computers, 'filed', column.filed);
                                        scope.computers[index].hasAdd = false;
                                    }

                                }
                                scope.tableDefault.column = angular.copy(columnTemp);
                                // if(keyWordIndex >= 0){
                                //     scope.tableDefault.column.splice(keyWordIndex, 0, keyWord);
                                // }

                                // 石勇
                                // 新增 20170504
                                // 为了解决报表中表格类型切换时会发生的关于维度标签的bug
                                if (indexArray.length > 0) {
                                    for (var i = 0; i < indexArray.length; i++) {
                                        scope.tableDefault.column.splice(indexArray[i].Index, 0, indexArray[i].item);
                                    }
                                }

                            // 
                            // 
                            }
                            else {
                                $rootScope.switchTostats = 'stats'; // 标记为统计报表切换，陈磊@2017-07-29

                                /*陈磊，优化处理，切换两种报表时，对指标和计算项的不选中处理 2017-07-18 */

                                for (var j = 0; j < scope.measures.length; j++) {
                                    scope.measures[j].hasAdd = false;
                                }
                                for (var k = 0; k < scope.computers.length; k++) {
                                    scope.computers[k].hasAdd = false;
                                }

                                /**石勇,新增 20170504
                                为了解决报表中表格类型切换时会发生的关于维度标签的bug
                                这部分的目的是为了判断维度标签中的部分标签是否出现的情况进行判断
                                */
                                indexArray = [];
                                for (var i = 0; i < scope.tableDefault.column.length; i++) {
                                    var column = scope.tableDefault.column[i];
                                    // 因为维度标签上有些维度标签获取不到analysis的值，所以不能直接用“analysis==0”进行区别判断
                                    if (column.filed == 'keyword' || column.filed == 'timeFormat' || column.filed == 'voiceId' || column.filed == 'taskId' || column.filed == 'ifLone' && column.filed != 'timeDim' && column.filed != 'offLineTagId') {
                                        scope.tableDefault.column.splice(i, 1);
                                        indexArray.push({
                                            Index: i,
                                            item: column
                                        });
                                        i--;
                                    }

                                }
                            }
                            scope.tableDefault.hasChanged = true;
                        }

                    });

                    // 根据值和dimension获取组装condition
                    function getConditionValue(column, value) {
                        var item;
                        var cvalue;
                        if (column.dtype == 'timeDim') {
                            item = {filed: column.filed, value: [value], type: 'mulSel'};
                        }
                        else {
                            angular.forEach(scope.dimensions, function (dimension) {
                                if (column.filed == dimension.key) {
                                    if (dimension.type == 'mulSel'
                                        || dimension.type == 'mulEqu') {
                                        cvalue = [value];
                                    }

                                    if (dimension.type == 'range') {
                                        if (!angular.isUndefined(value) && !Number(value) && value.indexOf('~') > -1 && value.split('~').length > 1) { // 区间
                                            cvalue = [value.split('~')[0] + '|' + value.split('~')[1]];
                                        }
                                        else {
                                            cvalue = [value + '|'];
                                        }

                                        /*cvalue = [value+'|'+value];*/
                                    }

                                    if (dimension.type == 'offLineTagId'
                                        || dimension.type == 'radio') {
                                        angular.forEach(dimension.value, function (i) {
                                            if (angular.isArray(i.value)) {
                                                angular.forEach(i.value, function (v) {
                                                    if (value == v.value) {
                                                        cvalue = [{
                                                            key: v.key,
                                                            value: v.value
                                                        }];
                                                    }

                                                });
                                            }
                                            else if (value == i.value) {
                                                cvalue = [{
                                                    key: i.key,
                                                    value: i.value
                                                }];
                                            }

                                        });
                                    }
                                }

                            });
                            item = {filed: column.filed, value: cvalue, type: column.dtype};
                        }
                        return item;
                    }

                    // 表格点击
                    scope.tdClick = function (value, column, row, valueCopy) {
                        if (value == null) {
                            return;
                        }

                        // 详细报表不能钻取
                        if (scope.tableDefault.tableType == 'detail'
                            || value == '') {
                            return;
                        }

                        // 同一列不能进行二次钻取
                        var hasClicked = false;
                        angular.forEach(scope.paramList, function (item) {
                            if (item.text.filed == column.filed) {
                                hasClicked = true;
                            }

                        });
                        if (hasClicked) {
                            return;
                        }

                        isDirllBack = true;
                        isClickTd = true;
                        scope.pageOptions.pageNum = 1;
                        scope.rows = [];
                        scope.counts = 0;
                        scope.drillType = column.type;
                        cc.name = column.name;
                        cc.filed = column.filed;
                        cc.condition = '';
                        if (column.type == 'dimension') {
                            var hasCondition = false;
                            condition = condition.length ? condition : angular.copy(scope.$parent.condition);
                            if (condition.length) {
                                angular.forEach(scope.dimensions, function (dimension) {
                                    angular.forEach(condition, function (item) {
                                        if ((item.filed === column.filed) && (item.filed === dimension.key)) {
                                            if (item.type == 'mulSel'
                                                || item.type == 'mulEqu') {
                                                item.value = [valueCopy];
                                            }

                                            if (item.type == 'range') {
                                                if (!Number(value) && value.indexOf('~') > -1 && value.split('~').length > 1) { // 区间
                                                    item.value = [value.split('~')[0] + '|' + value.split('~')[1]];
                                                }
                                                else {
                                                    item.value = [value + '|'];
                                                }
                                            }

                                            if (dimension.type == 'offLineTagId'
                                                || dimension.type == 'radio') {
                                                angular.forEach(dimension.value, function (i) {
                                                    if (angular.isArray(i.value)) {
                                                        angular.forEach(i.value, function (v) {
                                                            if (value == v.value) {
                                                                cvalue = [{
                                                                    key: v.key,
                                                                    value: v.value
                                                                }];
                                                            }

                                                        });
                                                    }
                                                    else if (value == i.value) {
                                                        cvalue = [{
                                                            key: i.key,
                                                            value: i.value
                                                        }];
                                                    }

                                                });
                                            }

                                            hasCondition = true;
                                        }

                                    });
                                });
                                if (!hasCondition) {
                                    condition.push(getConditionValue(column, valueCopy));
                                }
                            }
                            else {
                                condition.push(getConditionValue(column, valueCopy));
                            }
                            cc.condition = value;
                        }
                        else {
                            scope.drillViewConfig.column = [];
                            scope.drillViewConfig.order = '';
                            var hasVoiceId = false;
                            var hasTaskId = false;
                            mDrillCondition = angular.copy(condition);
                            angular.forEach(row, function (item) {
                                if (item.column.type == 'dimension') {
                                    if (item.column.filed == 'voiceId') {
                                        hasVoiceId = true;
                                        scope.drillViewConfig.column.unshift(item.column);
                                    }
                                    else if (item.column.filed == 'taskId') {
                                        hasTaskId = true;
                                        scope.drillViewConfig.column.unshift(item.column);
                                    }
                                    else {
                                        scope.drillViewConfig.column.push(item.column);
                                    }
                                    var hasCondition = false;
                                    if (mDrillCondition.length) {
                                        angular.forEach(mDrillCondition, function (i) {
                                            if (i.filed == item.column.filed) {
                                                if (i.type == 'mulSel'
                                                    || i.type == 'mulEqu') {
                                                    i.value = [item.value];
                                                }

                                                if (i.type == 'range') {
                                                    // i.value = [item.value+'|'+item.value];
                                                    if (!Number(item.value) && item.value.indexOf('~') > -1 && item.value.split('~').length > 1) { // 区间
                                                        i.value = [item.value.split('~')[0] + '|' + item.value.split('~')[1]];
                                                    }
                                                    else {
                                                        i.value = [i.value + '|'];
                                                    }
                                                }

                                                if (i.type == 'offLineTagId'
                                                    || i.type == 'radio') {
                                                    var cvalue = [];
                                                    angular.forEach(i.value, function (v) {
                                                        if (angular.isArray(v.value)) {
                                                            angular.forEach(v.value, function (t) {
                                                                if (item.value == t.value) {
                                                                    cvalue = [{
                                                                        key: t.key,
                                                                        value: t.value
                                                                    }];
                                                                }

                                                            });
                                                        }
                                                        else if (v.value == item.value) {
                                                            cvalue = [{
                                                                key: v.key,
                                                                value: v.value
                                                            }];
                                                        }

                                                    });
                                                    i.value = cvalue;
                                                }

                                                hasCondition = true;
                                            }

                                        });
                                        if (!hasCondition) {
                                            mDrillCondition.push(getConditionValue(item.column, item.valueCopy));
                                        }
                                    }
                                    else {
                                        mDrillCondition.push(getConditionValue(item.column, item.valueCopy));
                                    }
                                }

                            });
                            if (!hasVoiceId && !$rootScope.isTask) {
                                scope.drillViewConfig.column.unshift({
                                    name: '流水号',
                                    text: '流水号',
                                    type: 'dimension',
                                    filed: 'voiceId',
                                    dtype: ''
                                });
                            }

                            if (!hasTaskId && $rootScope.isTask) {
                                scope.drillViewConfig.column.unshift({
                                    name: '任务号',
                                    text: '任务号',
                                    type: 'dimension',
                                    filed: 'taskId',
                                    dtype: ''
                                });
                            }
                        }
                        scope.getTableData();
                        isClickTd = false;
                    };

                    // 预览
                    scope.setShow = function () {
                        scope.paramList = [];
                        scope.drillType = '';
                        // 石勇 判断当前选择的条件选项是否选择了具体的筛选条件
                        // 想法：对当前选择的条件进行判断，如果选择了条件，但并未选择具体筛选条件内容，则删除该条件
                        for (var i = 0; i < scope.$parent.condition.length; i++) {
                            if (scope.$parent.condition[i].value.length == 0) { // 判断当前的条件数组中是否存在未选择条件的情况
                                scope.$parent.condition.splice(i, 1);
                                i--;
                            }

                        }
                        // 
                        condition = angular.copy(scope.$parent.condition);
                        isDirllBack = false;
                        scope.viewConfig.column = angular.copy(scope.tableDefault.column);
                        scope.viewConfig.tableType = scope.tableDefault.tableType;
                        scope.viewConfig.timeDimText = scope.tableDefault.timeDimText;
                        scope.viewConfig.timeDimKey = scope.tableDefault.timeDimKey;
                        scope.pageOptions.pageNum = 1;
                        // 获取表格数据
                        scope.getTableData();
                    };
                }
            };
        }]);
});
