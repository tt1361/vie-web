/**
 * 系统首页统一接口列表
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
    app.service('systemIndexService', ['baseService', function (baseService) {

        return {

            /*获取热词数据*/
            fetchHotWord: function (params) {
                return baseService.postHttp('hotWordAnalysis/getHotWordRank', params);
            },

            /*获取历史数据*/
            fetchHistoryWord: function (params) {
                return baseService.postHttp('hotWordConfigure/fetchHistoryWord', params);
            },

            /*删除热词*/
            delHotWord: function (params) {
                return baseService.postHttp('hotWordConfigure/addHotWord', params);
            },

            /*获取机构信息*/
            getCenters: function () {
                return baseService.getHttp('home/getCenters');
            },

            /*获取前一天的聚类热点*/
            fetchHotViewData: function (params) {
                return baseService.postHttp('home/fetchHotViewData', params);
            },

            /*获取图表数据*/
            getModelAccuracy: function (params) {
                return baseService.postHttp('home/getModelAccuracy', params);
            },

            /*获取模型组的模型数据*/
            getModelByModelGroupId: function (params) {
                return baseService.postHttpNoDialog('home/getModelByModelGroupId', params);
            },

            /*获取通话时长趋势条件维度接口*/
            getCallTimeTrendDimList: function (params) {
                return baseService.getHttp('home/getCallTimeTrendDimList', params);
            },

            /*通话时长*/
            getCallTimeTrendByDim: function (params) {
                return baseService.postHttp('home/getCallTimeTrendByDim', params);
            }
        };
    }
    ]);

});
