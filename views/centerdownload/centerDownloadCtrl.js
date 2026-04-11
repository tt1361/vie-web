/**
*  center_download 下载中心 controller
*  @author yancai2
*  @time 2017/09/15
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

    app.controller('centerDownloadCtrl', [
        '$scope',
        '$stateParams',
        '$q',
        '$timeout',
        '$rootScope',
        '$document',
        'dialogService',
        'winHeightService',
        'centerDownloadService',
        'baseService', function ($scope, $stateParams, $q, $timeout, $rootScope, $document, dialogService, winHeightService, centerDownloadService, baseService) {
            $document.find('input').placeholder();
            $scope.delAuth = false; // 是否有删除权限
            $scope.exportAuth = false; // 是否有导出权限
            $scope.timesRange = {
                defaultStart: $scope.systemDate && $scope.systemDate != '${systemDate}' ? $.datepicker.formatDate('yy-mm-dd', new Date(new Date($scope.systemDate).getTime() - 6 * 24 * 3600 * 1000)) : $.datepicker.formatDate('yy-mm-dd', new Date(new Date().getTime() - 6 * 24 * 3600 * 1000)),
                defaultEnd: $scope.systemDate && $scope.systemDate != '${systemDate}' ? $scope.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date())
            };
            // 分页的参数;
            $scope.pageOptions = {
                pageNum: 1,
                pageSize: 15
            };

            /**
             * 搜索框监听Enter键
             *
             */
            //  $scope.enterKey = function(event){
            //      event = event || window.event;
            //      if (event.keyCode == 13) {
            //          $scope.search();
            //      }
            //  }

            // 单个导出
            //  $scope.oneExport = function(id){
            //     $("#del-wrap_"+id).removeClass("hidden");
            //     dialogService.confirmTo("确认要导出该条信息吗").then(function(value){
            //         $("#del-wrap_"+id).addClass("hidden");
            //         if(value){
            //             $("#frm_"+id).attr('action', reportService.downloadFile()).submit();
            //         }
            //     });
            //  }

            // 删除
            // $scope.downloadDelete = function(id){
            //     reportService.deleteDownLoadReport({reportDownloadIds: id})
            //         .then(function(result){
            //             $scope.getDownloadReportList();
            //         });
            // }

            // 单个删除
            // $scope.oneDelete = function(id){
            //     $("#del-wrap_"+id).removeClass("hidden");
            //     dialogService.confirmTo("确认要删除该条信息吗").then(function(value){
            //         $("#del-wrap_"+id).addClass("hidden");
            //         if(value){
            //             $scope.downloadDelete(id);
            //         }

            //     });
            // }

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
