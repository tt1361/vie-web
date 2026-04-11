/**
 * 日期控件
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
    app.directive('calendar', ['$document', 'dialogService', function ($document, dialogService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'directives/calendar-directive.htm',
            scope: {
                item: '=',
                status: '@',
                type: '@'
            },
            link: function (scope, element, attrs) {
                if (scope.type === 'modelAdd') { // 新增模型
                    // 初始化
                    scope.item.timeType = '';
                    scope.item.timeValue = '';
                }

                // 石勇 新增 时分秒
                scope.chooseDatetime = false; // 是否显示选择开始时间框
                scope.endChooseDatetime = false; // 是否显示选择结束时间框
                scope.hourValue = '00';
                scope.minValue = '00';
                scope.endHourValue = '23';
                scope.endMinValue = '59';

                // 1.自然时间，2.相对时间，3.自定义时间 默认显示相对时间
                scope.item.timeType = scope.item.timeType ? Number(scope.item.timeType) : 2;
                scope.tab = scope.item.timeType === 2 ? 1 : 0;
                // -1.昨日, 1.今日, -2.上周, 2.本周, -3.上月, 3.本月, -4.上年, 4.本年, -7.过去7天, -30.过去30天, -90.过去90天, -180.过去180天, -365.过去365天 默认显示相对时间的过去7天
                scope.item.timeValue = scope.item.timeValue ? Number(scope.item.timeValue) : -7;
                if (scope.item.timeType === 1 || scope.item.timeType === 3) {
                    scope.item.timeValue = 0; // 自然时间、自定义时间编辑进来的时候默认不选中
                }

                scope.uid = Math.floor(Math.random() * 1000) + 1000;
                scope.isOpen = false;

                scope.changeTab = function (type) {
                    scope.item.timeType = type;
                    if (type === 1) {
                        scope.tab = 0;
                    }
                    else {
                        scope.tab = 1;
                    }
                };

                // 设置相对时间
                scope.setAbTime = function (day) {
                    // 石勇 新增 在点击相对时间时默认时分秒的值
                    scope.hourValue = '00';
                    scope.minValue = '00';
                    scope.endHourValue = '23';
                    scope.endMinValue = '59';
                    // 
                    scope.start = scope.$parent.systemDate && scope.$parent.systemDate != '${systemDate}' ? $.datepicker.formatDate('yy-mm-dd', new Date(new Date(scope.$parent.systemDate).getTime() - (day - 1) * 24 * 3600 * 1000)) : $.datepicker.formatDate('yy-mm-dd', new Date(new Date().getTime() - (day - 1) * 24 * 3600 * 1000));
                    scope.end = scope.$parent.systemDate && scope.$parent.systemDate != '${systemDate}' ? scope.$parent.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date());
                    scope.item.timeValue = -day;
                    scope.isCalendarOpen = false;
                    scope.setDateRange();
                    scope.item.timeType = 2;
                };

                // 相对时间时设置默认起始时间和结束时间
                if (scope.item.timeType == 2) {
                    scope.item.defaultStart = scope.$parent.systemDate && scope.$parent.systemDate != '${systemDate}' ? $.datepicker.formatDate('yy-mm-dd', new Date(new Date(scope.$parent.systemDate).getTime() + (scope.item.timeValue + 1) * 24 * 3600 * 1000)) : $.datepicker.formatDate('yy-mm-dd', new Date(new Date().getTime() + (scope.item.timeValue + 1) * 24 * 3600 * 1000));
                    scope.item.defaultEnd = scope.$parent.systemDate && scope.$parent.systemDate != '${systemDate}' ? scope.$parent.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date());
                }

                /*石勇 修改显示问题*/
                if (scope.item.defaultStart.length > 10) {
                    scope.inputTime = scope.item.defaultStart + '至' + scope.item.defaultEnd;
                }
                else {
                    scope.inputTime = scope.item.defaultStart + ' ' + scope.hourValue + ':' + scope.minValue + ':' + '00' + '至' + scope.item.defaultEnd + ' ' + scope.endHourValue + ':' + scope.endMinValue + ':' + '59';
                }
                scope.start = angular.copy(scope.item.defaultStart);
                scope.end = angular.copy(scope.item.defaultEnd);
                scope.now = angular.copy(scope.item.isToNow);

                // 设置至今/取消至今
                scope.setToNow = function () {
                    scope.item.isToNow = !scope.item.isToNow;
                    if (scope.item.isToNow) {
                        var now = scope.$parent.systemDate && scope.$parent.systemDate != '${systemDate}' ? scope.$parent.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date());
                        element.find('.endDatepicker').datepicker('option', 'minDate', now);
                        element.find('.endDatepicker').datepicker('option', 'maxDate', now);
                        scope.end = now;
                    }
                    else {
                        element.find('.endDatepicker').datepicker('option', 'minDate', scope.start);
                    }

                };
                // 打开日历控件
                scope.showOpen = function () {
                    scope.isOpen = !scope.isOpen;
                };

                // 设置自然时间
                scope.setReTime = function (type) {
                    // 石勇 新增 在点击自然时间时默认时分秒的值
                    scope.hourValue = '00';
                    scope.minValue = '00';
                    scope.endHourValue = '23';
                    scope.endMinValue = '59';
                    // 
                    var now = scope.$parent.systemDate && scope.$parent.systemDate != '${systemDate}' ? new Date(scope.$parent.systemDate) : new Date(); // 当前日期
                    var nowDayOfWeek = now.getDay(); // 今天本周的第几天
                    var nowDay = now.getDate(); // 当前日
                    var nowMonth = now.getMonth(); // 当前月
                    var nowYear = now.getYear(); // 当前年
                    nowYear += (nowYear < 2000) ? 1900 : 0; //
                    var lastMonthDate = scope.$parent.systemDate && scope.$parent.systemDate != '${systemDate}' ? new Date(scope.$parent.systemDate) : new Date(); // 上月日期
                    lastMonthDate.setDate(1);
                    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
                    var lastYear = lastMonthDate.getYear();
                    var lastMonth = lastMonthDate.getMonth();
                    var lastYearD = now.getFullYear() - 1;

                    if (type === -1) { // 昨日
                        scope.start = scope.$parent.systemDate && scope.$parent.systemDate != '${systemDate}' ? $.datepicker.formatDate('yy-mm-dd', new Date(new Date(scope.$parent.systemDate).getTime() - 24 * 3600 * 1000)) : $.datepicker.formatDate('yy-mm-dd', new Date(new Date().getTime() - 24 * 3600 * 1000));
                        scope.end = scope.start;
                    }

                    if (type === 1) { // 今日
                        scope.start = scope.$parent.systemDate && scope.$parent.systemDate != '${systemDate}' ? scope.$parent.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date());
                        scope.end = scope.start;
                    }

                    if (type === -2) { // 上周
                        // 获得上周的开始日期
                        var getUpWeekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek - 7);
                        scope.start = formatDate(getUpWeekStartDate);
                        // 获得上周的结束日期
                        var getUpWeekEndDate = new Date(nowYear, nowMonth, nowDay + (6 - nowDayOfWeek - 7));
                        scope.end = formatDate(getUpWeekEndDate);
                    }

                    if (type === 2) { // 本周
                        // 获得本周的开始日期
                        var getWeekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek);
                        scope.start = formatDate(getWeekStartDate);
                        // 获得本周的结束日期
                        var getWeekEndDate = new Date(nowYear, nowMonth, nowDay);
                        scope.end = formatDate(getWeekEndDate);
                    }

                    if (type === -3) { // 上月
                        // 获得上月开始及结束时间
                        if (lastMonth == 11) {
                            var getLastMonthStartDate = new Date(nowYear - 1, lastMonth, 1);
                            var getLastMonthEndDate = new Date(nowYear - 1, lastMonth, getMonthDays(nowYear, lastMonth));
                        }
                        else {
                            var getLastMonthStartDate = new Date(nowYear, lastMonth, 1);
                            var getLastMonthEndDate = new Date(nowYear, lastMonth, getMonthDays(nowYear, lastMonth));
                        }
                        scope.start = formatDate(getLastMonthStartDate);
                        scope.end = formatDate(getLastMonthEndDate);
                    }

                    if (type === 3) { // 本月
                        // 获得本月的开始日期
                        var getMonthStartDate = new Date(nowYear, nowMonth, 1);
                        scope.start = formatDate(getMonthStartDate);
                        // 获得本月的结束日期
                        var getMonthEndDate = new Date(nowYear, nowMonth, nowDay);
                        scope.end = formatDate(getMonthEndDate);
                    }

                    if (type === -4) { // 上年
                        // 获取去年的开始日期
                        var lastYearStartDate = new Date(lastYearD, 0, 1);
                        scope.start = formatDate(lastYearStartDate);
                        // 获取去年的结束日期
                        var lastYearEndDate = new Date(lastYearD, 11, 31);
                        scope.end = formatDate(lastYearEndDate);
                    }

                    if (type === 4) { // 本年
                        var nowYearD = now.getFullYear();
                        // 获取本年的开始日期
                        var nowYearStartDate = new Date(nowYearD, 0, 1);
                        scope.start = formatDate(nowYearStartDate);
                        // 获取本年的结束日期
                        var nowYearEndDate = new Date(nowYearD, nowMonth, nowDay);
                        scope.end = formatDate(nowYearEndDate);
                    }

                    scope.item.timeValue = type;
                    scope.item.timeType = 1;
                    scope.isCalendarOpen = false;
                    scope.setDateRange();
                };

                // 格式化日期：yyyy-MM-dd
                function formatDate(date) {
                    var myyear = date.getFullYear();
                    var mymonth = date.getMonth() + 1;
                    var myweekday = date.getDate();

                    if (mymonth < 10) {
                        mymonth = '0' + mymonth;
                    }

                    if (myweekday < 10) {
                        myweekday = '0' + myweekday;
                    }

                    return (myyear + '-' + mymonth + '-' + myweekday);
                }

                // 获得某月的天数
                function getMonthDays(nowYear, myMonth) {
                    var monthStartDate = new Date(nowYear, myMonth, 1);
                    var monthEndDate = new Date(nowYear, myMonth + 1, 1);
                    var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
                    return days;
                }

                // 自定义时间
                scope.custom = function () {
                    scope.item.timeType = 3;
                    scope.item.timeValue = '';
                    scope.isCalendarOpen = !scope.isCalendarOpen;
                    scope.start = angular.copy(scope.item.defaultStart);
                    scope.end = angular.copy(scope.item.defaultEnd);
                    if (!scope.start) {
                        scope.start = scope.$parent.systemDate && scope.$parent.systemDate != '${systemDate}' ? $.datepicker.formatDate('yy-mm-dd', new Date(new Date(scope.$parent.systemDate).getTime() - 7 * 24 * 3600 * 1000)) : $.datepicker.formatDate('yy-mm-dd', new Date(new Date().getTime() - 7 * 24 * 3600 * 1000));
                    }

                    if (!scope.end) {
                        scope.end = scope.$parent.systemDate && scope.$parent.systemDate != '${systemDate}' ? scope.$parent.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date());
                    }
                    else {
                        var endDate = scope.$parent.systemDate && scope.$parent.systemDate != '${systemDate}' ? scope.$parent.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date());
                        if (Number(scope.end.replace(/-/g, '')) < Number(endDate.replace(/-/g, ''))) {
                            scope.end = endDate;
                        }
                    }
                    element.find('.startDatepicker').datepicker('destroy');
                    element.find('.endDatepicker').datepicker('destroy');
                    element.find('.startDatepicker').datepicker({
                        dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
                        monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                        showMonthAfterYear: true,
                        dateFormat: 'yy-mm-dd',
                        yearSuffix: '年',
                        maxDate: scope.end,
                        defaultDate: scope.start,
                        onSelect: function (dateText, ins) {
                            element.find('.startDateInput').val(dateText);
                            scope.start = dateText;
                            if (!scope.item.isToNow) {
                                element.find('.endDatepicker').datepicker('option', 'minDate', dateText);
                            }

                        }
                    }).datepicker('setDate', scope.start);

                    element.find('.endDatepicker').datepicker({
                        dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
                        monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                        showMonthAfterYear: true,
                        minDate: scope.start,
                        defaultDate: scope.end,
                        dateFormat: 'yy-mm-dd',
                        yearSuffix: '年',
                        maxDate: scope.end, // scope.end
                        onSelect: function (dateText, ins) {
                            element.find('.endDateInput').val(dateText);
                            scope.end = dateText;
                            element.find('.startDatepicker').datepicker('option', 'maxDate', dateText);

                        }
                    }).datepicker('setDate', scope.end);

                    if (scope.item.isToNow) {
                        var now = scope.$parent.systemDate && scope.$parent.systemDate != '${systemDate}' ? scope.$parent.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date());
                        element.find('.endDatepicker').datepicker('option', 'minDate', now);
                        element.find('.endDatepicker').datepicker('option', 'maxDate', now);
                    }
                    else {
                        element.find('.endDatepicker').datepicker('option', 'minDate', scope.start);
                    }
                };
                // 应用按钮
                scope.setDateRange = function () {
                    scope.item.defaultStart = scope.start ? scope.start : scope.item.defaultStart;
                    scope.item.defaultEnd = scope.end ? scope.end : scope.item.defaultEnd;

                    /*石勇 新增 对开始时间与结束时间进行判断*/

                    /*石勇 新增 截取时间字符的前十位日期*/
                    if (scope.item.defaultStart.length > 10 || scope.item.defaultEnd.length > 10) {
                        scope.item.defaultStartCheck = scope.item.defaultStart.substr(0, 10);
                        scope.item.defaultEndCheck = scope.item.defaultEnd.substr(0, 10);
                    }
                    else {
                        scope.item.defaultStartCheck = scope.item.defaultStart;
                        scope.item.defaultEndCheck = scope.item.defaultEnd;
                    }

                    /*石勇 新增 传值增加时间*/
                    if (scope.item.defaultStartCheck.length < 11) {
                        scope.item.defaultStartCheck = scope.item.defaultStartCheck + ' ' + scope.hourValue + ':' + scope.minValue + ':' + '00';
                        scope.item.defaultEndCheck = scope.item.defaultEndCheck + ' ' + scope.endHourValue + ':' + scope.endMinValue + ':' + '59';
                    }

                    if (scope.item.defaultStartCheck > scope.item.defaultEndCheck) {
                        scope.hourValue = '00';
                        scope.minValue = '00';
                        scope.endHourValue = '23';
                        scope.endMinValue = '59';
                        scope.item.defaultStart = scope.item.defaultStart.substr(0, 10) + ' 00:00:00';
                        scope.item.defaultEnd = scope.item.defaultEnd.substr(0, 10) + ' 23:59:59';
                        scope.inputTime = scope.item.defaultStart.substr(0, 10) + ' 00:00:00' + '至' + scope.item.defaultEnd.substr(0, 10) + ' 23:59:59';
                        dialogService.alert('开始时间不能大于结束时间，请重新选择开始时间！');
                        scope.item.defaultStartCheck = scope.item.defaultStartCheck.substr(0, 10);
                        scope.item.defaultEndCheck = scope.item.defaultEndCheck.substr(0, 10);
                        return;
                    }

                    /*石勇 新增 截取时间字符的前十位日期*/
                    if (scope.item.defaultStart.length > 10 || scope.item.defaultEnd.length > 10) {
                        scope.item.defaultStart = scope.item.defaultStart.substr(0, 10);
                        scope.item.defaultEnd = scope.item.defaultEnd.substr(0, 10);
                    }

                    /*石勇 新增 传值增加时间*/
                    if (scope.item.defaultStart.length < 11) {
                        scope.item.defaultStart = scope.item.defaultStart + ' ' + scope.hourValue + ':' + scope.minValue + ':' + '00';
                        scope.item.defaultEnd = scope.item.defaultEnd + ' ' + scope.endHourValue + ':' + scope.endMinValue + ':' + '59';
                    }

                    /*石勇 新增 传值增加时间*/
                    // scope.item.defaultStartTemp = scope.item.defaultStart;
                    // scope.item.defaultEndTemp = scope.item.defaultEnd;
                    // scope.item.defaultStart = scope.item.defaultStart + " " + scope.hourValue + ":" + scope.minValue + ":" + "00";
                    // scope.item.defaultEnd = scope.item.defaultEnd + " " + scope.endHourValue + ":" + scope.endMinValue + ":" + "59";
                    // console.log(scope.item.defaultStart,scope.item.defaultEnd)

                    scope.inputTime = scope.item.defaultStart + '至' + scope.item.defaultEnd;

                    scope.now = angular.copy(scope.item.isToNow);
                    scope.showOpen();
                    if (scope.type === 'voice') {
                        var $scope = scope;
                        while (angular.isUndefined($scope.getUpdate)) {
                            $scope = $scope.$parent;
                        }
                        $scope.getUpdate();
                    }
                    else if (scope.type === 'hotwordListAnalysis') {
                        var $scope = scope;
                        while (angular.isUndefined($scope.refreshHotData)) {
                            $scope = $scope.$parent;
                        }
                        $scope.refreshHotData();
                    }
                    else if (scope.type === 'topic' || scope.type === 'topic-right' || scope.type === 'callList') {
                        var $scope = scope;
                        while (angular.isUndefined($scope.timeRefresh)) {
                            $scope = $scope.$parent;
                        }
                        $scope.timeRefresh();
                    }
                    else if (scope.type === 'buiOverview') {
                        var $scope = scope;
                        while (angular.isUndefined($scope.getColumData)) {
                            $scope = $scope.$parent;
                        }
                        $scope.getColumData();
                    }
                    else if (scope.type === 'index') {
                        var $scope = scope;
                        while (angular.isUndefined($scope.refreshDate)) {
                            $scope = $scope.$parent;
                        }
                        $scope.refreshDate();
                    }

                    /*石勇 新增 还原默认值*/
                    // scope.item.defaultStart = scope.item.defaultStartTemp;
                    // scope.item.defaultEnd = scope.item.defaultEndTemp;

                };
                // 关闭按钮
                scope.closeDialog = function () {
                    scope.start = angular.copy(scope.item.defaultStart);
                    scope.end = angular.copy(scope.item.defaultEnd);
                    scope.item.isToNow = angular.copy(scope.now);
                    if (scope.item.isToNow) {
                        var now = scope.$parent.systemDate && scope.$parent.systemDate != '${systemDate}' ? scope.$parent.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date());
                        element.find('.endDatepicker').datepicker('option', 'minDate', now);
                        element.find('.endDatepicker').datepicker('option', 'maxDate', now);
                    }
                    else {
                        element.find('.endDatepicker').datepicker('option', 'minDate', scope.start);
                    }
                    scope.isCalendarOpen = false;
                    scope.showOpen();
                };

                // if clicked outside of calendar
                $document.on('click', function (e) {
                    if (!scope.isOpen) {
                        return;
                    }

                    var i = 0,
                        ele;

                    if (!e.target) {
                        return;
                    }

                    for (ele = e.target; ele; ele = ele.parentNode) {
                        // var nodeName = angular.lowercase(element.nodeName)
                        if (angular.lowercase(ele.nodeName) === 'calendar' || ele.nodeType === 9 || angular.lowercase(ele.nodeName) === 'rect') {
                            break;
                        }

                        // 石勇 新增 在点击选择时间时，不关闭选择日期窗口
                        if (ele.className.indexOf('choose-hour') > -1 || ele.className.indexOf('show-time') > -1) {
                            return;
                        }

                        var uid = scope.$eval(ele.getAttribute('uid'));
                        if (!!uid && uid === scope.uid || angular.lowercase(ele.className).indexOf('ui-datepicker-header') > -1) {
                            return;
                        }

                    }

                    scope.showOpen();
                    scope.$apply();
                });

                // 石勇 新增 时分秒

                $('.chooseDatetimeTest').css('color', 'black');

                /*点击选择开始时间类型*/
                scope.DatetimeChoose = function (data) {
                    scope.chooseDatetime = true;
                    scope.judeg = false;
                    scope.datetimeTemp = [];

                    /*
                     *data值
                     *  data值为1，对应的是小时
                     *  data值为2，对应的是分钟
                     *  data值为3，对应的是秒
                     * */
                    if (data === 1) {
                        scope.datetimeType = 1;
                        scope.judeg = false;
                        scope.datetimeTemp = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
                    }

                    if (data === 2) {
                        scope.datetimeType = 2;
                        scope.judeg = true;
                        scope.datetimeTemp = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59'];
                    }

                };

                /*关闭选择开始时间框*/
                scope.closeChooseDatetime = function () {
                    scope.chooseDatetime = false;
                };

                /*选择开始时间数值*/
                scope.chooseResult = function (data) {
                    if (scope.datetimeType == 1) {
                        scope.hourValue = data;
                    }

                    if (scope.datetimeType == 2) {
                        scope.minValue = data;
                    }

                    scope.closeChooseDatetime();
                };

                /*点击选择结束时间类型*/
                scope.endDatetimeChoose = function (data) {
                    scope.endChooseDatetime = true;
                    scope.endJudeg = false;
                    scope.endDatetimeTemp = [];

                    /*
                     *data值
                     *  data值为1，对应的是小时
                     *  data值为2，对应的是分钟
                     *  data值为3，对应的是秒
                     * */
                    if (data === 1) {
                        scope.datetimeType = 1;
                        scope.endJudeg = false;
                        scope.endDatetimeTemp = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
                    }

                    if (data === 2) {
                        scope.datetimeType = 2;
                        scope.endJudeg = true;
                        scope.endDatetimeTemp = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59'];
                    }

                };

                /*关闭选择结束时间框*/
                scope.closeChooseEndDatetime = function () {
                    scope.endChooseDatetime = false;
                };

                /*选择结束时间数值*/
                scope.chooseEndResult = function (data) {
                    if (scope.datetimeType == 1) {
                        scope.endHourValue = data;
                    }

                    if (scope.datetimeType == 2) {
                        scope.endMinValue = data;
                    }

                    scope.closeChooseEndDatetime();
                };
            }
        };
    }]);
});
