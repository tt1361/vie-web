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
    app.directive('commonSearch', function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'search/common/common-search-directive.htm',
            scope: {
                searchAuth: '@',
                advanceSearchAuth: '@',
                time: '=',
                chanelItem: '=',
                searchKeyword: '='
            },
            link: function ($scope, element, attrs) {

                // enter键
                $scope.enterSearchCommonKey = function (event) {
                    event = event || window.event;
                    if (event.keyCode == 13) {
                        $scope.showViewResult(1);
                    }

                };

                // 搜索
                $scope.showViewResult = function (num, comfrom) {
                    $scope.$emit('previewSearchResult', {num: num, from: comfrom});
                };

            }
        };
    });

});
