/**
 * 维度导出管理
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
    app.directive('exportManage', [
        'dimensionService', function (dimensionService) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'setting/dimension/export-manage-directive.htm',
                scope: {
                    update: '&'
                },
                link: function ($scope, element, attrs) {
                    $scope.dimTab = 0;
                    $scope.isShowSuccessMsg = false; // 是否显示正确的提示语
                    $scope.isShowErrorMsg = false; // 是否显示错误的提示语
                    $scope.errorMsg = ''; // 错误的提示语
                    $scope.pageOptions = {
                        pageNum: 1,
                        pageSize: 6
                    };
                    // 切换tab
                    $scope.changeDimTab = function (num) {
                        $scope.dimTab = num;
                        if (num === 1) {
                            $scope.getManageValue();
                        }

                    };

                    // 模板下载
                    $scope.exportDimMB = function () {
                        $('#form5').attr('action', dimensionService.exportDimensionExcel()).submit();
                    };

                    // 模板上传
                    $('#dimension_file_upload').uploadify({
                        height: 28,
                        width: 100,
                        buttonText: '选择配置文件',
                        buttonClass: 'upload_btn',
                        swf: 'framework/uploadify/uploadify.swf',
                        uploader: 'dimension/importPersonalDimension',
                        auto: true,
                        multi: false,
                        removeCompleted: true,
                        fileObjName: 'uploadify',
                        cancelImg: 'images/uploadify-cancel.png',
                        checkExisting: false,
                        removeTimeout: 0.1,
                        onUploadSuccess: function (file, data, response) {
                            data = eval('(' + data + ')');
                            if (data.success) {
                                $scope.isShowSuccessMsg = true;
                                $scope.isShowErrorMsg = false;
                            }
                            else {
                                $scope.isShowErrorMsg = true;
                                $scope.isShowSuccessMsg = false;
                                $scope.errorMsg = data.message;
                            }
                            var scope = $scope;
                            while (angular.isUndefined(scope.getCustomDim)) {
                                scope = scope.$parent;
                            }
                            scope.getCustomDim();

                        },
                        // 加上此句会重写onSelectError方法【需要重写的事件】
                        overrideEvents: [
                            'onSelectError',
                            'onDialogClose'
                        ],
                        // 返回一个错误，选择文件的时候触发
                        onSelectError: function (file, errorCode, errorMsg) {}
                    });

                    // 获取任务管理接口
                    $scope.getManageValue = function (params) {
                        params = $.extend(params, $scope.pageOptions);
                        dimensionService.searchDimensionTask(params).then(function (result) {
                            $scope.exportList = result.value.rows || [];
                            $scope.counts = result.value.totalRows || 0;
                        });
                    };

                    // 查看任务管理
                    $scope.viewManage = function () {
                        $scope.dimTab = 1;
                        $scope.pageOptions.pageNum = 1;
                        $scope.getManageValue();
                    };

                    // 监听消息
                    $scope.$on('setErrorType', function (event, data) {
                        $scope.isShowErrorMsg = false;
                        $scope.errorMsg = '';
                        $scope.isShowSuccessMsg = false;
                    });

                    // 查看原因
                    $scope.viewErrorResult = function (item) {
                        $scope.$emit('viewResult', {
                            id: item.taskId
                        });
                    };

                }
            };
        }
    ]);
});
