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
    *  reportGroupCtrl 实现报表管理  分组区域的逻辑
    *   @params:
    *       $http:  http请求服务Service
    *       $scope: $scope, 作用域Service
    *
    */
    app.directive('advanceTime', [
        'dialogService', function (dialogService) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'search/advance/advance-time-directive.htm',
                scope: {
                    item: '='
                },
                link: function (scope, element, attrs) {
                    // 石勇 新增 时分秒
                    scope.chooseDatetime = false; // 是否显示选择开始时间框
                    scope.endChooseDatetime = false; // 是否显示选择结束时间框
                    scope.hourValue = '00';
                    scope.minValue = '00';
                    scope.endHourValue = '23';
                    scope.endMinValue = '59';
                    scope.item.startDatetimeTemp = ' ' + scope.hourValue + ':' + scope.minValue + ':' + '00';
                    scope.item.endDatetimeTemp = ' ' + scope.endHourValue + ':' + scope.endMinValue + ':' + '59';
                    // 

                    scope.start = angular.copy(scope.item.startTime);
                    scope.end = angular.copy(scope.item.endTime);

                    if (scope.item.startTime && scope.item.endTime) {
                        scope.item.defaultTime = scope.item.startTime + ' ' + scope.hourValue + ':' + scope.minValue + ':' + '00' + '~' + scope.item.endTime + ' ' + scope.endHourValue + ':' + scope.endMinValue + ':' + '59';
                    }
                    else {
                        scope.item.defaultTime = '';
                    }

                    // 默认不展示
                    scope.isOpen = false;
                    // 展示与收起
                    scope.showTimeOpen = function () {
                        if (scope.item.defaultTime) {
                            scope.hourValue = scope.item.defaultTime.substring(11, 13);
                            scope.minValue = scope.item.defaultTime.substring(14, 16);
                            scope.endHourValue = scope.item.defaultTime.substring(31, 33);
                            scope.endMinValue = scope.item.defaultTime.substring(34, 36);
                        }
                        else {
                            scope.hourValue = '00';
                            scope.minValue = '00';
                            scope.endHourValue = '23';
                            scope.endMinValue = '59';
                        }

                        /*新增结束*/
                        scope.isOpen = !scope.isOpen;
                        scope.start = angular.copy(scope.item.startTime);
                        scope.end = angular.copy(scope.item.endTime);
                        if (!scope.start) {
                            scope.start = scope.$parent.systemDate && scope.$parent.systemDate != '${systemDate}' ? $.datepicker.formatDate('yy-mm-dd', new Date(new Date(scope.$parent.systemDate).getTime() - 7 * 24 * 3600 * 1000)) : $.datepicker.formatDate('yy-mm-dd', new Date(new Date().getTime() - 7 * 24 * 3600 * 1000));
                        }

                        if (!scope.end) {
                            scope.end = scope.$parent.systemDate && scope.$parent.systemDate != '${systemDate}' ? scope.$parent.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date());
                        }

                        $('#startAdDatepicker').datepicker({
                            dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
                            monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                            showMonthAfterYear: true,
                            dateFormat: 'yy-mm-dd',
                            yearSuffix: '年',
                            maxDate: scope.end,
                            onSelect: function (dateText, ins) {
                                $('#startAdDateInput').val(dateText);
                                scope.start = dateText;
                                $('#endAdDatepicker').datepicker('option', 'minDate', dateText);
                            }
                        }).datepicker('setDate', scope.start);

                        $('#endAdDatepicker').datepicker({
                            dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
                            monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                            showMonthAfterYear: true,
                            minDate: scope.start,
                            dateFormat: 'yy-mm-dd',
                            yearSuffix: '年',
                            maxDate: scope.end,
                            onSelect: function (dateText, ins) {
                                $('#endAdDateInput').val(dateText);
                                scope.end = dateText;
                                // $('#startAdDatepicker').datepicker('option', 'maxDate', dateText);
                            }
                        }).datepicker('setDate', scope.end);
                    };

                    /**
                        设置时间区间
                    */
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
                            // scope.item.startTime = scope.item.startTimeTemp;
                            // scope.item.endTime = scope.item.endTimeTemp;
                            // scope.item.defaultTime = scope.item.startTime + " 00:00:00" + "~" + scope.item.endTime + " 23:59:59";
                            dialogService.alert('开始时间不能大于结束时间，请重新选择开始时间！');
                            return;
                        }

                        // 
                        scope.item.defaultTime = scope.item.startTime + '~' + scope.item.endTime;
                        scope.item.defaultTimeName = scope.item.defaultTime;
                        scope.item.timeType = 'customDate';
                        scope.showTimeOpen();

                        /*石勇 新增 还原默认值*/
                        scope.item.startTime = scope.item.startTimeTemp;
                        scope.item.endTime = scope.item.endTimeTemp;
                    };

                    scope.closeDialog = function () {
                        scope.isOpen = false;
                    };

                    // 点击页面其他地方关闭弹窗
                    $(window.document).click(function (event) {
                        if (!angular.element(event.target).parents('.time-advance').length
                            && !angular.element(event.target).parents('.ui-datepicker-header').length
                            && !angular.element(event.target).hasClass('advance-time-input')
                            && !angular.element(event.target).hasClass('chooseDatetimeTest')
                            && !angular.element(event.target).hasClass('close-datetime-text')
                            && scope.isOpen) {
                            scope.isOpen = false;
                        }

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
