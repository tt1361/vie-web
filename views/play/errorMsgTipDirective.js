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
     *  本 directive 是消息提示
     *
     *
     */
    app.directive('errorMsgTip', ['$timeout', function ($timeout) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'play/error-msg-tip.htm',
            link: function (scope, element, attrs) {
                // 隐藏提示框
                scope.hideOrShowTip = function () {
                    if (scope.msg) {
                        $timeout(function () {
                            scope.msg = '';
                        }, 2000);
                    }

                };
                // 监听提示框
                scope.$on('showErrorMsgEvent', function (event, data) {
                    scope.msg = data.msg;
                    scope.hideOrShowTip();
                });
            }
        };
    }]);

});
