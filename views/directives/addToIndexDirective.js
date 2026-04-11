/**
 * 发送到首页
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
    app.directive('addtoindex', [
        '$http',
        '$document',
        '$timeout',
        'customIndexService',
        'dialogService', function ($http, $document, $timeout, customIndexService, dialogService) {
            return {
                restrict: 'EA',
                templateUrl: 'directives/addToIndex.htm',
                replace: true,
                scope: {
                    type: '@',
                    config: '=',
                    opType: '=',
                    defaultPage: '=',
                    reportName: '=',
                    recordId: '=',
                    tableDefault: '=',
                    topicId: '=',
                    pathId: '=',
                    data: '=',
                    content: '@'
                },
                link: function (scope, element, attrs) {
                    $timeout(function () {
                        $document.find('input').placeholder();
                    }, 500);
                    var textReplace = new RegExp('^[A-Za-z\\d\\u4E00-\\u9FA5]+$');

                    // 输入内容
                    scope.validInputWord = function (name) {
                        if (!name) {
                            dialogService.alert('展示名称不能为空');
                            return false;
                        }

                        if (name.replace(/[^\x00-\xff]/g, 'xx').length > 20) {
                            dialogService.alert('展示名称不能超过20个字符');
                            return false;
                        }

                        if (scope.type === 'table') {
                            if (!scope.data || !scope.data.length) {
                                dialogService.alert('为空的表格不允许添加到概览页面');
                                return false;
                            }
                        }

                        return true;
                    };

                    scope.$watch('reportName', function (newValue, oldValue) {
                        if (!newValue) {
                            return;
                        }

                        if (newValue) {
                            scope.moduleName = newValue;
                        }

                    });

                    // 发送到首页的报表ID
                    scope.moduleId = '';

                    // 模块类型,报表为1
                    scope.moduleType = 1;

                    // 是否支持多图切换，默认false
                    scope.picturesShow = 0;

                    if (scope.type === 'column') {
                        scope.contentType = 13;
                        scope.chartType = 'lineColumChart';
                        scope.$parent.isSaved = true;
                    }

                    if (scope.type === 'pie') {
                        scope.contentType = 12;
                        scope.chartType = 'pieChart';
                        scope.$parent.isSaved = true;
                    }

                    if (scope.type === 'table') {
                        scope.contentType = 11;
                        scope.chartType = 'table';
                        scope.$parent.isSaved = true;
                    }

                    if (scope.type === 'analysisChart') {
                        scope.chartType = 'lineColumChart';
                        scope.moduleType = 4;
                    }

                    scope.showEdialog = false;

                    scope.showGroups = function () {
                        scope.isOpen = !scope.isOpen;
                    };

                    // 获取自定义首页
                    scope.addToIndex = function () {
                        if (!scope.$parent.canView && scope.type === 'analysisChart') {
                            dialogService.alert('该路径存在已下线的模型／已删除的维度，不可发送到概览！');
                            return;
                        }

                        if (!scope.$parent.isPreview) {
                            dialogService.alert('发送到概览前请先预览！');
                            return;
                        }

                        if (!scope.$parent.isSaved) {
                            dialogService.alert('发送到概览前请先保存专题！');
                            return;
                        }

                        customIndexService.queryCustomHomePageList()
                            .then(function (result) {
                                scope.indexContent = result.value || [];
                                if (!scope.indexContent.length) {
                                    dialogService.alert('概览中无自定义首页，请添加！');
                                    return;
                                }

                                var firstPageId = scope.indexContent[0].id;
                                angular.forEach(scope.indexContent, function (item) {
                                    scope.homepageid = item.id;
                                    scope.pageName = item.pageName;
                                    // 修改页面默认赋值
                                    if ('add' === scope.opType) {
                                        if (scope.homepageid === firstPageId) {
                                            scope.indexName = item.pageName;
                                            scope.pageId = firstPageId;
                                        }
                                    }
                                    else {
                                        if (scope.homepageid === scope.defaultPage) {
                                            scope.indexName = item.pageName;
                                            scope.pageId = scope.defaultPage;
                                        }
                                    }
                                });
                                scope.showEdialog = !scope.showEdialog;
                            });
                    };

                    // 发送到首页
                    scope.save = function () {
                        if (!scope.validInputWord(scope.moduleName)) {
                            return;
                        }

                        var contentParam = {};
                        if (scope.type === 'analysisChart') { // 发送内容为自定义专题时
                            switch (Number(scope.content)) {
                                case 1:
                                    scope.contentType = 43;
                                    break;
                                case 2:
                                    scope.contentType = 41;
                                    break;
                                case 3:
                                    scope.contentType = 44;
                                    break;
                                case 4:
                                    scope.contentType = 42;
                                    break;
                                default:
                                    break;
                            }
                            var params;
                            var url;
                            // if("add" == scope.opType){
                            customIndexService.queryModuleIfSendHomePage({
                                moduleType: 4,
                                moduleId: scope.topicId,
                                moduleDetailInfo: scope.pathId
                            }).then(function (result) {
                                if ('add' == scope.opType) {
                                    if (Number(result.value) === 0) { // 未发送
                                        params = {
                                            moduleName: scope.moduleName,
                                            pageId: scope.pageId,
                                            moduleType: scope.moduleType,
                                            moduleId: scope.topicId,
                                            moduleDetailInfo: scope.pathId,
                                            contentType: scope.contentType,
                                            picturesShow: scope.picturesShow
                                        };
                                        url = customIndexService.savePageRelateModule();
                                    }
                                    else { // 已发送
                                        if (!scope.$parent.canView) {
                                            dialogService.alert('该路径存在已下线的模型／已删除的维度，不可发送到概览！');
                                            return;
                                        }

                                        params = {
                                            moduleName: scope.moduleName,
                                            pageId: scope.pageId,
                                            id: result.value,
                                            contentType: scope.contentType
                                        };
                                        url = customIndexService.updatePageRelateModule();
                                    }
                                    return $http.post(url, params).then(function (response) {
                                        dialogService.alertTo(response.data.message).then(function (value) {
                                            scope.showEdialog = !scope.showEdialog;
                                        });
                                    });
                                }
                                else {
                                    if (Number(result.value) === 0) { // 更新
                                        params = {
                                            moduleName: scope.moduleName,
                                            pageId: scope.pageId,
                                            moduleType: scope.moduleType,
                                            moduleId: scope.topicId,
                                            moduleDetailInfo: scope.pathId,
                                            contentType: scope.contentType,
                                            picturesShow: scope.picturesShow
                                        };
                                        url = customIndexService.savePageRelateModule();
                                    }
                                    else { // 保存
                                        params = {
                                            moduleName: scope.moduleName,
                                            pageId: scope.pageId,
                                            id: scope.recordId,
                                            contentType: scope.contentType
                                        };
                                        url = customIndexService.updatePageRelateModule();
                                    }
                                    scope.operateTion(url, params);
                                }

                            });

                        // }
                        // else{
                        //     if(Number(result.value) === 0){//更新
                        //         params = {
                        //             moduleName: scope.moduleName,
                        //             pageId: scope.pageId,
                        //             moduleType: scope.moduleType,
                        //             moduleId: scope.topicId,
                        //             moduleDetailInfo: scope.pathId,
                        //             contentType : scope.contentType,
                        //             picturesShow : scope.picturesShow
                        //         };
                        //         url = customIndexService.savePageRelateModule();
                        // }else{    //保存
                        //     params = {
                        //         moduleName: scope.moduleName,
                        //         pageId: scope.pageId,
                        //         id:scope.recordId,
                        //         contentType : scope.contentType
                        //     };
                        //     url = customIndexService.updatePageRelateModule();
                        //     }
                        //     scope.operateTion(url, params);
                        // }

                        }
                        else { // 发送内容为报表时
                            contentParam = {
                                timeType: scope.$parent.$parent.timesRange.timeType,
                                timeValue: scope.$parent.$parent.timesRange.timeValue,
                                startTime: scope.$parent.$parent.timesRange.defaultStart,
                                endTime: scope.$parent.$parent.timesRange.defaultEnd
                            };

                            /*石勇 新增 增加默认传值*/
                            if (contentParam.startTime.length < 11) {
                                contentParam.startTime = contentParam.startTime + ' 00:00:00';
                                contentParam.endTime = contentParam.endTime + ' 23:59:59';
                            }

                            // 

                            if (11 == scope.contentType) {
                                contentParam.tableParams = scope.config;
                            }
                            else {
                                // contentParam.chartParams = scope.tableDefault;
                                contentParam.chartParams = scope.config;
                            }
                            var params;
                            var url;
                            if ('add' == scope.opType) {
                                params = {
                                    moduleName: scope.moduleName,
                                    pageId: scope.pageId,
                                    moduleType: scope.moduleType,
                                    moduleId: scope.moduleId,
                                    moduleDetailInfo: scope.pathID,
                                    contentType: scope.contentType,
                                    contentParam: JSON.stringify(contentParam),
                                    picturesShow: scope.picturesShow
                                };
                                url = customIndexService.savePageRelateModule();
                            }
                            else {
                                params = {
                                    moduleName: scope.moduleName,
                                    pageId: scope.pageId,
                                    id: scope.recordId,
                                    contentParam: JSON.stringify(contentParam)
                                };
                                url = customIndexService.updatePageRelateModule();
                            }
                            scope.operateTion(url, params);
                        }
                    };

                    /**
                     * @brief 具体操作
                     * @details [long description]
                     *
                     * @param l [description]
                     * @param s [description]
                     *
                     * @return [description]
                     */
                    scope.operateTion = function (url, params) {
                        return $http.post(url, params).then(function (response) {
                            dialogService.alertTo(response.data.message).then(function (value) {
                                scope.showEdialog = !scope.showEdialog;
                            });
                            // if(response.data.success){
                            //     var $scope = scope;
                            //     while(angular.isUndefined($scope.queryModuleInfoById)){
                            //         $scope = $scope.$parent;
                            //     }

                            //     $scope.queryModuleInfoById();
                            // }
                        });
                    };

                    // 下拉列表首页选择
                    scope.chooseIndex = function (item, index) {
                        scope.pageName = item.pageName;
                        scope.indexName = item.pageName;
                        scope.pageId = item.id;
                        scope.showGroups();
                    };

                    scope.close = function () {
                        scope.showEdialog = false;
                    };

                    // 关闭弹框
                    $(window.document).click(function (event) {
                        if (
                            !angular.element(event.target).parents('.add-toIndex-window').length
                            && !angular.element(event.target).hasClass('add-toIndex-window')
                            && scope.showEdialog) {
                            scope.showEdialog = false;
                        }

                        scope.$apply();
                    });

                }
            };
        }]);
});
