/**
 * 时间控件
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
    app.directive('timeSelectIndex', function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'index/system/time-select-index-directive.htm',
            scope: {
                selectTime: '='
            },
            link: function (scope, element, attrs) {
                var now = scope.$parent.systemDate && scope.$parent.systemDate != '${systemDate}' ? scope.$parent.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date());
                element.find('.timeStart').datepicker({
                    dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
                    monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                    showMonthAfterYear: true,
                    dateFormat: 'yy-mm-dd',
                    yearSuffix: '年',
                    maxDate: now,
                    onSelect: function (dateText, ins) {
                        scope.selectTime = dateText;
                        scope.$parent.selectTime = dateText;
                        var isDis = $('#ui-datepicker-div').css('display');
                        if (isDis === 'block') {
                            $('#ui-datepicker-div').css('display', 'none');
                        }

                        var $scope = scope;
                        while (angular.isUndefined($scope.refreshDate)) {
                            $scope = $scope.$parent;
                        }
                        $scope.refreshDate();
                    }
                });

                scope.condata = function () {
                    var isDis = $('#ui-datepicker-div').css('display');
                    if (isDis === 'none') {
                        $('#ui-datepicker-div').css('display', 'block');
                    }

                };

                $(window.document).click(function (event) {
                    var isDis = $('#ui-datepicker-div').css('display');
                    if (!angular.element(event.target).parents('#ui-datepicker-div').length
                        && !angular.element(event.target).parents('.index-time').length
                        && !angular.element(event.target).parents('.ui-datepicker-header').length
                        && isDis === 'block') {
                        $('#ui-datepicker-div').css('display', 'none');
                    }
                    else if ((angular.element(event.target).parents('#ui-datepicker-div').length
                        || angular.element(event.target).parents('.index-time').length)
                        && isDis === 'none') {
                        $('#ui-datepicker-div').css('display', 'block');
                    }

                    scope.$apply();

                });
            }
        };
    });
});
