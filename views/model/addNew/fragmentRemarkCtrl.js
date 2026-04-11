/**
 * 本文件中的Controller 实现模型详情页面结构化编辑规则列表规则备注的 控制器逻辑
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
     * 本controller 模型 新增的模板
     *  @params:
     *      $http:  发送http 请求的service
     *      $scope: 双向绑定的媒介， 由 angular 自动实例化
     *
     *
     */
    app.controller('fragmentRemarkCtrl', [
        '$scope',
        '$http',
        '$document',
        'dialogService', function ($scope, $http, $document, dialogService, modelService) {

            $scope.remarkContent = angular.copy($scope.$parent.item.remark);

            // 保存按钮
            $scope.okRemark = function () {
                if ($scope.remarkContent && $scope.remarkContent.replace(/[^\x00-\xff]/g, 'xx').length > 20) {
                    dialogService.alert('备注不能超过20个字符！');
                    return;
                }

                $scope.$parent.item.remark = $scope.remarkContent;
                $scope.closeThisDialog();
            };

        }
    ]);
});
