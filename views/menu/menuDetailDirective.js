

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

    app.directive('menuDetail', [
        '$timeout',
        '$state',
        'dialogService',
        'menuService',
        'customIndexService',
        'CONSTANT', function ($timeout, $state, dialogService, menuService, customIndexService, CONSTANT) {

            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'menu/menu-detail-directive.htm',
                scope: {
                    item: '=',
                    type: '@',
                    update: '&'
                },
                link: function ($scope, element, attrs) {
                    $timeout(function () {
                        element.find('input').placeholder();
                    }, 500);

                    // 初始化数据
                    $scope.setInitData = function () {
                        if ($scope.type === 'menu') {
                            $scope.pageName = '';
                        }
                        else {
                            $scope.pageName = angular.copy($scope.item.pageName);
                        }
                    };

                    // 刷新页面
                    $scope.refresh = function (argument) {
                        var pscope = $scope;
                        while (angular.isUndefined(pscope.getMenu)) {
                            pscope = pscope.$parent;
                        }
                        pscope.getMenu();
                    };

                    // 保存按钮点击事件
                    $scope.saveMenu = function () {
                        if (!$scope.validModel()) {
                            return;
                        }

                        $scope.type === 'menu' ? $scope.creatMenu() : $scope.updateMenu();
                    };

                    // 保存操作
                    $scope.creatMenu = function () {
                        customIndexService.saveCustomHomePage({
                            pageName: $scope.pageName
                        })
                            .then(function (result) {
                                $scope.refresh();
                            });
                    };

                    // 更新操作
                    $scope.updateMenu = function () {
                        customIndexService.updateCustomHomePage({pageName: $scope.pageName, pageId: $scope.item.id})
                            .then(function (result) {
                                $scope.item.pageName = $scope.pageName;
                                $scope.refresh();
                                $scope.update();

                            });
                    };

                    // 删除操作
                    $scope.deleteMenu = function () {
                        dialogService.confirm('确认要删除该概览吗？').then(function () {
                            customIndexService.deleteCustomHomePage({pageId: $scope.item.id, pageName: $scope.item.pageName})
                                .then(function (result) {
                                    $state.go('main.index.system', {}, {
                                        reload: true
                                    });
                                });
                        });
                    };

                    // 取消
                    $scope.cancel = function () {
                        $scope.setInitData();
                        $scope.update();
                    };

                    // 预处理
                    $scope.validModel = function () {
                        if (!$scope.pageName) {
                            dialogService.alert('概览名称为空');
                            return false;
                        }

                        if ($scope.pageName.replace(/[^\x00-\xff]/g, 'xx').length > 20) {
                            dialogService.alert('概览名称超过20个字符');
                            return false;
                        }

                        if (CONSTANT.textReplace.test($scope.pageName)) {
                            dialogService.alert('概览名称包含特殊字符');
                            return false;
                        }

                        return true;
                    };

                    $scope.setInitData();
                }

            };
        }]);
});
