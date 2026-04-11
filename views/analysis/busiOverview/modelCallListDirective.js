/**
 * 本文件实现依赖任何一个 Angular 的module, 如果不采用本系统的框架，
 *      可以可以在  factory(window.app) app 修改你所创建的模块名称
 *  @dependece: Angular Module
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
     * 业务概览列表指令
     */
    app.directive('modelCallList', [
        '$http',
        '$timeout',
        '$q',
        'ngDialog',
        'dialogService',
        'topicService',
        '$rootScope', function ($http, $timeout, $q, ngDialog, dialogService, topicService, $rootScope) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'analysis/busiOverview/model-call-list.htm',
                transclude: true,
                scope: {
                    timesRange: '='
                },
                link: function (scope, element, attrs) {
                    scope.browser = $rootScope.getBowerserInfo();
                    scope.groupType = parseInt(attrs.groupType, 10);
                    scope.currentModel = -1;
                    scope.params = {};
                    // 监听模型变更
                    scope.$on('model-changed', function (e, d) {
                        scope.selectedModel = d;
                        // scope.params.topicGroupType = attrs.groupType;
                        scope.params.id = d.modelId;
                        scope.params.modelOrGroup = d.modelOrGroup;
                        if (d.parentId) {
                            scope.params.parentGroupId = d.parentId;
                        }

                        resetData();
                        getCallList();
                        scope.currentModel = d.modelId;
                    });

                    scope.$on('date-changed', function (e, d) {
                        scope.params = $.extend(scope.params, d);
                        resetData();
                    });

                    scope.allchecked = false;
                    scope.dialogShow = false;
                    scope.btnUp = 'id';
                    scope.trSlected = -1;

                    scope.sortParams = {
                        sortColumn: 'id',
                        sortType: 'asc'
                    };

                    // 标识通话列表展示维度
                    scope.from = 'callList';

                    /**
                     * [setDimension 打开模型维度弹出框]
                     */
                    // 重置数据
                    resetData();

                    scope.columns = [];

                    /**
                     * [setDimension 打开维度弹出框]
                     */
                    scope.setDimension = function () {
                        ngDialog.open({
                            template: 'analysis/detail/dimension-libs-directive.htm',
                            controller: 'dimensionLibsCtrl',
                            scope: scope,
                            showClose: false,
                            closeByEscape: false,
                            closeByDocument: true,
                            disableAnimation: true,
                            className: 'ngdialog-theme-default ngdialog-theme-model-push'
                        }).closePromise.then(function (dialog) {
                            // 当弹出层关闭后，自动更新 维度对象
                            if (angular.isUndefined(dialog.value) || dialog.value === '$document') {
                                return;
                            }

                            scope.columns = [];
                            angular.forEach(dialog.value.pushDim, function (item) {
                                scope.columns.push({
                                    column: item.key,
                                    columnName: item.name
                                });
                            });

                            getCallList();

                        });
                    };

                    // 标记库
                    scope.markerLibShow = function () {
                        ngDialog.open({
                            template: 'analysis/detail/marker-lib-dia.htm',
                            controller: 'markerLibDiaCtrl',
                            scope: scope,
                            showClose: true,
                            closeByEscape: false,
                            closeByDocument: false,
                            disableAnimation: true,
                            className: 'ngdialog-theme-default ngdialog-theme-model ngdialog-theme-markerlib'
                        });
                    };

                    // 给父级菜单赋值
                    scope.setParams = function () {
                        item.callListDimensions = scope.columns;
                    };
                    // 获取父级菜单的值
                    scope.getParams = function () {
                        var pscope = scope;
                        while (angular.isUndefined(pscope.tabPaths)) {
                            pscope = pscope.$parent;
                        }
                        angular.forEach(pscope.tabPaths, function (item) {
                            if (item.pathId === scope.pathId) {
                                scope.columns = item.callListDimensions || [];
                                return;
                            }

                        });
                    };

                    scope.$on('read-all', function () {
                        resetData();
                        getCallList();
                    });

                    scope.readCall = function (call) {
                        if (!call.dataMaps.isRead) {
                            if (parseInt(attrs.groupType, 10) == 1) {
                                var model = scope.selectedModel;
                                var params = {
                                    callId: call.id,

                                    /*modelOrGroup: model.modelOrGroup,*/
                                    callTime: call.dataMaps.dimDay,
                                    modelIdListStr: call.dataMaps.modelIdList
                                };

                                /*if (model.modelOrGroup == 0) {
                                    params.modelId = model.modelId;
                                    params.parentGroupId = model.parent.modelId;
                                } else{
                                    params.parentGroupId = model.modelId;
                                }
*/
                                topicService.setCallRead(params)
                                    .then(function (result) {
                                        call.dataMaps.isRead = true;
                                        scope.$emit('read-call', {});
                                    });
                            }
                        }

                    };

                    /**
                     * [getCallList 获取通话列表]
                     * @param  {[type]} params [description]
                     * @return {[type]}        [description]
                     */
                    var getCallList = function () {
                        var params = $.extend(scope.params, scope.pageOptions, scope.sortParams, {
                            searchDimension: JSON.stringify(scope.columns),
                            beginDate: scope.timesRange.defaultStart,
                            endDate: scope.timesRange.defaultEnd
                        });
                        var url = topicService.getCallList();
                        if (scope.groupType == 1) {
                            url = topicService.getPushCallList();
                        }

                        return $http.post(url, params).then(function (response) {
                            if (response.data.success && response.status === 200) {
                                scope.allchecked = false;
                                scope.headColums = response.data.value.columns || [];
                                scope.callLists = response.data.value.previewList.rows || [];
                                scope.counts = response.data.value.totalCount;
                                scope.idCulumns = [];
                                scope.markCulumns = [];
                                scope.dimCulumns = [];
                                angular.forEach(scope.headColums, function (item) {
                                    if (item.column === 'id') {
                                        scope.idCulumns.push(item);
                                    }

                                    if (item.column === 'mark') {
                                        scope.markCulumns.push(item);
                                    }

                                    if (item.column !== 'mark') {
                                        scope.dimCulumns.push(item);
                                    }

                                });

                                if (scope.callLists.length) {
                                    return $q.reject(response);
                                }

                                if (scope.pageOptions.pageNum === 1 && response.data.value.totalRows === 0) {
                                    return $q.reject(response);
                                }

                                return response;
                            }

                            dialogService.alert(response.data.message);
                            return $q.reject(false);
                        }).then(function () {
                            scope.pageOptions.pageNum = scope.pageOptions.pageNum - 1;
                            if (scope.pageOptions.pageNum > 0) {
                                getCallList();
                            }

                        });
                    };

                    // 全选功能
                    scope.checkAll = function () {
                        scope.allchecked = !scope.allchecked;
                        angular.forEach(scope.callLists, function (item) {
                            item.checked = scope.allchecked;
                        });
                    };

                    /***
                     *
                     *  选中单个
                     */
                    scope.checkedThis = function (item) {
                        if (!item.checked) {
                            scope.allchecked = false;
                            return;
                        }

                        var allchecked = true;
                        $.each(scope.callLists, function (key, item) {
                            if (!item.checked) {
                                allchecked = false;
                                return false;
                            }

                        });

                        scope.allchecked = allchecked;
                    };

                    /**
                     * 获取选中的项
                     */
                    scope.getCheckedIds = function () {
                        var deferred = $q.defer();

                        $timeout(function () {
                            var serialNumbers = [];
                            $.each(scope.callLists, function (key, item) {
                                if (item.checked) {
                                    serialNumbers.push(item.serialNumber);
                                }

                            });
                            if (serialNumbers.length) {
                                deferred.resolve(serialNumbers);
                            }
                            else {
                                dialogService.alert('至少选择一条记录');
                                deferred.reject(serialNumbers);
                            }
                        });
                        return deferred.promise;
                    };

                    // 打开弹出框
                    scope.openRemark = function (item, index) {
                        scope.dialogShow = true;
                        scope.trSlected = index;
                        scope.remarkSerialNumber = item.dataMaps.id;
                        if (item.dataMaps.isHaveRemark) {
                            scope.remarkContent = item.dataMaps.remark;
                        }
                        else {
                            scope.remarkContent = '';
                        }
                    };

                    // 关闭弹出框
                    scope.cancleRemark = function () {
                        scope.dialogShow = false;
                        scope.trSlected = -1;
                    };

                    // 确定键
                    scope.okRemark = function () {
                        // if (scope.remarkContent != "") {
                        var param = {
                            topicId: scope.topicId,
                            telephonId: scope.remarkSerialNumber,
                            mark: scope.remarkContent
                        };
                        if (param.mark) {
                            if (param.mark.replace(/[^\x00-\xff]/g, 'xx').length > 20) {
                                dialogService.alert('备注不能超过20个字符！');
                                return $q.reject(false);
                            }
                        }

                        topicService.addMark(param)
                            .then(function (result) {
                                scope.dialogShow = false;
                                scope.trSlected = -1;
                            });
                        scope.getCallList();
                    };

                    /**
                     * [remarkSort 排序]
                     * @param  {[type]} order     [description]
                     * @param  {[type]} orderType [description]
                     * @return {[type]}           [description]
                     */
                    scope.remarkSort = function (order, orderType) {
                        if (orderType === 'asc') {
                            scope.btnUp = order;
                            scope.btnDown = '';
                        }
                        else {
                            scope.btnUp = '';
                            scope.btnDown = order;
                        }

                        scope.sortParams = {
                            sortColumn: order,
                            sortType: orderType
                        };
                        getCallList();
                    };

                    /**
                     * 翻页的时候请求的的函数
                     *  @params:
                     *      param: Object; 翻页的一些参数
                     *   该方法共分页参数  directive 调用
                     *
                     */
                    scope.paging = function () {
                        getCallList();
                    };

                    scope.$watch('pathId', function (newValue, oldValue) {
                        if (newValue) {
                            scope.getParams();
                            scope.getCallList();
                        }

                    });

                    // 重置参数
                    function resetData() {
                        scope.pageOptions = {
                            pageNum: 1,
                            pageSize: 10
                        };
                    }
                }
            };
        }
    ]);

});
