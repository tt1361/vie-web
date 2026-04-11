

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

    app.directive('menuAdd', function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'menu/menu-add-directive.htm',
            scope: {
                node: '='
            },
            link: function ($scope, element, attrs) {
                // 点击新增按钮
                $scope.addMenu = function (event) {
                    $scope.stopEvent();
                    $scope.isOpen = !$scope.isOpen;
                };

                // 阻止事件冒泡
                $scope.stopEvent = function (event) {
                    var evt = (window.event) ? window.event : ""; //兼容IE和Firefox获得keyBoardEvent对象  
                   // event = event || window.event;
                    evt.stopPropagation ? evt.stopPropagation() : (evt.cancelBubble = true);
                };

                // 点击页面其他地方关闭弹窗
                $(window.document).click(function (event) {
                    if (!angular.element(event.target).parents('.menu-dialog-position').length
                        && !angular.element(event.target).hasClass('picture-plus')
                        && $scope.isOpen) {
                        $scope.isOpen = false;
                    }

                    $scope.$apply();
                });
            }

        };
    });
});
