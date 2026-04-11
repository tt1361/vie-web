/**
 * 本文件实现依赖任何一个 Angular 的module, 如果不采用本系统的框架，
 *      可以可以在  factory(window.app) app 修改你所创建的模块名称
 *  @dependece: Angular Module
 *
 */
(function (factory) {
    if (typeof define === 'function' && !!define.amd) {
        define([
            'app',
            'interceptor/repeat.submit'
        ], factory);
    }
    else {
        factory(window.app);
    }
})(function (app) {

    /**
     *  本 设置文件， 设置http 请求的拦截链的数量和条目
     *
     *
     */
    // 配置默认的http 头
    app.config([
        '$httpProvider', function ($httpProvider) {

            // 修改默认 http 的请求头部
            $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
            $httpProvider.defaults.headers.post.Accept = 'application/json, text/javascript, */*; q=0.01';
            $httpProvider.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest';

            $httpProvider.defaults.transformRequest = function (data) {
                return angular.isObject(data) && String(data) ? jQuery.param(data) : data;
            };

            // 添加重复请求的拦截器
            $httpProvider.interceptors.push('repeatsubmitInterceptor');
        }
    ]);

});
