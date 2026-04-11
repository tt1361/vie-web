/**
 * 第三方请求配置
 *
 */
(function (factory) {
    if (typeof define === 'function' && !!define.amd) {
        define([
            'test',
            'interceptor/repeat.submit'
        ], factory);
    }
    else {
        factory(window.test);
    }
})(function (test) {

    /**
     *  本 设置文件， 设置http 请求的拦截链的数量和条目
     *
     *
     */
    // 配置默认的http 头
    test.config([
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
