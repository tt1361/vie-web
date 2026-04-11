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
     * 本controller 实现菜单区域的相应逻辑
     *  @params:
     *      $http:  发送http 请求的service
     *      $scope: 双向绑定的媒介， 由 angular 自动实例化
     *
     *
     */
    app.directive('menu', [
        '$rootScope',
        'RecursionHelper', function ($rootScope, RecursionHelper) {
            return {
                restrict: 'EA',
                scope: {
                    node: '='
                },
                replace: true,
                templateUrl: 'menu/menu-directive.htm',
                compile: function (element) {
                    return RecursionHelper.compile(element, function (scope, $el, arrt, controller, transcludeFn) {
                        // 初始化状态的时候， 是否展开菜单
                        scope.isActive = $rootScope.urlCheck(scope.node.view);

                        scope.view = angular.copy(scope.node.view);
                        if (scope.node.parentID === -1) {
                            scope.node.isChildOpen = angular.copy(scope.isActive);
                        }
                        else {
                            scope.node.isChildOpen = true;
                        }

                        /**
                         * 树状结构， 不建议采用 Scope 实现渲染,
                         *  为了避免事件冒泡的过程中冒泡到同样元素上，而组织了页面展示
                         *  切换绑定事件到 li > a.name 上绑定点击事件
                         */

                        scope.toggle = function ($event) {
                            if (scope.node.parentID === -1) {
                                scope.node.isChildOpen = !scope.node.isChildOpen;
                                var $scope = scope;
                                while (angular.isUndefined($scope.resources)) {
                                    $scope = $scope.$parent;
                                }
                                angular.forEach($scope.resources, function (item) {
                                    if (item.view != scope.node.view && item.parentID === -1) {
                                        item.isChildOpen = false;
                                    }
                                });
                            }

                            if (scope.node.childRes) {
                                // 更换url为子列的第一项
                                if (location.hash.indexOf(scope.node.view) > -1) {
                                    scope.view = angular.copy(location.hash);
                                }
                                else {
                                    scope.view = angular.copy(scope.node.childRes[0].view);
                                }

                                var index = 0;
                                $.each($el.find('li.level-2'), function (key, value) {
                                    var view = value.firstChild.hash || value.firstElementChild.hash;
                                    if (view === location.hash) {
                                        index = key;
                                        return;
                                    }
                                });
                                var children = $el.find('li.level-2').eq(index);
                                if (children) {
                                    children.addClass('active').siblings('li').removeClass('active');
                                    children.find('a.name').addClass('active');
                                    children.siblings('li.level-2').find('a.name').removeClass('active');
                                    $el.parent().find('li.level-1').addClass('active');
                                    $el.siblings('li.level-1').removeClass('active');
                                }
                                $el.siblings('li').find('li.level-2').find('a.name').removeClass('active');
                            }

                            $el.addClass('active').siblings('li').removeClass('active');
                        };
                    });
                }
            };

        }]);
});
