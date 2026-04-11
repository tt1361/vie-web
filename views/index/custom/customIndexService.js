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
    app.service('customIndexService', ['baseService', function (baseService) {

        return {

            /*获取自定义首页依赖模块*/
            queryPageRelateModuleList: function (params) {
                return baseService.postHttp('customHomePage/queryPageRelateModuleList', params);
            },

            /*删除概览模块*/
            deletePageRelateModule: function (params) {
                return baseService.postHttp('customHomePage/deletePageRelateModule', params);
            },

            /*根据id获取模块信息*/
            queryModuleInfoById: function (params) {
                return baseService.postHttp('customHomePage/getModuleInfoById', params);
            },

            /*获取所有自定义首页*/
            queryCustomHomePageList: function () {
                return baseService.postHttp('customHomePage/queryCustomHomePageList');
            },

            /*新增自定义首页模块*/
            savePageRelateModule: function () {
                return 'customHomePage/savePageRelateModule';
            },

            /*更新自定义首页模块*/
            updatePageRelateModule: function () {
                return 'customHomePage/updatePageRelateModule';
            },

            /*判断有没有插入记录*/
            queryModuleIfSendHomePage: function (params) {
                return baseService.postHttp('customHomePage/queryPageIdByModuleInfo', params);
            },

            /*删除自定义首页相关模块*/
            deleteModuleFromHomePage: function (params) {
                return baseService.postHttp('customHomePage/deleteModuleFromHomePage', params);
            },

            /*保存自定义菜单*/
            saveCustomHomePage: function (params) {
                return baseService.postHttp('customHomePage/saveCustomHomePage', params);
            },

            /*更新自定义菜单*/
            updateCustomHomePage: function (params) {
                return baseService.postHttp('customHomePage/updateCustomHomePage', params);
            },

            /*删除自定义菜单*/
            deleteCustomHomePage: function (params) {
                return baseService.postHttp('customHomePage/deleteCustomHomePage', params);
            }

        };
    }
    ]);

});
