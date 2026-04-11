/**
*  reportGroupCtrl 实现下载管理报表管理  分组区域的逻辑
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

    app.controller('reportDownloadListCtrl', [
        '$scope',
        '$stateParams',
        '$q',
        '$timeout',
        '$rootScope',
        '$document',
        'dialogService',
        'winHeightService',
        'reportService',
        'baseService', function ($scope, $stateParams, $q, $timeout, $rootScope, $document, dialogService, winHeightService, reportService, baseService) {
            $document.find('input').placeholder();
            $scope.delAuth = false; // 是否有删除权限
            $scope.exportAuth = false; // 是否有导出权限
            $scope.status = Number($stateParams.type); // 状态：0:下载中  1：已完成
            // 分页的参数;
            $scope.pageOptions = {
                pageNum: 1,
                pageSize: 15
            };
            // 获取报表列表
            $scope.getDownloadReportList = function (params) {
                // 自己新加
                params = $.extend(params, {type: $scope.status, downloadReportName: $scope.keyword}, $scope.pageOptions);
                return reportService.getDownloadReport(params)
                    .then(function (result) {
                        $scope.allchecked = false;
                        $scope.counts = result.value.totalRows || 0;
                        $scope.reports = result.value.rows || [];
                        if ($scope.reports.length) {
                            return $q.reject(result);
                        }

                        if ($scope.pageOptions.pageNum === 1 && result.value.totalRows === 0) {
                            return $q.reject(result);
                        }

                        return result;
                    }).then(function () {
                    $scope.pageOptions.pageNum = $scope.pageOptions.pageNum - 1;
                    if ($scope.pageOptions.pageNum) {
                        $scope.getDownloadReportList();
                    }

                });
            };

            /**
             * 搜索框监听Enter键
             *
             */
            $scope.enterKey = function (event) {
                event = event || window.event;
                if (event.keyCode == 13) {
                    $scope.search();
                }

            };

            /**
             * 搜索功能, 在发起请求的时候， 重置 分页参数
             * @params: None
             *
             *
             **/
            $scope.search = function () {
                if (!baseService.validWord($scope.keyword)) {
                    return;
                }

                $scope.pageOptions.pageNum = 1;
                $scope.counts = 0;
                $scope.getDownloadReportList();
            };

            // 全选功能
            $scope.checkAll = function () {
                $scope.allchecked = !$scope.allchecked;
                angular.forEach($scope.reports, function (item) {
                    item.checked = $scope.allchecked;
                });
            };
            // 单选监听
            $scope.checkedThis = function (item) {
                if (!item.checked) {
                    $scope.allchecked = false;
                    return;
                }

                var allchecked = true;
                $.each($scope.reports, function (key, item) {
                    if (!item.checked) {
                        allchecked = false;
                        return;
                    }

                });

                $scope.allchecked = allchecked;
            };
            // 获取已选择的对象
            $scope.getCheckedItems = function () {
                var deferred = $q.defer();

                $timeout(function () {
                    var reportId = [];
                    $.each($scope.reports, function (key, item) {
                        if (item.checked) {
                            reportId.push(item.id);
                        }

                    });
                    if (reportId.length) {
                        deferred.resolve(reportId);
                    }
                    else {
                        dialogService.alert('至少选择一条记录');
                        deferred.reject(reportId);
                    }
                });
                return deferred.promise;
            };

            // 单个导出
            $scope.oneExport = function (id) {
                $('#del-wrap_' + id).removeClass('hidden');
                dialogService.confirmTo('确认要导出该条信息吗').then(function (value) {
                    $('#del-wrap_' + id).addClass('hidden');
                    if (value) {
                        $('#frm_' + id).attr('action', reportService.downloadFile()).submit();
                    }

                });
            };
            // 删除
            $scope.downloadDelete = function (id) {
                reportService.deleteDownLoadReport({
                    reportDownloadIds: id
                })
                    .then(function (result) {
                        $scope.getDownloadReportList();
                    });
            };

            // 批量删除
            $scope.batchDelete = function () {
                $scope.getCheckedItems().then(function (reportId) {
                    dialogService.confirm('确认要删除这些信息吗').then(function () {
                        $scope.downloadDelete(reportId.join(','));
                    });

                });
            };

            // 单个删除
            $scope.oneDelete = function (id) {
                $('#del-wrap_' + id).removeClass('hidden');
                dialogService.confirmTo('确认要删除该条信息吗').then(function (value) {
                    $('#del-wrap_' + id).addClass('hidden');
                    if (value) {
                        $scope.downloadDelete(id);
                    }

                });
            };

            // 获取列表,　
            $scope.getDownloadReportList();
            // 初始化调用
            winHeightService.calculate();
            // 浏览器窗口大小改变
            angular.element(window).resize(function () {
                winHeightService.calculate();
            });
            // 监听表格渲染完成(列表有数据才会循环，才有判断)
            $scope.$on('colResizable', function (ngRepeatFinishedEvent) {
                winHeightService.calculate();
                // 浏览器窗口大小改变
                angular.element(window).resize(function () {
                    winHeightService.calculate();
                });
            });

            // 功能权限
            $scope.$watch('$parent.resources', function (newValue, oldValue) {
                if (!newValue) {
                    return;
                }

                angular.forEach(newValue, function (resource) {
                    if (resource.link === '/report') { // 模型
                        angular.forEach(resource.childRes, function (item) {
                            if (item.link === '/download.do') {
                                $scope.optAciton = item.optAction || [];
                                if ($.inArray('delete', $scope.optAciton) > -1) {
                                    $scope.delAuth = true;
                                }

                                if ($.inArray('export', $scope.optAciton) > -1) {
                                    $scope.exportAuth = true;
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
