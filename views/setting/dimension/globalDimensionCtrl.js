/**
 * 全部维度管理
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

    app.controller('globalDimensionCtrl', [
        '$scope',
        'dialogService',
        'CONSTANT', function ($scope, dialogService, CONSTANT) {
            $scope.saveAuth = false; // 是否有保存权限
            $scope.delAuth = false; // 是否有删除权限
            $scope.addAuth = false; // 是否有添加权限
            $scope.importAuth = false; // 是否有导入权限
            // 0自定义维度，1系统维度，默认显示自定义维度
            $scope.showTab = 1;

            // 校验搜索关键词规范
            $scope.validKeyWord = function (keyword) {
                if (keyword) {
                    if (keyword.replace(/[^\x00-\xff]/g, 'xx').length > 20) {
                        dialogService.alert('搜索字段不能超过20个字符');
                        return false;
                    }

                    if (CONSTANT.textReplace.test(keyword)) {
                        dialogService.alert('搜索字段不能包含特殊字符');
                        return false;
                    }
                }

                return true;
            };

            // 维度名称的验证
            $scope.preValidName = function (name) {
                if (!name) {
                    dialogService.alert('维度名称不能为空');
                    return false;
                }

                if (name.replace(/[^\x00-\xff]/g, 'xx').length > 20) {
                    dialogService.alert('维度名称不能超过20个字符');
                    return false;
                }

                if (CONSTANT.textReplace.test(name)) {
                    dialogService.alert('维度名称不能包含特殊字符');
                    return false;
                }

                return true;
            };

            // tab切换
            $scope.changeTab = function (type) {
                $scope.showTab = type;
            };

            // 功能权限
            $scope.$watch('$parent.resources', function (newValue, oldValue) {
                if (!newValue) {
                    return;
                }
                angular.forEach(newValue, function (resource) {
                    if (resource.link === '/setting.do') { // 配置
                        angular.forEach(resource.childRes, function (item) {
                            if (item.link === '/dimension.do') {
                                $scope.optAciton = item.optAction || [];
                                if ($.inArray('add', $scope.optAciton) > -1) {
                                    $scope.addAuth = true;
                                }
                                if ($.inArray('import', $scope.optAciton) > -1) {
                                    $scope.importAuth = true;
                                }
                                if ($.inArray('save', $scope.optAciton) > -1) {
                                    $scope.saveAuth = true;
                                }
                                if ($.inArray('delete', $scope.optAciton) > -1) {
                                    $scope.delAuth = true;
                                }
                                return;
                            }
                        });
                        return;
                    }
                });
            });

        }
    ]);
});
