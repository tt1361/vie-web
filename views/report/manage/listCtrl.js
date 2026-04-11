/**
*  reportGroupCtrl 实现报表管理列表区域的逻辑
*   @params:
*       $http:  http请求服务Service
*       $scope: $scope, 作用域Service
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

    app.controller('reportManageListCtrl', [
        '$scope',
        '$stateParams',
        '$q',
        '$timeout',
        'ngDialog',
        '$document',
        'dialogService',
        'winHeightService',
        'reportService',
        'baseService', function ($scope, $stateParams, $q, $timeout, ngDialog, $document, dialogService, winHeightService, reportService, baseService) {
            $document.find('input').placeholder();
            $scope.shareAuth = false; // 是否有分享权限
            $scope.addAuth = false; // 是否有添加权限
            $scope.delAuth = false; // 是否有分享权限
            $scope.commonAuth = false; // 是否有常用权限
            $scope.setTopAuth = false; // 是否有置顶权限
            $scope.groupAddAuth = false; // 是否有组添加权限
            $scope.groupEditAuth = false; // 是否组编辑权限
            $scope.groupDelAuth = false; // 是否有组删除权限
            // 初始化分页参数
            $scope.pageOptions = {
                pageNum: 1,
                pageSize: 15
            };
            // 默认未全选
            $scope.allchecked = false;
            // 接收group参数
            $scope.reportGroupId = Number($stateParams.group);

            /**
             * @brief 设置报表组
             * @details [long description]
             *
             * @param  [description]
             * @return [description]
             */
            $scope.setGroupName = function (item) {
                $scope.groupListName = item.name;
            };

            /**
             * @brief 搜索报表组
             * @details [long description]
             * @return [description]
             */
            $scope.findKeyGroups = function () {
                if (!baseService.validWord($scope.searchword)) {
                    return;
                }

                $scope.groups = [];
                if (!$scope.searchword) {
                    $scope.groups = $scope.allGroups;
                }
                else {
                    angular.forEach($scope.allGroups, function (item) {
                        if (item.name.indexOf($scope.searchword) > -1) {
                            $scope.groups.push(item);
                        }

                    });
                }

                // 如果group为-1，表示全部
                if ($scope.reportGroupId === -1) {
                    $scope.groupListName = '全部';
                }
                else {
                    angular.forEach($scope.groups, function (item) {
                        if (item.id === $scope.reportGroupId) {
                            $scope.groupListName = item.name;
                            return;
                        }

                    });
                }
            };

            /**
             * @brief 按enter键报表组模糊查询
             * @details [long description]
             *
             * @param  [description]
             * @return [description]
             */
            $scope.enterKeyGroup = function (event) {
                event = event || window.event;
                if (event.keyCode == 13) {
                    $scope.findKeyGroups();
                }

            };

            /**
             * @brief 获取报表列表
             * @details [long description]
             *
             * @param  [description]
             * @return [description]
             */
            $scope.getReportList = function (params) {
                params = $.extend(params, $scope.pageOptions, {
                    reportName: $scope.keyword,
                    reportGroupId: $scope.reportGroupId
                });
                return reportService.getReportList(params)
                    .then(function (result) {
                        $scope.allchecked = false;
                        $scope.reports = result.value.rows || [];
                        $scope.counts = result.value.totalRows;
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
                        $scope.getReportList();
                    }

                });
            };

            /**
             * @brief 新建报表弹窗
             * @details [long description]
             * @return [description]
             */
            $scope.addReport = function () {
                $scope.typeFrom = 'add';
                $scope.reportName = '';
                $scope.reportGroupID = $scope.reportGroupId;
                // 获取报表组
                reportService.getReportGroupExpCom()
                    .then(function (result) {
                        $scope.reportGroups = result.value || [];
                        angular.forEach($scope.reportGroups, function (item) {
                            if ($scope.reportGroupID === item.id) {
                                $scope.reportGroupName = item.name;
                            }

                        });
                        ngDialog.open({
                            id: 'editDetail',
                            template: 'report/detail/reportDetail.htm',
                            controller: 'manageNewCreate',
                            scope: $scope,
                            className: 'report-detail ngdialog-theme-default',
                            showClose: false,
                            closeByEscape: false,
                            closeByDocument: true,
                            disableAnimation: true
                        }).closePromise.then(function (dialog) {
                            if (angular.isUndefined(dialog.value) || dialog.value == '$document') {
                                return;
                            }

                            window.location.href = '#/report/detail/' + dialog.value.reportGroupID + '//' + dialog.value.reportName + '/0';
                        });
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
                $scope.getReportList();
            };

            /**
             * @brief 报表置顶/取消置顶
             * @details [long description]
             *
             * @param d [description]
             * @param d [description]
             *
             * @return [description]
             */
            $scope.setReportUp = function (id, name, type) {
                reportService.setReportUp({
                    reportId: id,
                    reportName: name,
                    type: type
                }).then(function (result) {
                    $scope.getReportList();
                });
            };

            /**
             * @brief 设置报表为常用/取消常用
             * @details [long description]
             *
             * @param  [description]
             * @return [description]
             */
            $scope.updateFavorite = function (item) {
                reportService.usualReport({
                    reportIds: item.id,
                    reportName: item.name,
                    type: item.isGeneral
                }).then(function (result) {
                    $scope.getReportList();
                });
            };

            /**
             * @brief 批量设置为常用/取消常用
             * @details [long description]
             *
             * @param  [description]
             * @return [description]
             */
            $scope.batchFavorite = function (isGeneral) {
                var ids = [];
                var reportName = [];
                $.each($scope.reports, function (key, item) {
                    if (item.checked) {
                        ids.push(item.id);
                        reportName.push(item.name);
                    }

                });
                if (ids.length) {
                    $scope.updateFavorite({id: ids.join(','), name: reportName.join(','), isGeneral: isGeneral});
                }
                else {
                    dialogService.alert('至少选择一个报表');
                    return;
                }
            };

            /**
             * @brief 全选功能
             * @details [long description]
             * @return [description]
             */
            $scope.checkAll = function () {
                $scope.allchecked = !$scope.allchecked;
                angular.forEach($scope.reports, function (item) {
                    item.checked = $scope.allchecked;
                });
            };

            /**
             * @brief 删除
             * @details [long description]
             *
             * @param  [description]
             * @return [description]
             */
            $scope.remove = function (id, reportName) {
                reportService.deleteReport({id: id, reportName: reportName})
                    .then(function (result) {
                        $scope.getReportList();
                    });
            };

            /**
             * @brief 批量删除
             * @details [long description]
             * @return [description]
             */
            $scope.batchRemove = function () {
                // $scope.getCheckedIds().then(function(ids){
                //     dialogService.confirm("确认要删除这些信息吗").then(function(){
                //         $scope.remove(ids.join(','));
                //     });

                // });

                var ids = [];
                var reportName = [];
                $.each($scope.reports, function (key, item) {
                    if (item.checked) {
                        ids.push(item.id);
                        reportName.push(item.name);
                    }

                });
                if (ids.length) {
                    dialogService.confirm('确认要删除这些信息吗').then(function () {
                        $scope.remove(ids.join(','), reportName.join(','));
                    });
                }
                else {
                    dialogService.alert('至少选择一个报表');
                    return;
                }

            };

            /**
             * @brief 单个删除
             * @details [long description]
             *
             * @param  [description]
             * @return [description]
             */
            $scope.oneRemove = function (id, reportName) {
                $('#opo-wrap_' + id).removeClass('hidden');
                dialogService.confirmTo('确认要删除这个信息吗').then(function (value) {
                    $('#opo-wrap_' + id).addClass('hidden');
                    if (value) {
                        $scope.remove(id, reportName);
                    }

                });
            };

            /***
             *
             *  选中单个
             */
            $scope.checkedThis = function (item) {
                if (!item.checked) {
                    $scope.allchecked = false;
                    return;
                }

                var allchecked = true;
                $.each($scope.reports, function (key, item) {
                    if (!item.checked) {
                        allchecked = false;
                        return false;
                    }

                });

                $scope.allchecked = allchecked;
            };

            /**
             * 获取选中的项
             */
            $scope.getCheckedIds = function () {
                var deferred = $q.defer();
                $timeout(function () {
                    var ids = [];
                    $.each($scope.reports, function (key, item) {
                        if (item.checked) {
                            ids.push(item.id);
                        }

                    });
                    if (ids.length) {
                        deferred.resolve(ids);
                    }
                    else {
                        dialogService.alert('至少选择一个报表');
                        deferred.reject(ids);
                    }
                });
                return deferred.promise;
            };

            /**
             * @brief 下拉列表显示
             * @details [long description]
             * @return [description]
             */
            $scope.showGroups = function () {
                $scope.isOpen = !$scope.isOpen;
            };

            // 下拉组显示
            $scope.showBox = function () {
                $scope.isShow = !$scope.isShow;
            };

            /**
             * @brief 获取报表组
             * @details [long description]
             * @return [description]
             */
            $scope.getGroups = function () {
                reportService.allGroups()
                    .success(function (result) {
                        $scope.allGroups = result.value || [];
                        $scope.findKeyGroups();
                        $scope.getReportList();
                    });
            };

            /**
             * @brief 新建报表组
             * @details [long description]
             * @return [description]
             */
            $scope.newReportGroup = function () {
                if (angular.element('.report-group-input').length > 0) {
                    $('#report-opt-all').removeClass('hidden');
                    dialogService.alertTo('请先完成其他的报表组编辑或新增').then(function (value) {
                        $('#report-opt-all').addClass('hidden');
                    });
                    return;
                }

                var item = {
                    isAdd: true
                };
                $scope.groups.push(item);
                $timeout(function () {
                    angular.element('.report-group-input').focus();
                }, 500);
            };

            $scope.getGroups();
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

            // 点击页面其他地方关闭弹窗
            $(window.document).click(function (event) {
                if (!angular.element(event.target).parents('.article-header-top').length
                    && !angular.element(event.target).hasClass('picture-select-down')
                    && $scope.isOpen) {
                    $scope.isOpen = false;
                }

                $scope.$apply();
            });

            // 功能权限
            $scope.$watch('$parent.resources', function (newValue, oldValue) {
                if (!newValue) {
                    return;
                }

                angular.forEach(newValue, function (resource) {
                    if (resource.link === '/report') { // 模型
                        angular.forEach(resource.childRes, function (item) {
                            if (item.link === '/manage.do') {
                                $scope.optAciton = item.optAction || [];
                                if ($.inArray('delete', $scope.optAciton) > -1) {
                                    $scope.delAuth = true;
                                }

                                if ($.inArray('add', $scope.optAciton) > -1) {
                                    $scope.addAuth = true;
                                }

                                if ($.inArray('share', $scope.optAciton) > -1) {
                                    $scope.shareAuth = true;
                                }

                                if ($.inArray('common', $scope.optAciton) > -1) {
                                    $scope.commonAuth = true;
                                }

                                if ($.inArray('groupAdd', $scope.optAciton) > -1) {
                                    $scope.groupAddAuth = true;
                                }

                                if ($.inArray('groupEdit', $scope.optAciton) > -1) {
                                    $scope.groupEditAuth = true;
                                }

                                if ($.inArray('groupDel', $scope.optAciton) > -1) {
                                    $scope.groupDelAuth = true;
                                }

                                if ($.inArray('setTop', $scope.optAciton) > -1) {
                                    $scope.setTopAuth = true;
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
