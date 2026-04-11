/**
*  报表接口汇总
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

    app.service('reportService', ['$http', 'baseService', function ($http, baseService) {

        return {

            /*获取所有报表组*/
            allGroups: function (params) {
                return $http.post('report/queryReportGroup', params);
            },

            /*获取表格数据*/
            getTableData: function (params) {
                return baseService.postHttp('report/getTableData', params);
            },

            /*获取饼图数据*/
            getPieData: function (params) {
                return baseService.postHttp('report/getPieData', params);
            },

            /*获取柱折图数据*/
            getLineColumData: function (params) {
                return baseService.postHttp('report/getLineColumData', params);
            },

            /*获取所有y轴维度*/
            getAllMeasure: function () {
                return baseService.postHttp('report/getAllMeasure');
            },

            /*获取所有常用报表*/
            getCommonReport: function (params) {
                return baseService.postHttp('report/queryCommonReport', params);
            },

            /*删除常用报表*/
            deleteCommonReport: function (params) {
                return baseService.postHttp('report/deleteCommonReport', params);
            },

            /*获取下载列表*/
            getDownloadReport: function (params) {
                return baseService.postHttp('reportDownload/queryDownloadReport', params);
            },

            /*删除下载列表*/
            deleteDownLoadReport: function (params) {
                return baseService.postHttp('reportDownload/deleteDownLoadReport', params);
            },

            /*获取报表下载状态*/
            getDownloadReportStatus: function (params) {
                return baseService.postHttp('reportDownload/getDownloadReportStatus', params);
            },

            /*获取报表列表*/
            getReportList: function (params) {
                return baseService.postHttp('report/queryReportList', params);
            },

            /*获取报表组*/
            getReportGroupExpCom: function () {
                return baseService.postHttp('report/queryReportGroup');
            },

            /*报表置顶*/
            setReportUp: function (params) {
                return baseService.postHttp('report/setUpReport', params);
            },

            /*设置报表为常用*/
            usualReport: function (params) {
                return baseService.postHttp('report/setUsualReport', params);
            },

            /*删除报表*/
            deleteReport: function (params) {
                return baseService.postHttp('report/deleteReport', params);
            },

            /*检测报表是否重名*/
            checkReportName: function (params) {
                return $http.post('report/checkReportName', params);
            },

            /*删除报表组*/
            deleteReportGroup: function (params) {
                return baseService.postHttp('report/deleteReportGroup', params);
            },

            /*新增报表组*/
            addReportGroup: function (params) {
                return baseService.postHttp('report/addReportGroup', params);
            },

            /*编辑报表组*/
            editSingleReportGroup: function (params) {
                return baseService.postHttp('report/updateReportGroup', params);
            },

            /*根据编号查询报表*/
            getReportByID: function (params) {
                return baseService.postHttp('report/getReportById', params);
            },

            /*更新报表*/
            updateReport: function (params) {
                return baseService.postHttp('report/saveReport', params);
            },

            /*下载报表*/
            downloadReport: function (params) {
                return baseService.postHttp('reportDownload/saveDownloadReport', params);
            },

            /*导出已下载的报表*/
            downloadFile: function () {
                return 'custom/reportDownload/saveDownloadFile';
            },

            /*获取计算项*/
            getComputerField: function () {
                return $http.post('report/getComputerField');
            },

            /*检测计算项格式是否正确*/
            checkExpress: function (params) {
                return $http.post('report/checkExpress', params);
            }
        };
    }
    ]);

});
