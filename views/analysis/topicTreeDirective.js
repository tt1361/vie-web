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
     * 业务概览属性结构指令
     */
    app.directive('topicTreeGrid', [
        'topicService',
        'dialogService', function (topicService, dialogService) {
            return {
                restrict: 'E',
                templateUrl: 'analysis/topicTreeGrid.htm',
                replace: true,
                scope: {
                    columns: '=',
                    timesRange: '='
                },
                controller: function ($scope, $element, $attrs) {

                    /**
                     * @brief 初始化数据
                     * @details [long description]
                     * @return [description]
                     */
                    $scope.init = function () {
                        topicService.busiOverview({
                            topicGroupType: $attrs.groupType,
                            beginDate: $scope.timesRange.defaultStart,
                            endDate: $scope.timesRange.defaultEnd
                        }).then(function (result) {
                            if (result.success) {
                                $scope.dataSource = [];
                                angular.forEach(result.value, function (e, i) {
                                    e.level = 1;
                                    e.expended = false;
                                    e.visible = true;
                                    e.actived = false;
                                    if (i == 0) {
                                        e.selected = true;
                                    }

                                    e.hasChildren = true;
                                    $scope.dataSource.push(e);
                                });
                                if ($scope.dataSource.length) {
                                    $scope.itemClick($scope.dataSource[0]);
                                }

                                $scope.$emit('date-parent', {
                                    beginDate: $scope.timesRange.defaultStart,
                                    endDate: $scope.timesRange.defaultEnd
                                });

                                // 获取未读通话数量
                                if ($attrs.groupType === 1) {
                                    var params = $.extend($scope.dateParams, {
                                        beginDate: $scope.timesRange.defaultStart,
                                        endDate: $scope.timesRange.defaultEnd
                                    });
                                    topicService.getUnReadCallCount(params)
                                        .then(function (result) {
                                            $scope.$emit('data-unreadcount', {
                                                unReadCount: result.value
                                            });
                                        });
                                }
                            }
                            else {
                                dialogService.error(result.message);
                                return;
                            }
                        });
                    };
                },
                link: function ($scope, $element, $attrs) {
                    $scope.maxLevel = parseInt($attrs.maxLevel, 10);
                    $scope.key = $attrs.key;
                    $scope.dateParams = {};

                    /**
                     * @brief 选中
                     * @details [long description]
                     *
                     * @param  [description]
                     * @return [description]
                     */
                    $scope.toggle = function (item) {
                        var index = getdataSourceIndex(item);
                        item.expended ? collapse(item) : expend(index);
                    };

                    /**
                     * @brief 获取下标
                     * @details [long description]
                     *
                     * @param  [description]
                     * @return [description]
                     */
                    var getdataSourceIndex = function (item) {
                        var index = -1;
                        for (var i = 0; i < $scope.dataSource.length; i++) {
                            if ($scope.dataSource[i].modelId === item.modelId && $scope.dataSource[i].modelOrGroup === item.modelOrGroup) {
                                index = i;
                                break;
                            }

                        }
                        return index;
                    };

                    /**
                     * @brief 监听
                     * @details [long description]
                     *
                     * @return [description]
                     */
                    $scope.$on('date-changed', function (e, d) {
                        $scope.dateParams = d;
                        var params = $.extend($scope.dateParams, {
                            topicGroupType: $attrs.groupType
                        });
                        topicService.busiOverview(params)
                            .then(function (result) {
                                $scope.dataSource = [];
                                angular.forEach(result.value, function (e, i) {
                                    e.level = 1;
                                    e.expended = false;
                                    e.visible = true;
                                    e.actived = false;
                                    if (i === 0) {
                                        e.selected = true;
                                    }

                                    e.hasChildren = true;
                                    $scope.dataSource.push(e);
                                });
                                if ($scope.dataSource.length) {
                                    $scope.itemClick($scope.dataSource[0]);
                                }

                            });
                    });

                    $scope.selectedItemIndex = -1;

                    /**
                     * @brief 提交item点击事件
                     * @details [long description]
                     *
                     * @param m [description]
                     * @param x [description]
                     *
                     * @return [description]
                     */
                    $scope.itemClick = function (item, index) {
                        if (angular.isUndefined($scope.selectedItemIndex) || $scope.selectedItemIndex != index) {
                            $scope.$emit('tree-item-click', item);
                            $scope.selectedItemIndex = angular.isUndefined($scope.selectedItemIndex) ? 0 : index;
                        }

                        if ($scope.selectedItem) {
                            $scope.selectedItem.selected = false;
                        }

                        item.selected = true;
                        $scope.selectedItem = item;
                        if (item.level === 1) {
                            $scope.topGroupId = item.modelId;
                        }

                    };

                    /**
                     * @brief 获取模型组id
                     * @details [long description]
                     *
                     * @param  [description]
                     * @return [description]
                     */
                    var getParentGroupId = function (item) {
                        if (item.parent) {
                            return getParentGroupId(item.parent);
                        }

                        return item.modelId;
                    };

                    /**
                     * @brief 获取index
                     * @details [long description]
                     *
                     * @param  [description]
                     * @return [description]
                     */
                    var getTopIndex = function (id) {
                        for (var i = 0; i < $scope.dataSource.length; i++) {
                            var group = $scope.dataSource[i];
                            if (group.modelId === id && group.modelOrGroup === 1) {
                                return i;
                            }

                        }
                        return -1;
                    };

                    /**
                     * @brief 获取对象
                     * @details [long description]
                     *
                     * @param  [description]
                     * @return [description]
                     */
                    var getModelElement = function (modelId) {
                        for (var i = 0; i < $scope.dataSource.length; i++) {
                            var group = $scope.dataSource[i];
                            if (group.modelId === modelId) {
                                return true;
                            }

                        }
                        return false;
                    };

                    /**
                     * @brief 刷新数据
                     * @details [long description]
                     * @return [description]
                     */
                    var refreshData = function () {
                        var topGroupId = getParentGroupId($scope.selectedItem);
                        var params = $.extend($scope.dateParams, {
                            parentGroupId: topGroupId,
                            beginDate: $scope.timesRange.defaultStart,
                            endDate: $scope.timesRange.defaultEnd
                        });
                        topicService.getAllGroupDatas(params)
                            .then(function (result) {
                                var topIndex = getTopIndex(topGroupId);
                                var data = result.value;
                                var j = 0;
                                for (var i = 0; i < data.length; i++) {
                                    if (!getModelElement(data[i].modelId)) {
                                        j = j + 1;
                                        continue;
                                    }

                                    if (i > 0 && $scope.dataSource[i + topIndex - j].level == 1) {
                                        break;
                                    }

                                    $scope.dataSource[i + topIndex - j].callCount = data[i].callCount;
                                    $scope.dataSource[i + topIndex - j].unReadCall = data[i].unReadCall;
                                }
                            });
                    };

                    /**
                     * @brief 更新数据
                     * @details [long description]
                     *
                     * @param c [description]
                     * @param t [description]
                     *
                     * @return [description]
                     */
                    var updateCountData = function (src, dest) {
                        for (var i = 0; i < src.length; i++) {
                            var s = src[i];
                            for (var j = 0; j < dest.length; j++) {
                                var d = dest[j];
                                if (d.modelId === s.modelId) {
                                    d.callCount = s.callCount;
                                    d.unReadCall = s.unReadCall;
                                }

                                if (s.models && d.subItems) {
                                    updateCountData(s.models, d.subItems);
                                }

                            }
                        }
                    };

                    /**
                     * @brief [brief description]
                     * @details [long description]
                     *
                     * @param  [description]
                     * @return [description]
                     */
                    var expend = function (index) {
                        var item = $scope.dataSource[index];
                        item.expended = true;
                        if (item.actived) { // 已查询过子节点
                            var children = findChindren(item, index);
                            if (children.length > 0) {
                                angular.forEach(children, function (e) {
                                    e.visible = item.expended;
                                });
                            }
                        }
                        else {
                            getChildren(index);
                            item.actived = true;
                        }
                    };

                    /**
                     * @brief 监听
                     * @details [long description]
                     * @return [description]
                     */
                    $scope.$on('call-read', function () {
                        refreshData();
                        getUnReadCount();
                    });

                    /**
                     * @brief 获取未读通话数量
                     * @details [long description]
                     * @return [description]
                     */
                    var getUnReadCount = function () {
                        $scope.$on('date-changed', function (e, d) {
                            $scope.beginDateTime = d.beginDate;
                            $scope.endDateTime = d.endDate;
                        });
                        // 获取未读通话数量
                        var params = $.extend($scope.dateParams, {
                            beginDate: $scope.timesRange.defaultStart,
                            endDate: $scope.timesRange.defaultEnd
                        });
                        topicService.getUnReadCallCount(params)
                            .then(function (result) {
                                $scope.$emit('data-unreadcount', {
                                    unReadCount: result.value
                                });
                            });
                    };

                    /**
                     * @brief 查询子节点
                     * @details [long description]
                     *
                     * @param  [description]
                     * @return [description]
                     */
                    var getChildren = function (index) {
                        var item = $scope.dataSource[index];
                        var param = $.extend({
                            topicGroupType: $attrs.groupType,
                            id: item.modelId,
                            beginDate: $scope.timesRange.defaultStart,
                            endDate: $scope.timesRange.defaultEnd
                        }, $scope.dateParams);
                        topicService.getChildrenGroup(param)
                            .then(function (result) {
                                angular.forEach(result.value, function (e, i) {
                                    e.level = item.level + 1;
                                    e.expended = false;
                                    e.visible = item.expended;
                                    e.parentId = item[$scope.key];
                                    e.actived = false;
                                    e.parent = item;
                                    if (!item.subItems) {
                                        item.subItems = [];
                                    }

                                    item.subItems.push(e);
                                    e.hasChildren = (e.level != $scope.maxLevel && e.modelOrGroup == 1);
                                    $scope.dataSource.splice(index + 1 + i, 0, e);
                                });
                            });
                    };

                    /**
                     * @brief 查询节点
                     * @details [long description]
                     *
                     * @param m [description]
                     * @param x [description]
                     *
                     * @return [description]
                     */
                    var findChindren = function (item, index) {
                        var children = [];
                        for (var i = index + 1; i < $scope.dataSource.length; i++) {
                            var child = $scope.dataSource[i];
                            if (child.level > item.level + 1) {
                                continue;
                            }

                            if (child.parentId != item[$scope.key]) {
                                break;
                            }

                            children.push(child);
                        }
                        return children;
                    };

                    /**
                     * @brief [brief description]
                     * @details [long description]
                     *
                     * @param  [description]
                     * @return [description]
                     */
                    var collapse = (function f(item) {
                        // var item = $scope.dataSource[index];
                        item.expended = false;
                        if (item.level < $scope.maxLevel) {
                            var index = getdataSourceIndex(item);
                            var children = findChindren(item, index);
                            if (children && children.length > 0) {
                                angular.forEach(children, function (e, i) {
                                    e.visible = false;
                                    f(e);
                                });
                            }
                        }

                    });
                }
            };
        }
    ]);
});
