/**
 * 自定义专题-基础分析-编辑库
 * @author
 * @time
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
    app.controller('markerLibDiaCtrl', [
        '$scope',
        '$q',
        '$timeout',
        'dialogService',
        'topicService', function ($scope, $q, $timeout, dialogService, topicService) {
            // 默认排序
            $scope.sortParams = {
                sortColumn: 'id',
                sortType: 'asc'
            };
            // 分页参数
            $scope.pageOptions = {
                pageNum: 1,
                pageSize: 10
            };

            $scope.counts = 0;
            $scope.btnUp = 'id';

            // 排序
            $scope.remarkSort = function (order, orderType) {
                if (orderType == 'asc') {
                    $scope.btnUp = order;
                    $scope.btnDown = '';
                }
                else {
                    $scope.btnUp = '';
                    $scope.btnDown = order;
                }
                // if (orderType == 'asc') {
                //    $scope.btnUp = index;
                //    $scope.btnDown = -1;
                // } else {
                //    $scope.btnUp = -1;
                //    $scope.btnDown = index;
                // }
                $scope.sortParams = {
                    sortColumn: order,
                    sortType: orderType
                };
                $scope.getConversationList($scope.sortParams);
            };

            // 获取匹配通话标记库列表
            $scope.getConversationList = function (params) {
                // 排序参数
                params = $.extend(true, $scope.sortParams, $scope.pageOptions, {
                    topicId: $scope.$parent.topicId
                });
                return topicService.getMarkData(params)
                    .then(function (result) {
                        $scope.allchecked = false;
                        // 表头列元素
                        $scope.columns = result.value ? result.value.columns : [];
                        // 表格内容行
                        $scope.conversations = result.value ? result.value.previewList.rows : [];
                        // 总行数
                        $scope.counts = result.value ? result.value.totalCount : 0;
                        if ($scope.conversations != null && $scope.conversations.length > 0) {
                            return $q.reject(result);
                        }

                        if ($scope.pageOptions.pageNum === 1 && $scope.counts === 0) {
                            return $q.reject(result);
                        }

                        return result;
                    }).then(function () {
                    $scope.pageOptions.pageNum = $scope.pageOptions.pageNum - 1;
                    if ($scope.pageOptions.pageNum > 0) {
                        $scope.getConversationList();
                    }

                });
            };

            // 全选功能
            $scope.checkAll = function () {
                $scope.allchecked = !$scope.allchecked;
                angular.forEach($scope.conversations, function (item) {
                    item.checked = $scope.allchecked;
                });
            };

            $scope.checkedThis = function (item) {
                if (!item.checked) {
                    $scope.allchecked = false;
                    return;
                }

                var allchecked = true;
                $.each($scope.conversations, function (key, item) {
                    if (!item.checked) {
                        allchecked = false;
                        return;
                    }

                });
                $scope.allchecked = allchecked;
            };

            // 排序
            $scope.sortByOrder = function (order, orderType) {
                if (order == $scope.viewConfig.order
                    && orderType == $scope.viewConfig.orderType) {
                    return;
                }

                $scope.viewConfig.order = order;
                $scope.viewConfig.orderType = orderType;
                $scope.getConversationList();
            };

            /**
             * 获取选中的项
             */
            $scope.getCheckedIds = function () {
                var deferred = $q.defer();
                $timeout(function () {
                    var ids = [];
                    $.each($scope.conversations, function (key, item) {
                        if (item.checked) {
                            ids.push(item.dataMaps.markId);
                        }

                    });
                    if (ids.length) {
                        deferred.resolve(ids);
                    }
                    else {
                        dialogService.alert('至少选择一条记录！');
                        deferred.reject(ids);
                    }
                });
                return deferred.promise;
            };

            // 删除
            $scope.remove = function (id) {
                topicService.deleteMark({
                    markIds: id
                })
                    .then(function (result) {
                        $scope.getConversationList();
                        $scope.$parent.getCallList();
                    });
            };

            // 批量删除
            $scope.batchRemove = function () {
                $scope.getCheckedIds().then(function (ids) {
                    dialogService.confirm('确认要删除这些信息吗').then(function () {
                        $scope.remove(ids.join(','));
                    });

                });
            };

            // 点击可编辑
            $scope.showEdit = function (item) {
                item.edit = !item.edit;
                if (item.edit) {
                    var id = item.dataMaps.id;
                    $timeout(function () {
                        document.getElementById('remark-input_' + id).focus();
                    }, 500);
                }

            };

            // 校验备注是否合理
            $scope.validMark = function (mark) {
                if (!mark) {
                    dialogService.alert('备注不能为空！');
                    return false;
                }

                if (mark.replace(/[^\x00-\xff]/g, 'xx').length > 20) {
                    dialogService.alert('备注不能超过20个字符！');
                    return false;
                }

                return true;
            };

            // 提交编辑
            $scope.submitRemark = function (item) {
                var id = item.dataMaps.id;
                var remark = document.getElementById('remark-input_' + id).value;
                if (!$scope.validMark(remark)) {
                    return;
                }

                var params = {
                    topicId: $scope.$parent.topicId,
                    telephonId: item.dataMaps.id,
                    mark: remark
                };
                topicService.addMark(params)
                    .then(function (result) {
                        item.edit = !item.edit;
                        item.dataMaps.remark = remark;
                        $scope.$parent.getCallList();
                    });
            };
            // 初始化标记库列表
            $scope.getConversationList();

        }
    ]);

});
