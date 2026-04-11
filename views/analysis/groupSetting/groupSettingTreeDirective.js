(function (factory) {
    if (typeof define === 'function' && !!define.amd) {
        define([
            '../../app'
        ], factory);
    }
    else {
        factory(window.app);
    }
})(function (app) {
    app.directive('groupSettingTree', ['$stateParams', 'dialogService', 'topicService', 'baseService', function ($stateParams, dialogService, topicService, baseService) {

        return {
            restrict: 'E',
            templateUrl: 'analysis/groupSetting/groupSettingTree.htm',
            replace: true,
            scope: {},
            link: function ($scope, $element, $attr) {
                $scope.groupType = $stateParams.groupType;
                $scope.maxLevel = 4;
                // if ($scope.groupType == 0) $scope.maxLevel = 2;

                $scope.dataSource = [{
                    level: 0,
                    modelName: '全部',
                    modelId: 0,
                    expended: true,
                    visible: true
                }];

                // 获取系统时间
                $scope.timesRange = baseService.getSystemTime();
                // 删除
                $scope.deleteGroup = function (item) {
                    $('#group-tree_' + item.modelId).removeClass('hidden');
                    if ($scope.editing) {
                        dialogService.alertTo('请提交或取消正在编辑/新增的分组').then(function (value) {
                            $('#group-tree_' + item.modelId).addClass('hidden');
                        });
                        return;
                    }

                    dialogService.confirmTo('该节点下的子节点会一并删除，是否要删除？').then(function (value) {

                        $('#group-tree_' + item.modelId).addClass('hidden');
                        if (value) {
                            topicService.deleteTopicGroup({
                                id: item.modelId
                            }).then(function (result) {
                                removeItem(item);
                                clearSelectedGroup(item); // 删除后刷新左侧页面
                            });
                        }

                    });
                    return false;
                };

                // 编辑
                $scope.editItem = function (item) {
                    if ($scope.editing) {
                        $('#group-tree_' + item.modelId).removeClass('hidden');
                        dialogService.alertTo('请提交或取消正在编辑/新增的分组').then(function (value) {
                            $('#group-tree_' + item.modelId).addClass('hidden');
                        });

                        return;
                    }

                    $scope.editing = true;
                    item.isEdit = true;
                };

                // 取消编辑与新增
                $scope.cancelEdit = function (item) {
                    if (item.isEdit) {
                        item.isEdit = false;
                    }
                    else if (item.isAdd) {
                        removeItem(item);
                    }

                    $scope.editing = false;
                };

                $scope.confirmEdit = function (item) {
                    var specialChar = new RegExp('[~！@#￥%……&*（）——+]');
                    var newModelName = $element.find('input').val();

                    if (!newModelName || $.trim(newModelName) == '') {
                        dialogService.alert('请输入分组名!');
                        return;
                    }

                    if (specialChar.test(newModelName)) {
                        dialogService.alert('分组名不能包含特殊字符，请重新输入!');
                        return;
                    }

                    if (getBLen(newModelName) > 20) {
                        dialogService.alert('分组名长度超过20个字符，请重新输入!');
                        return;
                    }

                    if (item.isEdit) {
                        if (newModelName !== item.modelName) {
                            topicService.updateTopicGroup({
                                id: item.modelId,
                                topicGroupType: $scope.groupType,
                                topicGroupName: newModelName
                            }).then(function (result) {
                                $scope.editing = false;
                                item.isEdit = false;
                                item.modelName = newModelName;
                            });
                        }
                    }
                    else if (item.isAdd) {
                        topicService.addTopicGroup({
                            topicGroupType: $scope.groupType,
                            parentGroupId: item.parent.modelId,
                            topicGroupName: newModelName
                        }).then(function (result) {
                            $scope.editing = false;
                            item.isAdd = false;
                            item.modelName = newModelName;
                            item.modelId = result.value;
                            $scope.itemClick(item);
                        });
                    }

                };

                $scope.addItem = function (item) {
                    if ($scope.editing) {
                        $('#group-tree_' + item.modelId).removeClass('hidden');
                        dialogService.alertTo('请提交或取消正在编辑/新增的分组').then(function (value) {
                            $('#group-tree_' + item.modelId).addClass('hidden');
                        });
                        return;
                    }

                    var newItem = {
                        visible: true,
                        expended: false,
                        selected: true,
                        parent: item,
                        level: item.level + 1,
                        isAdd: true,
                        modelOrGroup: 1
                    };
                    if (!item.subItems) {
                        item.subItems = [];
                    }

                    item.subItems.push(newItem);
                    $scope.editing = true;
                };

                $scope.showEdit = function () {
                    $element.find('input[type=text]')[0].focus();
                };

                $scope.itemClick = function (item) {
                    if (item.modelOrGroup != 0 && item.level > 0 && !item.isEdit && !item.isAdd) {
                        changeSelectedGroup(item);
                        $scope.$emit('item-click', item);
                    }

                };

                var removeItem = function (item) {
                    if (item.parent && item.parent.subItems) {
                        item.parent.subItems.splice($.inArray(item, item.parent.subItems), 1);
                    }

                };

                var getTop = function () {
                    topicService.busiOverview({
                        settingPage: 1,
                        topicGroupType: $scope.groupType,
                        beginDate: $scope.timesRange.defaultStart,
                        endDate: $scope.timesRange.defaultEnd
                    }).then(function (result) {
                        angular.forEach(result.value, function (e) {
                            var item = $.extend(e, {
                                level: 1,
                                expended: false,
                                selected: false,
                                visible: true,
                                avtived: false,
                                parent: $scope.dataSource[0]
                            });
                            if (!$scope.dataSource[0].subItems) {
                                $scope.dataSource[0].subItems = [];
                            }

                            $scope.dataSource[0].subItems.push(item);
                        });
                    });
                };

                getTop();

                getBLen = function (str) {
                    if (str == null) {
                        return 0;
                    }

                    if (typeof str != 'string') {
                        str += '';
                    }

                    return str.replace(/[^\x00-\xff]/g, '01').length;
                };

                $scope.toggle = function (item) {
                    if (item.expended) {
                        collapse(item);
                    }
                    else {
                        expend(item);
                    }
                };

                $scope.isDisplay = function (item) {
                    var show = item.level == 0 || item.modelOrGroup == 1;
                    return show && item.visible;
                };

                var changeSelectedGroup = function (item) {
                    if ($scope.selectedGroup) {
                        $scope.selectedGroup.selected = false;
                    }

                    item.selected = true;
                    $scope.selectedGroup = item;
                };

                var clearSelectedGroup = function (item) {
                    if ($scope.selectedGroup) {
                        $scope.selectedGroup.selected = false;
                    }

                    item.selected = true;
                    $scope.selectedGroup = item;
                    $scope.$emit('item-clear', item);
                };

                var expend = function (item) {
                    item.expended = true;
                    if (item.subItems) {
                        angular.forEach(item.subItems, function (e) {
                            e.visible = true;
                        });
                    }
                    else {
                        if (item.level == 0) {
                            getTop();
                        }
                        else {
                            topicService.getChildrenGroup({
                                isSetting: 1,
                                topicGroupType: $scope.groupType,
                                id: item.modelId,
                                beginDate: $scope.timesRange.defaultStart,
                                endDate: $scope.timesRange.defaultEnd
                            }).then(function (result) {
                                item.actived = true;
                                angular.forEach(result.value, function (e) {
                                    if (e.modelOrGroup == 1) {
                                        var subItem = $.extend(e, {
                                            visible: true,
                                            expended: false,
                                            level: item.level + 1,
                                            selected: false,
                                            avtived: false,
                                            parent: item
                                        });
                                        if (!item.subItems) {
                                            item.subItems = [];
                                        }

                                        item.subItems.push(subItem);
                                    }

                                });
                            });
                        }
                    }
                };

                var collapse = function (item) {
                    item.expended = false;
                    if (item.subItems) {
                        angular.forEach(item.subItems, function (e) {
                            e.visible = false;
                            if (e.level < $scope.maxLevel) {
                                collapse(e);
                            }

                        });
                    }

                };
            }
        };

    }
    ]);
});
