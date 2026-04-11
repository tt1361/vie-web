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
    *  本文件中的Controller 实现so
    *
    */
    app.directive('chanelSelect', [
        '$document', function ($document) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'search/common/chanel-select-directive.htm',
                scope: {
                    item: '=',
                    type: '@'
                },
                link: function (scope, element, attrs) {

                    // 展示与收起
                    scope.showTimeOpen = function () {
                        scope.isOpen = !scope.isOpen;
                    };

                    // 点击页面其他地方关闭弹窗
                    $(window.document).click(function (event) {
                        if (!angular.element(event.target).parents('.search-chanel-select').length
                            && !angular.element(event.target).hasClass('picture-select-down')
                            && scope.isOpen) {
                            scope.isOpen = false;
                        }

                        scope.$apply();
                    });

                    // 选择声道
                    scope.setChanel = function (num) {
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
                        scope.showTimeOpen();
                        var $scope = scope;
                        while (angular.isUndefined($scope.showViewResult)) {
                            $scope = $scope.$parent;
                        }
                        $scope.showViewResult(Number(scope.type));
                    };

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

                    scope.getChanel(scope.item.chanel);
                }
            };

        }
    ]);

});
