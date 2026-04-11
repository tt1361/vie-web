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
    app.service('bubbleService', ['baseService', function (baseService) {

        return {

            /*获取关键词前后文本*/
            fetchContactKwContext: function (params) {
                return baseService.postHttp('player/getContactKwContext', params);
            },

            /*获取声道类型*/
            getWavFormat: function (params) {
                var token = localStorage.getItem('h5-token')
                if (token) {
                    params.token = token
                }
                return baseService.postHttp('player/getWavFormat', params);
            }

        };
    }
    ]);

});
