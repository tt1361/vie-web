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
    app.service('commonFilterService', ['$http', 'baseService', function ($http, baseService) {

        return {

            /*查询筛选维度*/
            queryAllFilter: function () {
                return baseService.postHttp('commonFilter/queryAllFilter');
            },

            /*保存、编辑和逻辑删除*/
            saveEditDelete: function (params) {
                return baseService.postHttp('commonFilter/createOrUpdateFilterService', params);
            },

            /*查询*/
            searchDimAndModel: function (params) {
                return baseService.postHttp('commonFilter/searchDimAndModel', params);
            },

            /*查询单条*/
            searchFilterById: function (params) {
                return baseService.postHttp('commonFilter/queryFilter', params);
            },

            /*check重名*/
            checkFilterName: function (params) {
                return baseService.postHttp('commonFilter/checkFilterName', params);
            }
        };
    }
    ]);

});
