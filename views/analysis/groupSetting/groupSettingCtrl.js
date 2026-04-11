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
    app.controller('groupSettingCtrl', ['$scope', '$stateParams', 'ngDialog', 'dialogService', 'topicService',
        'baseService', function ($scope, $stateParams, ngDialog, dialogService, topicService, baseService) {

            if (parseInt($stateParams.groupType, 10) == 0) {
                $scope.dataPage = {url: '#/analysis/overview', name: '业务概览', settingName: '概览配置'};
            }
            else {
                $scope.dataPage = {url: '#/analysis/focuspush', name: '重点推送', settingName: '推送配置'};
            }

            $scope.modelList = [];

            $scope.timesRange = baseService.getSystemTime();

            $scope.$on('item-click', function (e, d) {
                $scope.selectedGroup = d;
                $scope.group_type = $stateParams.groupType;
                $scope.paths = [];
                getPaths(d, $scope.paths);
                $scope.paths.reverse();
                queryModels($scope.selectedGroup);
            });

            var queryModels = function (group) {
                topicService.getChildrenGroup({
                    id: group.modelId,
                    topicGroupType: $stateParams.groupType,
                    settingPage: 1,
                    beginDate: $scope.timesRange.defaultStart,
                    endDate: $scope.timesRange.defaultEnd
                }).then(function (result) {
                    $scope.modelList = [];
                    angular.forEach(result.value, function (e) {
                        if (e.modelOrGroup == 0) {
                            $scope.modelList.push(e);
                        }

                    });
                });
            };

            $scope.deleteModel = function (model) {
                dialogService.confirm('确定要移除模型:' + model.modelName + '?').then(function () {
                    topicService.deleteGroupModel({
                        parentGroupId: $scope.selectedGroup.modelId,
                        modelId: model.modelId
                    }).then(function (result) {
                        queryModels($scope.selectedGroup);
                    });
                });
            };

            $scope.addModel = function () {
                ngDialog.open({
                    template: 'analysis/groupSetting/addModels.htm',
                    controller: 'addModelsCtrl',
                    scope: $scope,
                    showClose: false,
                    closeByEscape: false,
                    closeByDocument: true,
                    disableAnimation: true,
                    className: 'ngdialog-theme-default ngdialog-theme-model-push'
                }).closePromise.then(function (dialog) {
                    if (angular.isUndefined(dialog.value) || dialog.value == '$document') {
                        return;
                    }

                    topicService.addGroupModels({
                        id: $scope.selectedGroup.modelId,
                        modelIds: dialog.value
                    }).then(function (result) {
                        queryModels($scope.selectedGroup);
                    });
                });
            };

            var getPaths = function (item, paths) {
                paths.push(item.modelName);
                if (item.parent && item.level > 1) {
                    getPaths(item.parent, paths);
                }

            };

            $scope.$on('item-clear', function (e, d) {
                $scope.paths = [];
                $scope.selectedGroup = d;
                queryModels($scope.selectedGroup);
                $scope.selectedGroup = null;
            });

        }]).controller('addModelsCtrl', ['$scope', 'modelService', function ($scope, modelService) {
        var selectedModels = [];
        $scope.queryModels = function () {
            modelService.findAllOnlineModelGroup().then(function (result) {
                $scope.modelGroupList = result.value || [];
            });
        };

        $scope.unAdded = function (item) {
            var key = item.key;
            if ($scope.modelList) {
                for (var i = 0; i < $scope.modelList.length; i++) {
                    if ($scope.modelList[i].modelId + '' == key + '') {
                        return false;
                    }

                }
            }

            return true;
        };

        $scope.selectModel = function (model) {
            if (!model.selected) {
                selectedModels.push(model.key);
                model.selected = true;
            }
            else {
                selectedModels.splice($.inArray(model.key, selectedModels), 1);
                model.selected = false;
            }
        };

        $scope.commit = function () {
            if (selectedModels.length > 0) {
                $scope.closeThisDialog(selectedModels.join(','));
            }
            else {
                $scope.closeThisDialog();
            }
        };
    }]).filter('getPaths', function () {
        return function (item, maxSize) {
            if (item) {
                if (item.length <= maxSize) {
                    return item;
                }
                else {
                    var shortpaths = item.substr(0, 5);
                    return shortpaths + '...';
                }
            }
            else {
                return '';
            }
        };
    });
});
