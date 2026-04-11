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
    app.directive('searchResult', ['$rootScope', function ($rootScope) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'search/result/search-result-directive.htm',
            scope: {
                item: '=',
                keyword: '=',
                chanel: '='
            },
            link: function (scope, element, attrs) {

                scope.browser = $rootScope.getBowerserInfo();

                // $rootScope.isTask 为0按照录音 1按照任务 
                // $rootScope.isTask = 1;
                // scope.showIsByTaskIdParams = $rootScope.isTask;

                if ($rootScope.isTask === '1' || $rootScope.isTask === 1) {
                    scope.taskName = '任务号：';
                    scope.isShowByTask = true;
                }

                if ($rootScope.isTask == '0' || $rootScope.isTask === 0) {
                    scope.taskName = '流水号：';
                    scope.isShowByTask = false;
                }

                // 默认显示部分
                scope.isAll = 0;
                scope.toggleShowAll = function () {
                    scope.isAll = 1 - scope.isAll;
                };

                scope.markView = function () {
                    element.find('a.item-id').addClass('visited');
                    return true;
                };
            }
        };

    }]);

});
