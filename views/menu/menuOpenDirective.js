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
    app.directive('menuOpen', [
        '$rootScope',
        'RecursionHelper',
        '$document', function ($rootScope, RecursionHelper, $document) {
            return {
                restrict: 'EA',
                scope: {
                    node: '='
                },
                replace: true,
                templateUrl: 'menu/menu-open-directive.htm',
                compile: function (element) {
                    return RecursionHelper.compile(element, function (scope, $el, arrt, controller, transcludeFn) {
                        scope.uid = Math.floor(Math.random() * 1000) + 1000;
                        // 初始化状态的时候， 是否展开菜单
                        scope.isActive = $rootScope.urlCheck(scope.node.view);
                        scope.view = angular.copy(scope.node.view);
                        scope.node.isShow = false;
                        scope.view = angular.copy(scope.node.view);

                        /**
                         * 树状结构， 不建议采用 Scope 实现渲染,
                         *  为了避免事件冒泡的过程中冒泡到同样元素上，而组织了页面展示
                         *  切换绑定事件到 li > a.name 上绑定点击事件
                         */
                        scope.toggle = function ($event) {
                            var $scope = scope;
                            while (angular.isUndefined($scope.resources)) {
                                $scope = $scope.$parent;
                            }
                            angular.forEach($scope.resources, function (item) {
                                if (item.view != scope.node.view) {
                                    item.isShow = false;
                                }
                            });
                            angular.element('.level-hover').removeClass('active');
                            scope.node.isShow = !scope.node.isShow;
                            if (scope.node.childRes) {
                                // 更换url为子列的第一项
                                scope.view = angular.copy(scope.node.childRes[0].view);

                                var index = 0;
                                $.each($el.find('li.children'), function (key, value) {
                                    var view = value.firstChild.hash || value.firstElementChild.hash;
                                    if (view === location.hash) {
                                        index = key;
                                        return;
                                    }
                                });
                                var children = $el.find('li.children').eq(index);
                                if (children) {
                                    children.find('a.level-children-2').addClass('active');
                                    children.siblings('li.children').find('a.level-children-2').removeClass('active');
                                    $el.parent().find('li.level-1').addClass('active');
                                    $el.siblings('li.level-1').removeClass('active');
                                }

                                $el.siblings('li').find('li.children').find('a.level-children-2').removeClass('active');
                            }

                            $el.addClass('active').siblings('li').removeClass('active');
                        };

                        // if clicked outside of calendar
                        $document.on('click', function (e) {
                            if (!scope.node.isShow) {
                                return;
                            }

                            var i = 0,
                                ele;

                            if (!e.target) {
                                return;
                            }

                            for (ele = e.target; ele; ele = ele.parentNode) {
                                if (angular.lowercase(ele.nodeName) === 'menu-open' || ele.nodeType === 9) {
                                    break;
                                }

                                var uid = scope.$eval(ele.getAttribute('uid'));
                                if (!!uid && uid === scope.uid || angular.lowercase(ele.className).indexOf('name') > -1) {
                                    return;
                                }

                            }

                            scope.node.isShow = false;
                            scope.$apply();
                        });

                    });
                }
            };

        }]);
});
