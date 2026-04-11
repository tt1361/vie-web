/**
 * 系统首页框架
 *
 */
(function (factory) {
    if (typeof define === 'function' && !!define.amd) {
        define([
            'app',
            'echarts'
        ], factory);
    }
    else {
        factory(window.app);
    }
})(function (app) {

    /**
     * 本controller 实现首页的逻辑
     *  @params:
     *      $http:  发送http 请求的service
     *      $scope: 双向绑定的媒介， 由 angular 自动实例化
     */
    app.controller('indexCtrl', [
        '$scope', function ($scope) {

            $scope.timesRange = {
                defaultStart: $scope.systemDate && $scope.systemDate != '${systemDate}' ? $.datepicker.formatDate('yy-mm-dd', new Date(new Date($scope.systemDate).getTime() - 6 * 24 * 3600 * 1000)) : $.datepicker.formatDate('yy-mm-dd', new Date(new Date().getTime() - 6 * 24 * 3600 * 1000)),
                defaultEnd: $scope.systemDate && $scope.systemDate != '${systemDate}' ? $scope.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date())
            };
            angular.element('.section-footer').removeClass('fixed');

            // 监听刷新数据
            $scope.$on('refreshIndexDate', function (event, data) {
                // 发广播给快速预览模型
                $scope.$broadcast('modelState', {
                    selectTime: $scope.timesRange.defaultEnd,
                    startTime: $scope.timesRange.defaultStart, // 增加快速模型概览时间段展示展示
                    endTime: $scope.timesRange.defaultEnd, // 增加快速模型概览时间段展示展示
                    centerFlag: data.centerFlag,
                    selectCenter: data.selectCenter
                });

                // 发广播给热词场景
                $scope.$broadcast('hotPoint', {
                    selectTime: data.selectTime,
                    centerFlag: data.centerFlag,
                    selectCenter: data.selectCenter
                });

                // 发广播给热词分析
                $scope.$broadcast('hotWord', {
                    // selectTime : data.selectTime,
                    startTime: $scope.timesRange.defaultStart,
                    endTime: $scope.timesRange.defaultEnd,
                    centerFlag: data.centerFlag,
                    selectCenter: data.selectCenter
                });

                // 发广播给通话时长趋势
                $scope.$broadcast('callDuration', {
                    selectTime: data.selectTime,
                    centerFlag: data.centerFlag,
                    selectCenter: data.selectCenter,
                    singleCenter: data.singleCenter
                });
            });

        }
    ]);
});
