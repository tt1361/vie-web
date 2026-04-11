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
    app.directive('exportSearchResult', ['dialogService', 'searchService', '$rootScope', function (dialogService, searchService, $rootScope) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'search/result/export-search-result-directive.htm',
            scope: {
                columns: '=',
                showTab: '=',
                time: '='
            },
            link: function ($scope, element, attrs) {
                // 导出
                $scope.exportSearch = function () {
                    $scope.importDimension = $rootScope.importDimension;
                    var maxExportNum = $rootScope.maxExportNum;
                    if ($scope.$parent.total > maxExportNum) {
                        dialogService.alert('导出条数超过' + maxExportNum + '条');
                        return;
                    }

                    var preParams = $scope.$parent.preSearchResult();
                    $('#content_export').val(preParams.content);
                    $('#chanel_export').val(preParams.chanel);
                    $('#dimensionParams_export').val(preParams.dimensionParams);
                    $('#optionType_export').val(preParams.optionType);
                    if ($scope.showTab === 0) {
                        $('#form2').attr('action', searchService.exportSearchText());
                    }
                    else {
                        $('#searchDimension_export').val($scope.importDimension);
                        $('#form2').attr('action', searchService.exportSearchTable());
                    }
                    $('#form2').submit();
                };
            }
        };
    }]);

});
