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
     *  本 directive 是模型的单个模块指令
     *
     *
     */
    app.directive('molNew', function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'play/mol-new-directive.htm',
            scope: {
                item: '=',
                update: '&',
                model: '=',
                index: '@'
            },
            link: function (scope, element, attrs) {
                scope.choose = function (item) {
                    element.addClass('active');
                    element.siblings().removeClass('active');
                    scope.update(item);
                };
            }
        };
    });
});
