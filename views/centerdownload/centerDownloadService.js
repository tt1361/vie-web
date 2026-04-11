/**
 * 下载中心统一接口
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
    app.service('centerDownloadService', ['baseService', function (baseService) {
        return {

            /*获取下载列表*/
            queryDownload: function (params) {
                return baseService.postHttp('download/queryDownload', params);
            },

            /*删除一条下载数据*/
            deleteDownload: function (params) {
                return baseService.postHttp('download/deleteDownload', params);
            },

            /*导出一条数据*/
            exportDownload: function (params) {
                return baseService.postHttp('download/exportDownload', params);
            },

            /*重新下载*/
            reDownload: function (params) {
                return baseService.postHttp('download/reDownload', params);
            }

        };
    }

    ]);
});
