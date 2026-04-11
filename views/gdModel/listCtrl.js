/**
 * 本文件中的Controller 实现模型页面的 控制器逻辑
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
     * 本controller 模型 列表区域的模板
     *  @params:
     *      $scope: 双向绑定的媒介， 由 angular 自动实例化
     *      $stateParams: 获取路径中传递的参数
     *      $timeout: 定时器
     *      ngDialog: angularjs的弹窗插件，定义弹窗
     *      $q: angularjs中的服务
     *      $document: angularjs获取元素对象的document
     *      dialogService: 自定义的弹窗提示服务
     *      winHeightService: 自定义的高度调整的服务
     *      modelService: 模型与后台交互的接口服务
     *      baseService: 自定义公共服务接口
     *      modelConstant: 模型定义的常量服务
     *      CONSTANT: 系统常量
     */
    app.controller('gdModelListCtrl', [
        '$scope',
        '$stateParams',
        '$timeout',
        'ngDialog',
        '$q',
        '$document',
        'dialogService',
        'winHeightService',
        'gdModelService',
        'baseService',
        'gdModelConstant',
        'CONSTANT',
        // 石勇 新增
        'dimensionService',
        '$rootScope', function ($scope, $stateParams, $timeout, ngDialog, $q, $document, dialogService, winHeightService, gdModelService, baseService, gdModelConstant, CONSTANT, dimensionService, $rootScope) {
            // ie8下实现placeholder的兼容
            $document.find('input').placeholder();

            $scope.addModelAuth = false; // 是否有新增模型权限
            $scope.exportModelAuth = false; // 是否有导出模型权限
            $scope.offlineAuth = false; // 是否有下线权限
            $scope.delModelAuth = false; // 是否有删除权限
            $scope.onlineAuth = false; // 是否有上线权限
            $scope.setUpAuth = false; // 是否有置顶权限
            $scope.callListAuth = false; // 是否有查看通话列表权限

            $scope.groupAddAuth = false; // 是否有组新增权限
            $scope.groupDelAuth = false; // 是否有组删除权限
            $scope.groupEditAuth = false; // 是否有组编辑权限

            /**
             *  分页的的相关参数
             *  默认由directive 去控制，
             *  如果传入则使用controller 数据
             *  @params:
             *      pageSize: 15,
             *      pageNum: 1
             */
            $scope.pageOptions = {
                pageNum: 1,
                pageSize: 15
            };

            // 接收路径传参
            $scope.groupId = Number($stateParams.group);

            // 石勇 新增 默认排序参数
            $scope.orderColumn = 'updateTime';
            $scope.orderType = 'desc'; // 默认按照最后编辑时间进行降序排序
            $scope.btnDown = 'updateTime'; // 默认显示最后编辑时间的向下箭头颜色
            // 用来展示模型上线弹窗的左侧维度标签
            $scope.$on('give-dim', function (e, d) {
                $scope.$broadcast('get-dim', d);
            });
            // 用来判断维度标签是否禁用
            $scope.$on('give-onOpen', function (e, d) {
                $scope.$broadcast('get-onOpen', d);
            });

            // 

            /**
             *  获取该模型组下的所有模型
             *  @params:
             *      params: 传参
             */
            // 石勇 新增 上线数据范围鼠标放上去显示起止时间和维度
            $scope.dim = [];
            $scope.findModels = function (params) {
                params = $.extend(params, $scope.pageOptions, {
                    modelGroupId: -1,
                    modelName: $scope.keyword,
                    type: 'all',
                    // 石勇 新增 模型页面排序
                    orderColumn: $scope.orderColumn,
                    orderType: $scope.orderType
                });
                return gdModelService.findModels(params)
                    .then(function (result) {
                        $scope.allchecked = false;
                        $scope.models = result.value.rows || [];
                        $scope.counts = result.value.totalRows || 0;
                        angular.forEach($scope.models, function (item) {
                            // 石勇 新增 上线数据范围鼠标放上去显示起止时间和维度
                            $scope.dim = angular.fromJson(item.screeningRule);
                            if (item.screeningRule) {
                                angular.forEach(item.screeningRule, function (i, index) {
                                    if (i.type == 'timeRange') {
                                        // console.log(i.value[0])
                                        item.releasetime = i.value[0];
                                        // 石勇 新增 显示上线数据范围
                                        item.releasetimes = i.value[1];
                                        if (item.releasetimes) {
                                            item.releasetimes = item.releasetime + '~' + item.releasetimes;
                                        }
                                        else if (item.releasetimes == '') {
                                            item.releasetimes = item.releasetime + '~至今';
                                        }
                                    }

                                });
                            }

                            // 石勇 新增 上线数据范围鼠标放上去显示起止时间和维度
                            if ($scope.dim) {
                                for (var i = 0; i < $scope.dim.length; i++) {
                                    if ($scope.dim[i].key === 'timestamp') {
                                        $scope.dim.splice(i, 1);
                                    }

                                }
                            }

                            item = $.extend(item, {
                                dim: $scope.dim
                            });
                        });
                        if ($scope.models.length > 0) {
                            return $q.reject(false);
                        }

                        if ($scope.pageOptions.pageNum === 1 && result.value.totalRows === 0) {
                            return $q.reject(false);
                        }

                        return true;
                    }).then(function () {
                    // 如果当前页不是第一页且没有数据继续向前一页搜索
                    $scope.pageOptions.pageNum = $scope.pageOptions.pageNum - 1;
                    if ($scope.pageOptions.pageNum > 0) {
                        $scope.findModels();
                    }

                });
            };

            /**
             *  删除模型
             *  @params:
             *      id: 需要删除模型的id
             */
            $scope.modelDelete = function (id, modelName) {
                gdModelService.deleteModel({modelIds: id, modelName: modelName})
                    .then(function (result) {
                        $scope.findModels();
                    });
            };

            /**
             *  批量操作
             *  @params:
             *      type: 标识是下线还是删除
             */
            $scope.batchOperate = function (type) {
                var tip = type === 'offline' ? gdModelConstant.MODEL_BATCH_OFFLINE_TIP : gdModelConstant.MODEL_BATCH_DEL_TIP;
                // $scope.getCheckedItems().then(function(modelIds){
                var modelIds = [];
                var modelName = [];
                $.each($scope.models, function (key, item) {
                    if (item.checked) {
                        modelIds.push(item.modelId);
                        modelName.push(item.modelName);
                    }

                });
                if (modelIds.length) {
                    dialogService.confirm(tip).then(function () {
                        type === 'offline' ? $scope.offline(modelIds.join(','), modelName.join(',')) : $scope.modelDelete(modelIds.join(','), modelName.join(','));

                        /*//校验能否支持批量下线或删除
                        modelService.modelOperateCheck({modelIds: modelIds.join(","), operation: type})
                            .then(function(result){
                                type === 'offline' ? $scope.offline(modelIds.join(",")) : $scope.modelDelete(modelIds.join(","));
                        });*/
                    });
                }
                else {
                    dialogService.alert('至少选择一个模型');
                    return;
                }
                // });
            };

            /**
             *  单个操作
             *  @params:
             *      id: 需要下线或删除的模型id
             *      type: 标识是下线还是删除
             */
            $scope.oneOperate = function (id, modelName, type) {
                var tip = type === 'offline' ? gdModelConstant.MODEL_OFFLINE_TIP : gdModelConstant.MODEL_DEL_TIP; // 判断是下线还是删除
                dialogService.confirm(tip)
                    .then(function () {
                        type === 'offline' ? $scope.offline(id, modelName) : $scope.modelDelete(id, modelName);
                    });
            };

            /**
             *  批量导出
             *  @params: None
             */
            $scope.bacthExport = function () {
                $scope.getCheckedItems().then(function () {
                    $('#form').submit();
                });
            };

            /**
             *  下线模型
             *  @params:
             *      id: 需要下线或删除的模型id
             */
            $scope.offline = function (id, modelName) {
                gdModelService.offlineModel({modelIds: id, modelName: modelName})
                    .then(function (result) {
                        $scope.findModels();
                    });
            };

            /**
             *  模型组搜索功能
             *  @params: None
             */
            // $scope.searchGroup = function(){
            //     if(!baseService.validWord($scope.searchkeyword)) return;
            //     $scope.getAllModelGroups({parentId: 0, modelGroupName: $scope.searchkeyword});
            // }

            /**
             *  模型置顶/取消置顶
             *  @params:
             *      id: 模型id
             *      flag: 标记是置顶还是取消置顶
             */
            $scope.setModelUp = function (id, modelName, flag) {
                gdModelService.setModelUp({modelId: id, modelName: modelName, deleteUp: flag})
                    .then(function (result) {
                        $scope.findModels();
                    });
            };

            /**
             *  搜索功能, 在发起请求的时候， 重置 分页参数
             *  @params: None
             */
            $scope.search = function () {
                if (!baseService.validWord($scope.keyword)) {
                    return;
                }

                $scope.pageOptions.pageNum = 1;
                $scope.counts = 0;
                $scope.findModels();
            };

            /**
             *  全选功能
             *  @params: None
             */
            $scope.checkAll = function () {
                $scope.allchecked = !$scope.allchecked;
                angular.forEach($scope.models, function (item) {
                    item.checked = $scope.allchecked;
                });
            };

            /**
             *  选中与未选中切换
             *  @params:
             *      item: 当前选中或未选中对象
             */
            $scope.checkedThis = function (item) {
                if (!item.checked) {
                    $scope.allchecked = false;
                    return;
                }

                var allchecked = true;
                $.each($scope.models, function (key, item) {
                    if (!item.checked) {
                        allchecked = false;
                        return;
                    }

                });

                $scope.allchecked = allchecked;
            };

            /**
             *  判断是否有选择一条记录
             *  @params: None
             */
            $scope.getCheckedItems = function () {
                var deferred = $q.defer();

                $timeout(function () {
                    var modelIds = [];
                    $.each($scope.models, function (key, item) {
                        if (item.checked) {
                            modelIds.push(item.modelId);
                            $('[name=\'modelId\']').val(item.modelId);
                        }

                    });
                    if (modelIds.length) {
                        deferred.resolve(modelIds);
                        if (modelIds.length > 1) {
                            $('#form').attr('action', gdModelService.exportMoreRule());
                            $('[name=\'modelId\']').val(modelIds);
                        }
                        else {
                            $('#form').attr('action', gdModelService.exportSingleRule());
                        }
                    }
                    else {
                        dialogService.alert(CONSTANT.ONLY_ONE_CHOOSE);
                        deferred.reject(modelIds);
                    }
                });
                return deferred.promise;
            };

            /**
             *  下拉列表显示
             *  @params: None
             */
            $scope.showGroups = function () {
                $scope.isOpen = !$scope.isOpen;
            };

            /**
             *   模型列表搜索框监听Enter键
             *   @params: None
             */
            $scope.enterKey = function (event) {
                event = event || window.event;
                if (event.keyCode == 13) {
                    $scope.search();
                }

            };

            /**
             *   模型组下拉列表搜索框监听Enter键
             *   @params: None
             */
            $scope.enterGroupKey = function (event) {
                event = event || window.event;
                if (event.keyCode == 13) {
                    $scope.searchGroup();
                }

            };

            /**
             *   获取全部模型组
             *   @params:
             *      params： 传参
             */
            // $scope.getAllModelGroups = function(params){
            //     params = $.extend(params,{modelGroupName: $scope.searchkeyword});
            //     gdModelService.searchModelGroup(params)
            //         .then(function(result){
            //             $scope.modelGroups  = result.value || [];
            //             if($scope.groupId === -1){
            //                 $scope.groupListName = "全部";
            //                 $scope.modelGroupId = -1;
            //             }else{
            //                 //获取所有模型组
            //                 gdModelService.allModelGroups().then(function(result){
            //                     $scope.modelGroup = result.data.value || [];
            //                     angular.forEach($scope.modelGroup, function(item){
            //                         if($scope.groupId === item.groupId){
            //                             $scope.groupListName = item.groupName;
            //                             return;
            //                         }
            //                     });
            //                 });
            //                 $scope.modelGroupId = -1;
            //             }
            //             $scope.findModels();
            //     });
            // }

            /**
             *   替换模型组名称
             *   @params:
             *      item： 对象
             */
            $scope.setGroupName = function (item) {
                $scope.groupListName = item.text;
            };

            /**
             *   新建模型
             *   @params: None
             */
            $scope.addModel = function () {
                // 新建模型类别
                $scope.modelType = 'add';
                ngDialog.open({
                    template: 'gdModel/gdModel-detail-directive.htm',
                    controller: 'gdModelDetailCtrl',
                    scope: $scope,
                    showClose: false,
                    closeByEscape: false,
                    closeByDocument: false,
                    disableAnimation: true,
                    className: 'ngdialog-theme-default ngdialog-theme-dialog'
                });
            };

            /**
             *   上线模型
             *   @params:
             *      id: 模型id
             */
            $scope.online = function (item) {
                // 石勇 新增 获取该模型是否拥有筛选条件
                gdModelService.queryCondition({
                    modelId: item.modelId
                }).then(function (result) {
                    if (result.data.value.hascdt == '1') {
                        // 石勇 新增 弹窗显示
                        dialogService.confirmTo('是否引用筛选条件').then(function (value) {
                            if (value) {
                                var params = {};
                                params = {
                                    modelId: item.modelId,
                                    modelName: item.modelName,
                                    condition: JSON.stringify(result.data.value.filter_rule),
                                    isPass: 1
                                };
                                gdModelService.onlineModel(params)
                                    .then(function (response) {
                                        if (response.status === 200 && response.data.success) {
                                            dialogService.success('模型提交成功！');
                                            if ($scope.onlineType === 'add') {
                                                $timeout(function () {
                                                    window.location.href = '#/gdModel/-1/list';
                                                }, 3000);
                                            }
                                            else {
                                                $timeout(function () {
                                                    ngDialog.close('successDialog');
                                                }, 1000);
                                            }
                                            $scope.findModels();
                                        }
                                        else {
                                            dialogService.error(response.data.message);
                                            $timeout(function () {
                                                ngDialog.close('errorDialog');
                                            }, 1000);
                                            $scope.findModels();
                                            // return;
                                        }
                                    });
                            }
                            else {
                                $scope.onlineModelPop(item);
                            }
                        });
                    }
                    else {
                        $scope.onlineModelPop(item);
                    }

                });

            };
            // 石勇 新增 封装模型上线函数
            $scope.onlineModelPop = function (item) {
                // 获取是否开启禁用维度
                gdModelService.fetchOnSwitch().then(function (result) {
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
                // 
                $scope.onlineModel = item;
                $scope.onlineType = 'list';
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

                    $scope.findModels();
                });
            };
            // 

            /**
             *   功能权限
             *   @params: None
             */
            $scope.$watch('$parent.$parent.resources', function (newValue, oldValue) {
                if (!newValue) {
                    return;
                }

                angular.forEach(newValue, function (resource) {
                    if (resource.link === gdModelConstant.MODEL_LINK) { // 模型
                        $scope.optAciton = resource.optAction || [];
                        // 支持模型新增
                        if ($.inArray(gdModelConstant.MODEL_ADD, $scope.optAciton) > -1) {
                            $scope.addModelAuth = true;
                        }

                        // 支持模型导出
                        if ($.inArray(gdModelConstant.MODEL_EXPORT, $scope.optAciton) > -1) {
                            $scope.exportModelAuth = true;
                        }

                        // 支持模型删除
                        if ($.inArray(gdModelConstant.MODEL_DELETE, $scope.optAciton) > -1) {
                            $scope.delModelAuth = true;
                        }

                        // 支持模型上线
                        if ($.inArray(gdModelConstant.MODEL_ONLINE, $scope.optAciton) > -1) {
                            $scope.onlineAuth = true;
                        }

                        // 支持模型下线
                        if ($.inArray(gdModelConstant.MODEL_OFFLINE, $scope.optAciton) > -1) {
                            $scope.offlineAuth = true;
                        }

                        // 支持模型置顶、取消置顶
                        if ($.inArray(gdModelConstant.MODEL_SETTOP, $scope.optAciton) > -1) {
                            $scope.setUpAuth = true;
                        }

                        // 支持查看模型通话列表
                        if ($.inArray(gdModelConstant.MODEL_CALLLIST, $scope.optAciton) > -1) {
                            $scope.callListAuth = true;
                        }

                        // 支持模型组新增
                        if ($.inArray(gdModelConstant.MODEL_GROUP_ADD, $scope.optAciton) > -1) {
                            $scope.groupAddAuth = true;
                        }

                        // 支持模型组编辑
                        if ($.inArray(gdModelConstant.MODEL_GROUP_EDIT, $scope.optAciton) > -1) {
                            $scope.groupEditAuth = true;
                        }

                        // 支持模型组删除
                        if ($.inArray(gdModelConstant.MODEL_GROUP_DEL, $scope.optAciton) > -1) {
                            $scope.groupDelAuth = true;
                        }

                        return;
                    }

                });
            });

            /**
             *   当离开这个页面的时候将弹窗关闭
             *   @params: None
             */
            $scope.$on('$destroy', function () {
                ngDialog.closeAll();
            });

            // 监听表格渲染完成(列表有数据才会循环，才有判断)
            $scope.$on('colResizable', function (ngRepeatFinishedEvent) {
                winHeightService.calculate();
                // 浏览器窗口大小改变
                angular.element(window).resize(function () {
                    winHeightService.calculate();
                });
            });

            // 点击页面其他地方关闭模型组下拉列表
            $(window.document).click(function (event) {
                if (!angular.element(event.target).parents('.model-header-left').length
                    && !angular.element(event.target).hasClass('picture-select-down')
                    && $scope.isOpen) {
                    $scope.isOpen = false;
                }

                $scope.$apply();
            });
            // 获取所有模型组
            // $scope.getAllModelGroups();

            /* 石勇 新增 获取所有工单模型*/
            $scope.findModels();
            // 初始化调用
            winHeightService.calculate();

            // 浏览器窗口大小改变
            angular.element(window).resize(function () {
                winHeightService.calculate();
            });

            // 石勇 新增 排序
            $scope.remarkSort = function (order, orderType) {
                if (orderType == 'asc') {
                    $scope.btnUp = order;
                    $scope.btnDown = '';
                }
                else if (orderType == 'desc') {
                    $scope.btnUp = '';
                    $scope.btnDown = order;
                }

                if (order == 'releasetime' || order == 'releasetimes') {
                    order = 'startTime';
                }

                $scope.orderColumn = order;
                $scope.orderType = orderType;
                $scope.findModels();
            };

            /**
             *  石勇 新增 导出列表
             */
            $scope.listExport = function () {
                // 获取选中的模型
                var modelIds = [];
                $.each($scope.models, function (key, item) {
                    if (item.checked) {
                        modelIds.push(item.modelId);
                        $('[name=\'modelId\']').val(item.modelId);
                    }

                });
                var params = {};
                // 部分导出时的情况
                if (modelIds.length > 0) {
                    $('.exportExcle').remove(); // 清除默认的隐藏域
                    params = $.extend(params, $scope.pageOptions, {
                        modelGroupId: -1,
                        type: 'all',
                        orderColumn: $scope.orderColumn,
                        orderType: $scope.orderType,
                        modelIds: modelIds
                    });
                    for (var key in params) {
                        $('#form').prepend('<input type="hidden" name ="' + key + '" class="exportExcle">');
                        $('[name = \'' + key + '\']').val(params[key]);
                    }
                    $('#form').attr('action', gdModelService.exportExcleMore()).submit();
                    $('.exportExcle').remove(); // 运行结束后删除隐藏域，避免下次使用时会产生重复传值
                    $('#form').prepend('<input type="hidden" name="modelId" class="exportExcle">'); // 增加一个默认隐藏域，供导出规则使用
                }
                else if (modelIds.length == 0) { // 全部导出时的情况
                    dialogService.confirm('是否导出全部列表').then(function (value) {
                        if (value) {
                            $('.exportExcle').remove(); // 清除默认的隐藏域
                            params = $.extend(params, $scope.pageOptions, {
                                modelGroupId: -1,
                                type: 'all',
                                orderColumn: $scope.orderColumn,
                                orderType: $scope.orderType
                            });
                            for (var key in params) {
                                $('#form').prepend('<input type="hidden" name ="' + key + '" class="exportExcle">');
                                $('[name = \'' + key + '\']').val(params[key]);
                            }
                            $('#form').attr('action', gdModelService.exportExcleAll()).submit();
                            $('.exportExcle').remove(); // 运行结束后删除隐藏域，避免下次使用时会产生重复传值
                            $('#form').prepend('<input type="hidden" name="modelId" class="exportExcle">'); // 增加一个默认隐藏域，供导出规则使用
                        }

                    });
                }

            };
            // 石勇 新增 上线数据范围显示上线时间范围以及维度信息
            // 显示和隐藏维度显示弹框
            $scope.showDemKeyWrap = function (id) {
                $('#' + id).css('display', 'block');
            };

            $scope.hideDemKeyWrap = function (id) {
                $('#' + id).css('display', 'none');
            };
        }
    ]);
});
