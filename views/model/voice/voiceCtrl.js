/**
 * 本文件中的Controller 实现模型通话列表页面的 控制器逻辑
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
     * 本controller 模型  组区域的模板
     *  @params:
     *      $http:  发送http 请求的service
     *      $scope: 双向绑定的媒介， 由 angular 自动实例化
     *
     *
     */
    app.controller('voiceListCtrl', [
        '$scope',
        '$stateParams',
        'ngDialog',
        '$q',
        '$rootScope',
        '$timeout',
        'modelService',
        'winHeightService',
        'dimensionService', function ($scope, $stateParams, ngDialog, $q, $rootScope, $timeout, modelService, winHeightService, dimensionService) {
            $scope.browser = $rootScope.getBowerserInfo();
            // 获取浏览器类型
            $scope.browser = $rootScope.getBowerserInfo();
            // 石勇 判断浏览器进行跳转页面
            if ($scope.browser === 'chrome') {
                $scope.PageName = 'playH5';
            }
            else if ($scope.browser === 'msie') {
                $scope.PageName = 'play';
            }
            if ($scope.browser === 'other') {
                $scope.PageName = 'play';
            }
            // 
            var now = $scope.systemDate && $scope.systemDate != '${systemDate}' ? $scope.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date());
            $scope.modelId = Number($stateParams.id);
            $scope.type = $stateParams.type;
            $scope.selectCenter = $stateParams.selectCenter;
            $scope.selectFlag = $stateParams.selectFlag;
            $scope.model = {};

            $scope.columns = [];

            $scope.from = 'voiceList';

            $scope.btnUp = 'voiceId';

            if ($rootScope.isTask) {
                if ($scope.type === 'hotword') {
                    $scope.sortParams = {
                        sortColumn: 'taskId',
                        sortType: 'asc'
                    };
                }
                else {
                    $scope.sortParams = {
                        sortColumn: 'id',
                        sortType: 'asc'
                    };
                }
            }
            else {
                $scope.sortParams = {
                    sortColumn: 'voiceId',
                    sortType: 'asc'
                };
            }
            // 通话列表分页
            $scope.pageOptions = {
                pageNum: 1,
                pageSize: 10
            };
            // 按任务分析通话列表录音结果分页
            $scope.voiceResultPageOptions = {
                pageNum: 1,
                pageSize: 10
            };
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

            // 石勇 新增 用于区别通话列表所属模块
            $scope.tool = 'modelCallList';
            // 

            // 根据模型id获取模型信息
            $scope.getModel = function () {
                modelService.getModel($stateParams.id).then(function (result) {
                    // 转化模型数据
                    $scope.model.modelId = result.value.modelId;
                    $scope.model.modelName = result.value.modelName;
                    $scope.model.modelGroupId = result.value.groupId;
                    $scope.groupName = result.value.groupName;
                });
            };

            /**
             * [remarkSort 排序]
             * @param  {[type]} order     [description]
             * @param  {[type]} orderType [description]
             * @return {[type]}           [description]
             */
            $scope.remarkSort = function (order, orderType) {
                if (orderType == 'asc') {
                    $scope.btnUp = order;
                    $scope.btnDown = '';
                }
                else {
                    $scope.btnUp = '';
                    $scope.btnDown = order;
                }

                $scope.sortParams = {
                    sortColumn: order,
                    sortType: orderType
                };
                $scope.getTableData();
            };

            /**
             * [setDimension 打开维度弹出框]
             */
            $scope.setDimension = function () {
                // 石勇 新增
                $scope.closeAllDetailedResult();
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
                        // 石勇 新增
                        // $scope.callListResultDim.push(item.key);
                        // 
                        $scope.columns.push({
                            column: item.key,
                            columnName: item.name
                        });
                    });

                    $scope.getTableData();
                });
            };

            // 石勇 新增
            // 获取模型保存的维度
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

            // 获取列表信息
            $scope.getTableData = function (params) {
                $scope.ModelSearchDim().then(function (col) {
                    $scope.columns = col;
                    params = $.extend(params, $scope.pageOptions, $scope.sortParams);
                    params = $.extend(params, {
                        searchDimension: JSON.stringify($scope.columns)
                    });
                    if ($scope.type === 'hotword') {
                        // var pretime = $scope.callDay;  //首页热点切换到通话列表，对日期减一天处理
                        // pretime.replace(/-/g,"/");
                        // var pre = new Date(pretime);
                        // var timeSecond = pre.getTime()-24*3600*1000;
                        // var now = new Date(timeSecond);
                        // var year = now.getFullYear();
                        // var month = now.getMonth()+1;
                        // var day = now.getDate();
                        // if(month<10){
                        //     month = "0"+month;
                        // }
                        //  if(day<10){
                        //     day = "0"+day;
                        // }
                        // var fullDay = year+"-"+month+"-"+day;
                        params = $.extend(params, {clusterId: $scope.modelId, selectTime: $scope.callDay, selectCenter: $scope.selectCenter, centerFlag: $scope.selectFlag});

                        /*石勇 新增 增加默认传值(首页热词跳转过来时不加时分秒)*/
                        // if(params.selectTime.length < 11){
                        //     params.selectTime = params.selectTime + " 23:59:59";
                        // }
                        // 

                        return modelService.getTableDataCluster(params)
                            .then(function (result) {
                                $scope.headColums = result.value ? result.value.columns : [];
                                $scope.callLists = result.value ? result.value.previewList.rows : [];
                                $scope.counts = result.value ? result.value.previewList.totalRows : 0;
                                if ($scope.callLists && $scope.callLists.length) {
                                    return $q.reject(false);
                                }

                                if ($scope.pageOptions.pageNum === 1 && result.value && result.value.totalRows === 0) {
                                    return $q.reject(false);
                                }

                                return true;
                            }).then(function () {
                            $scope.pageOptions.pageNum = $scope.pageOptions.pageNum - 1;
                            if ($scope.pageOptions.pageNum > 0) {
                                $scope.getTableData();
                            }

                        });
                    }
                    else {
                        if ($scope.type === 'index') {
                            params = $.extend(params, {modelId: $scope.modelId, startTime: $scope.callDay, endTime: $scope.callDay, selectCenter: $scope.selectCenter, selectFlag: $scope.selectFlag});
                        }
                        else {
                            params = $.extend(params, {modelId: $scope.modelId, startTime: $scope.timesRange.defaultStart, endTime: $scope.timesRange.defaultEnd});
                        }

                        /*石勇 新增 增加默认传值*/
                        if (params.startTime.length < 11) {
                            params.startTime = params.startTime + ' 00:00:00';
                            params.endTime = params.endTime + ' 23:59:59';
                        }

                        // 

                        return modelService.getTableData(params)
                            .then(function (result) {
                                $scope.headColums = result.value ? result.value.columns : [];
                                $scope.callLists = result.value ? result.value.previewList.rows : [];
                                $scope.counts = result.value ? result.value.previewList.totalRows : 0;
                                if ($scope.callLists && $scope.callLists.length) {
                                    return $q.reject(false);
                                }

                                if ($scope.pageOptions.pageNum === 1 && result.value && result.value.totalRows === 0) {
                                    return $q.reject(false);
                                }

                                return true;
                            }).then(function () {
                            $scope.pageOptions.pageNum = $scope.pageOptions.pageNum - 1;
                            if ($scope.pageOptions.pageNum > 0) {
                                $scope.getTableData();
                            }

                        });
                    }
                });
            };

            // 点击表格日期
            $scope.changeDate = function (item) {
                $scope.callDay = item;
                $scope.pageOptions.pageNum = 1;
                $scope.getTableData();
            };

            $scope.winHeight = function () {
                // 初始化调用
                winHeightService.calculate();
                // 浏览器窗口大小改变
                angular.element(window).resize(function () {
                    winHeightService.calculate();
                });
            };

            // 获取模型上线时间
            $scope.getOnlineTime = function () {
                modelService.getOnlineTime({
                    modelId: $stateParams.id
                })
                    .then(function (result) {
                        $scope.timesRange = {
                            defaultStart: result.value.startTime ? result.value.startTime : $.datepicker.formatDate('yy-mm-dd', new Date(new Date().getTime(now) - 7 * 24 * 3600 * 1000)),
                            defaultEnd: result.value.endTime ? result.value.endTime : now,
                            isToNow: false
                        };

                        $scope.showTime = true;
                        $scope.getColumData();
                        // 石勇 新增 为了保存维度
                        $scope.ModelSearchDim().then(function (col) {
                            $scope.getTableData();
                        });

                    });
            };

            $scope.getColumData = function () {
                $scope.$broadcast('queryColumData', {
                    time: $scope.timesRange
                });
            };

            // 更换时间
            $scope.getUpdate = function () {
                $scope.pageOptions.pageNum = 1;
                $scope.getColumData();
                $scope.getTableData();
            };

            // 标记测听
            $scope.markView = function (item) {
                $('#voice-item-id_' + item.id).addClass('visited');
                return true;
            };

            // 当离开这个页面的时候将定时器清空
            $scope.$on('$destroy', function () {
                ngDialog.closeAll();
            });

            // 如果不是通话详情获取模型相关信息
            if ($scope.type != 'hotword') {
                $scope.getModel();
            }

            if ($scope.type === 'model') {
                $scope.getOnlineTime();
            }
            else {
                $scope.callDay = $stateParams.day;
                $scope.ModelSearchDim().then(function (col) {
                    $scope.getTableData();
                });
            }

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

                // 当从主页热词跳转到该页面时增加维度传参“模型名称”
                if ($scope.type == 'hotword') {
                    $scope.callListResultDim.push('modelName');
                }

                // 
                $scope.thisRow = $scope.callLists[$index];
                // 展开后翻页
                if ($scope.thisRow == undefined) {
                    // var params = {
                    //     pageNum:1,
                    //     pageSize:1,
                    //     id:$scope.thisRow.id,
                    //     // searchDimension:JSON.stringify($scope.callListResultDim),
                    //     searchDimension:$scope.callListResultDim.toString(),
                    //     modelId:$scope.modelId
                    // };
                    $scope.paramsTemp = $.extend($scope.paramsTemp, $scope.voiceResultPageOptions);
                    // 请求该任务下的所有录音
                    modelService.queryVoiceCallList($scope.paramsTemp).then(function (result) {

                        $scope.headColumsResult = result.value;
                    });
                    return;
                }

                // 展开某一箭头时关闭其他箭头
                if ($scope.thisRow.taskImg) {
                    $scope.closeAllDetailedResult();
                    return;
                }
                else {
                    $scope.closeAllDetailedResult();
                }
                // 只变化当前的箭头
                $scope.thisRow.taskImg = !$scope.thisRow.taskImg;
                if ($scope.thisRow.taskImg == true) { // 展开时
                    // console.log($scope.thisRow.id);// 该条数据的id
                    var params = {
                        pageNum: 1,
                        pageSize: 10,
                        id: $scope.thisRow.id,
                        // searchDimension:JSON.stringify($scope.callListResultDim),
                        searchDimension: $scope.callListResultDim.toString(),
                        modelId: $scope.modelId
                    };
                    // 当从主页热词跳转到该页面时不进行modelId的传值
                    if ($scope.type == 'hotword') {
                        params = {
                            pageNum: 1,
                            pageSize: 10,
                            id: $scope.thisRow.id,
                            // searchDimension:JSON.stringify($scope.callListResultDim),
                            searchDimension: $scope.callListResultDim.toString()
                        };
                    }

                    $scope.voiceResultPageOptions.pageNum = 1;

                    $scope.paramsTemp = params;
                    // 请求该任务下的所有录音
                    modelService.queryVoiceCallList(params).then(function (result) {

                        $scope.headColumsResult = result.value;
                    });
                }
                else { // 关闭时

                }
            };
            // 石勇 新增 关闭所有的任务对应的结果
            $scope.closeAllDetailedResult = function () {
                angular.forEach($scope.callLists, function (item) {
                    item.taskImg = false;
                });
            };

            $scope.winHeight();
        }
    ]);
});
