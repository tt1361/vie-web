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
    app.service('menuService', ['baseService', function (baseService) {

        return {

            /*获取菜单*/
            getMenu: function () {
                return baseService.getHttp('home/getMenu');
            },

            /*获取数据源*/
            getDataSource: function () {
                return baseService.postHttp('datasource/getUserDataSourceList');
            },

            /*修改菜单*/
            setDataSource: function (params) {
                return baseService.postHttp('datasource/changeUserDataSource', params);
            },

            /*修改密码*/
            updatePwd: function (params) {
                return baseService.postHttp('login/updatePwd', params);
            }
        };
    }
    ]);

});
