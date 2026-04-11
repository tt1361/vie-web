/**
 * 报表组指令
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

    app.directive('group', ['$state', '$timeout', 'dialogService', 'reportService', 'CONSTANT', function ($state, $timeout, dialogService, reportService, CONSTANT) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'report/manage/group-directive.htm',
            scope: {
                item: '=',
                mgroup: '=',
                status: '=',
                remove: '&',
                editAuth: '@',
                delAuth: '@'
            },
            link: function (scope, element, attrs) {

                scope.deItem = angular.copy(scope.item);

                var name = angular.copy(scope.item.name);

                scope.isEditMethod = true;
                if (!scope.editAuth && !scope.delAuth) {
                    scope.isEditMethod = false;
                }

                /**
                 * @brief 编辑报表组
                 * @details [long description]
                 * @return [description]
                 */
                scope.editReportGroup = function () {
                    if (angular.element('.report-group-input').length > 0) {
                        element.find('.report-group-opt').removeClass('hidden');
                        dialogService.alertTo('请先完成其他的报表组编辑或新增').then(function (value) {
                            element.find('.report-group-opt').addClass('hidden');
                        });
                        return;
                    }

                    scope.item.isEditGroup = true;
                    $timeout(function () {
                        element.find('.report-group-input').focus();
                    }, 500);
                };

                /**
                 * @brief 删除报表组（与后台交互）
                 * @details [long description]
                 *
                 * @param  [description]
                 * @return [description]
                 */
                scope.remove = function (id, reportGroupName) {
                    reportService.deleteReportGroup({reportGroupId: id, reportGroupName: reportGroupName})
                        .then(function (result) {
                            $state.go('main.report.manage.list', {group: -1, edit: 0}, {
                                reload: true
                            });
                        });
                };

                /**
                 * @brief 删除报表组
                 * @details [long description]
                 *
                 * @param  [description]
                 * @return [description]
                 */
                scope.deleteReportGroup = function (id, reportGroupName) {
                    element.find('.report-group-opt').removeClass('hidden');
                    dialogService.confirmTo().then(function (value) {
                        element.find('.report-group-opt').addClass('hidden');
                        if (value) {
                            scope.remove(id, reportGroupName);
                        }

                    });
                };

                /**
                 * @brief 按 enter键提交
                 * @details [long description]
                 *
                 * @param  [description]
                 * @return [description]
                 */
                scope.enterSubmitKey = function (event) {
                    event = event || window.event;
                    if (event.keyCode === 13) {
                        scope.saveOrUpdate();
                    }

                };

                /**
                 * @brief 新增报表组
                 * @details [long description]
                 * @return [description]
                 */
                scope.saveGroup = function () {
                    if (!scope.validModel()) {
                        return;
                    }

                    reportService.addReportGroup({
                        reportGroupName: scope.item.name
                    }).then(function (result) {
                        scope.item.isAdd = false;
                        scope.$parent.getGroups();
                    });
                };

                /**
                 * @brief 取消按钮
                 * @details [long description]
                 * @return [description]
                 */
                scope.cancelUpdate = function () {
                    if (scope.item.isEditGroup || scope.item.isAdd) {
                        scope.item.isEditGroup = false;
                        scope.item.isAdd = false;
                        scope.$parent.getGroups();
                    }
                    else {
                        scope.item.isEditGroup = false;
                        scope.item.isAdd = false;
                        scope.item = angular.copy(scope.deItem);
                    }
                };

                /**
                 * @brief 编辑报表组
                 * @details [long description]
                 * @return [description]
                 */
                scope.updateGroup = function () {
                    if (!scope.validModel()) {
                        return;
                    }

                    if (name === scope.item.name) {
                        scope.item.isEditGroup = false;
                        return;
                    }

                    reportService.editSingleReportGroup({
                        reportGroupId: scope.item.id,
                        reportGroupName: scope.item.name
                    }).then(function (result) {
                        scope.item.isEditGroup = false;
                        if (scope.mgroup === scope.item.id) {
                            var $scope = scope;
                            while (angular.isUndefined($scope.setGroupName)) {
                                $scope = $scope.$parent;
                            }
                            $scope.setGroupName(scope.item);
                        }

                        name = angular.copy(scope.item.name);
                    });
                };

                /**
                 * @brief 保存按钮
                 * @details [long description]
                 * @return [description]
                 */
                scope.saveOrUpdate = function () {
                    scope.item.isAdd ? scope.saveGroup() : scope.updateGroup();
                };

                /**
                 * @brief 预处理
                 * @details [long description]
                 * @return [description]
                 */
                scope.validModel = function () {
                    if (!scope.item.name) {
                        dialogService.alert('报表组名称不能为空！');
                        return false;
                    }

                    if (scope.item.name.replace(/[^\x00-\xff]/g, 'xx').length > 20) {
                        dialogService.alert('报表组名称超过20个字符！');
                        return false;
                    }

                    if (CONSTANT.textReplace.test(scope.item.name)) {
                        dialogService.alert('报表组名称包含特殊字符');
                        return false;
                    }

                    return true;
                };
            }
        };

    }]);
});
