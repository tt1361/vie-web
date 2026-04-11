/**
 * 路径添加模型
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
     * 本controller 模型薪资区域
     *  @params:
     *      $http:  发送http 请求的service
     *      $scope: 双向绑定的媒介， 由 angular 自动实例化
     *
     *
     */

    app.directive('modelPush', ['$timeout', 'ngDialog', 'dialogService', function ($timeout, ngDialog, dialogService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'analysis/detail/path/model-push-directive.htm',
            scope: {
                item: '=',
                index: '@'
            },
            link: function (scope, element, attrs) {

                // 新增按钮
                scope.pushIntoRoute = function () {
                    if (!scope.$parent.path) {
                        dialogService.error('全局路径下，模型选择不可用，请切换路径！');
                        $timeout(function () {
                            ngDialog.close('errorDialog');
                        }, 3000);
                        return;
                    }

                    var inSelect = false;
                    angular.forEach(scope.$parent.path.subRoute, function (route) {
                        if (scope.item.modelId === route.value) {
                            inSelect = true;
                            return;
                        }

                    });
                    if (!inSelect) {
                        var path = {
                            field: 'model',
                            type: 'model',
                            value: scope.item.modelId,
                            name: scope.item.modelName,
                            status: 2,
                            notView: false,
                            isNegate: 0 // 默认不取反
                        };
                        scope.$parent.path.subRoute.push(path);
                        scope.$parent.path.isSave = false;
                        scope.$emit('getPathValue');
                        return;
                    }
                    else {
                        dialogService.alert('该路径中已存在该模型');
                        return;
                    }
                };
            }
        };
    }]);

});
