/**
 * 本文件中的Controller 实现数据处理状态页面交互
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

    app.controller('datastatusCtrl', [
        '$scope',
        'ngDialog',
        '$q',
        '$document',
        'dialogService',
        'baseService',
        'datastatusService', function ($scope, ngDialog, $q, $document, dialogService, baseService, datastatusService) {
            var now = $scope.systemDate && $scope.systemDate != '${systemDate}' ? $scope.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date());
            $scope.time = now;

            /* 分页的的相关参数*/
            $scope.pageOptions = {
                pageNum: 1,
                pageSize: 10
            };

            $scope.callLists = [];
            $scope.counts = 0;
            $scope.allTotalNum = 0;

            /*系统处理总量*/
            $scope.totalNum = 0;

            /*当日处理量*/
            $scope.successNum = 0;

            /*当日处理成功量*/
            $scope.totalFailNum = 0;

            /*当日处理失败量*/

            /*获取数据处理信息*/
            $scope.getDataStatusList = function (params) {
                params = $.extend(params, $scope.pageOptions, {
                    handleTime: $scope.time
                });
                return datastatusService.getDataStatusList(params).then(function (result) {
                    $scope.headColums = [{columnName: '流水号', column: 'voiceId'}, {columnName: '来电时间', column: 'callTime'}, {columnName: '录音路径', column: 'voiceUri'}, {columnName: '失败原因', column: 'failReason'}];
                    $scope.callLists = result.value.handleInfo.infoList ? result.value.handleInfo.infoList : [];
                    $scope.counts = result.value ? result.value.handleInfo.totalCount : 0;
                    $scope.allTotalNum = result.value.totalNumInfo ? result.value.totalNumInfo.allTotalNum : 0;

                    /*系统处理总量*/
                    $scope.totalNum = result.value.totalNumInfo ? result.value.totalNumInfo.totalNum : 0;

                    /*当日处理量*/
                    $scope.successNum = result.value.totalNumInfo ? result.value.totalNumInfo.successNum : 0;

                    /*当日处理成功量*/
                    $scope.totalFailNum = result.value.totalNumInfo ? result.value.totalNumInfo.totalFailNum : 0;

                    /*当日处理失败量*/
                });
            };

            /*时间改变后重新发请求*/
            $scope.changeDate = function (item) {
                $scope.time = item;
                $scope.pageOptions.pageNum = 1;
                $scope.getDataStatusList();
            };

            $scope.getDataStatusList(); // 首次进入页面的请求
        }
    ]);
});
