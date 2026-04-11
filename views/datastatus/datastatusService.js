/**
 * 数据处理状态模块所有接口请求
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

    app.service('datastatusService', ['baseService', function (baseService) {

        return {

            /*获取数据状态列表*/
            getDataStatusList: function (params) {
                return baseService.postHttp('dataHandle/queryDataHandleInfo', params);
            }
        };
    }
    ]);

});
