/**
 * 本文件中的directive 实现模型详情页面模型预览通话列表的组件
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
     * 模型预览结果指令
     * @params:
     *     ngDialog: 弹窗组件
     *     $timeout: 定时器
     *     $q: 内定服务
     *     $rootScope: 根目录
     *     modelService: 接口服务
     *     dialogService: 弹窗组件自定义
     *     modelConstant: 常量
     *     CONSTANT: 系统常量
     *         type: 类型，表示是模型还是片段
     *         frag: 片段对象
     *         index: 下标
     *
     */
    app.directive('modelResult', [
        '$http',
        'ngDialog',
        '$timeout',
        '$q',
        '$rootScope',
        'gdModelService',
        'dialogService',
        'gdModelConstant',
        'CONSTANT',
        'dimensionService', function ($http, ngDialog, $timeout, $q, $rootScope, gdModelService, dialogService, gdModelConstant, CONSTANT, dimensionService) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'model/addNew/model-result-directive.htm',
                scope: {
                    type: '@',
                    frag: '=',
                    index: '@'
                },
                link: function ($scope, element, attrs) {
                    // 石勇 新增 按任务分析，否则按语音分析
                    // $rootScope.isTask ,值为1，按任务，值为0 按录音
                    if ($rootScope.isTask) {
                        $scope.isModelTask = true;
                        $scope.isModelCalllist = false;
                    }
                    else {
                        $scope.isModelTask = false;
                        $scope.isModelCalllist = true;
                    }
                    // 用来跳转到测听页面时进行传值
                    $scope.showIsByTaskId = $rootScope.isTask;
                    // $scope.isModelTask = true;
                    // $scope.isModelCalllist = false;

                    // 获取浏览器类型
                    $scope.browser = $rootScope.getBowerserInfo();
                    // 石勇 判断浏览器进行跳转页面
                    if ($scope.browser === 'chrome') {
                        $scope.PageName = 'playH5';
                    }
                    else if ($scope.browser === 'msie') {
                        $scope.PageName = 'play';
                    }

                    // 
                    $scope.isShowTip = false;

                    $scope.isShowMark = false;

                    $scope.allchecked = false;

                    $scope.showTip = function () {
                        $scope.isShowTip = !$scope.isShowTip;
                    };

                    $scope.columns = [];
                    $scope.isExistState = [];
                    resetData();

                    $scope.from = 'previewList';

                    // 石勇 新增 用于区别通话列表所属模块
                    $scope.tool = 'modelCallList';
                    // 

                    // 石勇 新增 用来展示任务展开时流水号对应的关键词
                    $scope.tempCallList = [];
                    $scope.tempCallListResult = [];
                    $scope.tempMarkList = [];
                    // 

                    /**
                     * [setDimension 打开维度弹出框]
                     */
                    $scope.setDimension = function () {
                        $scope.closeAllDetailedResult(); // 关闭所有的展开结果
                        ngDialog.open({
                            template: 'analysis/detail/dimension-libs-directive.htm',
                            controller: 'dimensionLibsCtrl',
                            scope: $scope,
                            showClose: false,
                            closeByEscape: false,
                            closeByDocument: true,
                            disableAnimation: true,
                            className: 'ngdialog-theme-default ngdialog-theme-model-push'
                        }).closePromise.then(function (dialog) {
                            // 当弹出层关闭后，自动更新 维度对象
                            if (angular.isUndefined(dialog.value) || dialog.value == '$document') {
                                return;
                            }

                            $scope.columns = [];
                            // 石勇 显示任务结果时传维度值
                            // $scope.callListResultDim = ["voiceId","duration","keyword"];
                            // 
                            angular.forEach(dialog.value.pushDim, function (item) {
                                // if(item.key != "taskId"){
                                // 石勇 新增
                                // $scope.callListResultDim.push(item.key);
                                // 
                                $scope.columns.push({
                                    column: item.key,
                                    columnName: item.name
                                });
                                // }

                            });
                            // 石勇 新增 按任务分析，去除弹窗中维度任务号
                            // $rootScope.isTask ,值为1，按任务，值为0 按录音
                            // if($rootScope.isTask){
                            //     angular.forEach($scope.tableData,function(item,index){
                            //         if(item.key == "taskId"){
                            //             $scope.tableData.splice(index,1);
                            //         }
                            //     })
                            // }
                            // 
                            // 
                            $scope.updatePreviewData();
                        });
                    };

                    /**
                     * @brief 编辑备注
                     * @details [long description]
                     *
                     * @param  item 对象
                     * @return [description]
                     */
                    $scope.showEdit = function (item) {
                        item.edit = !item.edit;
                        if (item.edit) {
                            $timeout(function () {
                                // 石勇 新增 兼容录音
                                if ($rootScope.isTask == 0) {
                                    document.getElementById('remark-input_' + item.dataMaps.voiceId + '_' + $scope.index).focus();
                                }
                                else {
                                    document.getElementById('remark-input_' + item.dataMaps.taskId + '_' + $scope.index).focus();
                                }
                            }, 500);
                        }

                    };

                    /**
                     * @brief 提交备注信息
                     * @details [long description]
                     *
                     * @param  对象
                     * @return [description]
                     */
                    $scope.submitRemark = function (item) {
                        var fragmentId = $scope.type === 'fragment' ? $scope.frag.fragmentId : $scope.$parent.model.modelFragmentRelation.fragmentId;
                        // 石勇 新增 兼容录音
                        if ($rootScope.isTask == 0) {
                            var remark = document.getElementById('remark-input_' + item.dataMaps.voiceId + '_' + $scope.index).value;
                            if (remark && remark.replace(/[^\x00-\xff]/g, 'xx').length > 20) {
                                dialogService.alert(gdModelConstant.MODEL_REMARK_TIP);
                                return;
                            }

                            gdModelService.voiceRemark({
                                fragmentId: fragmentId,
                                telId: item.dataMaps.voiceId,
                                comment: remark
                            }).then(function (result) {

                                /*item.edit = !item.edit;
                                $scope.updatePreviewData();*/
                            });
                        }
                        else {
                            var remark = document.getElementById('remark-input_' + item.dataMaps.taskId + '_' + $scope.index).value;
                            if (remark && remark.replace(/[^\x00-\xff]/g, 'xx').length > 20) {
                                dialogService.alert(gdModelConstant.MODEL_REMARK_TIP);
                                return;
                            }

                            gdModelService.voiceRemark({
                                fragmentId: fragmentId,
                                telId: item.dataMaps.taskId,
                                comment: remark
                            }).then(function (result) {

                                /*item.edit = !item.edit;
                                $scope.updatePreviewData();*/
                            });
                        }
                        // 
                        // var remark = document.getElementById('remark-input_' + item.dataMaps.taskId + "_" + $scope.index).value;

                    };

                    /**
                     * @brief 页面参数重置
                     * @details [long description]
                     *
                     * @param t [description]
                     * @param data 传递参数
                     *
                     * @return [description]
                     */
                    $scope.$on('preview', function (event, data) {
                        if (data.type !== $scope.type) {
                            return;
                        }

                        if (data.type === 'model' && $scope.$parent.validatefragmentContent() && $scope.$parent.validateTime() && !$scope.$parent.isError && $scope.$parent.preOperateSilenceContent()) {
                            // 重新预览的时候重置页面参数
                            resetData();
                            $scope.$parent.previewReuslt = {
                                total: 0,
                                mark: 0
                            };
                            $scope.tableData = [];
                            $scope.model = $scope.$parent.packModelParam();
                            $scope.updatePreviewData();

                            if ($scope.model.modelFragments != '[]') {
                                // var modelDimension = $scope.$parent.packModelDimension();
                                // angular.forEach(modelDimension,function(item,index){
                                //     if (item.key == "timestamp") {
                                //         if (item.value[0].length < 11) {
                                //             item.value[0] = item.value[0] + " 00:00:00";
                                //             item.value[1] = item.value[1] + " 23:59:59";
                                //         }
                                //     }
                                // })
                                // 获取每一个片段的命中数
                                gdModelService.getHitCount({
                                    modelFragments: $scope.model.modelFragments,
                                    searchType: $scope.$parent.preIsHavaSilent ? 0 : 1,
                                    modelDimension: JSON.stringify($scope.$parent.packModelDimension()),
                                    // 筛选器增加传参
                                    filterRuleId: $scope.$parent.a.id,
                                    filter: JSON.stringify($scope.$parent.b)
                                }).then(function (result) {
                                    angular.forEach($scope.$parent.model.modelFragments, function (fragment) {
                                        angular.forEach(result.value, function (item) {
                                            if (fragment.fragmentId === item.fragmentId) {
                                                fragment.count = item.count;
                                            }

                                        });
                                    });
                                });
                            }

                            $scope.$parent.showPreivewResult(0);
                            return;
                        }

                        if (data.type === 'fragment' && data.data == $scope.frag.fragmentId && $scope.$parent.validateTime() && !$scope.$parent.isError) {
                            // 重新预览的时候重置页面参数
                            resetData();
                            $scope.updatePreviewData();
                        }

                    });

                    /**
                     * @brief 全部清空按钮
                     * @details [long description]
                     * @return [description]
                     */
                    $scope.resetMark = function () {
                        var fragmentId = $scope.type === 'fragment' ? $scope.frag.fragmentId : $scope.$parent.model.modelFragmentRelation.fragmentId;

                        $scope.getCheckedItems().then(function (telephonId) {
                            gdModelService.clearAllMarks({
                                fragmentId: fragmentId,
                                telId: telephonId.join(',')
                            }).then(function (result) {
                                // 重新预览的时候重置页面参数
                                resetData();
                                $scope.updatePreviewData();
                                $scope.pageData.type = 1;
                                $scope.isShowMark = true;
                            });
                        });
                    };

                    /**
                     * @brief 获取已选择的item
                     * @details [long description]
                     * @return [description]
                     */
                    $scope.getCheckedItems = function () {
                        var deferred = $q.defer();

                        $timeout(function () {
                            var telephonId = [];
                            $.each($scope.tableData.previewList.rows, function (key, item) {
                                if (item.checked) {
                                    telephonId.push(item.id);
                                }

                            });
                            if (telephonId.length) {
                                deferred.resolve(telephonId);
                            }
                            else {
                                dialogService.alert(CONSTANT.ONLY_ONE_CHOOSE);
                                deferred.reject(telephonId);
                            }
                        });
                        return deferred.promise;
                    };

                    /**
                     * @brief 当单选切换的时候
                     * @details [long description]
                     *
                     * @param  type 类型
                     * @return [description]
                     */
                    $scope.changeMark = function (type) {
                        $scope.pageData.type = type;
                        var showData = $scope.callListData;
                        if (Number($scope.pageData.type) === 1) {
                            showData = $scope.markData;
                            $scope.getMarkList();
                            $scope.isShowMark = true;
                        }
                        else {
                            $scope.getCallList();
                            $scope.isShowMark = false;
                        }
                        $scope.tableData = showData.previewData;
                    };

                    /**
                     * @brief 获取测听标记数量
                     * @details [long description]
                     * @return [description]
                     */
                    $scope.getMarkTotalData = function () {
                        var fragmentId = $scope.type === 'fragment' ? $scope.frag.fragmentId : $scope.$parent.model.modelFragmentRelation.fragmentId;
                        gdModelService.getMarkTotalData({
                            fragmentId: fragmentId
                        })
                            .then(function (result) {
                                $scope.pageData.mark = result.value;
                            });
                    };

                    // 石勇 新增
                    // 获取模型保存的维度
                    $scope.allDimensions = [];
                    $scope.ModelSearchDim = function () {
                        var deferred = $q.defer();

                        dimensionService.searchDim()
                            .then(function (result) {
                                $scope.allDimensions = result.value || [];
                                dimensionService.queryDimensions({
                                    listType: 6
                                }).then(function (data) {
                                    var selDims = data.value.split(',');
                                    $scope.columns = [];
                                    angular.forEach($scope.allDimensions, function (dim, index) {
                                        angular.forEach(selDims, function (selDim, index) {
                                            if (dim.key === selDim) {
                                                dim.checked = true;
                                                $scope.columns.push({
                                                    column: dim.key,
                                                    columnName: dim.name
                                                });
                                            }

                                        });
                                    });
                                    deferred.resolve($scope.columns);
                                });
                            });
                        return deferred.promise;
                    };

                    /**
                     * @brief 获取通话列表数据
                     * @details [long description]
                     * @return [description]
                     */
                    $scope.showResultExport = false;
                    $scope.getCallList = function () {
                        $scope.showResultExport = true;

                        // var modelDimension = $scope.$parent.packModelDimension();
                        // angular.forEach(modelDimension,function(item,index){
                        //     if (item.key == "timestamp") {
                        //         if (item.value[0].length < 11) {
                        //             item.value[0] = item.value[0] + " 00:00:00";
                        //             item.value[1] = item.value[1] + " 23:59:59";
                        //         }
                        //     }
                        // })
                        var params = {
                            columns: JSON.stringify($scope.columns),
                            modelDimension: JSON.stringify($scope.$parent.packModelDimension()),
                            // 筛选器增加传参
                            filterRuleId: $scope.$parent.a.id,
                            filter: JSON.stringify($scope.$parent.b),
                            searchType: $scope.$parent.preIsHavaSilent ? 0 : 1,
                            // 石勇 新增 维度传参
                            listType: 6
                        };
                        if ($scope.type === 'model' && $scope.$parent.validatefragmentContent()) {
                            var previewModel = angular.copy($scope.model);
                            try {
                                delete previewModel.pageType;
                                delete previewModel.modelGroupId;
                                delete previewModel.modelAccuracy;
                                delete previewModel.modelName;
                                delete previewModel.modelComment;
                                delete previewModel.previewId;
                            }
                            catch (e) {}
                            params = $.extend(params, $scope.callListData.pageOptions, previewModel);
                        }
                        else {
                            var fragment = angular.copy($scope.frag);
                            fragment.fragmentContent = fragment.isTag === 1 ? '#' : fragment.fragmentContent;
                            params = $.extend(params, $scope.callListData.pageOptions, fragment);
                        }
                        // 直接点击全部时不可请求
                        if (params.channel == undefined) {
                            return;
                        }

                        gdModelService.getCallList(params).then(function (result) {
                            // 石勇 新增 获取所有的结果
                            $scope.tempCallList = result.value.previewList.rows;
                            // 

                            $scope.callListData.previewData = result.value;
                            $scope.callListData.count = result.value.previewList.totalRows;
                            $scope.callListData.total = result.value.totalCount;
                            $scope.callListData.match = result.value.previewList.totalRows;
                            $scope.pageData.total = result.value.previewList.totalRows;
                            if (Number($scope.pageData.type) == 0) {
                                $scope.tableData = result.value;
                                $scope.$parent.previewReuslt.total = $scope.callListData.total;
                                $scope.$parent.previewReuslt.match = $scope.callListData.match;
                            }

                            if ($scope.type === 'fragment') {
                                $scope.frag.count = $scope.callListData.match;
                            }

                        });
                    };

                    /**
                     * @brief 获取标记数量与数据
                     * @details [long description]
                     * @return [description]
                     */
                    $scope.getMarkList = function () {
                        $scope.showResultExport = true;
                        // 石勇 解决【模型】人工测听标记中某页全选删除后，跳转至另一页，顶部勾选图标仍在 
                        $scope.allchecked = false;
                        // 
                        var params = {
                            columns: JSON.stringify($scope.columns),
                            modelDimension: JSON.stringify($scope.$parent.packModelDimension()),
                            // 筛选器增加传参
                            filterRuleId: $scope.$parent.a.id,
                            filter: JSON.stringify($scope.$parent.b),
                            // 石勇 新增 维度传参
                            listType: 6
                        };
                        if ($scope.type === 'model' && $scope.$parent.validatefragmentContent()) {
                            params = $.extend(params, $scope.markData.pageOptions, $scope.model);
                        }
                        else {
                            var fragment = angular.copy($scope.frag);
                            fragment.fragmentContent = fragment.isTag === 1 ? '#' : fragment.fragmentContent;
                            params = $.extend(params, $scope.markData.pageOptions, fragment, {
                                modelId: $scope.$parent.model.modelId,
                                modelName: $scope.$parent.model.modelName
                            });
                        }
                        // 石勇 新增 用来导出列表时传参
                        $scope.modelParams = params;
                        // 直接点击全部时不可请求
                        if (params.channel == undefined) {
                            return;
                        }

                        gdModelService.getMarkList(params).then(function (result) {
                            // 石勇 新增 获取所有的结果
                            $scope.tempMarkList = result.value.previewList.rows;
                            // 
                            $scope.markData.previewData = result.value;
                            $scope.markData.count = result.value.previewList.totalRows;
                            $scope.pageData.mark = result.value.previewList.totalRows || 0;

                            if (Number($scope.pageData.type) == 1) {
                                $scope.tableData = result.value;
                                $scope.isExistState = angular.copy(result.value.previewList.rows);
                            }

                            // 获取页面模型命中的准确数
                            $scope.pageData.yExist = result.value.yExist;
                            $scope.pageData.nExist = result.value.nExist;
                            $scope.pageData.yNoExist = result.value.yNoExist;
                            $scope.pageData.nNoExist = result.value.nNoExist;
                            $scope.pageData.accuracy = result.value.accuracy;

                            if ($scope.type === 'model') {
                                $scope.$parent.model.modelAccuracy = result.value.accuracy;
                            }

                            $scope.getMarkTotalData(); // 预览的时候显示标记值
                        });
                    };

                    /**
                     * @brief 标注 用户的选择
                     * @details [long description]
                     *
                     * @param item 对象
                     * @param mark 1是， -1否
                     *
                     * @return [description]
                     */
                    $scope.voiceMark = function (item, mark) {
                        // 石勇 新增 兼容录音
                        if ($rootScope.isTask == 0) {
                            item.id = item.dataMaps.voiceId;
                        }

                        // 
                        // 判断当前录音是否存在列表之中，默认在
                        var isExist = 1;
                        var index = $rootScope.myInArray($scope.isExistState, 'id', item.id);
                        if (index > -1) { // 已存在
                            isExist = $scope.isExistState[index].isExist;
                        }

                        if (mark === 1) {
                            $scope.markStateTip = isExist === 1 ? 1 : 2;
                        }
                        else if (mark === -1) {
                            $scope.markStateTip = isExist === 1 ? 3 : 4;
                        }

                        // 获取上次的标记情况
                        gdModelService.getTelephonIdState({
                            fragmentId: item.fragmentId,
                            telephonId: item.id
                        }).then(function (result) {
                            $scope.pmark = result.value || 0;
                            switch ($scope.pmark) {
                                case 0:
                                    $scope.lastMarkStateTip = 0;
                                    break;
                                case 1:
                                    $scope.lastMarkStateTip = isExist === 1 ? 1 : 2;
                                    break;
                                case -1:
                                    $scope.lastMarkStateTip = isExist === 1 ? 3 : 4;
                                    break;
                                default:
                                    break;
                            }
                            $scope.getMarkData();
                            $scope.saveMark(item, mark);
                        });
                    };

                    /**
                     * @brief 获取标记各个状态数量
                     * @details [long description]
                     * @return [description]
                     */
                    $scope.getMarkData = function () {
                        gdModelService.getMarkData({
                            yesExist: $scope.pageData.yExist || 0,
                            noExist: $scope.pageData.nExist || 0,
                            yesNotExist: $scope.pageData.yNoExist || 0,
                            noNotExist: $scope.pageData.nNoExist || 0,
                            lastMarkState: $scope.lastMarkStateTip || 0,
                            markState: $scope.markStateTip
                        }).then(function (result) {
                            $scope.pageData.yExist = result.value.yExist;
                            $scope.pageData.nExist = result.value.nExist;
                            $scope.pageData.yNoExist = result.value.yNoExist;
                            $scope.pageData.nNoExist = result.value.nNoExist;
                            $scope.pageData.accuracy = result.value.accuracy;
                            if ($scope.type === 'model') {
                                $scope.$parent.model.modelAccuracy = result.value.accuracy;
                            }

                        });
                    };

                    /**
                     * @brief 标记操作
                     * @details [long description]
                     *
                     * @param item 对象
                     * @param mark 1是， -1否
                     *
                     * @return [description]
                     */
                    $scope.saveMark = function (item, mark) {
                        // 石勇 新增 兼容录音
                        if ($rootScope.isTask == 0) {
                            item.id = item.dataMaps.voiceId;
                        }

                        // 
                        gdModelService.voiceMark({

                            /* dataMarkId: item.dataMarkId,*/
                            mark: mark,
                            fragmentId: item.fragmentId,
                            telId: item.id
                        }).then(function (result) {
                            item.dataMarkId = result.value;
                            item.mark = mark;
                            $scope.getMarkTotalData(); // 标记的时候添加到标记总值
                        });
                    };

                    /**
                     * @brief 全选/全不选
                     * @details [long description]
                     * @return [description]
                     */
                    $scope.toggleAllChecked = function () {
                        $scope.allchecked = !$scope.allchecked;
                        angular.forEach($scope.tableData.previewList.rows, function (item) {
                            item.checked = $scope.allchecked;
                        });
                    };

                    /**
                     * @brief 单选检验
                     * @details [long description]
                     *
                     * @param  item 对象
                     * @return [description]
                     */
                    $scope.checkedThis = function (item) {
                        if (!item.checked) {
                            $scope.allchecked = false;
                            return;
                        }

                        var allchecked = true;
                        $.each($scope.tableData.previewList.rows, function (key, item) {
                            if (!item.checked) {
                                allchecked = false;
                                return;
                            }

                        });

                        $scope.allchecked = allchecked;
                    };

                    /**
                     * @brief 更新页面数据
                     * @details [long description]
                     * @return [description]
                     */
                    $scope.updatePreviewData = function () {
                        $scope.ModelSearchDim().then(function (col) {
                            $scope.getCallList();
                            $scope.getMarkList();
                        });
                        $scope.isShowMark = $scope.pageData.type === 1 ? true : false;
                    };

                    if ($scope.type === 'fragment') {
                        $scope.updatePreviewData();
                    }

                    /**
                     * @brief 测听过记录
                     * @details [long description]
                     *
                     * @param  item 对象
                     * @return [description]
                     */
                    $scope.markView = function (item) {
                        $('#model-preview_' + item.id).addClass('visited');
                        return true;
                    };

                    /**
                     * @brief 重置数据
                     * @details [long description]
                     * @return [description]
                     */
                    function resetData() {
                        $scope.pageData = {
                            type: 0,
                            yExist: 0,
                            nExist: 0,
                            yNoExist: 0,
                            nNoExist: 0,
                            total: 0,
                            accuracy: 0,
                            mark: 0
                        };
                        $scope.markData = {
                            pageOptions: {
                                pageSize: 10,
                                pageNum: 1
                            },
                            count: 0,
                            total: 0,
                            mark: 0,
                            previewData: {}
                        };

                        // 全部列表的分页信息
                        $scope.callListData = {
                            pageOptions: {
                                pageSize: 10,
                                pageNum: 1
                            },
                            count: 0,
                            total: 0,
                            mark: 0,
                            previewData: {}
                        };

                        // 全部任务列表的录音结果的分页信息
                        $scope.CallListResult = {
                            pageOptions: {
                                pageSize: 10,
                                pageNum: 1
                            },
                            count: 0,
                            total: 0,
                            mark: 0,
                            previewData: {}
                        };
                    }

                    // 石勇 新增 模型编辑页面预览结果导出
                    $scope.resultExport = function () {
                        var params = $scope.modelParams;
                        // 遍历增加隐藏域，用来在导出时进行传值
                        for (var key in params) {
                            $('#ModelForm1').prepend('<input type="hidden" name ="' + key + '"/ class="exportModelList">');
                            $('[name = \'' + key + '\']').val(params[key]);
                        }

                        // 导出所有的通话列表结果
                        $('#ModelForm1').attr('action', gdModelService.exportPreviewModel()).submit();
                        $('.exportModelList').remove(); // 运行结束后删除隐藏域，避免下次使用时会产生重复传值
                    };
                    // 石勇 新增 模型预览结果展开
                    // 获取任务下的通话列表的维度传参
                    // $scope.callListResultDim = ["voiceId","duration","keyword"]; 

                    $scope.showDetailedResult = function ($index, $event) { // 传参：行的下标
                        // 顺序决定展开后的显示顺序
                        // $scope.callListResultDim = ["voiceId","duration"];
                        $scope.callListResultDim = [];
                        angular.forEach($scope.columns, function (item) {
                            $scope.callListResultDim.push(item.column);
                        });
                        $scope.callListResultDim.splice(0, 1, 'voiceId');
                        $scope.callListResultDim.push('keyword');
                        // 
                        $scope.thisRow = $scope.tableData.previewList.rows[$index];

                        // 展开后翻页
                        if ($scope.thisRow == undefined) {
                            $scope.paramsTemp = $.extend($scope.paramsTemp, $scope.CallListResult.pageOptions);
                            // 请求该任务下的所有录音
                            gdModelService.queryVoiceCallList($scope.paramsTemp).then(function (result) {
                                $scope.TableCallListResult = result.value;
                                $scope.CallListResult.count = result.value.total;
                                // 石勇 新增 用于显示任务展开后的关键词
                                angular.forEach($scope.TableCallListResult.rows, function (voiceItem) {
                                    voiceItem.keyword = [];
                                });
                                angular.forEach($scope.tempCallListResult, function (item) {
                                    if (item.id == $scope.paramsTemp.id) {
                                        angular.forEach($scope.TableCallListResult.rows, function (voiceItem) {
                                            angular.forEach(item.keywordInfos, function (taskItem) {
                                                if (taskItem.voiceId == voiceItem.voiceId) {
                                                    voiceItem.keyword.push(taskItem);
                                                }

                                            });
                                        });
                                    }

                                });
                            });
                            return;
                        }

                        if ($scope.thisRow.taskImg) {
                            $scope.closeAllDetailedResult();
                            return;
                        }
                        else {
                            $scope.closeAllDetailedResult();
                        }
                        // 只变化当前的箭头
                        $scope.thisRow.taskImg = !$scope.thisRow.taskImg;
                        // 切换全部匹配通话或人工测听标记
                        if ($scope.pageData.type == 1) {
                            $scope.tempCallListResult = $scope.tempMarkList;
                        }
                        else {
                            $scope.tempCallListResult = $scope.tempCallList;
                        }

                        if ($scope.thisRow.taskImg == true) { // 展开时
                            // console.log($scope.thisRow.id);// 该条数据的id
                            var params = {
                                pageNum: 1,
                                pageSize: 10,
                                id: $scope.thisRow.id,
                                // searchDimension:JSON.stringify($scope.callListResultDim),
                                searchDimension: $scope.callListResultDim.toString(),
                                modelId: $scope.$parent.model.modelId
                            };
                            // 展开后翻页问题 
                            $scope.CallListResult.pageOptions.pageNum = 1;
                            $scope.paramsTemp = params;

                            // 请求该任务下的所有录音
                            gdModelService.queryVoiceCallList(params).then(function (result) {
                                $scope.TableCallListResult = result.value;
                                $scope.CallListResult.count = result.value.total;
                                // 石勇 新增 用于显示任务展开后的关键词
                                angular.forEach($scope.TableCallListResult.rows, function (voiceItem) {
                                    voiceItem.keyword = [];
                                });
                                angular.forEach($scope.tempCallListResult, function (item) {
                                    if (item.id == $scope.thisRow.id) {
                                        angular.forEach($scope.TableCallListResult.rows, function (voiceItem) {
                                            angular.forEach(item.keywordInfos, function (taskItem) {
                                                if (taskItem.voiceId == voiceItem.voiceId) {
                                                    voiceItem.keyword.push(taskItem);
                                                }

                                            });
                                        });
                                    }

                                });
                                // 
                            });
                        }
                        else { // 关闭时

                        }
                    };
                    // 石勇 新增 关闭所有的任务对应的结果
                    $scope.closeAllDetailedResult = function () {
                        angular.forEach($scope.tableData.previewList.rows, function (item) {
                            item.taskImg = false;
                        });
                    };

                }
            };

        }
    ]);
});
