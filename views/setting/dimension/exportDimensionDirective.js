/**
 * 维度导出
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

    app.directive('exportDimension', function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'setting/dimension/export-dimension-directive.htm',
            link: function (scope, element, attrs) {
                // 0表示任务管理， 1表示查看原因，默认任务管理
                scope.showTab = 0;

                // 查看原因
                scope.$on('viewResult', function (event, data) {
                    scope.showTab = 1;
                    scope.$broadcast('viewErrorMsg', {
                        id: data.id
                    });
                });

                // 返回任务管理
                scope.callBackManage = function () {
                    scope.showTab = 0;
                };
            }
        };
    });
});
