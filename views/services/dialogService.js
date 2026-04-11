/**
*  弹窗控制
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

    app.service('dialogService', ['$q', 'ngDialog', '$state', function ($q, ngDialog, $state) {

        return {
            confirm: function (message, yes, no) {
                return ngDialog.open({
                    template: 'services/confirm.htm',
                    closeByDocument: false,
                    showClose: false,
                    disableAnimation: true,
                    controller: ['$scope', function ($scope) {
                        // 点击确定后直接调用
                        $scope.message = message || '您确定要删除本条信息吗？';
                        $scope.yes = yes || '确认';
                        $scope.no = no || '取消';
                    }],
                    className: 'ngdialog-theme-default ngdialog-theme-dialog'
                }).closePromise.then(function (dialog) {
                    if (typeof dialog.value === 'number' && dialog.value) {
                        return true;
                    }

                    return $q.reject();
                });
            },
            confirmTo: function (message, yes, no) {
                return ngDialog.open({
                    template: 'services/confirm.htm',
                    closeByDocument: false,
                    showClose: false,
                    disableAnimation: true,
                    controller: ['$scope', function ($scope) {
                        // 点击确定后直接调用
                        $scope.message = message || '您确定要删除本条信息吗？';
                        $scope.yes = yes || '确认';
                        $scope.no = no || '取消';
                    }],
                    className: 'ngdialog-theme-default ngdialog-theme-dialog'
                }).closePromise.then(function (dialog) {
                    if (typeof dialog.value === 'number' && dialog.value) {
                        return true;
                    }

                    return false;
                });
            },
            alert: function (message) {
                return ngDialog.open({
                    template: 'services/alert.htm',
                    disableAnimation: true,
                    controller: ['$scope', function ($scope) {
                        // 点击确定后直接调用
                        $scope.message = message || '';
                    }],
                    closeByDocument: false,
                    showClose: false,
                    className: 'ngdialog-theme-default ngdialog-theme-dialog'
                }).closePromise.then(function (dialog) {
                    if (typeof dialog.value === 'number' && dialog.value) {
                        return true;
                    }

                    return $q.reject();
                });
            },
            alertTo: function (message) {
                return ngDialog.open({
                    template: 'services/alert.htm',
                    disableAnimation: true,
                    controller: ['$scope', function ($scope) {
                        // 点击确定后直接调用
                        $scope.message = message || '';
                    }],
                    closeByDocument: false,
                    showClose: false,
                    className: 'ngdialog-theme-default ngdialog-theme-dialog'
                }).closePromise.then(function (dialog) {
                    if (typeof dialog.value === 'number' && dialog.value) {
                        return true;
                    }

                    return false;
                });
            },
            success: function (message) {
                return ngDialog.open({
                    id: 'successDialog',
                    template: 'services/success.htm',
                    closeByDocument: true,
                    showClose: false,
                    disableAnimation: true,
                    controller: ['$scope', function ($scope) {
                        // 点击确定后直接调用
                        $scope.message = message || '提交信息成功';
                    }],
                    className: 'ngdialog-theme-default ngdialog-tooltip-dialog'
                });
            },
            successTo: function (message) {
                return ngDialog.open({
                    id: 'successDialog',
                    template: 'services/downloadReportSuccess.htm',
                    closeByDocument: true,
                    showClose: false,
                    disableAnimation: true,
                    controller: ['$scope', function ($scope) {
                        $scope.goDownload = function () {
                            $state.go('main.report.download.list', {
                                type: 0
                            }, {
                                reload: true
                            });
                        };
                    }],
                    className: 'ngdialog-theme-default ngdialog-tooltip-dialog'
                });
            },
            error: function (message) {
                return ngDialog.open({
                    id: 'errorDialog',
                    template: 'services/error.htm',
                    closeByDocument: true,
                    showClose: false,
                    disableAnimation: true,
                    controller: ['$scope', function ($scope) {
                        // 点击确定后直接调用
                        $scope.message = message || '提交信息失败';
                    }],
                    className: 'ngdialog-theme-default ngdialog-tooltip-dialog'
                });
            }
        };
    }
    ]);

});
