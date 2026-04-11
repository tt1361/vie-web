/**
 * 数据处理状态模块日期选择控件
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

    app.directive('timeSelectData', function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'datastatus/time-select-data-directive.htm',
            scope: {
                item: '=',
                type: '@'
            },
            link: function (scope, element, attrs) {
                scope.time = angular.copy(scope.item);
                var now = scope.systemDate && scope.systemDate != '${systemDate}' ? scope.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date());
                scope.time = now;
                element.find('.timeStart').datepicker({
                    dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
                    monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                    showMonthAfterYear: true,
                    dateFormat: 'yy-mm-dd',
                    yearSuffix: '年',
                    maxDate: now,
                    onSelect: function (dateText, ins) {

                        scope.time = dateText;
                        scope.item = scope.time;
                        var $scope = scope;
                        while (angular.isUndefined($scope.changeDate)) {
                            $scope = $scope.$parent;
                        }
                        $scope.changeDate(scope.item); // 时间改变后重新发请求
                    }
                });
            }
        };
    });
});
