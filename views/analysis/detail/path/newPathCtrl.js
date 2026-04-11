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
    app.controller('newPathCtrl', [
        '$scope',
        '$timeout',
        '$document',
        'topicService',
        'CONSTANT', function ($scope, $timeout, $document, topicService, CONSTANT) {
            $timeout(function () {
                $document.find('input').placeholder();
            }, 500);

            $scope.msg = '';
            // 关闭弹出层，确定按钮点击
            $scope.submitPathName = function () {
                // 保存路径接口,返回该路径的id
                if (!$scope.validPreSave()) {
                    return;
                }

                var path = {
                    name: $scope.pathName,
                    route: [],
                    subRoute: [],
                    isSave: true,
                    id: '',
                    view: true
                };
                topicService.editPath({
                    pathId: path.id,
                    topicId: $scope.$parent.topicId,
                    pathName: path.name,
                    pathPram: JSON.stringify(path.route)
                }).then(function (response) {
                    if (response.status === 200 && response.data.success) {
                        path.id = response.data.value;
                        $scope.closeThisDialog(path);
                    }
                    else {
                        $scope.msg = response.data.message;
                        return;
                    }
                });
            };

            // 校验路径名称
            $scope.validPreSave = function () {
                if (!$scope.pathName || $scope.pathName === '') {
                    $scope.msg = '路径名称不能为空';
                    return false;
                }

                if ($scope.pathName.replace(/[^\x00-\xff]/g, 'xx').length > 20) {
                    $scope.msg = '路径名称不能超过20个字符';
                    return false;
                }

                if (CONSTANT.textReplace.test($scope.pathName)) {
                    $scope.msg = '路径名称不能包含特殊字符';
                    return false;
                }

                return true;
            };
        }
    ]);

});
