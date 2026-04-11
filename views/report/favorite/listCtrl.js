

/**
 * 本controller 实现常用报表列表展示的相关功能
 *  @params:
 *      $http:  发送http 请求的service
 *      $scope: 双向绑定的媒介， 由 angular 自动实例化
 *
 *  本controller 实现功能如下
 *      1、切换状态
 *      2、未删除其中一项， PS: 伪删除
 *      3、恢复删除项
 *      4、提交删除项
 *      5、搜索
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

    app.controller('favoriteReportListCtrl', [
        '$scope',
        '$q',
        '$document',
        'winHeightService',
        'reportService',
        'baseService', function ($scope, $q, $document, winHeightService, reportService, baseService) {
            $document.find('input').placeholder();
            $scope.delAuth = false; // 是否有删除权限

            /**
             *  分页的的相关参数
             *  默认由directive 去控制，
             *  如果传入则使用controller 数据
             *  pageSize: 15,
             *  pageNum: 1
             */
            $scope.pageOptions = {
                pageNum: 1,
                pageSize: 20
            };

            $scope.counts = 0;

            /**
             * 请求服务器端 常用报表列表
             *   @params: Object;
             *      Example:{
                        pageSize: Integer; 请求的数量
                        pageNum: Integer; 请求的页码
                        content: String; 搜索的关键字
             }
             *
             */
            $scope.getFavRepList = function (params) {
                params = $.extend(params, $scope.pageOptions, {
                    reportName: $scope.reportName
                });
                return reportService.getCommonReport(params)
                    .then(function (result) {
                        $scope.commonReports = result.value.rows || [];
                        $scope.counts = result.value.totalRows;
                        if ($scope.commonReports.length) {
                            return $q.reject(result);
                        }

                        if ($scope.pageOptions.pageNum === 1 && result.value.totalRows === 0) {
                            return $q.reject(result);
                        }

                        return result;
                    }).then(function () {
                    $scope.pageOptions.pageNum = $scope.pageOptions.pageNum - 1;
                    if ($scope.pageOptions.pageNum) {
                        $scope.getFavRepList();
                    }

                });
            };

            $scope.getFavRepList();

            /**
             *  提交删除项，及想服务器端提交前面操作伪删除的列表项
             *
             */
            $scope.submitMockRemoveItem = function (item) {
                reportService.deleteCommonReport({
                    reportIds: item.reportId
                }).then(function (result) {
                    $scope.getFavRepList();
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
                if (!baseService.validWord($scope.reportName)) {
                    return;
                }

                $scope.pageOptions.pageNum = 1;
                $scope.counts = 0;
                $scope.getFavRepList();
            };

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
                            if (item.link === '/report.do') {
                                $scope.optAciton = item.optAction || [];
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
