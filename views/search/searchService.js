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
    app.service('searchService', ['baseService', function (baseService) {

        return {

            /*获取文本结果*/
            getSearchResult: function (params) {
                return baseService.postHttp('search/queryTextSearchList', params);
            },

            /*获取列表结果*/
            getTableSearchResult: function (params) {
                return baseService.postHttp('search/queryTableSearchList', params);
            },

            /*获取模型关键词*/
            getOnlineModelKeyWord: function (params) {
                return baseService.postHttp('search/queryModelKeyWord', params);
            },

            /*导出文本*/
            exportSearchText: function () {
                return 'search/exportSearchText';
            },

            /*导出列表*/
            exportSearchTable: function () {
                return 'search/exportSearchTable';
            }
        };
    }
    ]);

});
