/**
 * @author yancai2
 * @update 2017-08-03
 * 路径下模型、维度指令
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
    app.directive('modelRoute', ['$rootScope', function ($rootScope) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'analysis/detail/path/model-route-directive.htm',
            scope: {
                item: '=',
                index: '@',
                edit: '@'
            },
            link: function (scope, element, attrs) {
                // 删除
                scope.removeRouteItem = function () {
                    if (scope.item.type === 'dimension') { // 此项是维度项
                        var index = $rootScope.myInArray(scope.$parent.$parent.$parent.newDimensions, 'key', scope.item.field);
                        if (index > -1) { // 该维度存在于维度列表中
                            scope.$parent.$parent.$parent.newDimensions[index].operateType = 0; // 改为添加
                        }
                    }

                    scope.$parent.$parent.$parent.path.subRoute.splice(scope.index, 1);
                    if ((scope.$parent.$parent.$parent.path.subRoute.length) != Number(scope.index)) { // 删除不是最后一个
                        if (scope.$parent.$parent.$parent.path.subRoute.length) {
                            var i = Number(scope.index) === 0 ? 0 : -1; // 判断是删除中间的还是第一个
                            scope.commonOperate(i);
                        }
                    }

                    scope.$parent.$parent.$parent.path.isSave = false;
                    var view = true;
                    angular.forEach(scope.$parent.$parent.$parent.path.subRoute, function (item) {
                        if (item.type === 'model' && item.status != 2) { // 模型
                            view = false;
                            return;
                        }

                        if (item.type === 'dimension' && item.notView) { // 维度
                            view = false;
                            return;
                        }

                    });
                    scope.$parent.$parent.$parent.path.view = view;
                };

                // 取反
                scope.getNegate = function () {
                    // 只针对模型
                    if (scope.item.type === 'model' && scope.item.status === 2) {
                        scope.item.isNegate = 1 - scope.item.isNegate;
                        var i = 0;
                        scope.commonOperate(i);
                    }

                };

                // 共同处理操作
                scope.commonOperate = function (i) {
                    var lastItem = scope.$parent.$parent.$parent.path.subRoute[scope.$parent.$parent.$parent.path.subRoute.length - 1];
                    var prePath = scope.$parent.$parent.$parent.path.subRoute.slice(0, Number(scope.index) + i + 1);
                    var pathTab = angular.copy(prePath);
                    scope.$emit('getPathValue', {type: 'model', index: scope.index, i: i, pathTab: pathTab, lastItem: lastItem});
                };

            }
        };
    }]);

});
