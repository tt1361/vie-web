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
    app.directive('advanceChanel', function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'search/advance/advance-chanel-directive.htm',
            scope: {
                item: '='
            },
            link: function (scope, element, attrs) {
                // 默认不展示
                scope.isOpen = false;
                // 展示与收起
                scope.showTimeOpen = function () {
                    scope.isOpen = !scope.isOpen;
                };

                // 选择声道
                scope.setChanel = function (num) {
                    scope.getChanel(num);
                    scope.showTimeOpen();
                };

                /**
                    声道切换
                */
                scope.getChanel = function (num) {
                    if (num === 2) {
                        scope.item.chanelName = '全部声道';
                    }
                    else if (num === 0) {
                        scope.item.chanelName = '坐席声道';
                    }
                    else if (num === 1) {
                        scope.item.chanelName = '客户声道';
                    }

                    scope.item.chanel = num;
                };

                // 点击页面其他地方关闭弹窗
                $(window.document).click(function (event) {
                    if (!angular.element(event.target).parents('.advance-chanel').length
                        && !angular.element(event.target).hasClass('picture-select-down')
                        && scope.isOpen) {
                        scope.isOpen = false;
                    }

                    scope.$apply();
                });

                scope.getChanel(scope.item.chanel);
            }
        };

    });
});
