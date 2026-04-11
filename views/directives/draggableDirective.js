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
            'jquery-ui'
        ], factory);
    }
    else {
        factory(window.app);
    }
})(function (app) {
    app.directive('sortDrag', ['$window', '$parse', function ($window, $parse) {
        return {
            restrict: 'A',
            replace: true,
            stop: '&',
            link: function (scope, element, attrs) {

                var onDragSuccessCallback = $parse(attrs.dragStop) || null;
                var _data = attrs.dragData;
                var onDragComplete = function (evt, ui) {
                    if (!onDragSuccessCallback) {
                        return;
                    }

                    scope.$apply(function () {
                        onDragSuccessCallback(scope, {$data: _data, $event: evt});
                    });
                };
                $(element).parent().sortable({
                    revert: true,
                    stop: onDragComplete
                });

                $('.swiper-container, .swiper-container .Axis.column').disableSelection();

            }
        };
    }]);
});
