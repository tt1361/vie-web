/**
 * 维度选择弹框(公用组件)
 * @update-author yancai2
 * @mail yancai2@iflytek.com
 * @update-time 2016-07-07
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
    app.controller('dimensionLibsCtrl', [
        '$scope',
        '$document',
        '$timeout',
        'dimensionService',
        'baseService',
        '$rootScope', function ($scope, $document, $timeout, dimensionService, baseService, $rootScope) {
            $timeout(function () {
                $document.find('input').placeholder();
            }, 500);
            $scope.defaultFilter = '';
            $scope.allChecked = true; // 默认全选
            $scope.isTask = $rootScope.isTask;
            if ($scope.isTask === 1 || $scope.isTask === '1') {
                $scope.defaultFilter = 'taskId,duration';
                $scope.defaultColumn = [{
                    key: 'taskId',
                    name: '任务号'
                }, {
                    key: 'duration',
                    name: '通话时长（秒）'
                }];
            }
            else {
                $scope.defaultFilter = 'voiceId,duration';
                $scope.defaultColumn = [{
                    key: 'voiceId',
                    name: '流水号'
                }, {
                    key: 'duration',
                    name: '通话时长（秒）'
                }];
            }
            // 需要保存的维度
            $scope.addDimensions = [];
            // 保存获取的维度传给父级
            $scope.selCallListCulumns = [];
            $scope.checkSearch = false;
            // 获取全部维度信息
            $scope.searchDim = function () {
                var params;
                if (!baseService.validWord($scope.keyword)) {
                    return;
                }

                if ($scope.tim === 1) {
                    params = {keyword: '', reportTypeFlag: 1};
                }
                else {
                    params = {
                        keyword: ''
                    };
                }
                dimensionService.searchDim(params)
                    .then(function (result) {

                        $scope.allDimensions = result.value || [];
                        $scope.dimensions = [];
                        // 通话列表展示维度
                        if ($scope.$parent.from) {
                            if ($scope.$parent.from != 'callList' && $scope.$parent.from != 'previewList') {
                                if ($scope.keyword && '关键词'.indexOf($scope.keyword) > -1) {
                                    $scope.dimensions.push({
                                        key: 'keyword',
                                        name: '关键词',
                                        checked: true,
                                        isSelect: true,
                                        search: true
                                    });
                                }
                                else {
                                    $scope.dimensions.push({
                                        key: 'keyword',
                                        name: '关键词',
                                        checked: true,
                                        isSelect: true
                                    });
                                }
                            }

                            if ($scope.$parent.from === 'previewList') {
                                if ($scope.keyword && '匹配规则'.indexOf($scope.keyword) > -1) {
                                    $scope.dimensions.push({
                                        key: 'keyword',
                                        name: '匹配规则',
                                        checked: true,
                                        isSelect: true,
                                        search: true
                                    });
                                }
                                else {
                                    $scope.dimensions.push({
                                        key: 'keyword',
                                        name: '匹配规则',
                                        checked: true,
                                        isSelect: true
                                    });
                                }
                            }

                            angular.forEach($scope.allDimensions, function (item) {
                                var search = false;
                                if ($scope.keyword && item.name.indexOf($scope.keyword) > -1) {
                                    search = true;
                                }

                                if ((item.key === 'id' || item.key === 'voiceId' || item.key === 'duration' || item.key === 'taskId') ||
                                    ($scope.$parent.from === 'searchList' && item.key === 'timeFormat')) {
                                    var name = item.name;
                                    if ($scope.$parent.from === 'previewList' && (item.key === 'id' || item.key === 'voiceId')) {
                                        name = '流水号';
                                    }
                                    else if (($scope.$parent.from === 'previewList' || $scope.$parent.from === 'callList') && item.key === 'duration') {
                                        name = '通话时长(秒)';
                                    }
                                    else if ($scope.$parent.from === 'callList' && (item.key === 'id' || item.key === 'voiceId')) {
                                        name = '流水号';
                                    }

                                    $scope.dimensions.push({
                                        key: item.key,
                                        name: name,
                                        checked: true,
                                        isSelect: true,
                                        search: search
                                    });
                                }
                                else {
                                    var checked = false;
                                    $.each($scope.$parent.columns, function (index, column) {
                                        if (column.column === item.key) {
                                            checked = true;
                                            return false;
                                        }

                                    });
                                    $scope.dimensions.push({
                                        key: item.key,
                                        name: item.name,
                                        checked: checked,
                                        search: search
                                    });
                                }
                            });
                            if (!$scope.checkSearch) {
                                if ($scope.$parent.tool && $scope.$parent.tool === 'basis') {
                                    dimensionService.queryDimensions({
                                        listType: 5
                                    }).then(function (data) {
                                        if (data.value !== null) {
                                            var selDims = data.value.split(',');
                                        }

                                        angular.forEach($scope.dimensions, function (dim, index) {
                                            angular.forEach(selDims, function (selDim, index) {
                                                if (dim.key === selDim) {
                                                    dim.checked = true;
                                                    $scope.selCallListCulumns.push({
                                                        column: dim.key,
                                                        columnName: dim.name
                                                    });
                                                }

                                            });
                                        });
                                    });
                                }

                                // 石勇 新增 模型模块通话列表的维度与用户绑定问题
                                if ($scope.$parent.tool && $scope.$parent.tool === 'modelCallList') {
                                    dimensionService.queryDimensions({
                                        listType: 6
                                    }).then(function (data) {
                                        if (data.value !== null) {
                                            var ModelDims = data.value.split(',');
                                        }

                                        angular.forEach($scope.dimensions, function (dim, index) {
                                            angular.forEach(ModelDims, function (ModelDim, index) {
                                                if (dim.key === ModelDim) {
                                                    dim.checked = true;
                                                    $scope.selCallListCulumns.push({
                                                        column: dim.key,
                                                        columnName: dim.name
                                                    });
                                                }

                                            });
                                        });
                                    });
                                }

                                // 
                            }
                        }
                        else {
                            $scope.dimensions = $scope.allDimensions;

                            // 导入维度检测是否有已经选中的维度
                            angular.forEach($scope.dimensions, function (item) {
                                angular.forEach($scope.$parent.preDimensions, function (dimension) {
                                    if (item.key === dimension.key) {
                                        item.checked = true;
                                    }

                                });

                                if ($scope.keyword && item.name.indexOf($scope.keyword) > -1) {
                                    item.search = true;
                                }

                            });

                            // 柱状图检测x是否有已经选中的维度
                            angular.forEach($scope.dimensions, function (item) {
                                angular.forEach($scope.$parent.xSelectList, function (dimension) {
                                    if (item.key === dimension.key) {
                                        item.checked = true;
                                        // item.isSelect = true;
                                    }

                                });

                                if ($scope.$parent.xSelected && item.name === $scope.$parent.xSelected) {
                                    item.isSelect = true;
                                }

                                if ($scope.keyword && item.name.indexOf($scope.keyword) > -1) {
                                    item.search = true;
                                }

                            });
                        }

                        angular.forEach($scope.dimensions, function (item) {
                            if (!item.checked) {
                                $scope.allChecked = false;
                            }

                        });
                    });

            };

            /**
             * @brief 选择关键词显示
             * @details [long description]
             *
             * @param  [description]
             * @return [description]
             */
            $scope.chooseKeyWord = function (name) {
                var search = false;
                if ($scope.keyword && name.indexOf($scope.keyword) > -1) {
                    search = true;
                    $scope.dimensions.push($scope.contItem('keyword', name, true));
                }

                $scope.dimensions.push($scope.contItem('keyword', name, search));
            };

            /**
             * @brief 组合对象
             * @details [long description]
             *
             * @param e [description]
             * @param h [description]
             *
             * @return [description]
             */
            $scope.contItem = function (key, name, isSearch) {
                var item = {
                    key: key,
                    name: name,
                    checked: true,
                    isSelect: true,
                    search: isSearch
                };
                return item;
            };

            /**
             * 搜索框监听Enter键
             *
             */
            $scope.enterKey = function (event) {
                event = event || window.event;
                if (event.keyCode == 13) {
                    $scope.checkSearch = true;
                    $scope.searchDim();
                }

            };
            $scope.searchDimFont = function () {
                $scope.checkSearch = true;
                // angular.forEach($scope.dimensions, function(dim){
                //     dim.search = false;
                // });
                // angular.forEach($scope.dimensions, function(item){
                //     if($scope.keyword && item.name.indexOf($scope.keyword)>-1){
                //         item.search = true;
                //     }
                // });
                $scope.searchDim();
            };

            // 全选按钮
            $scope.toggleAllChecked = function () {
                $scope.allChecked = !$scope.allChecked;
                if ($scope.allChecked) {
                    angular.forEach($scope.dimensions, function (item) {
                        item.checked = true;
                    });
                    return;
                }

                angular.forEach($scope.dimensions, function (item) {
                    if ($scope.$parent.from) {
                        if ($scope.$parent.from === 'searchList') {
                            if (item.key != 'id' && item.key != 'voiceId' && item.key != 'duration' && item.key != 'keyword' && item.key != 'timeFormat') {
                                item.checked = false;
                            }
                        }
                        else {
                            if (item.key != 'id' && item.key != 'voiceId' && item.key != 'duration' && item.key != 'keyword') {
                                item.checked = false;
                            }
                        }
                    }
                    else {
                        item.checked = false;
                    }

                    // 石勇 新增 默认不可勾选的在全选的时候不会消失  previewList
                    if ($scope.$parent.xSelected && item.name === $scope.$parent.xSelected) {
                        item.checked = true;
                    }

                    // 石勇 添加一个例外“任务号”
                    // $scope.$parent.xSelected对应的是之前的输入框的值
                    // 如果他的值为undefined，也就是说它的前面是不存在输入框的，这个时候默认勾选任务号
                    if (item.key == 'taskId') {
                        if (angular.isUndefined($scope.$parent.xSelected)) {
                            // 对模型中增加筛选条件时再次进行判断
                            if (angular.isUndefined($scope.$parent.status)) {
                                item.checked = true;
                            }
                        }
                    }

                    // 蔡燕2 更改bug X轴全选取消全选任务号无法被取消选中问题
                    // if ($scope.$parent.from === 'callList') {
                    //     if ($scope.$parent.xSelected && item.name === $scope.$parent.xSelected || item.key == "taskId") {
                    //         item.checked = true;
                    //     }
                    // }else{
                    //     if ($scope.$parent.xSelected && item.name === $scope.$parent.xSelected) {
                    //         item.checked = true;
                    //     }
                    // }

                });

            };

            // 维度保存按钮
            $scope.pushedDimension = function () {
                var result = {
                    pushDim: [],
                    dimeName: []
                };
                if ($scope.$parent.from) {
                    if ($scope.$parent.from === 'searchList') {
                        angular.forEach($scope.dimensions, function (item) {
                            if (item.key != 'id' && item.key != 'voiceId' && item.key != 'duration' && item.key != 'keyword' && item.key != 'timeFormat'
                                && item.checked) {
                                result.pushDim.push(item);
                                result.dimeName.push(item.key);
                            }

                        });
                    }
                    else {
                        angular.forEach($scope.dimensions, function (item) {
                            if (item.key != 'id' && item.key != 'voiceId' && item.key != 'duration' && item.key != 'keyword' && item.key != 'taskId'
                                && item.checked) {
                                result.pushDim.push(item);
                                result.dimeName.push(item.key);
                            }

                        });
                    }
                }
                else {
                    // 石勇 新增 按任务分析，去除维度流水号，按录音分析去除任务号
                    // $rootScope.isTask ,值为1，按任务，值为0 按录音
                    if ($rootScope.isTask) {
                        angular.forEach($scope.dimensions, function (item, index) {
                            if (item.key == 'voiceId') {
                                $scope.dimensions.splice(index, 1);
                            }

                        });
                    }
                    else {
                        angular.forEach($scope.dimensions, function (item, index) {
                            if (item.key == 'taskId') {
                                $scope.dimensions.splice(index, 1);
                            }

                        });
                    }
                    // 
                    angular.forEach($scope.dimensions, function (item) {
                        if (item.checked) {
                            result.pushDim.push(item);
                            result.dimeName.push(item.key);
                        }

                    });
                }

                var filter;
                if (result.dimeName.length != 0) {
                    filter = $scope.defaultFilter + ',' + result.dimeName.join(',');
                }
                else {
                    filter = $scope.defaultFilter;
                }
                if ($scope.$parent.tool && $scope.$parent.tool === 'basis') {
                    dimensionService.saveFiltersOrDimension({
                        // userId: $rootScope.userId,
                        filterType: 0,
                        listType: 5,
                        filter: filter
                    });
                    angular.forEach(result.pushDim, function (pushDim, index, arr) {
                        $scope.defaultColumn.push(pushDim);
                    });
                    result.pushDim = $scope.defaultColumn;
                    $scope.closeThisDialog(result);
                }
                else if ($scope.$parent.tool && $scope.$parent.tool === 'modelCallList') { // 石勇 保存维度时判断是否是模型模块的
                    dimensionService.saveFiltersOrDimension({
                        // userId: $rootScope.userId,
                        filterType: 0,
                        listType: 6,
                        filter: filter
                    });
                    angular.forEach(result.pushDim, function (pushDim, index, arr) {
                        $scope.defaultColumn.push(pushDim);
                    });
                    // console.log($scope.defaultColumn);
                    result.pushDim = $scope.defaultColumn;
                    $scope.closeThisDialog(result);
                }

                $scope.closeThisDialog(result);
                // 
            };

            $scope.$on('colResizable', function (ngRepeatFinishedEvent) {
                var scrollTo = $document.find('.redFont').first();
                var container = $('.push-model-content .content-wrap');
                if (scrollTo.length) {
                    container.scrollTop(
                        scrollTo.offset().top - container.offset().top + container.scrollTop()
                    );
                }

            });

            $scope.searchDim();

        }
    ]);

});
