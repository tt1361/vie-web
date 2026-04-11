/**
 * 本文件实现依赖任何一个 Angular 的module, 如果不采用本系统的框架，
 *      可以可以在  factory(window.app) app 修改你所创建的模块名称
 *  @dependece: Angular Module
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

    /**
    *  本文件中的Controller 实现so
    *
    */
    app.directive('timeRange', [
        '$document',
        'dialogService', function ($document, dialogService) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'search/common/time-range-directive.htm',
                scope: {
                    item: '=',
                    type: '@'
                },
                link: function (scope, element, attrs) {
                    // 石勇 新增 时分秒
                    scope.chooseDatetime = false; // 是否显示选择开始时间框
                    scope.endChooseDatetime = false; // 是否显示选择结束时间框
                    scope.hourValue = '00';
                    scope.minValue = '00';
                    scope.endHourValue = '23';
                    scope.endMinValue = '59';
                    // scope.item.startDatetimeTemp = " " + scope.hourValue + ":" + scope.minValue + ":" + "00";
                    // scope.item.endDatetimeTemp = " " + scope.endHourValue + ":" + scope.endMinValue + ":" + "59";
                    // 
                    scope.start = '';
                    scope.end = '';
                    // 展示与收起
                    scope.showTimeOpen = function () {
                        scope.isOpen = !scope.isOpen;
                    };

                    scope.lastType = angular.copy(scope.item.timeType);

                    // 设置时间
                    scope.setTimes = function (type) {
                        // 石勇 新增 选择相对时间时默认修改时分秒的值
                        scope.item.startDatetimeTemp = ' 00:00:00';
                        scope.item.endDatetimeTemp = ' 23:59:59';
                        // 
                        scope.item.timeType = type;
                        scope.lastType = angular.copy(scope.item.timeType);
                        var now = scope.$parent.systemDate && scope.$parent.systemDate != '${systemDate}' ? new Date(scope.$parent.systemDate) : new Date();
                        switch (type) {
                            case 'lastOneDay':
                                now.setDate(now.getDate());
                                scope.item.defaultTimeName = '一天内';
                                break;
                            case 'lastWeek':
                                now.setDate(now.getDate() - 6);
                                scope.item.defaultTimeName = '一周内';
                                break;
                            case 'lastYear':
                                now.setFullYear(now.getFullYear() - 1);
                                scope.item.defaultTimeName = '一年内';
                                break;
                            default:
                                break;
                        }
                        scope.item.startTime = formatDate(now);
                        scope.item.endTime = scope.$parent.systemDate && scope.$parent.systemDate != '${systemDate}' ? scope.$parent.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date());
                        scope.item.defaultTime = scope.item.startTime + ' 00:00:00' + '~' + scope.item.endTime + ' 23:59:59';
                        scope.showRange = false;
                        scope.showTimeOpen();
                        var $scope = scope;
                        while (angular.isUndefined($scope.showViewResult)) {
                            $scope = $scope.$parent;
                        }
                        $scope.showViewResult(Number(scope.type));
                    };

                    // 自定义时间
                    scope.customDate = function () {
                        scope.item.timeType = 'customDate';
                        scope.showRange = true;
                        scope.item.startTime = scope.item.startTime ? scope.item.startTime : $.datepicker.formatDate('yy-mm-dd', new Date(new Date().getTime() - 7 * 24 * 3600 * 1000));
                        scope.item.endTime = scope.item.endTime ? scope.item.endTime : $.datepicker.formatDate('yy-mm-dd', new Date());

                        /*石勇 新增 搜索跳转时展开显示对应的时分秒*/
                        scope.hourValue = scope.item.defaultTime.substring(11, 13);
                        scope.minValue = scope.item.defaultTime.substring(14, 16);
                        scope.endHourValue = scope.item.defaultTime.substring(31, 33);
                        scope.endMinValue = scope.item.defaultTime.substring(34, 36);

                        /*新增结束*/
                        element.find('.startDatepicker').datepicker({
                            dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
                            monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                            showMonthAfterYear: true,
                            showOtherMonths: true,
                            dateFormat: 'yy-mm-dd',
                            yearSuffix: '年',
                            maxDate: scope.item.endTime,
                            onSelect: function (dateText, ins) {
                                element.find('.startDateInput').val(dateText);
                                scope.start = dateText;
                                element.find('.endDatepicker').datepicker('option', 'minDate', dateText);
                            }
                        }).datepicker('setDate', scope.item.startTime);

                        element.find('.endDatepicker').datepicker({
                            dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
                            monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                            showMonthAfterYear: true,
                            showOtherMonths: true,
                            minDate: scope.item.startTime,
                            dateFormat: 'yy-mm-dd',
                            yearSuffix: '年',
                            maxDate: $.datepicker.formatDate('yy-mm-dd', new Date()),
                            onSelect: function (dateText, ins) {
                                element.find('.endDateInput').val(dateText);
                                scope.end = dateText;
                                element.find('.startDatepicker').datepicker('option', 'maxDate', dateText);
                            }
                        }).datepicker('setDate', scope.item.endTime);
                    };

                    scope.setDateRange = function () {
                        scope.item.startTime = scope.start ? scope.start : scope.item.startTime;
                        scope.item.endTime = scope.end ? scope.end : scope.item.endTime;

                        /*石勇 新增 传值增加时间*/
                        scope.item.startTimeTemp = scope.item.startTime;
                        scope.item.endTimeTemp = scope.item.endTime;
                        scope.item.startDatetimeTemp = ' ' + scope.hourValue + ':' + scope.minValue + ':' + '00';
                        scope.item.endDatetimeTemp = ' ' + scope.endHourValue + ':' + scope.endMinValue + ':' + '59';
                        scope.item.startTime = scope.item.startTime + ' ' + scope.hourValue + ':' + scope.minValue + ':' + '00';
                        scope.item.endTime = scope.item.endTime + ' ' + scope.endHourValue + ':' + scope.endMinValue + ':' + '59';
                        // 

                        /*石勇 新增 对开始时间与结束时间进行判断*/
                        if (scope.item.startTime > scope.item.endTime) {

                            /*石勇 新增 还原默认值*/
                            scope.hourValue = '00';
                            scope.minValue = '00';
                            scope.endHourValue = '23';
                            scope.endMinValue = '59';
                            scope.item.startDatetimeTemp = ' 00:00:00';
                            scope.item.endDatetimeTemp = ' 23:59:59';
                            scope.item.startTime = scope.item.startTimeTemp;
                            scope.item.endTime = scope.item.endTimeTemp;
                            scope.item.defaultTimeName = scope.item.startTime + ' 00:00:00' + '~' + scope.item.endTime + ' 23:59:59';
                            dialogService.alert('开始时间不能大于结束时间，请重新选择开始时间！');
                            return;
                        }

                        // 
                        scope.item.defaultTimeName = scope.item.startTime + '~' + scope.item.endTime;
                        scope.item.defaultTime = scope.item.defaultTimeName;
                        scope.lastType = angular.copy(scope.item.timeType);
                        scope.showTimeOpen();
                        var $scope = scope;
                        while (angular.isUndefined($scope.showViewResult)) {
                            $scope = $scope.$parent;
                        }
                        $scope.showViewResult(Number(scope.type));

                        /*石勇 新增 还原默认值*/
                        scope.item.startTime = scope.item.startTimeTemp;
                        scope.item.endTime = scope.item.endTimeTemp;
                    };

                    scope.closeDialog = function () {
                        scope.item.timeType = angular.copy(scope.lastType);
                        scope.showRange = false;
                    };

                    function formatDate(dateObj) {
                        var year = dateObj.getFullYear(),
                            month = dateObj.getMonth() + 1,
                            date = dateObj.getDate();
                        return [year, '-', month < 10 ? '0' : '', month, '-', date < 10 ? '0' : '', date].join('');
                    }

                    // 点击页面其他地方关闭弹窗
                    $(window.document).click(function (event) {
                        if (!angular.element(event.target).parents('.search-input-time').length
                            && !angular.element(event.target).parents('.ui-datepicker-header').length
                            && !angular.element(event.target).hasClass('picture-select-down')
                            && !angular.element(event.target).hasClass('chooseDatetimeTest')
                            && !angular.element(event.target).hasClass('close-datetime-text')
                            && scope.isOpen) {
                            scope.item.timeType = angular.copy(scope.lastType);
                            scope.showRange = false;
                            scope.isOpen = false;
                        }

                        scope.$apply();
                    });

                    // 获取时间
                    scope.getTimes = function (type) {
                        scope.item.timeType = type;
                        var now = scope.$parent.systemDate && scope.$parent.systemDate != '${systemDate}' ? new Date(scope.$parent.systemDate) : new Date();
                        switch (type) {
                            case 'lastOneDay':
                                now.setDate(now.getDate());
                                scope.item.defaultTimeName = '一天内';
                                scope.item.startTime = formatDate(now);
                                scope.item.endTime = scope.$parent.systemDate && scope.$parent.systemDate != '${systemDate}' ? scope.$parent.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date());
                                scope.item.defaultTime = scope.item.startTime + '~' + scope.item.endTime;
                                break;
                            case 'lastWeek':
                                now.setDate(now.getDate() - 6);
                                scope.item.defaultTimeName = '一周内';
                                scope.item.startTime = formatDate(now);
                                scope.item.endTime = scope.$parent.systemDate && scope.$parent.systemDate != '${systemDate}' ? scope.$parent.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date());
                                scope.item.defaultTime = scope.item.startTime + '~' + scope.item.endTime;
                                break;
                            case 'lastYear':
                                now.setFullYear(now.getFullYear() - 1);
                                scope.item.defaultTimeName = '一年内';
                                scope.item.startTime = formatDate(now);
                                scope.item.endTime = scope.$parent.systemDate && scope.$parent.systemDate != '${systemDate}' ? scope.$parent.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date());
                                scope.item.defaultTime = scope.item.startTime + '~' + scope.item.endTime;
                                break;
                            case 'customDate':
                                scope.item.defaultTimeName = scope.item.startTime + '~' + scope.item.endTime;
                                scope.item.defaultTime = scope.item.defaultTimeName;
                                break;
                            default:
                                scope.item.defaultTimeName = '时间';
                                scope.item.defaultTime = '';
                                break;
                        }
                    };

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

                    scope.getTimes(scope.item.timeType);
                }
            };

        }
    ]);

});
