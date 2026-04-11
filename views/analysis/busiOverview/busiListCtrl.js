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
     * 业务概览控制器
     */
    app.controller('busiListCtrl', [
        '$scope', 'winHeightService', 'baseService', function ($scope, winHeightService, baseService) {
            $scope.status = -2;
            $scope.treeGrid = {
                columns: [
                    {title: '业务名称', field: 'modelName'},
                    {title: '通话数量', field: 'callCount'},
                    {title: '占比', field: 'callPercent'}
                ]
            };

            // 模型树itemclick后广播change事件
            $scope.$on('tree-item-click', function (e, d) {
                $scope.$broadcast('model-changed', d);
            });

            $scope.getColumData = function () {
                $scope.$broadcast('date-changed', {
                    beginDate: $scope.timesRange.defaultStart,
                    endDate: $scope.timesRange.defaultEnd
                });

            };

            $scope.$on('date-parent', function (e, d) {
                $scope.timesRange.defaultStart = d.beginDate;
                $scope.timesRange.defaultEnd = d.endDate;
                $scope.$broadcast('date-init', {beginDate: d.beginDate, endDate: d.endDate});

            });

            $scope.timesRange = baseService.getSystemTime();

            // 计算页面高度
            $scope.winHeight = function () {
                // 初始化调用
                winHeightService.calculate();
                // 浏览器窗口大小改变
                angular.element(window).resize(function () {
                    winHeightService.calculate();
                });
            };

            $scope.winHeight();

        }]);
});
