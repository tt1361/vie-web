/**
 * 新建报表弹窗
 * Created by zszhang on 2016/5/23.
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

    app.controller('manageNewCreate', [
        '$scope',
        '$document',
        '$timeout',
        'reportService',
        'CONSTANT', function ($scope, $document, $timeout, reportService, CONSTANT) {

            $timeout(function () {
                $document.find('input').placeholder();
            }, 500);

            $scope.reportGroup = [];

            $scope.msg = '';
            $scope.groupMsg = '';

            $scope.modelFragments = [];

            /**
             * @brief 确定
             * @details [long description]
             *
             * @param e [description]
             * @param D [description]
             *
             * @return [description]
             */
            $scope.changeDetail = function (reportName, reportGroupID, reportGroupName) {
                if (!$scope.validReport()) {
                    return;
                }

                if (!$scope.typeFrom) {
                    $scope.closeThisDialog({
                        reportName: reportName,
                        reportGroupID: reportGroupID,
                        reportGroupName: reportGroupName
                    });
                    return;
                }

                reportService.checkReportName({
                    reportName: reportName
                })
                    .then(function (response) {
                        if (response.status === 200 && response.data.success) {
                            $scope.closeThisDialog({
                                reportName: reportName,
                                reportGroupID: reportGroupID,
                                reportGroupName: reportGroupName
                            });
                        }
                        else {
                            $scope.msg = response.data.message;
                            return;
                        }

                    });
            };

            /**
             * @brief 规则验证
             * @details [long description]
             * @return [description]
             */
            $scope.validReport = function () {
                $scope.msg = '';
                $scope.groupMsg = '';
                if (!$scope.reportName) {
                    $scope.msg = '报表组名称为空';
                    return false;
                }

                if ($scope.reportName.replace(/[^\x00-\xff]/g, 'xx').length > 20) {
                    $scope.msg = '报表组名称超过20个字符';
                    return false;
                }

                if (CONSTANT.textReplace.test($scope.reportName)) {
                    $scope.msg = '报表组名称包含特殊字符';
                    return false;
                }

                if (!$scope.reportGroupName || $scope.reportGroupName == '--请选择所属组--') {
                    $scope.groupMsg = '请选择所属报表组';
                    return false;
                }

                return true;
            };

        }
    ]);
});
