/**
 * 本文件中的Controller 实现模型详情页面的 控制器逻辑
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
     *  modelNewAddCtrl本controller 模型 新增的模板
     *  @params:
     *      $rootScope: 全局媒介， 由 angular 自动实例化
     *      $scope: 双向绑定的媒介， 由 angular 自动实例化
     *      $timeout: 定时器
     *      $stateParams: 获取url中的参数
     *      ngDialog: 弹窗插件
     *      $q: angular内置服务
     *      dialogService: 自定义弹窗提示组件
     *      modelService:   自定义后台接口服务
     *      winHeightService:   自定义页面高度调整服务
     *      baseService:    自定义基础服务
     *      silenceService:     自定义静音规则验证服务
     *      modelConstant:  自定义模型常量
     *      CONSTANT:   自定义基础常量
     */
    app.controller('modelNewAddCtrl', [
        '$rootScope',
        '$scope',
        '$timeout',
        '$stateParams',
        'ngDialog',
        '$q',
        'dialogService',
        'modelService',
        'winHeightService',
        'baseService',
        'silenceService',
        'modelConstant',
        'CONSTANT',
        // 石勇 新增
        'dimensionService',
        'commonFilterService', function ($rootScope, $scope, $timeout, $stateParams, ngDialog, $q, dialogService, modelService, winHeightService, baseService, silenceService, modelConstant, CONSTANT, dimensionService, commonFilterService) {
            // 初始化权限操作
            $scope.offlineAuth = false; // 是否有下线权限
            $scope.onlineAuth = false; // 是否有上线权限
            $scope.saveAuth = false; // 是否有保存权限
            $scope.returnAuth = false; // 是否有返回权限
            $scope.editAuth = false; // 是否有编辑模型信息权限
            $scope.previewAuth = false; // 是否有预览权限
            $scope.assignDimension = false; // 是否有分配维度权限
            $scope.searchAuth = false; // 是否有搜索权限
            $scope.b = {};
            $scope.a = {};

            // 初始化模型条件展开
            $scope.open = true;
            // 初始化模型状态
            $scope.status = modelConstant.MODEL_STATUS.OPTIMIZING;
            // 是否显示静音规则
            $scope.preIsHavaSilent = false;
            // 条件接收参数
            $scope.preDimensions = [];
            // 获取最近一周时间
            $scope.timesRange = baseService.getSystemTime || {};
            $scope.timesRange.isToNow = false;

            // 初始化参数
            $scope.previewReuslt = {
                total: 0,
                mark: 0
            };

            // 展示预览的片段
            $scope.previewFrags = [];

            // 接受定时器返回promise
            var timer;
            // 当离开这个页面的时候将定时器清空
            $scope.$on('$destroy', function () {
                ngDialog.closeAll();
                if (timer) {
                    $timeout.cancel(timer);
                }

            });

            // 模型对象
            $scope.model = {
                condition: $scope.preDimensions, // 石勇 增加传参
                modelId: Number($stateParams.id),
                pageType: 0,
                modelFragmentRelation: {
                    ruleType: 2
                },
                modelTextFragment: {
                },
                modelFragments: [],
                modelGroupId: Number($stateParams.group),
                modelAccuracy: 0,
                channel: 2,
                modelName: $stateParams.name,
                modelComment: $stateParams.remark,
                silenceRule: [],
                silenceText: '',
                choose: false
            };

            // 初始化静音规则参数
            $scope.silenceScreen = {
                mentId: Math.floor(Math.random() * 1000) + 1000,
                condition: []
            };

            $scope.showTab = 0; // 0表示全部，-1表示搜索，其他至其他
            $scope.isSearch = false;
            $scope.isSearchShow = false;

            // 如果模型id不为空，获取该模型相关信息
            $scope.modelFilterId = 0;
            // 新增 获取所有的筛选器id
            commonFilterService.queryAllFilter().then(function (filterResult) {
                $scope.filterTemp = filterResult.value.value;
            });

            if ($scope.model.modelId != -1) {

                modelService.getModel($stateParams.id).then(function (result) {

                    // 转化模型数据
                    $scope.model.modelId = result.value.modelId;
                    $scope.model.modelName = result.value.modelName;
                    $scope.model.modelComment = result.value.modelComment;
                    $scope.model.pageType = 0;
                    $scope.model.groupId = result.value.groupId;
                    $scope.model.modelGroupId = result.value.groupId;
                    $scope.model.modelFragmentRelation = result.value.modelFragmentRelation;
                    $scope.model.modelFragments = result.value.modelFragments || [];
                    $scope.model.channel = result.value.channel;
                    $scope.model.modelAccuracy = result.value.modelAccuracy || 0;

                    // 石勇 新增 判断该筛选器是否被删除
                    $scope.modelFilterId = result.value.filterId;
                    var filterIndex = 0;
                    angular.forEach($scope.filterTemp, function (item) {
                        if ($scope.modelFilterId == item.filterId) {
                            filterIndex = 1;
                        }

                    });
                    if (filterIndex != 1) {
                        $scope.modelFilterId = 0;
                    }

                    // 进入模型详情时取该模型筛选器id
                    $scope.a.id = $scope.modelFilterId;

                    // 获取是否是顺序模式
                    modelService.isOrderModel({
                        modelId: $scope.model.modelId
                    }).then(function (result) {
                        if (result.data.value == '1') {
                            $scope.model.choose = true;
                        }

                    });

                    // 石勇 维度问题
                    // $scope.preDimensions = [];
                    var temp = [];
                    modelService.queryCondition({
                        modelId: $scope.model.modelId
                    }).then(function (modelresult) {
                        if (modelresult.data.value.filter_rule == null) {
                            $scope.preDimensions = [];
                        }
                        else {
                            var temp = modelresult.data.value.filter_rule;
                            $scope.preDimensions = modelresult.data.value.filter_rule;
                        }

                        angular.forEach(temp, function (tempItem) {
                            angular.forEach($scope.preDimensions, function (item) {
                                if (tempItem.key == item.key) {
                                    if (item.exclude) {
                                        item.inputValue = '!(' + tempItem.value.toString() + ')';
                                    }
                                    else {
                                        item.inputValue = tempItem.value.toString();
                                    }
                                }

                            });
                        });
                        // 石勇 新增 删除显示的时间维度
                        angular.forEach($scope.preDimensions, function (item, index) {
                            if (item.key == 'timestamp') {
                                $scope.preDimensions.splice(index, 1);
                            }

                        });
                        // console.log($scope.preDimensions);

                        $scope.groupName = result.value.groupName;
                        $scope.silenceScreen = result.value.silenceText ? eval('(' + result.value.silenceText + ')') : $scope.silenceScreen;
                        // 初始化 新增页面 需要的参数
                        modelService.getPreviewId().then(function (result) {
                            // 初始化 previewId;
                            $scope.model.previewId = result.value;
                        });
                        $scope.getModelStatus();

                    });
                });
            }
            else {
                // 初始化 新增页面 需要的参数
                modelService.getPreviewId().then(function (result) {
                    // 初始化 previewId;
                    $scope.model.previewId = result.value;
                });

                // 获取所有模型组
                modelService.allModelGroups().then(function (result) {
                    $scope.modelGroup = result.data.value || [];
                    angular.forEach($scope.modelGroup, function (item) {
                        if ($scope.model.modelGroupId === item.groupId) {
                            $scope.groupName = item.groupName;
                        }

                    });
                });
            }

            /**
             *  隐藏搜索
             *  @params: None
             */
            $scope.hideSearch = function () {
                $scope.isSearch = false;
                $scope.isSearchShow = false;
                $scope.isSearchShowTab = false;
                $scope.showTab = 0;
                $scope.calculateWidth();
            };

            /**
             *  显示搜索
             *  @params: None
             */
            $scope.showSearch = function () {
                $scope.isSearch = true;
                $scope.calculateWidth();
            };

            /**
             *  左边展开与收起
             *  @params: None
             */
            $scope.hideLeft = function () {
                $scope.hideOpen = !$scope.hideOpen;
            };

            /**
             *  添加条件
             *  @params: None
             */
            $scope.addCondition = function () {
                ngDialog.open({
                    template: 'analysis/detail/dimension-libs-directive.htm',
                    controller: 'dimensionLibsCtrl',
                    scope: $scope,
                    showClose: false,
                    closeByEscape: false,
                    closeByDocument: false,
                    disableAnimation: true,
                    className: 'ngdialog-theme-default ngdialog-theme-model-push'
                }).closePromise.then(function (dialog) {
                    // 当弹出层关闭后，自动更新 维度对象
                    if (angular.isUndefined(dialog.value) || dialog.value == '$document') {
                        return;
                    }

                    angular.forEach(dialog.value.pushDim, function (item) {
                        // 判断当前维度是否存在已经选择的维度数组中
                        var index = $rootScope.myInArray($scope.preDimensions, 'key', item.key);
                        if (index > -1) { // 若存在
                            item.inputValue = $scope.preDimensions[index].inputValue;
                            item.defaultValue = $scope.preDimensions[index].defaultValue;
                            if (item.type === 'mulEqu' || item.type === 'range') {
                                item.value = $scope.preDimensions[index].value;
                            }

                            return;
                        }

                    });
                    $scope.preDimensions = dialog.value.pushDim;

                    $timeout(function () {
                        $scope.dimensionHeight();
                        $scope.winHeight();
                    }, 500);
                });
            };

            /**
             *  设置维度容器的高度
             *  @params: None
             */
            $scope.dimensionHeight = function () {
                var ulHeight = angular.element('.condition-wrapper').height();
                if (ulHeight > 400) {
                    angular.element('.condition-wrapper').addClass('scroll');
                }
                else {
                    angular.element('.condition-wrapper').removeClass('scroll');
                }
            };

            /**
             *  上面模型维度条件的展开与收起
             *  @params: None
             */
            $scope.showOpen = function () {
                $scope.open = !$scope.open;
                $scope.winHeight();
            };

            /**
             *  模型详情弹窗
             *  @params: None
             */
            $scope.modelDetail = function () {
                ngDialog.open({
                    template: 'model/model-detail-directive.htm',
                    controller: 'modelDetailCtrl',
                    scope: $scope,
                    showClose: false,
                    closeByEscape: false,
                    closeByDocument: false,
                    disableAnimation: true,
                    className: 'ngdialog-theme-default ngdialog-theme-dialog'
                }).closePromise.then(function (dialog) {
                    // 当弹出层关闭后，自动更新 维度对象
                    if (angular.isUndefined(dialog.value) || dialog.value == '$document') {
                        return;
                    }

                    $scope.model.modelName = dialog.value.name ? dialog.value.name : $scope.model.modelName;
                    $scope.model.modelGroupId = dialog.value.group ? dialog.value.group : $scope.model.modelGroupId;
                    $scope.model.modelComment = dialog.value.remark ? dialog.value.remark : $scope.model.modelComment;
                    $scope.groupName = dialog.value.groupName ? dialog.value.groupName : $scope.groupName;
                });
            };

            /**
             *  模型预览
             *  @params: None
             */
            $scope.$on('get-isTab', function (event, data) {
                $scope.isTabTemp = data.isTab;
            });
            $scope.preview = function () {
                if (!$scope.validatefragmentContent()) {
                    return;
                }

                if (!$scope.model.choose && $scope.isTabTemp == 0 && ($scope.model.modelFragmentRelation.fragmentContent == undefined || $scope.model.modelFragmentRelation.fragmentContent == '')) {
                    dialogService.alert('请输入规则组合！');
                    return false;
                }

                $scope.showTab = 0;
                $scope.$broadcast('preview', {
                    type: 'model'
                });
            };

            /**
             *  搜索enter键
             *  @params: event 事件
             */
            $scope.enterKey = function (event) {
                event = event || window.event;
                if (event.keyCode == 13) {
                    $scope.searchBeforeResult();
                }

            };

            /**
             *  搜索
             *  @params: None
             */
            $scope.searchBeforeResult = function () {
                if (!baseService.validWord()) {
                    return;
                }

                $scope.isSearch = true;
                $scope.showTab = -1;
                $scope.isSearchShow = true;
                $scope.isSearchShowTab = true;
                $scope.$broadcast('searchResult', {
                    keyword: $scope.searchKeyword
                });
            };

            /**
             *  切换tab
             *  @params: index 切换的tab标识
             */
            $scope.showPreivewResult = function (index) {
                $scope.isSearchShow = index === -1 ? true : false;
                if (index === -1) {
                    $scope.searchBeforeResult();
                }
                else {
                    $scope.showTab = index;
                }
                $scope.calculateWidth();
            };

            /**
             *  保存整个模型
             *  @params: None
             */
            $scope.addModel = function () {
                if (!$scope.validateModel()) {
                    return;
                }

                // console.log($scope.packModelParam('save').condition.length)
                modelService.addCondition($scope.packModelParam('save')).then(function (result) {
                    $scope.model.modelId = result.value || -1;
                    dialogService.success(modelConstant.MODEL_SUCCESS);
                    $timeout(function () {
                        ngDialog.close('successDialog');
                    }, 500);
                });

            };

            /**
             *  移除片段
             *  @params:
             *      item: 移除片段的对象
             */
            $scope.removePrewViewFrag = function (item) {
                var index = $rootScope.myInArray($scope.previewFrags, 'fragmentId', item.fragmentId);
                if (index === -1) {
                    return;
                }

                $scope.previewFrags.splice(index, 1);
                $scope.showTab = index === 0 ? 0 : $scope.previewFrags[index - 1].fragmentNum;
                $scope.calculateWidth();
            };
            // 石勇 移除所有的片段
            $scope.removeAllPrewViewFrag = function () {
                $scope.previewFrags = [];
                $scope.$apply();
            };

            /**
             *  片段预览
             *  @params:
             *      id: 需要片段预览的id
             */
            $scope.fragmentPreview = function (id) {
                $scope.isSearchShow = false;
                var exitsTab = false;
                $.each($scope.previewFrags, function (index, item) {
                    if (item.fragmentId == id) {
                        $scope.$broadcast('preview', {
                            type: 'fragment',
                            data: id
                        });
                        exitsTab = true;
                        $scope.showTab = item.fragmentNum;
                        return false;
                    }

                });
                if (!exitsTab && $scope.validateTime()) {
                    $.each($scope.model.modelFragments, function (index, item) {
                        if (item.fragmentId == id) {
                            if ($scope.previewFrags.length < 8) {
                                $scope.previewFrags.push(item);
                                $scope.showTab = item.fragmentNum;
                                $scope.calculateWidth();
                            }
                            else {
                                dialogService.alert(modelConstant.MODEL_TAB_LENGTH);
                            }
                            return false;
                        }

                    });
                }

            };

            /**
             *  验证模型信息
             *  @params: None
             */
            $scope.validateModel = function () {
                if (!$scope.model.modelName) {
                    dialogService.alert(modelConstant.MODEL_NAME_EMPTY);
                    return false;
                }

                if ($scope.model.modelName.replace(/[^\x00-\xff]/g, 'xx').length > 100) {
                    dialogService.alert(modelConstant.MODEL_NAME_LENGTH);
                    return false;
                }

                if (CONSTANT.textReplace.test($scope.model.modelName)) {
                    dialogService.alert(modelConstant.MODEL_NAME_UNVALID);
                    return false;
                }

                if (!$scope.model.modelGroupId) {
                    dialogService.alert(modelConstant.MODEL_GROUP_EMPTY);
                    return false;
                }

                if (!$scope.preOperateSilenceContent()) {
                    return false;
                }

                if ($scope.preIsHavaSilent
                    || (!$scope.preIsHavaSilent
                    && !$scope.silenceScreen.condition.length)) {
                    if ($scope.model.pageType === 0
                        && $scope.model.modelFragmentRelation
                        && !$scope.model.modelFragmentRelation.fragmentContent) {
                        dialogService.alert(modelConstant.MODEL_FTAMENT_EMPTY);
                        return false;
                    }
                }

                if (!$scope.validatefragmentContent()) {
                    return false;
                }

                return true;
            };

            /**
             *  验证组合规则
             *  @params: None
             */
            $scope.validatefragmentContent = function () {
                $scope.indexTemp = [];
                if ($scope.model.choose) {
                    angular.forEach($scope.model.modelFragments, function (data, index) {
                        $scope.indexTemp.push(data.fragmentNum);
                    });
                    $scope.model.modelFragmentRelation.fragmentContent = $scope.indexTemp.join('@');
                }
                else if ($scope.model.modelFragmentRelation && $scope.model.modelFragmentRelation.fragmentContent) {
                    var fragmentContent = $scope.model.modelFragmentRelation.fragmentContent.replace(/\（/g, '\(').replace(/\）/g, '\)');
                    $scope.model.modelFragmentRelation.fragmentContent = fragmentContent;
                    // 石勇 修改 修改验证组合规则
                    if (/[^\,\:\&\|\(\)\!+a-z0-9]/igm.test($scope.model.modelFragmentRelation.fragmentContent)) {
                        dialogService.alert(modelConstant.MODEL_FTAMENT_VALID);
                        return false;
                    }
                }

                return true;
            };

            /**
             *  验证时间与维度
             *  @params: None
             */
            $scope.validateTime = function () {
                $scope.comitDimension = angular.copy($scope.preDimensions);
                $scope.valueDim = [];
                angular.forEach($scope.comitDimension, function (item) {
                    if (item.inputValue) {
                        $scope.valueDim.push(item);
                    }

                });
                $.each($scope.valueDim, function (key, item) {
                    try {
                        if (item.value.length) {
                            delete item.defaultValue;
                            delete item.checked;
                            delete item.$$hashKey;
                            $scope.item.push(JSON.stringify(item));
                        }

                    }
                    catch (e) {}
                });

                return true;
            };

            /**
             *  预处理模型参数
             *  @params: None
             */
            $scope.packModelParam = function (type) {
                if (!$scope.preOperateSilenceContent()) {
                    return;
                }

                // 石勇 新增
                // 当维度未进行选择时，点击保存，未选择的维度全部删除，只展示选择的维度
                for (var i = 0; i < $scope.preDimensions.length; i++) {
                    if (angular.isUndefined($scope.preDimensions[i].inputValue)) {
                        $scope.preDimensions.splice(i, 1);
                        i--;
                    }

                }
                // console.log($scope.preDimensions);
                // 石勇 新增
                $scope.condition = [];
                angular.forEach($scope.preDimensions, function (e) {
                    $scope.condition.push({
                        name: e.name,
                        key: e.key,
                        value: e.value,
                        type: e.type,
                        dataType: e.dataType,
                        exclude: e.exclude
                    });

                });

                /*石勇 新增 增加默认传值*/
                if ($scope.timesRange.defaultStart.length < 11) {
                    $scope.timesRange.defaultStart = $scope.timesRange.defaultStart + ' 00:00:00';
                    $scope.timesRange.defaultEnd = $scope.timesRange.defaultEnd + ' 23:59:59';
                }

                // 
                // 石勇 新增 多传一个时间标记
                $scope.condition.push({
                    name: '时间',
                    key: 'timestamp',
                    type: 'timeRange',
                    value: [$scope.timesRange.defaultStart, $scope.timesRange.defaultEnd],
                    dataType: 'long',
                    uptonow: 0
                });
                // 
                $scope.model.condition = JSON.stringify($scope.condition);
                // 

                // 增加筛选器传参
                $scope.model.filterRuleId = $scope.a.id;
                // $scope.model.filter = JSON.stringify($scope.b);

                var model = angular.copy($scope.model);
                var aftterFragmentContent = $scope.model.modelFragmentRelation ? angular.copy($scope.model.modelFragmentRelation.fragmentContent) : '';
                if (!aftterFragmentContent) {
                    try {
                        delete $scope.model.modelFragmentRelation.fragmentContent;
                    }
                    catch (e) {}
                }

                model.modelFragmentRelation = JSON.stringify($scope.model.modelFragmentRelation);
                model.modelFragments = [];
                angular.forEach($scope.model.modelFragments, function (item) {
                    model.modelFragments.push({
                        fragmentContent: item.isTag === 0 ? item.fragmentContent : '#',
                        ruleType: item.ruleType,
                        fragmentNum: item.fragmentNum,
                        fragmentId: item.fragmentId,
                        channel: Number(item.channel),
                        remark: item.remark,
                        isTag: item.isTag,
                        tagContent: item.tagContent ? JSON.parse(item.tagContent) : '[]', // 传的参数修改为json格式
                        tagText: item.tagText,
                        tagVersion: item.fragmentContent
                    });
                });
                model.modelFragments = JSON.stringify(model.modelFragments);
                // model.silenceRule = JSON.stringify(model.silenceRule);
                if (!type) {
                    return model;
                }

                // 做下面的处理是因为邹站站的保存接口的参数名称写错了
                var modelSave = angular.copy(model);
                modelSave.priviewId = modelSave.previewId;
                return modelSave;
            };

            $scope.$on('importRule', function (event, data) {
                $scope.silenceScreen = data;
                $scope.preOperateSilenceContent();
            });

            /**
             *  预处理静音规则
             *  @params: None
             */
            $scope.preOperateSilenceContent = function () {
                if (!$scope.preIsHavaSilent) { // 支持按字
                    var screenings = [];
                    var isErroe = silenceService.combinationRule($scope.silenceScreen.condition, 'zi');

                    if (isErroe) {
                        return false;
                    }

                    // 组合展示规则与tagContent
                    $.each($scope.silenceScreen.condition, function (sky, screen) {
                        var condition = {};
                        condition.dimensionCode = screen.dimensionCode;
                        condition.id = screen.id;
                        condition.value = [];
                        $.each(screen.options, function (key, option) {
                            var copition = {
                                propertyCode: option.propertyCode,
                                relativeobject: option.isDepend === 1 ? option.relativeobject : '',
                                operationCode: option.flag === 0 ? option.operationCode : option.equOperationCode,
                                value: option.flag === 0 ? option.inputValue : option.operationCode
                            };
                            condition.value.push(copition);
                        });
                        screenings.push(condition);
                    });
                    $scope.model.silenceText = '';
                    $scope.model.silenceRule = JSON.stringify(screenings);
                    if ($scope.silenceScreen.condition.length) {
                        var tagText = angular.copy($scope.silenceScreen);
                        angular.forEach(tagText.condition, function (condition) {
                            try {
                                delete condition.isShow;
                            }
                            catch (e) {}
                            angular.forEach(condition.options, function (option) {
                                try {
                                    delete option.isPropertyShow;
                                    delete option.isDependShow;
                                    delete option.isEquShow;
                                    delete option.isOperationShow;
                                }
                                catch (e) {}
                            });
                        });
                        $scope.model.silenceText = JSON.stringify(tagText);
                    }
                }

                return true;
            };
            // $scope.$on('preview',function(event){
            //     alert(11)
            // })

            /**
             *  预处理模型维度
             *  @params: None
             */
            $scope.packModelDimension = function () {

                /*石勇 新增 增加默认传值*/
                if ($scope.timesRange.defaultStart.length < 11) {
                    $scope.timesRange.defaultStart = $scope.timesRange.defaultStart + ' 00:00:00';
                    $scope.timesRange.defaultEnd = $scope.timesRange.defaultEnd + ' 23:59:59';
                }

                // 
                var screening = {
                    name: '时间',
                    key: 'timestamp',
                    type: 'timeRange',
                    value: [$scope.timesRange.defaultStart, $scope.timesRange.defaultEnd],
                    dataType: 'long'
                };
                var screenings = [];
                if (!angular.isUndefined($scope.valueDim)) {
                    screenings = angular.copy($scope.valueDim);
                }

                angular.forEach(screenings, function (item) {
                    if (typeof item.inputValue != 'undefined') {
                        if (item.inputValue) {
                            if (item.inputValue.indexOf('!(') > -1) {
                                item.value = item.inputValue.replace(/\!\(/g, '').replace(/\)/g, '').split(',');
                            }
                            else {
                                item.value = item.inputValue.split(',');
                            }
                        }

                        try {
                            delete item.inputValue;
                        }
                        catch (e) {}
                    }

                });
                if (screening.value.length) {
                    screenings.push(screening);
                }

                return screenings;
            };

            /**
             *  计算tabs宽度
             *  @params: None
             */
            $scope.calculateWidth = function () {
                // 单个对象宽度
                $timeout(function () {
                    var winWidth = angular.element('.model-content-result .data-outer-header').width(), // 是文档头部宽度
                        rightWidth = angular.element('.model-content-result .tabs-right').width(), // 右边宽度
                        itemHeight = 70;
                    var num = $scope.previewFrags.length;
                    if ($scope.isSearch) {
                        num = num + 3;
                    }
                    else {
                        num = num + 2;
                    }
                    var releWidth = Math.floor((winWidth - rightWidth) / num);
                    if (itemHeight > releWidth) {
                        angular.element('.model-content-result .analyse-tab').width(releWidth - 10);
                    }

                }, 1000);

            };

            /**
             *  计算页面高度
             *  @params: None
             */
            $scope.winHeight = function () {
                // 初始化调用
                winHeightService.calculate();
                // 浏览器窗口大小改变
                angular.element(window).resize(function () {
                    winHeightService.calculate();
                });
            };

            /**
             *  模型上线弹窗
             *  @params: None
             */
            // 用来展示模型上线弹窗的左侧维度标签
            $scope.$on('give-dim', function (e, d) {
                $scope.$broadcast('get-dim', d);
            });
            // 用来判断维度标签是否禁用
            $scope.$on('give-onOpen', function (e, d) {
                $scope.$broadcast('get-onOpen', d);
            });
            $scope.onlineModel = function () {
                $scope.onlineType = 'add';
                if (!$scope.validateModel()) {
                    return;
                }

                modelService.addCondition($scope.packModelParam('save')).then(function (modelresult) {
                    $scope.modelTemp = modelresult.value;
                    // 石勇 新增 模型上线是否引用筛选条件
                    modelService.queryCondition({
                        modelId: $scope.model.modelId
                    }).then(function (result) {
                        if (result.data.value.hascdt == '1') {
                            // 石勇 新增 弹窗显示
                            dialogService.confirmTo('是否引用筛选条件').then(function (value) {
                                if (value) {
                                    var params = {};
                                    params = {
                                        modelId: $scope.model.modelId,
                                        modelName: $scope.model.modelName,
                                        condition: JSON.stringify(result.data.value.filter_rule),
                                        isPass: 1
                                    };
                                    modelService.onlineModel(params)
                                        .then(function (response) {
                                            if (response.status === 200 && response.data.success) {
                                                dialogService.success('模型提交成功！');
                                                if ($scope.onlineType === 'add') {
                                                    $timeout(function () {
                                                        window.location.href = '#/model/' + $scope.model.modelGroupId + '/list';
                                                    }, 3000);
                                                }
                                                else {
                                                    $timeout(function () {
                                                        ngDialog.close('successDialog');
                                                    }, 1000);
                                                    // $scope.closeThisDialog(1);
                                                }
                                            }
                                            else {
                                                dialogService.error(response.data.message);
                                                $timeout(function () {
                                                    ngDialog.close('errorDialog');
                                                }, 1000);
                                                // return;
                                            }
                                        });
                                }
                                else {
                                    $scope.modelInsideOnline();
                                }
                            });
                        }
                        else {
                            $scope.modelInsideOnline();
                        }
                    });
                });

            };

            $scope.modelInsideOnline = function () {

                // 石勇 新增 获取是否开启禁用维度
                modelService.fetchOnSwitch().then(function (result) {
                    $scope.$broadcast('give-onOpen', result.data.value.onOpen);
                });
                // 石勇 新增 展示维度
                dimensionService.searchDim()
                    .then(function (result) {
                        $scope.systenDim = result.value || [];

                        // 石勇 新增 按任务分析，去除维度流水号，按录音分析去除任务号
                        // $rootScope.isTask ,值为1，按任务，值为0 按录音
                        if ($rootScope.isTask) {
                            angular.forEach($scope.systenDim, function (item, index) {
                                if (item.key == 'voiceId') {
                                    $scope.systenDim.splice(index, 1);
                                }

                            });
                        }
                        else {
                            angular.forEach($scope.systenDim, function (item, index) {
                                if (item.key == 'taskId') {
                                    $scope.systenDim.splice(index, 1);
                                }

                            });
                        }
                        // 

                        $scope.$emit('give-dim', $scope.systenDim);
                    });

                $scope.model.modelId = $scope.modelTemp;
                ngDialog.open({
                    template: 'model/online.htm',
                    controller: 'onlineModelCtrl',
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

                    $scope.status = modelConstant.MODEL_STATUS.ONLING;
                    $scope.getModelStatus();
                });
            };

            /**
             *  获取模型状态
             *  @params: None
             */
            $scope.getModelStatus = function () {
                modelService.getModelStatus({
                    modelId: $scope.model.modelId
                })
                    .then(function (result) {
                        $scope.status = result.value && result.value.modelStatus ? result.value.modelStatus : 0;

                        // 石勇 新增 样式显示问题
                        var position = 'relative';
                        if ($scope.status == -1 || $scope.status == 0) {
                            $scope.position = {
                                position: position
                            };
                        }
                        else {
                            $scope.position = {};
                        }
                        // 

                        $scope.errorReason = result.value && result.value.errorReason ? result.value.errorReason : modelConstant.MODEL_ONLINE_ERROR;
                        if ($scope.status != modelConstant.MODEL_STATUS.ONLING) { // 不是上线中状态
                            if ($scope.status === modelConstant.MODEL_STATUS.FAILURE) {
                                // dialogService.error("模型上线出错：" + $scope.errorReason + "，请重新上线");
                                // $timeout(function(){
                                //     ngDialog.close("errorDialog");
                                // },3000);
                            }

                            return $q.reject(false);
                        }

                        return true;
                    }).then(function () {
                    timer = $timeout($scope.getModelStatus, 10000);
                });
            };

            /**
             *  下线按钮
             *  @params: None
             */
            $scope.offlineModel = function () {
                modelService.offlineModel({
                    modelIds: $scope.model.modelId
                })
                    .then(function (result) {
                        $scope.status = modelConstant.OPTIMIZING;
                        $scope.getModelStatus();
                    });
            };

            /**
             *  返回按钮
             *  @params: None
             */
            $scope.retBack = function () {
                if ($scope.model.modelId === -1) {
                    dialogService.confirm(modelConstant.MODEL_BACK_TIP).then(function () {
                        window.location.href = '#/model/' + $scope.model.modelGroupId + '/list';
                    });
                }
                else {
                    window.location.href = '#/model/' + $scope.model.modelGroupId + '/list';
                }
            };

            /**
             *  删除条件
             *  @params:
             *      index: 删除对象的位置
             */
            $scope.removeCondition = function (index) {
                $scope.preDimensions.splice(index, 1);
            };

            /**
             *  功能权限
             *  @params:
             *      None
             */
            $scope.$watch('$parent.resources', function (newValue, oldValue) {
                if (!newValue) {
                    return;
                }

                angular.forEach(newValue, function (resource) {
                    if (resource.link === modelConstant.MODEL_LINK) { // 模型
                        $scope.optAciton = resource.optAction || [];
                        // 支持模型保存
                        if ($.inArray(modelConstant.MODEL_SAVE, $scope.optAciton) > -1) {
                            $scope.saveAuth = true;
                        }

                        // 支持模型上线
                        if ($.inArray(modelConstant.MODEL_ONLINE, $scope.optAciton) > -1) {
                            $scope.onlineAuth = true;
                        }

                        // 支持模型下线
                        if ($.inArray(modelConstant.MODEL_OFFLINE, $scope.optAciton) > -1) {
                            $scope.offlineAuth = true;
                        }

                        // 支持模型返回
                        if ($.inArray(modelConstant.MODEL_RETURN, $scope.optAciton) > -1) {
                            $scope.returnAuth = true;
                        }

                        // 支持模型修改
                        if ($.inArray(modelConstant.MODEL_UPDATE, $scope.optAciton) > -1) {
                            $scope.editAuth = true;
                        }

                        // 支持模型预览
                        if ($.inArray(modelConstant.MODEL_PREVIEW, $scope.optAciton) > -1) {
                            $scope.previewAuth = true;
                        }

                        // 支持模型搜索
                        if ($.inArray(modelConstant.MODEL_SEARCH, $scope.optAciton) > -1) {
                            $scope.searchAuth = true;
                        }

                        // 支持条件分配
                        if ($.inArray(modelConstant.MODEL_ASSIGN, $scope.optAciton) > -1) {
                            $scope.assignDimensionAuth = true;
                        }

                        return;
                    }

                });
            });

            // 石勇 新增 点击已上线或正在上线的模型的筛选条件遮罩层会弹出窗口进行提示
            $scope.dimensionTips = function () {
                dialogService.error('已上线或处于上线中的模型不能操作筛选条件');
            };

            $scope.winHeight();
            baseService.fixTitle();
        }
    ]);
});
