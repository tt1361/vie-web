/**
 * 自定义专题-详情页-js
 *  @dependece: Angular Module
 *  @update 2017-06-08 by yancai2
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
    app.controller('analysisDetailCtrl', [
        '$scope',
        '$stateParams',
        'ngDialog',
        '$document',
        '$timeout',
        '$q',
        '$rootScope',
        'modelService',
        'dialogService',
        'winHeightService',
        'topicService',
        'customIndexService',
        'dimensionService',
        'CONSTANT', function ($scope, $stateParams, ngDialog, $document, $timeout, $q, $rootScope, modelService, dialogService, winHeightService, topicService, customIndexService, dimensionService, CONSTANT) {
            $document.find('input').placeholder();
            $scope.isTask = $rootScope.isTask;
            $scope.tab = 0; // 0展示模型，1展示维度，默认展示模型
            $scope.addModelAuth = false; // 是否有新增模型权限
            $scope.importModelAuth = false; // 是否有导入模型权限
            $scope.importDimensionAuth = false; // 是否有导入维度权限
            $scope.addPathAuth = false; // 是否有新增路径权限
            $scope.assignDimensionAuth = false; // 是否有分配维度权限
            $scope.saveAuth = false; // 是否有保存权限
            $scope.markLibAuth = false; // 是否有标记库权限
            $scope.exportAuth = false; // 是否有导出权限
            $scope.hideOpen = false; // 默认展开
            // 默认展示全局
            $scope.showTab = 0;
            $scope.selectName = '全局';
            // $scope.defPathId = 0;
            $scope.iconTab = 0; // 默认显示模型，0表示模型， 1表示维度
            $scope.modelOpen = false; // 模型下拉列表是否展示
            $scope.groupListName = '全部'; // 默认展示全部模型
            $scope.modelGroupId = 0; // 默认设置全部模型组的id为0
            // 默认全局路径的匹配量为0
            $scope.gloabl = 0;
            $scope.manual = false; // 是否展示手动刷新
            $scope.showTime = false; // 是否显示时间控件
            $scope.canView = true; // 是否支持预览
            $scope.timesRange = {
                defaultStart: $scope.systemDate && $scope.systemDate != '${systemDate}' ? $.datepicker.formatDate('yy-mm-dd', new Date(new Date($scope.systemDate).getTime() - 6 * 24 * 3600 * 1000)) : $.datepicker.formatDate('yy-mm-dd', new Date(new Date().getTime() - 6 * 24 * 3600 * 1000)),
                defaultEnd: $scope.systemDate && $scope.systemDate != '${systemDate}' ? $scope.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date())
            };
            // 获取专题id
            $scope.topicId = Number($stateParams.id);
            // 获取路径id
            $scope.contentPathId = Number($stateParams.pathId);
            // 获取展示类型
            $scope.contentType = Number($stateParams.contentType);
            // 获取自定义首页模块id
            $scope.moduleId = Number($stateParams.moduleId);
            // 用于接受导入模型
            $scope.models = [];
            // 接受所属模型组参数
            $scope.modelGroup = {};
            // 所有路径
            $scope.allPaths = [];
            // 用于右侧展示的路径
            $scope.showPaths = [];
            $scope.tabPaths = [];
            // 用于接收全部维度
            $scope.allDimensions = [];
            // 用于接收每个路径下选择的维度
            $scope.newDimensions = [];
            // 用于接收每个路径下的全部维度
            $scope.pathDims = [];
            $scope.pathCounts = 0;
            $scope.viewConfig = [];
            $scope.isPreview = true; // 预览值固定
            $scope.opType = 'add'; // 添加到首页标志
            $scope.updateType = 'update'; // 添加到首页标志
            $scope.isSaved = false;
            // 根据id获取模块信息
            $scope.queryModuleInfoById = function () {
                customIndexService.queryModuleInfoById({
                    id: $scope.moduleId
                })
                    .then(function (result) {
                        $scope.moduleName = result.value ? result.value.moduleName : '';
                        $scope.pageId = result.value ? result.value.pageId : 0;
                        $scope.pageName = result.value ? result.value.pageName : '';
                    });
            };

            // 获取全局变量
            $scope.setGloabl = function () {
                topicService.getLoadCount({
                    topicId: $scope.topicId
                })
                    .then(function (result) {
                        $scope.gloabl = result.value || 0;
                    });
            };

            // 获取当前路径匹配数发送给detail页面使用
            $scope.$on('pathCounts', function (event, data) {
                $scope.pathCounts = data;
            });

            /*导出数据路径标签params*/
            $scope.exportPath = function (path) {
                if (path && path.subRoute) {
                    $scope.pathDim = '';
                    angular.forEach(path.subRoute, function (subRoute, index, arr) {
                        if (subRoute.isNegate === 1 && subRoute.type === 'model') {
                            $scope.pathDim = $scope.pathDim + '!' + subRoute.name + '[' + subRoute.count + ']';
                        }
                        else {
                            $scope.pathDim = $scope.pathDim + subRoute.name + '[' + subRoute.count + ']';
                        }
                        if (index + 1 != path.subRoute.length) {
                            $scope.pathDim += '/';
                        }

                    });
                }
                else {
                    $scope.pathDim = '';
                }
                // console.log($scope.pathDim)

            };

            // 根据专题id获取详情信息
            $scope.getDetailTopic = function () {
                var deferred = $q.defer();
                topicService.getDetailTopic({
                    topicId: $scope.topicId
                })
                    .then(function (result) {
                        $scope.name = result.value.topicName || '';
                        $scope.screening = result.value.topicCondition || [];
                        angular.forEach($scope.screening, function (item) {
                            if (item.type === 'timeRange') { // 获取时间
                                $scope.timesRange.timeValue = item.timeValue ? item.timeValue : -7;
                                $scope.timesRange.timeType = item.timeType ? item.timeType : 2;
                                if (item.inputValue) {
                                    $scope.timesRange.defaultStart = item.inputValue.split('~')[0];
                                    $scope.timesRange.defaultEnd = item.inputValue.split('~')[1];
                                }
                            }

                        });
                        // console.log($scope.timesRange);
                        $scope.showTime = true;
                        $scope.tabPaths = result.value.pathDimension || [];
                        angular.forEach($scope.tabPaths, function (item) {
                            item.callListDimensions = item.callListDimensions ? eval('(' + item.callListDimensions + ')') : [];
                            item.chartDimensions = item.chartDimensions ? eval('(' + item.chartDimensions + ')') : [];
                            item.togetherDimensions = item.togetherDimensions ? eval('(' + item.togetherDimensions + ')') : [];
                            if (item.pathName != '全局') {
                                var pathParam = eval('(' + item.pathParam + ')');
                                var view = true;
                                $.each(pathParam, function (key, value) {
                                    if (value.type == 'dimension') {
                                        value.value = value.isNegate ? '!(' + value.value + ')' : value.value;
                                        var index = $rootScope.myInArray($scope.allDimensions, 'key', value.field);
                                        if (index > -1) {
                                            value.name = $scope.allDimensions[index].name;
                                        }
                                        else {
                                            value.notView = true;
                                            view = false;
                                        }
                                    }
                                    else if (value.type == 'model') {
                                        if (Number(value.status) != 2) {
                                            view = false;
                                        }
                                    }

                                });
                                var path = {
                                    name: item.pathName,
                                    route: pathParam,
                                    subRoute: angular.copy(pathParam),
                                    isSave: true,
                                    id: item.pathId,
                                    view: view
                                };
                                $scope.allPaths.push(path);
                            }
                            else {
                                $scope.pathId = item.pathId;
                                $scope.defPathId = item.pathId;
                                deferred.resolve($scope.defPathId);
                                // console.log($scope.defPathId)
                                if (Number($scope.defPathId) === $scope.contentPathId) {
                                    $scope.showGlobalPath = true;
                                }
                            }
                        });
                        if ($scope.contentPathId === 0) {
                            $scope.showPaths = angular.copy($scope.allPaths);
                            $scope.showGlobalPath = true;
                        }
                        else {
                            angular.forEach($scope.allPaths, function (path) {
                                if (Number(path.id) === $scope.contentPathId) {
                                    $scope.showPaths.push(angular.copy(path));
                                    $scope.selectName = path.name;
                                    $scope.defPathId = path.id;
                                    $scope.showTab = path.id;
                                    $scope.path = path;
                                    $scope.searchPathDim();
                                    return;
                                }

                            });
                            deferred.resolve($scope.defPathId);
                        }
                        $scope.initTopicTime = $scope.screening[0].value;
                    });
                return deferred.promise;
            };

            // 切换每个路径tab
            $scope.showPathResult = function (path) {
                if ($scope.path && !$scope.path.isSave) {
                    dialogService.confirmTo('当前路径尚未保存，是否放弃保存？').then(function (value) {
                        if (value) { // 确认
                            $scope.path.subRoute = angular.copy($scope.path.route);
                            $scope.path.isSave = true;
                            $scope.isExistOfflineModel(path);
                        }

                        $scope.selectShow();
                        return;
                    });
                }
                else {
                    $scope.isExistOfflineModel(path);
                    $scope.selectShow();

                    /*更新路径模型维度数据count*/
                    $scope.getPathValueFresh(path);
                }

                /*导出数据路径标签params*/
                // $scope.exportPath(path);
            };
            // 切换后路径的处理
            $scope.afterChangeTab = function (path, type) {
                $scope.path = path === 0 ? '' : path;
                $scope.showTab = path === 0 ? 0 : path.id;
                $scope.selectName = path === 0 ? '全局' : path.name;
                $scope.defPathId = path === 0 ? $scope.pathId : path.id;
                if (type != 'save') {
                    $scope.searchPathDim();
                }

                $scope.iconKeyword = '';
                $scope.searchTags();

            };

            // 判断路径中是否存在未上线模型
            $scope.isExistOfflineModel = function (path, type) {
                $scope.canView = true;
                var modelIDList = [];
                var isCanView = true;
                angular.forEach(path.route, function (route) {
                    if (route.type === 'model') {
                        modelIDList.push(route.value);
                    }
                    else {
                        if (route.notView) {
                            isCanView = false;
                            return;
                        }
                    }
                });
                if (!isCanView) {
                    $scope.pathMsg = '该路径存在已下线的模型／已删除的维度，请将其移出路径后重新预览';
                    $scope.canView = false;
                    $scope.frashAnalyseData(path, type);
                    return;
                }

                if (!modelIDList.length) {
                    $scope.canView = true;
                    $scope.frashAnalyseData(path, type);
                    return;
                }

                topicService.getModelStats({modelIds: modelIDList.join(','), topicId: $scope.topicId})
                    .then(function (result) {
                        var resultData = result.value || [];
                        angular.forEach(resultData, function (item) {
                            if (item.status != 2) {
                                path.view = false;
                                return;
                            }

                        });

                        /**
                         * @params [boolean] true 有
                         */
                        if (!path.view) {
                            $scope.pathMsg = '该路径存在已下线的模型／已删除的维度，请将其移出路径后重新预览';
                            $scope.canView = false;
                            $scope.afterChangeTab(path, type);
                        }
                        else {
                            $scope.frashAnalyseData(path, type);
                        }
                        return;
                    });
            };

            /**
             * @brief 刷新
             * @details [long description]
             *
             * @param h [description]
             * @param e [description]
             *
             * @return [description]
             */
            $scope.frashAnalyseData = function (path, type) {
                $scope.afterChangeTab(path, type);
                type ? $scope.$broadcast('refreshData', {
                    pathId: $scope.defPathId
                }) : $scope.$broadcast('allFresh', {
                    pathId: $scope.defPathId
                });
            };

            // 获取当前选择路径下的所有维度
            $scope.searchPathDim = function () {
                $scope.newDimensions = [];
                $scope.pathDims = angular.copy($scope.allDimensions);
                if (!$scope.showTab) {
                    return;
                }

                topicService.searchPathDim({
                    pathId: $scope.defPathId
                })
                    .then(function (result) {
                        var resultValue = result.value || [];
                        angular.forEach(resultValue, function (item) {
                            var evalItem = eval('(' + item.pathDimJson + ')');
                            var index = $rootScope.myInArray($scope.allDimensions, 'key', evalItem.field);
                            if (index > -1) { // 存在
                                var dimItem = angular.copy($scope.allDimensions[index]);
                                dimItem.inputValue = evalItem.value;
                                dimItem.isNegate = evalItem.isNegate;
                                dimItem.id = item.id;
                                $scope.afterSearchPathDim(dimItem);
                                $scope.newDimensions.push(dimItem);
                            }

                            var pathIndex = $rootScope.myInArray($scope.pathDims, 'key', evalItem.field);
                            if (pathIndex > -1) { // 存在
                                $scope.pathDims.splice(pathIndex, 1);
                            }

                        });
                        $scope.autoDimHeight();
                    });
            };

            // 处理获取的维度
            $scope.afterSearchPathDim = function (item) {
                item.defaultValue = [];
                var vals = item.inputValue ? item.inputValue.split(',') : [];
                if (item.type === 'mulSel' || item.type === 'radio') {
                    angular.forEach(item.value, function (value) {
                        var isChecked = false;
                        var isSelect = false;
                        if (item.type === 'mulSel' && $.inArray(value, vals) > -1) { // 存在
                            isChecked = true;
                        }

                        if (item.type === 'radio' && $.inArray(value, vals) > -1) { // 存在
                            isSelect = true;
                        }

                        item.defaultValue.push({
                            checked: isChecked,
                            data: value,
                            type: item.type,
                            isSelect: isSelect
                        });
                    });
                }
                else {
                    angular.forEach(vals, function (val) {
                        var data = {};
                        if (item.type === 'range' || item.type === 'timeRange') {
                            data.up = val.split('~')[1];
                            data.low = val.split('~')[0];
                        }
                        else if (item.type === 'mulEqu') {
                            if (item.isNegate === 1) {
                                item.exclude = true;
                                data = val.replace(/[!()]/g, '');
                            }
                            else {
                                item.exclude = false;
                                data = val;
                            }
                        }

                        item.defaultValue.push({
                            checked: false,
                            data: data,
                            type: item.type,
                            isSelect: false
                        });
                    });
                }
            };

            // 动态监听设计左侧维度高度
            $scope.autoDimHeight = function () {
                $timeout(function () {
                    var haveValueHeight = angular.element('.tags-push-dimension-havevalue').height();
                    var allHeight = angular.element('.tags-push-dimension').height();
                    var realHeight = allHeight - haveValueHeight + 6;
                    angular.element('.tags-push-dimension-novalue').css('max-height', realHeight + 'px');
                }, 500);
            };

            // 新增路径
            $scope.addPath = function () {
                ngDialog.open({
                    template: 'analysis/detail/path/new-path-directive.htm',
                    controller: 'newPathCtrl',
                    scope: $scope,
                    showClose: true,
                    closeByEscape: false,
                    closeByDocument: false,
                    disableAnimation: true,
                    className: 'ngdialog-theme-default ngdialog-theme-model newTopic'
                }).closePromise.then(function (dialog) {
                    if (angular.isUndefined(dialog.value) || dialog.value == '$document' || dialog.value == '$closeButton') {
                        return;
                    }

                    $scope.showTab = dialog.value.id;
                    $scope.selectName = dialog.value.name;
                    $scope.defPathId = dialog.value.id;
                    $scope.path = dialog.value;
                    $scope.showPaths.push(dialog.value);
                    $scope.allPaths.push(dialog.value);
                    $scope.searchPathDim();
                    $scope.$broadcast('allFresh', {
                        pathId: $scope.defPathId
                    });
                    $scope.iconKeyword = '';
                    $scope.searchTags();

                });
            };

            // 管理路径
            $scope.managePath = function () {
                ngDialog.open({
                    template: 'analysis/detail/path/path-manage-directive.htm',
                    controller: 'pathManageCtrl',
                    scope: $scope,
                    showClose: true,
                    closeByEscape: false,
                    closeByDocument: false,
                    disableAnimation: true,
                    className: 'ngdialog-theme-default ngdialog-theme-model newTopic'
                }).closePromise.then(function (dialog) {
                    // 当弹出层关闭后，自动更新 维度对象
                    if (angular.isUndefined(dialog.value) || dialog.value == '$document' || dialog.value == '$closeButton') {
                        return;
                    }

                    $scope.showPaths = dialog.value;
                    angular.forEach($scope.showPaths, function (item) {
                        if ($scope.defPathId === item.id) {
                            $scope.selectName = item.name;
                            return;
                        }

                    });
                    if ($scope.selectName == '全局') {
                        $scope.path = '';
                    }

                });
            };

            // 保存路径
            $scope.savePath = function () {
                var paths = [];
                $scope.path.route = angular.copy($scope.path.subRoute);
                angular.forEach($scope.path.route, function (item) {
                    var path = angular.copy(item);
                    try {
                        delete path.status;
                        delete path.subRoute;
                        delete path.notView;
                    }
                    catch (e) {}
                    if (path.type === 'dimension' && path.value.indexOf('!') > -1) { // 维度取非
                        path.isNegate = 1;
                        path.value = path.value.replace(/\!\(/g, '').replace(/\)/g, '');
                    }

                    paths.push(path);
                });

                topicService.editPath({
                    pathId: $scope.defPathId,
                    topicId: $scope.topicId,
                    pathName: $scope.selectName,
                    pathPram: JSON.stringify(paths)
                }).then(function (response) {
                    if (response.status === 200 && response.data.success) {
                        $scope.isExistOfflineModel($scope.path, 'save');
                        $scope.path.isSave = true;
                    }
                    else {
                        dialogService.alert(response.data.message);
                        return;
                    }

                    /*导出数据路径标签params*/
                    // $scope.exportPath($scope.path);
                });
                if ($scope.curPageType == 4 || $scope.curPageType == 5 || $scope.curPageType == 6) {
                    $scope.$emit('curPageType', {
                        curPageType: 4
                    });
                }

            };

            // 删除路径
            $scope.$on('deletePath', function (event, data) {
                topicService.delPath({pathId: data.item.id, topicId: $scope.topicId})
                    .then(function (result) {
                        $scope.showPaths.splice(data.index, 1);
                        data.path.splice(data.index, 1);
                        var num = 0;
                        var pIndex = 0;
                        $.each($scope.tabPaths, function (key, path) {
                            if (Number(data.item.id) === Number(path.pathId)) {
                                num = key;
                                return;
                            }

                        });
                        $.each($scope.allPaths, function (key, path) {
                            if (Number(data.item.id) === Number(path.pathId)) {
                                pIndex = key;
                                return;
                            }

                        });
                        $scope.tabPaths.splice(num, 1);
                        $scope.allPaths.splice(pIndex, 1);
                        $scope.showTab = 0;
                        $scope.selectName = '全局';
                        $scope.defPathId = $scope.pathId;
                        $scope.$broadcast('allFresh', {
                            pathId: $scope.defPathId
                        });
                        customIndexService.deleteModuleFromHomePage({
                            moduleType: 4,
                            moduleIds: $scope.topicId,
                            moduleDetailInfo: data.item.id
                        });
                    });
            });

            // 切换时间实时刷新
            $scope.timeRefresh = function () {
                var condition = [];
                var screening = {
                    name: '起止时间',
                    key: 'timestamp',
                    type: 'timeRange',
                    value: [$scope.timesRange.defaultStart, $scope.timesRange.defaultEnd],
                    dataType: 'long',
                    uptonow: 0,
                    inputValue: $scope.timesRange.defaultStart + '~' + $scope.timesRange.defaultEnd,
                    timeType: $scope.timesRange.timeType ? $scope.timesRange.timeType : 2,
                    timeValue: $scope.timesRange.timeValue ? $scope.timesRange.timeValue : -7
                };
                condition.push(screening);
                topicService.updateTopicTime({topicId: $scope.topicId, topicCondition: JSON.stringify(condition)})
                    .then(function (result) {
                        if ($scope.initTopicTime.join(',') !== screening.value.join(',')) {
                            $scope.isUpdateTopicTimeFlag = true;
                            $scope.initTopicTime = screening.value;
                            angular.forEach($scope.showPaths, function (path, index, arr) {
                                delete path.pathHadBaseTime;
                            });
                        }
                        else {
                            $scope.isUpdateTopicTimeFlag = false;
                        }
                        // console.log($scope.isUpdateTopicTimeFlag)
                        if ($scope.isUpdateTopicTimeFlag) {
                            $scope.setGloabl();
                            $scope.getPathValueFresh();
                            $scope.getAllOnLineModelsByGroup();
                            // 刷新
                            $scope.$broadcast('refreshData', {
                                pathId: $scope.defPathId
                            });
                        }

                    });
            };

            // 监听查询某个路径值
            $scope.$on('getPathValue', function (event, data) {
                angular.isUndefined(data) ? $scope.operatePathValue() : $scope.operatePathValue(data.index, data.i, data.pathTab, data.lastItem);
                if (data && data.type && data.type === 'model') {
                    angular.forEach($scope.path.route, function (path, index, arr) {
                        if ($scope.path.route.length == $scope.path.subRoute.length) {
                            if (path.value === $scope.path.subRoute[index].value) {
                                if (path.isNegate !== $scope.path.subRoute[index].isNegate) {
                                    $scope.path.isSave = false;
                                    return;
                                }
                                else {
                                    $scope.path.isSave = true;
                                }
                            }
                            else {
                                $scope.path.isSave = false;
                            }
                        }
                        else {
                            $scope.path.isSave = false;
                        }

                    });
                }

                // console.log($scope.path.isSave)
            });

            // 获取匹配值的处理
            $scope.operatePathValue = function (index, i, pathTab, lastItem) {
                var pathTab = angular.isUndefined(index) ? angular.copy($scope.path.subRoute) : pathTab;
                angular.forEach(pathTab, function (path) {
                    try {
                        delete path.name;
                        delete path.count;
                    }
                    catch (e) {}
                    if (path.type === 'dimension' && path.value.indexOf('!') > -1) { // 维度取非
                        path.isNegate = 1;
                        path.value = path.value.replace(/\!\(/g, '').replace(/\)/g, '');
                    }

                });
                topicService.getPathValue({pathPram: JSON.stringify(pathTab), topicId: $scope.topicId})
                    .then(function (result) {
                        if (angular.isUndefined(index)) { // 新增
                            $scope.path.subRoute[$scope.path.subRoute.length - 1].count = result.value || 0;
                        }
                        else {
                            $scope.path.subRoute[Number(index) + i].count = result.value || 0;
                            if ($scope.path.subRoute[Number(index) + i] === lastItem) {
                                return;
                            }

                            i++;
                            var prePath = $scope.path.subRoute.slice(0, Number(index) + i + 1);
                            pathTab = angular.copy(prePath);
                            $scope.operatePathValue(index, i, pathTab, lastItem);
                        }
                        // $scope.exportPath($scope.path);
                    });
            };

            // 查询当前路径值
            $scope.getPathValueFresh = function (path) {
                if ($scope.isUpdateTopicTimeFlag) { // 若切换前时间已经改变，作为标记
                    if (path) { // 路径切换时
                        $scope.path = path;
                        if ($scope.path.tabPathFlag && $scope.path.pathHadBaseTime) {
                            return;
                        }

                        $scope.path.pathHadBaseTime = true;
                    }
                }
                else {
                    if (path) {
                        $scope.path = path;
                        if ($scope.path.tabPathFlag) {
                            return;
                        }
                    }
                }
                // 如果是刷新时间更新的数据
                if ($scope.path) {
                    var pathTabs = angular.copy($scope.path.subRoute);
                    $.each(pathTabs, function (index, pathTab) {
                        if (!pathTab) {
                            return;
                        }

                        try {
                            delete pathTab.name;
                            delete pathTab.count;
                        }
                        catch (e) {}
                        if (pathTab.type === 'dimension' && pathTab.value.indexOf('!') > -1) { // 维度取非
                            pathTab.isNegate = 1;
                            pathTab.value = pathTab.value.replace(/\!\(/g, '').replace(/\)/g, '');
                        }

                        var nowPath = pathTabs.slice(0, index + 1);
                        topicService.getPathValue({pathPram: JSON.stringify(nowPath), topicId: $scope.topicId})
                            .then(function (result) {
                                // 若为下拉框切换路径
                                if (path) {
                                    $scope.path.tabPathFlag = true;
                                }
                                else { // 若为直接切换时间更新数据
                                    $scope.path.tabPathFlag = true;
                                    $scope.path.pathHadBaseTime = true;
                                }
                                $scope.path.subRoute[index].count = result.value || 0;
                            });
                    });
                }

            };

            // 当离开这个页面的时候将弹窗关闭
            $scope.$on('$destroy', function () {
                ngDialog.closeAll();
            });

            // 校验搜索关键词规范
            $scope.validKeyWord = function (keyword) {
                if (keyword) {
                    if (keyword.replace(/[^\x00-\xff]/g, 'xx').length > 100) {
                        dialogService.alert('搜索字段不能超过100个字符');
                        return false;
                    }

                    if (CONSTANT.textReplace.test(keyword)) {
                        dialogService.alert('搜索字段不能包含特殊字符');
                        return false;
                    }
                }

                return true;
            };

            // 保存专题按钮
            $scope.saveTopic = function () {
                var allPaths = angular.copy($scope.tabPaths);
                angular.forEach(allPaths, function (item) {
                    try {
                        delete item.pathName;
                        delete item.pathStatus;
                        delete item.pathParam;
                    }
                    catch (e) {}
                });
                topicService.updateTopic({
                    topicId: $scope.topicId,
                    topicName: $scope.name,
                    pathDimension: JSON.stringify(allPaths)
                }).then(function (response) {
                    if (response.status === 200 && response.data.success) {
                        $scope.isSaved = true;
                        dialogService.success('保存成功');
                        $timeout(function () {
                            ngDialog.close('successDialog');
                        }, 500);
                    }
                    else {
                        dialogService.error('保存失败');
                        $timeout(function () {
                            ngDialog.close('errorDialog');
                        }, 500);
                    }
                });
            };

            // 功能权限
            $scope.$watch('$parent.resources', function (newValue, oldValue) {
                if (!newValue) {
                    return;
                }

                angular.forEach(newValue, function (resource) {
                    if (resource.link === '/analysis') { // 专题
                        angular.forEach(resource.childRes, function (item) {
                            if (item.link === '/analysis.do') {
                                $scope.optAciton = item.optAction || [];
                                if ($.inArray('addModel', $scope.optAciton) > -1) {
                                    $scope.addModelAuth = true;
                                }

                                if ($.inArray('importModel', $scope.optAciton) > -1) {
                                    $scope.importModelAuth = true;
                                }

                                if ($.inArray('importDimension', $scope.optAciton) > -1) {
                                    $scope.importDimensionAuth = true;
                                }

                                if ($.inArray('addPath', $scope.optAciton) > -1) {
                                    $scope.addPathAuth = true;
                                }

                                if ($.inArray('assignDimension', $scope.optAciton) > -1) {
                                    $scope.assignDimensionAuth = true;
                                }

                                if ($.inArray('save', $scope.optAciton) > -1) {
                                    $scope.saveAuth = true;
                                }

                                if ($.inArray('markLib', $scope.optAciton) > -1) {
                                    $scope.markLibAuth = true;
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

            // 获取全部维度信息
            $scope.searchDim = function (type) {
                if (!$scope.validKeyWord($scope.iconKeyword)) {
                    return;
                }

                dimensionService.searchDim({
                    keyword: $scope.iconKeyword
                })
                    .then(function (result) {
                        if ($scope.isTask == 1 || $scope.isTask == '1') {
                            var allDimensions = [];
                            angular.forEach(result.value, function (dimension, index, arr) {
                                if (dimension.key !== 'voiceId') {
                                    allDimensions.push(dimension);
                                }

                            });
                            $scope.allDimensions = allDimensions || [];
                        }
                        else {
                            $scope.allDimensions = result.value || [];
                        }
                        $scope.pathDims = [];
                        angular.forEach($scope.allDimensions, function (item) {
                            var index = $rootScope.myInArray($scope.newDimensions, 'key', item.key);
                            if (index === -1) { // 不存在与已选择维度中
                                $scope.pathDims.push(item);
                            }

                        });
                        if (type) {
                            $scope.getDetailTopic().then(function (data) {
                                // console.log(data)
                                $scope.$broadcast('allFresh', {
                                    pathId: data
                                });
                                if ($scope.path) {
                                    // 全局不存在模型上线、下线问题
                                    if ($scope.contentPathId != 0) {
                                        if ($scope.contentPathId == $scope.path.id) {
                                            if (!$scope.path.view) {
                                                $scope.canView = $scope.path.view;
                                                $scope.pathMsg = '该路径存在已下线的模型／已删除的维度，请将其移出路径后重新预览';
                                            }
                                        }
                                    }
                                }

                                $scope.initShow = true;
                            });
                            $scope.setGloabl();
                        }

                    });
            };
            // 获取全部模型组
            $scope.getAllModelGroups = function () {
                modelService.searchModelGroup({
                    modelGroupName: ''
                })
                    .then(function (result) {
                        $scope.modelGroups = result.value || [];
                        if ($scope.modelGroups.length) {
                            $scope.groupListName = $scope.modelGroups[0].children.length ? $scope.modelGroups[0].children[0].text : '全部';
                            $scope.modelGroupId = $scope.modelGroups[0].children.length ? $scope.modelGroups[0].children[0].id : 0;
                        }

                        $scope.getAllOnLineModelsByGroup();
                    });
            };

            // 切换模型组
            $scope.selectType = function (item) {
                $scope.groupListName = $.trim(item.text);
                $scope.modelGroupId = item.id;
                $scope.getAllOnLineModelsByGroup();
                $scope.showGroups();
            };

            // 模型组下拉列表显示
            $scope.showGroups = function () {
                $scope.modelOpen = !$scope.modelOpen;
            };

            // 获取模型组下所有的已上线模型
            $scope.getAllOnLineModelsByGroup = function () {
                if (!$scope.validKeyWord($scope.iconKeyword)) {
                    return;
                }

                modelService.getAllOnLineModelsByGroup({
                    modelGroupId: $scope.modelGroupId ? $scope.modelGroupId : -1,
                    modelName: $scope.iconKeyword,
                    topicId: $scope.topicId
                }).then(function (result) {
                    $scope.models = result.value || [];
                });
            };

            // 切换标签管理
            $scope.changeIconTab = function (num) {
                $scope.iconTab = num;
                $scope.iconKeyword = '';
                // $scope.searchTags();
                $scope.autoDimHeight();
            };

            // 标签管理enter键搜索
            $scope.enterKey = function (event) {
                var event = event || window.event;
                if (event.keyCode == 13) {
                    $scope.searchTags();
                }

            };

            // 搜索按钮
            $scope.searchTags = function () {
                $scope.iconTab === 0 ? $scope.getAllOnLineModelsByGroup() : $scope.searchDim();
            };

            // 专题详情
            $scope.topicDetail = function () {
                $scope.comFrom = 'detail';
                ngDialog.open({
                    id: 'onlineDialog',
                    template: 'analysis/detail/multi-dimensional-directive.htm',
                    controller: 'multiDimensionalCtrl',
                    scope: $scope,
                    showClose: false,
                    closeByEscape: false,
                    closeByDocument: false,
                    disableAnimation: true,
                    className: 'ngdialog-theme-default ngdialog-theme-model newTopic'
                }).closePromise.then(function (dialog) {
                    // 当弹出层关闭后，自动更新 维度对象
                    if (angular.isUndefined(dialog.value) || dialog.value == '$document') {
                        return;
                    }

                    var topicName = angular.copy($scope.name);
                    if (topicName != dialog.value.name) { // 名称有改变
                        // 调用更新专题名称接口
                        topicService.updateTopicName({
                            topicName: dialog.value.name,
                            topicId: $scope.topicId
                        }).then(function (response) {
                            if (response.status === 200 && response.data.success) {
                                $scope.name = dialog.value.name;
                            }
                            else {
                                // 更新失败，还原原来的名字
                                dialogService.error(response.data.message);
                                $scope.name = topicName;
                            }
                        });
                    }

                });
            };

            // 计算页面高度
            $scope.winHeight = function () {
                // 初始化调用
                winHeightService.calculate();
                // 浏览器窗口大小改变
                angular.element(window).resize(function () {
                    winHeightService.calculate();
                });
            };
            // 左边展开与收起
            $scope.hideLeft = function () {
                $scope.hideOpen = !$scope.hideOpen;
                $scope.$broadcast('childrenRefresh');
            };

            // 路径展开收起
            $scope.selectShow = function () {
                $scope.routeShow = !$scope.routeShow;
            };

            // 下拉列表点击其他地方收起
            $(window.document).click(function (event) {
                if (!angular.element(event.target).parents('.route-input-show').length
                    && !angular.element(event.target).hasClass('picture-select-down')
                    && $scope.routeShow) {
                    $scope.routeShow = false;
                }

                if (!angular.element(event.target).parents('.tags-push-model-header').length
                    && !angular.element(event.target).hasClass('picture-select-down')
                    && $scope.modelOpen) {
                    $scope.modelOpen = false;
                }

                $scope.$apply();
            });

            // 从自定义首页进入
            if ($scope.moduleId) {
                $scope.queryModuleInfoById();
            }

            $scope.searchDim(1); // 获取全部维度信息
            $scope.getAllModelGroups();
            $scope.winHeight();

            /**
             * 监听页面所属模块
             * @param [data.curPageType ===1]基础分析页;
             * @param [data.curPageType ===2]聚类工具页;
             * @param [data.curPageType ===3]热词分析页;
             * @param [data.curPageType ===4]漏斗工具默认首页;
             * @param [data.curPageType ===5]漏斗工具层次表格页;
             * @param [data.curPageType ===6]漏斗工具详情页;
             */
            $scope.$on('curPageType', function (event, data) {
                $scope.curPageType = data.curPageType;
                // alert($scope.curPageType)
            });
            // 导出数据一个sheet长度限制
            $scope.$on('exportLimitNumber', function (event, data) {
                $scope.exportLimitNumber = data;
                $scope.limitWords = '单次只能导出' + data / 10000 + '万条数据，请重新筛选数据后导出！';
            });

            /**
             * 基础分析数据监听
             * baseCallChartSvg：基础分析折柱图数据监听
             * baseCallImport：baseCallImport
             */
            $scope.$on('baseCallChartSvg', function (event, data) {
                $scope.svgCode = {
                    svgCode: data.svgCode
                };
                // console.log(data.svgCode);
            });
            var timeFormat = function () {
                if ($scope.timesRange.defaultStart.length < 11) {
                    $scope.timesRange.defaultStart = $scope.timesRange.defaultStart + ' 00:00:00';
                    $scope.timesRange.defaultEnd = $scope.timesRange.defaultEnd + ' 23:59:59';
                }

            };
            $scope.$on('baseCallImport', function (event, data) {
                timeFormat();
                $scope.baseCallImportParams = {
                    topicId: $scope.topicId,
                    pathId: $scope.defPathId,
                    inputTime: $scope.timesRange.defaultStart + '至' + $scope.timesRange.defaultEnd,
                    searchDimension: JSON.stringify(data.searchDimension),
                    sortType: data.sortParams.sortType,
                    sortColumn: data.sortParams.sortColumn
                };
                $scope.baseCount = data.totalCount;
            });

            /**
             * 聚类工具数据监听
             * clusterCanvasCode：图表数据监听
             * clusterCallImport: 通话列表相关数据
             * clusterStatus：聚类状态监听
             */
            $scope.$on('clusterCanvasCode', function (event, data) {
                timeFormat();
                $scope.imgCode = {
                    imgCode: data.imgCode,
                    inputTime: $scope.timesRange.defaultStart + '至' + $scope.timesRange.defaultEnd
                };
                $scope.ifCluster = data.clusteringFinished;
                // console.log(data.imgCode)
            });
            $scope.$on('clusterCallImport', function (event, data) {
                $scope.clusterCallImportParams = data.params;
                $scope.clusterCount = data.totalCount;
                // console.log(data)
            });
            $scope.$on('clusterStatus', function (event, data) {
                $scope.clusterStatus = data;
            });

            /**
             * 热词分析数据监听
             * hotWordImportParams:热词分析导出params
             */
            $scope.$on('hotWordImportParams', function (event, data) {
                timeFormat();
                $scope.hotWordImportParams = $.extend({
                    topicId: $scope.topicId,
                    pathId: $scope.defPathId,
                    inputTime: $scope.timesRange.defaultStart + '至' + $scope.timesRange.defaultEnd
                }, data.hotWordImportParams);
            });
            $scope.$on('hotViewStatus', function (event, data) {
                $scope.hotViewStatus = data;
            });
            $scope.$on('hotViewCount', function (event, data) {
                $scope.hotViewCount = data;
            });

            /**
             * 漏斗门模块导出监听
             * funnelCallListParams:监听通话列表参数变化
             * funnelImportCode:监听类图表数据变化
             * funnelTableImportParams:漏斗首页查询列表
             */
            $scope.$on('funnelImportCode', function (event, data) {
                $scope.funnelImportCode = {
                    svgCode: data.svgCode
                };
                // console.log(data.svgCode);
            });
            $scope.$on('funnelTableImportParams', function (event, data) {
                timeFormat();
                $scope.funnelTableImportParams = $.extend({
                    inputTime: $scope.timesRange.defaultStart + '至' + $scope.timesRange.defaultEnd
                }, data.params);
                // console.log(data.params);
            });
            $scope.$on('funnelCallListParams', function (event, data) {
                timeFormat();
                $scope.funnelCallListParams = $.extend(data.params, {
                    inputTime: $scope.timesRange.defaultStart + '至' + $scope.timesRange.defaultEnd
                });
                $scope.funnelListCount = data.totalCount;
                // console.log(data.params);
            });

            /*导出数据路径标签params*/
            // $scope.exportPath($scope.path);

            /**
             * 导出停留页面相应的数据
             * @params
             */
            $scope.importCurPageData = function () {

                /*导出数据路径标签params*/
                $scope.exportPath($scope.path);
                if ($scope.path && $scope.path.isSave || $scope.path === undefined || $scope.path === '') {
                    if ($scope.curPageType === 1) { // 若当前页面为基础分析
                        $scope.baseCallImportParams = $.extend($scope.baseCallImportParams, $scope.svgCode, {
                            pathDim: $scope.pathDim
                        });
                        if ($scope.baseCount < $scope.exportLimitNumber) {
                            onExport('#baseForm', topicService.exportBase());
                        }
                        else {
                            dialogService.alert($scope.limitWords);
                        }
                    }
                    else if ($scope.curPageType === 2) { // 若当前页面为聚类工具
                        $scope.clusterImportParams = $.extend($scope.imgCode, $scope.clusterCallImportParams, {
                            pathDim: $scope.pathDim
                        });
                        // console.log($scope.clusterImportParams);
                        if ($scope.clusterStatus === 1) { // 聚类完成
                            if ($scope.clusterCount < $scope.exportLimitNumber) {
                                onExport('#clusterForm', topicService.exportCluster());
                            }
                            else {
                                dialogService.alert($scope.limitWords);
                            }
                        }
                        else if ($scope.clusterStatus === 0) {
                            dialogService.alert('聚类过程中，请稍候导出！');
                        }
                        else if ($scope.clusterStatus === 2) {
                            dialogService.alert('请开始聚类！');
                        }
                        else if ($scope.clusterStatus === 3) {
                            dialogService.alert('聚类失败，无法导出！');
                        }
                        else if ($scope.clusterStatus === 4) {
                            dialogService.alert('没有数据！');
                        }
                    }
                    else if ($scope.curPageType === 3) { // 若当前页面为热词分析
                        // console.log($scope.hotWordImportParams);
                        if ($scope.hotViewStatus === 3) {
                            if ($scope.hotViewCount < $scope.exportLimitNumber) {
                                $scope.hotWordImportParams = $.extend($scope.hotWordImportParams, {
                                    pathDim: $scope.pathDim
                                });
                                onExport('#hotWordForm', topicService.exportTopicHotWordData());
                            }
                            else {
                                dialogService.alert($scope.limitWords);
                            }
                        }
                        else if ($scope.hotViewStatus === 0) {
                            dialogService.alert('请开始分析热词!');
                        }
                        else if ($scope.hotViewStatus === 1) {
                            dialogService.alert('热词分析过程中，请稍候导出！');
                        }
                        else if ($scope.hotViewStatus === 4) {
                            dialogService.alert('热词分析失败，无法导出数据!');
                        }
                        else if ($scope.hotViewStatus === 5) {
                            dialogService.alert('没有热词数据！');
                        }
                    }
                    else if ($scope.curPageType === 4 || $scope.curPageType === 5) { // 若当前页面为漏斗分析首页
                        $scope.funnelHomeImportParams = $.extend($scope.funnelImportCode, $scope.funnelTableImportParams, {
                            pathDim: $scope.pathDim
                        });
                        onExport('#funnelForm1', topicService.exportFunnel());
                    }
                    else {
                        if ($scope.funnelListCount < $scope.exportLimitNumber) {
                            $scope.funnelCallListParams = $.extend($scope.funnelCallListParams, {
                                pathDim: $scope.pathDim
                            });
                            onExport('#funnelForm2', topicService.exportFunnel());
                        }
                        else {
                            dialogService.alert($scope.limitWords);
                        }
                    }
                }
                else {
                    dialogService.alert('请保存专题路径信息！');
                }

            };
            var onExport = function (el, servive) {
                dialogService.confirmTo('确认要导出信息吗').then(function (value) {
                    if (value) {
                        $(el).attr('action', servive).submit();
                    }

                });
            };

        }
    ]);
});
