

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

    app.directive('menuChildren', function () {
        return {
            restrict: 'EA',
            scope: {
                item: '='
            },
            replace: true,
            templateUrl: 'menu/menu-children-directive.htm',
            link: function (scope, element, attrs) {

                scope.view = angular.copy(scope.item.view);
                scope.toggle = function () {
                    element.find('a.level-children-2').addClass('active');
                    element.siblings('li').find('a.level-children-2').removeClass('active');
                };
            }
        };

    });
});
