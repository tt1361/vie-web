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
    app.service('callListService', ['$http', 'baseService', function ($http, baseService) {

        return {

            /*获取通话列表信息*/
            queryCallList: function (params) {
                return baseService.postHttp('callFilter/queryCallList', params);
            },

            /*根据任务id匹配录音方法请求*/
            queryVoiceCallList: function (params) {
                return baseService.postHttp('callFilter/queryVoiceCallList', params);
            },

            /*获取用户维度*/
            queryDimensions: function (params) {
                return baseService.postHttp('callFilter/queryDimensions', params);
            },

            /*获取用户所有过滤条件或者一条筛选条件的信息*/
            queryAllFilters: function (params) {
                return baseService.postHttp('callFilter/queryAllFilters', params);
            },

            /*获取用户选择一条筛选条件的信息*/
            querySingleFilter: function (params) {
                return baseService.postHttp('callFilter/querySingleFilter', params);
            },

            /*保存用户的筛选条件*/
            saveFiltersOrDimension: function (params) {
                return baseService.postHttp('callFilter/saveFiltersOrDimension', params);
            },

            /*删除用户的筛选条件*/
            deleteSingleFilter: function (params) {
                return baseService.postHttp('callFilter/deleteSingleFilter', params);
            }
        };
    }
    ]);

});
