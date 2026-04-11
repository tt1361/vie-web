/**
 * 本文件中的directive 实现模型页面的模型管理模型组的组件
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

    /**
     * 模型管理页面模型组下拉列表指令
     *
     */
    app.directive('gdModelNewGroup', [
        'RecursionHelper',
        '$timeout',
        'dialogService',
        'gdModelService',
        'CONSTANT', function (RecursionHelper, $timeout, dialogService, gdModelService, CONSTANT) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'gdModel/gdModel-new-group-directive.htm',
                scope: {
                    item: '=',
                    groupId: '=',
                    addAuth: '@',
                    editAuth: '@',
                    delAuth: '@'
                },
                compile: function (element) {
                    return RecursionHelper.compile(element, function (scope, $el, arrt, controller, transcludeFn) {
                        // 中转接受参数
                        scope.deItem = angular.copy(scope.item);
                        var name = angular.copy(scope.item.text);

                        scope.item.isShow = scope.item.id === 0 ? true : false;

                        // 展开收起切换
                        scope.showOpen = function () {
                            scope.item.isShow = !scope.item.isShow;
                        };

                        /**
                         * @brief 刷新数据
                         * @details [long description]
                         * @return [description]
                         */
                        scope.refresh = function () {
                            var $scope = scope;
                            while (angular.isUndefined($scope.getAllModelGroups)) {
                                $scope = $scope.$parent;
                            }
                            $scope.groupId = -1;
                            $scope.getAllModelGroups();
                        };

                        /**
                         * @brief 删除模型组
                         * @details [long description]
                         * @return [description]
                         */
                        scope.deleteModelGroup = function () {
                            $el.find('.add-more-group-opt').removeClass('hidden');
                            dialogService.confirmTo('确定删除该模型组及其包含的所有模型？').then(function (value) {
                                if (value) {
                                    gdModelService.deleteModelGroup({modelGroupId: scope.item.id, modelGroupName: scope.item.text})
                                        .then(function (result) {
                                            $el.find('.add-more-group-opt').addClass('hidden');
                                            window.location.href = '#/model/-1/list';
                                            if (scope.groupId === 0) {
                                                $timeout(function () {
                                                    scope.refresh();
                                                }, 200);
                                            }

                                        });
                                }
                                else {
                                    $el.find('.add-more-group-opt').addClass('hidden');
                                }
                            });

                        };

                        /**
                         * @brief 新增或编辑模型组
                         * @details [long description]
                         *
                         * @param  type 表示是新增还是编辑
                         * @return [description]
                         */
                        scope.newOrEditModelGroup = function (type) {
                            if (angular.element('.model-name-input').length > 0) {
                                $el.find('.add-more-group-opt').removeClass('hidden');
                                dialogService.alertTo('请先完成其他的模型组编辑或新增').then(function (value) {
                                    $el.find('.add-more-group-opt').addClass('hidden');
                                });
                                return;
                            }

                            if (type === 'add') {
                                var item = {
                                    children: [],
                                    pid: scope.$parent.item.id,
                                    treeNum: scope.$parent.item.treeNum + 1,
                                    isAdd: true
                                };
                                scope.item.isShow = true;
                                scope.item.children.push(item);
                            }
                            else {
                                scope.item.isEdit = true;
                            }
                            $timeout(function () {
                                $el.find('.model-name-input').focus();
                            }, 500);
                        };

                        /**
                         * @brief 添加或更新模型组
                         * @details [long description]
                         * @return [description]
                         */
                        scope.saveGroup = function () {
                            gdModelService.addModelGroup({
                                parentId: scope.item.pid,
                                groupName: scope.item.text,
                                groupId: scope.item.isAdd ? -1 : scope.item.id
                            }).then(function (result) {
                                if (scope.item.isAdd) {
                                    scope.item.isAdd = false;
                                    scope.refresh();
                                    return;
                                }

                                scope.item.isEdit = false;
                                var modelId = Number(location.hash.split('/')[2]);
                                if (modelId === scope.item.id) {
                                    var $scope = scope;
                                    while (angular.isUndefined($scope.setGroupName)) {
                                        $scope = $scope.$parent;
                                    }
                                    $scope.setGroupName(scope.item);
                                }

                                name = angular.copy(scope.item.text);
                                scope.deItem = angular.copy(scope.item);
                            });
                        };

                        /**
                         * @brief 保存按钮
                         * @details [long description]
                         * @return [description]
                         */
                        scope.saveOrUpdate = function () {
                            if (!scope.validModel()) {
                                return;
                            }

                            if (scope.item.isEdit && name === scope.item.text) {
                                scope.item.isEdit = false;
                                return;
                            }

                            scope.saveGroup();
                        };

                        /**
                         * @brief 保存前的预处理
                         * @details [long description]
                         * @return [description]
                         */
                        scope.validModel = function () {
                            if (!scope.item.text) {
                                dialogService.alert('模型组名称不能为空！');
                                return false;
                            }

                            if (scope.item.text.replace(/[^\x00-\xff]/g, 'xx').length > 100) {
                                dialogService.alert('模型组名称超过100个字符！');
                                return false;
                            }

                            if (CONSTANT.textReplace.test(scope.item.text)) {
                                dialogService.alert('模型组名称包含特殊字符');
                                return false;
                            }

                            return true;
                        };

                        /**
                         * @brief 按enter键
                         * @details [long description]
                         *
                         * @param  event 事件
                         * @return [description]
                         */
                        scope.enterSubmitKey = function (event) {
                            event = event || window.event;
                            if (event.keyCode === 13) {
                                scope.saveOrUpdate();
                            }

                        };

                        /**
                         * @brief 取消按钮
                         * @details [long description]
                         * @return [description]
                         */
                        scope.cancelAdd = function () {
                            if (scope.item.isAdd) {
                                scope.item.isAdd = false;
                                scope.refresh();
                            }
                            else {
                                scope.item.isEdit = false;
                                scope.item = angular.copy(scope.deItem);
                            }
                        };
                    });
                }
            };

        }
    ]);
});
