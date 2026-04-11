/**
 * 维度导出错误信息
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

    app.directive('exportError', ['dimensionService', function (dimensionService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'setting/dimension/export-error-directive.htm',
            scope: {
                update: '&'
            },
            link: function ($scope, element, attrs) {
                // 分页参数初始化
                $scope.pageOptions = {
                    pageNum: 1,
                    pageSize: 10
                };

                // 监听错误信息
                $scope.$on('viewErrorMsg', function (event, data) {
                    $scope.pageOptions.pageNum = 1;
                    $scope.errTaskId = data.id;
                    $scope.getDimensionValueMessage();
                });

                // 获取错误信息
                $scope.getDimensionValueMessage = function (params) {
                    params = $.extend(params, {
                        dimensionTaskId: $scope.errTaskId
                    }, $scope.pageOptions);
                    dimensionService.getDimensionValueMessage(params)
                        .then(function (result) {
                            var resultList = result.value ? result.value.rows || [] : [];
                            $scope.counts = result.value ? result.value.totalRows || 0 : 0;
                            $scope.errorList = [];
                            angular.forEach(resultList, function (item) {
                                var letter = {};
                                var arr = item.split('配');
                                letter.indexNum = item.substring(0, item.indexOf(arr[1]) - 1);
                                letter.content = item.substring(item.indexOf(arr[1]) - 1);
                                $scope.errorList.push(letter);
                            });
                        });
                };

            }
        };
    }]);
});
