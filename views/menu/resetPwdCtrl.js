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
     * 本controller 模型 新增的模板
     *  @params:
     *      $http:  发送http 请求的service
     *      $scope: 双向绑定的媒介， 由 angular 自动实例化
     *
     *
     */
    app.controller('resetPwdCtrl', [
        '$scope',
        '$document',
        '$timeout',
        'ngDialog',
        'dialogService',
        'menuService', function ($scope, $document, $timeout, ngDialog, dialogService, menuService) {
            $timeout(function () {
                $document.find('input').placeholder();
            }, 500);

                function AES_Encrypt(plainText){
                var key="1234567890123456";
                var iv="1234567890123456";
                var keyWordArray=CryptoJS.enc.Utf8.parse(key);
                var ivWordArray=CryptoJS.enc.Utf8.parse(iv);
                var encrypted=CryptoJS.AES.encrypt(plainText,keyWordArray,{iv:ivWordArray,mode:CryptoJS.mode.CBC,padding:CryptoJS.pad.Pkcs7});
                return encrypted.toString();
                }

            // 确定按钮
            $scope.updatePwd = function () {
                if (!$scope.validPwd()) {
                    return;
                }
                var params = {
                    oldPassword: AES_Encrypt($scope.oldPassword),
                    newPassword: AES_Encrypt($scope.newPassword)
                };
                menuService.updatePwd(params)
                    .then(function (result) {
                        if (result) {
                            dialogService.success('修改密码成功！');
                            $timeout(function () {
                                ngDialog.close('successDialog');
                            }, 1000);
                            $scope.closeThisDialog(1);
                        }
                        else {
                            dialogService.error('修改密码失败');
                            $timeout(function () {
                                ngDialog.close('errorDialog');
                            }, 1000);
                            return;
                        }
                    });
            };

            // 验证
            $scope.validPwd = function () {
                $scope.msg = '';
                $scope.groupMsg = '';
                var trimOldPwd = $.trim($scope.oldPassword).replace(/[^\x00-\xff]/g, 'xx');
                var trimNewPwd = $.trim($scope.newPassword).replace(/[^\x00-\xff]/g, 'xx');
                if (trimOldPwd.length < 6 || trimOldPwd.length > 20) {
                    $scope.msg = '6~20个字符，不支持空格';
                    $('#oldPassword').focus();
                    return false;
                }
                if (trimNewPwd.length < 6 || trimNewPwd.length > 20) {
                    $scope.groupMsg = '6~20个字符，不支持空格';
                    $('#newPassword').focus();
                    return false;
                }

                if ($.trim($scope.newPassword) != $.trim($scope.copyPassword)) {
                    $scope.groupMsg = '重复密码与新密码不一致';
                    $('#newPassword').focus();
                    return false;
                }
                return true;
            };
        }
    ]);
});
