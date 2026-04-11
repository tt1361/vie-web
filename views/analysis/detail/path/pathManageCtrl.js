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
     * 本controller 模型薪资区域
     *  @params:
     *      $http:  发送http 请求的service
     *      $scope: 双向绑定的媒介， 由 angular 自动实例化
     *
     *
     */
    app.controller('pathManageCtrl', [
        '$scope',
        '$document',
        '$timeout',
        'topicService',
        'dialogService',
        'CONSTANT', function ($scope, $document, $timeout, topicService, dialogService, CONSTANT) {
            $timeout(function () {
                $document.find('input').placeholder();
            }, 500);

            $scope.msg = '';
            $scope.paths = angular.copy($scope.$parent.showPaths);

            // 保存路径修改
            $scope.changePathName = function () {
                // 保存路径接口,返回该路径的id
                if (!$scope.validPreSave()) {
                    return;
                }

                var pathInfo = [];
                var prePaths = angular.copy($scope.paths);
                angular.forEach(prePaths, function (item) {
                    var savePath = {};
                    savePath.pathID = item.id;
                    savePath.pathName = item.name;
                    var routeParams = [];
                    angular.forEach(item.route, function (route) {
                        var rPrams = {
                            field: route.field,
                            type: route.type,
                            value: route.value,
                            isNegate: route.isNegate,
                            count: route.count
                        };
                        routeParams.push(rPrams);
                    });
                    savePath.pathPram = JSON.stringify(routeParams);
                    pathInfo.push(savePath);
                });

                // 调用批量更新路径接口
                topicService.editBatchPath({topicId: $scope.$parent.topicId, pathInfo: JSON.stringify(pathInfo)})
                    .then(function (result) {
                        $scope.closeThisDialog($scope.paths);
                    });
            };

            // 取消
            $scope.cancelThisDialog = function () {
                $scope.closeThisDialog($scope.$parent.showPaths);
            };

            // 校验路径名称
            $scope.validPreSave = function () {
                var isError = false;
                angular.forEach($scope.paths, function (item) {
                    if (!item.name) {
                        $scope.msg = '路径名称不能为空';
                        isError = true;
                    }

                    if (item.name.replace(/[^\x00-\xff]/g, 'xx').length > 20) {
                        $scope.msg = '路径名称不能超过20个字符';
                        isError = true;
                    }

                    if (CONSTANT.textReplace.test(item.name)) {
                        $scope.msg = '路径名称不能包含特殊字符';
                        isError = true;
                    }

                });

                if (isError) {
                    return false;
                }

                return true;
            };

            // 删除路径
            $scope.delPath = function (item, index) {
                dialogService.confirm('该专题可能已添加至自定义概览，如果确认删除则概览中该路径同时删除').then(function () {
                    $scope.$emit('deletePath', {item: item, index: index, path: $scope.paths});
                });

            };
        }
    ]);

});
