/**
 *  自定义专题-聚类工具
 *  @update yancai2
 *  @mail yancai2@iflytek.com
 *  @time 2017-06-22
 */

(function (factory) {
    if (typeof define === 'function' && !!define.amd) {
        define([
            'app',
            'echarts-all'
        ], factory);
    }
    else {
        factory(window.app);
    }
})(function (app) {
    app.directive('clusteringResult', ['$http', '$timeout', '$q', '$rootScope', 'ngDialog', 'dialogService', 'topicService', function ($http, $timeout, $q, $rootScope, ngDialog, dialogService, topicService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'analysis/detail/clustering/clustering-result-directive.htm',
            transclude: true,
            scope: {
                pathId: '=', // 路径id
                topicId: '=',
                assignAuth: '@'
            },
            link: function (scope, element, attrs) {
                // 获取浏览器信息
                scope.browser = $rootScope.getBowerserInfo();
                scope.isAnalysisTask = $rootScope.isTask;
                scope.curTaskId = '';
                scope.colors = ['#EFCB48', '#FF8587', '#A5CF66', '#3ADFE7', '#F17452'];
                // 初始化数据
                scope.preData = function () {
                    // 聚类是否完成
                    scope.clusteringFinished = false;
                    // 聚类是否失败
                    scope.clusterFailed = false;
                    // 是否开始聚类
                    scope.isStartClustering = false;
                    // 当前选中类id
                    scope.selectedClusteringId = 0;
                    // 选中层级
                    scope.selectedHierarchy = '1';
                    // 已选择的深度钻取的类
                    scope.selectedDrill = [];
                    // 聚类进度提示
                    scope.clusterProcessText = '0%';
                    // 聚类路径
                    scope.togetherPath = [];

                    // 匹配通话全选标识
                    scope.allchecked = false;
                    scope.dialogShow = false;
                    scope.btnUp = 'id';
                    // 选择维度弹窗
                    scope.openDimensionSel = false;
                    scope.demission = [];
                    scope.manual = false;
                    resetData();
                };

                scope.preData();
                // 颜色值
                var color = '#EFCB48';
                var num = 1;
                var time;

                // 当离开这个页面的时候将弹窗关闭
                scope.$on('$destroy', function () {
                    clearInterval(time);
                });

                // 判断是否有聚类操作
                scope.hasClustering = function () {
                    topicService.getClusterStatus({cid: scope.selectedClusteringId, pid: scope.pathId})
                        .then(function (result) {
                            clearInterval(time);
                            scope.clusterProcessText = result.value ? '0%' : num + '%';
                            scope.isStartClustering = result.value ? false : true;
                            scope.clusteringFinished = result.value === 1 ? true : false;
                            if (result.value === 1) { // 已完成
                                num = 1;
                                // 开始请求聚类结果
                                initClusterPie(topicService.getClusterInfoFromPia());
                                scope.ifClusterSuccess = true;

                                /*等绘制结束，向上传递数据*/
                                scope.emitBase64();
                                // setTimeout(function(){
                                //     scope.emitBase64();
                                // },1500);
                                scope.$emit('clusterStatus', 1);
                            }
                            else if (result.value === 2) {
                                // 没有聚类操作
                                scope.$emit('clusterStatus', 2);
                            }
                            else if (result.value === 0) { // 未完成
                                if (num <= 98) {
                                    num++;
                                }

                                time = setInterval(scope.hasClustering, 8000);
                                scope.manual = false;
                                scope.$emit('clusterStatus', 0);
                            }
                            else {
                                num = 1;
                                if (Number(scope.$parent.resultType) === 2) {
                                    if (result.value === 3) { // 聚类失败
                                        scope.clusterFailed = true;
                                        dialogService.alert('聚类失败');
                                        scope.$emit('clusterStatus', 3);
                                    }
                                    else if (result.value === 4) {
                                        dialogService.alert('没有聚类数据');
                                        scope.$emit('clusterStatus', 4);
                                    }
                                    else if (result.value === 5) {
                                        scope.selectedDrill = [];
                                        scope.selectedClusteringId = 0;
                                        dialogService.alert('路径条件已经修改，请重新保存后进行聚类');
                                    }
                                }

                                scope.manual = false;
                            }
                        });
                };

                // 接收广播监听
                scope.$on('cluster', function (event, data) {
                    if (!data.pathId) {
                        return;
                    }

                    scope.pathId = data.pathId;
                    scope.preData();
                    scope.getParams();
                    scope.selectedClusteringId = 0;
                    scope.hasClustering();
                });

                // 接收广播监听，刷新图表
                scope.$on('flushCluster', function (event, data) {
                    if (!data.pathId) {
                        return;
                    }

                    scope.pathId = data.pathId;
                    scope.preData();
                    scope.togetherPath = [];
                    scope.selectedClusteringId = 0;
                    scope.selectedDrill = [];
                    scope.clusteringFinished = true;
                    scope.setParams();
                    scope.getParams();
                    scope.isStartClustering = false;
                    scope.startClustering(true, true);
                });

                /**
                 * 开始聚类
                 * @return {[type]} [description]
                 */
                scope.startClustering = function (flag, trag) {
                    scope.isStartClustering = flag;
                    topicService.createCluster({
                        cid: scope.selectedClusteringId,
                        pid: scope.pathId,
                        flushTime: trag
                    }).success(function (result) {
                        if (result.success) {
                            if (result.value === 0) { // 如果可以进行聚类
                                num = 1;
                                scope.hasClustering();
                                return;
                            }
                            else if (result.value === 1) { // 已经聚类过
                                // 开始请求聚类结果
                                scope.hasClustering(); // 聚类失败也属于聚类过，再次聚类也许判断聚类状态
                                initClusterPie(topicService.getClusterInfoFromPia());
                                return;
                            }
                            else if (result.value === 5) { // 已经聚类过,但是路径条件已改变
                                scope.selectedClusteringId = 0;
                                dialogService.alert('路径条件已经修改，请重新保存后进行聚类');
                                scope.clusterProcessText = '0%';
                                scope.isStartClustering = false;
                                scope.clusteringFinished = false;
                                scope.selectedDrill = [];
                                scope.manual = false;
                                return;
                            }
                        }

                        dialogService.alert('无法聚类');
                        scope.clusterProcessText = '0%';
                        scope.isStartClustering = false;
                        scope.clusteringFinished = false;
                        scope.manual = false;
                    });
                };

                /**
                 * 深度钻取
                 * @return null
                 */
                scope.deepDrill = function () {
                    // 深度钻取默认选中第一项
                    scope.selectedHierarchy = scope.selectedHierarchy + '.1';
                    scope.clusteringFinished = false;
                    scope.sortParams.sortColumn = 'id';
                    scope.sortParams.sortType = 'asc';
                    scope.pageOptions.pageNum = 1;
                    angular.forEach(scope.selectedDrill, function (item) {
                        if (scope.selectedHierarchy === item.hierarchyIndex) { // 表示已经聚类过
                            scope.clusteringFinished = true;
                            scope.switchDrillDrop(item);
                            return;
                        }

                    });
                    if (!scope.clusteringFinished) {
                        // 开始请求聚类结果
                        scope.clusteringFinished = true;
                        scope.startClustering(true, false);
                    }

                    // 向上传递图表base64

                };

                /**
                 * 聚类层级切换
                 * @param  {[object]} item [当前项]
                 * @return null
                 */
                scope.switchDrillDrop = function (item) {
                    scope.pageOptions.pageNum = 1;
                    scope.sortParams.sortColumn = 'id';
                    scope.sortParams.sortType = 'asc';
                    scope.selectedHierarchy = item.hierarchyIndex;
                    scope.selectedClusteringId = item.hierarchyId;
                    if (item.hierarchyId) {
                        scope.selectedHierarchyOneId = item.hierarchyId;
                    }

                    // 开始请求聚类结果
                    initClusterPie(topicService.getClusterInfoFromPath());
                    // 向上传递图表base64
                    if (scope.ifClusterSuccess) {
                        scope.emitBase64();
                        // setTimeout(function(){

                        //         },1000);
                    }

                };

                // 初始化聚类热点
                var initClusterPoint = function () {
                    // 请求热点数据
                    topicService.getHotviewById({
                        clusterId: scope.selectedClusteringId
                    })
                        .then(function (response) {
                            if (response.status === 200 && response.data.success) {
                                var result = eval('(' + response.data.value + ')') || '';
                                if (result.nodes.length && result.links.length) {
                                    renderClusteringPointChart(result);
                                }

                                scope.manual = true;
                                $timeout(function () {
                                    scope.$broadcast('lastFlushTime', {
                                        contentType: 2
                                    });
                                }, 500);

                                /**
                                 * 将svg转化为canvas
                                 */
                                setTimeout(function () {
                                    var code = clusteringTypeChart.getChartHTML();
                                    canvg(document.getElementById('clusteringTypeChartCanvas'), code);
                                }, 1000);
                                return;
                            }

                            dialogService.alert('聚类失败');
                            scope.clusterFailed = true;
                            scope.manual = false;
                        });
                };

                // 初始化聚类饼图
                var initClusterPie = function (url) {
                    $http.post(url, {cid: scope.selectedClusteringId, pid: scope.pathId})
                        .then(function (data) {
                            if (data.data.success) {
                                scope.isStartClustering = false;
                                scope.clusteringFinished = true;
                                var result = data.data.value || [];
                                if (!result.length) {
                                    return;
                                }

                                $.each(result, function (key, item) {
                                    if (item.selected) {
                                        scope.selectedClusteringId = item.clusterId;
                                        scope.selectedHierarchy = item.cluNum;
                                        color = scope.colors[key % scope.colors.length];
                                    }

                                });
                                scope.dreepData(scope.selectedClusteringId, result[0].name);

                                // 渲染饼图
                                // setTimeout(function () {
                                //    renderClusteringTypeChart(result);
                                // },200);
                                renderClusteringTypeChart(result);
                            }
                            else {
                                dialogService.alert('聚类失败');
                                scope.isStartClustering = false;
                                scope.clusteringFinished = false;
                                scope.clusterFailed = true;
                            }
                        });
                };

                /**
                 * 渲染聚类类别饼图
                 * @param  {[string]} id   [容器id]
                 * @param  {[object]} data [要渲染的数据]
                 */
                var clusteringTypeChart;
                var renderClusteringTypeChart = function (data) {
                    var series = [{
                        type: 'pie',
                        data: data
                    }];
                    clusteringTypeChart = new Highcharts.Chart({
                        chart: {
                            renderTo: 'clusteringTypeChart_' + scope.pathId,
                            zoomType: 'pie',
                            color: '#fbfbfb'
                        },
                        exporting: {
                            enabled: false
                        },
                        title: {
                            text: ''
                        },
                        tooltip: {
                            enabled: true
                        },
                        credits: {
                            enabled: false
                        },
                        loading: false,
                        plotOptions: {
                            pie: {
                                allowPointSelect: true,
                                cursor: 'pointer',
                                colors: scope.colors,
                                center: ['49%', '50%'],
                                dataLabels: {
                                    enabled: true,
                                    style: {
                                        fontFamily: '微软雅黑',
                                        fontSize: '12px',
                                        fontWeight: 'normal'
                                    },
                                    color: '#3E3E3E',
                                    connectorWidth: 2,
                                    format: '<b>{point.cluNum}</b>：{point.name}'
                                },
                                point: {
                                    events: {
                                        click: function (event) {
                                            color = this.color;
                                            scope.selectedHierarchy = this.cluNum;
                                            scope.selectedClusteringId = this.clusterId;
                                            if (!this.selected) {
                                                this.select();
                                                this.sliced = true;
                                                scope.pageOptions.pageNum = 1;
                                                scope.sortParams.sortColumn = 'id';
                                                scope.sortParams.sortType = 'asc';
                                                scope.dreepData(this.clusterId, this.name);
                                            }

                                            return false;
                                        }
                                    }
                                }
                            }

                        },
                        series: series
                    });
                };

                // 钻取后数据的处理
                scope.dreepData = function (clusterId, name) {
                    var index = $rootScope.myInArray(scope.selectedDrill, 'hierarchyIndex', scope.selectedHierarchy);
                    if (index === -1) { // 已经选择的深度钻取不在数组中
                        scope.selectedDrill.push({
                            hierarchyIndex: scope.selectedHierarchy, // 选择层级序号
                            hierarchyId: clusterId // 选择层级的当前类id
                        });
                    }

                    var isSelect = false;
                    angular.forEach(scope.togetherPath, function (item) {
                        if (Number(item.togetherId) === clusterId) {
                            isSelect = true;
                            return;
                        }

                    });
                    if (!isSelect) {
                        scope.togetherPath.push({
                            togetherId: clusterId,
                            togetherIndex: scope.selectedHierarchy,
                            togetherName: name
                        });
                    }

                    // 设置初始化参数
                    scope.setParams();
                    // 初始化热点
                    initClusterPoint();
                    // 初始化匹配通话
                    scope.getCallList({});
                };

                /**
                 * 渲染聚类关系图
                 * @param  {[string]} id   [容器id]
                 * @param  {[object]} data [要渲染的数据]
                 */
                var renderClusteringPointChart = function (data) {
                    var option = {
                        series: [{
                            type: 'force',
                            name: '聚类',
                            ribbonType: false,
                            draggable: false,
                            itemStyle: {
                                normal: {
                                    label: {
                                        show: true,
                                        textStyle: {
                                            color: '#000',
                                            fontFamily: '微软雅黑',
                                            fontSize: '12px'
                                        }
                                    },
                                    nodeStyle: {
                                        brushType: 'both',
                                        borderWidth: 0,
                                        color: color
                                    },
                                    linkStyle: {
                                        type: 'line',
                                        color: color,
                                        width: 1
                                    }
                                },
                                emphasis: {
                                    label: {
                                        show: false
                                    },
                                    nodeStyle: {},
                                    linkStyle: {}
                                }
                            },
                            useWorker: false,
                            minRadius: 15,
                            maxRadius: 30,
                            gravity: 1,
                            scaling: 0.7,
                            roam: 'move',
                            nodes: data.nodes,
                            links: data.links
                        }]
                    };
                    echarts.init(document.getElementById('clusteringResultChart_' + scope.pathId)).setOption(option);
                    echarts.init(document.getElementById('clusteringResultChartExport_' + scope.pathId)).setOption(option);
                };

                /******************************匹配通话************************************/

                // 传递到后台维度参数
                scope.columns = [];
                scope.childColumn = [];
                // 一句任务查询通话列表默认传参
                scope.defaultTaskCallParams = 'voiceId,duration';
                scope.defaultTaskCallParamsLast = ',keyword,modelName';
                // 标识通话列表展示维度
                scope.from = 'callList';

                /**
                 * [setDimension 维度弹出框]
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
                        if (angular.isUndefined(dialog.value) || dialog.value == '$document') {
                            return;
                        }

                        scope.columns = [];
                        scope.childColumn = [];
                        angular.forEach(dialog.value.pushDim, function (item) {
                            if (item.key != 'taskId') {
                                scope.columns.push({
                                    column: item.key,
                                    columnName: item.name
                                });
                                scope.childColumn.push(item.key);
                            }

                        });
                        scope.getCallList();
                        scope.setParams();
                    });
                };

                // 给父级菜单赋值
                scope.setParams = function () {
                    var pscope = scope;
                    while (angular.isUndefined(pscope.tabPaths)) {
                        pscope = pscope.$parent;
                    }
                    if (pscope.tabPaths) {
                        angular.forEach(pscope.tabPaths, function (item) {
                            if (item.pathId === scope.pathId) {
                                item.togetherDimensions = scope.columns;
                                item.togetherPath = scope.togetherPath;
                                return;
                            }

                        });
                    }

                };

                // 获取父级菜单的值
                scope.getParams = function () {
                    var pscope = scope;
                    while (angular.isUndefined(pscope.tabPaths)) {
                        pscope = pscope.$parent;
                    }
                    scope.selectedDrill = [];
                    if (pscope.tabPaths) {
                        angular.forEach(pscope.tabPaths, function (item) {
                            if (item.pathId === scope.pathId) {
                                scope.columns = item.togetherDimensions || [];
                                scope.togetherPath = item.togetherPath || [];
                                angular.forEach(scope.togetherPath, function (toge) {
                                    var index = $rootScope.myInArray(scope.selectedDrill, 'hierarchyIndex', toge.togetherIndex);
                                    if (index === -1) {
                                        scope.selectedDrill.push({
                                            hierarchyIndex: toge.togetherIndex,
                                            hierarchyId: toge.togetherId
                                        });
                                    }

                                });
                                return;
                            }

                        });
                    }

                };

                /**
                 * [getCallList 获取通话列表]
                 * @param  {[type]} params [description]
                 * @return {[type]}        [description]
                 */
                scope.getCallList = function (params) {
                    scope.curTaskId = '';
                    params = $.extend(params, scope.pageOptions, scope.sortParams, {
                        topicId: scope.topicId,
                        pathId: scope.pathId,
                        togatherId: scope.selectedClusteringId,
                        searchDimension: JSON.stringify(scope.columns)
                    });
                    return topicService.getTogatherData(params)
                        .then(function (result) {

                            /*聚类通话列表导出数据向上传递*/
                            scope.$emit('clusterCallImport', {params: params, totalCount: result.value.totalCount});

                            scope.childColumn = [];
                            angular.forEach(scope.columns, function (column, index, arr) {
                                scope.childColumn.push(column.column);
                            });
                            scope.headColums = result.value.columns || [];
                            scope.idCulumns = [];
                            scope.dimCulumns = [];
                            angular.forEach(scope.headColums, function (item) {
                                if (item.column === 'id') {
                                    scope.idCulumns.push(item);
                                }

                                // if (item.column != 'id' && item.column != 'mark' && item.column != 'keyword') {
                                //    scope.dimCulumns.push(item);
                                // }
                                if (item.column != 'id' && item.column != 'mark') {
                                    scope.dimCulumns.push(item);
                                }

                            });
                            scope.callLists = result.value.previewList.rows || [];
                            scope.counts = result.value.totalCount || 0;
                            if (scope.callLists.length > 0) {
                                return $q.reject(result);
                            }

                            if (scope.pageOptions.pageNum === 1 && result.value.totalRows === 0) {
                                return $q.reject(result);
                            }

                            return result;
                        }).then(function () {
                        scope.pageOptions.pageNum = scope.pageOptions.pageNum - 1;
                        if (scope.pageOptions.pageNum > 0) {
                            scope.getCallList();
                        }

                    });

                };

                scope.getTaskOfCallList = function (params) {
                    var curDimension;
                    if (scope.childColumn.join(',') == '') {
                        curDimension = 'voiceId,duration,keyword,modelName';
                    }
                    else {
                        curDimension = scope.defaultTaskCallParams + ',' + scope.childColumn.join(',') + scope.defaultTaskCallParamsLast;
                    }
                    params = $.extend(params, scope.childPageOptions, {
                        id: scope.curTaskId,
                        searchDimension: curDimension
                    });
                    return topicService.getCallFilter(params)
                        .then(function (result) {
                            scope.taskCallColumns = result.value.columns;
                            scope.taskCallLists = result.value.rows;
                            scope.taskCallListsCount = result.value.total;
                            // scope.taskCallListsCount = 0;

                        });
                };
                // 展开闭合通话列表
                scope.onGetTaskOfCallList = function (task, colums, e) {
                    var target = e.target;
                    var close = $(target).hasClass('triangle-right'); // 要是有这个类，说明是没有点开二级table
                    var _$childTable = $('#childTable');
                    if (close) {
                        $(target).removeClass('triangle-right').addClass('triangle-bottom');

                        /*初始化二级table当前页数*/
                        scope.childPageOptions = {
                            pageNum: 1,
                            pageSize: 10
                        };

                        /*渲染任务下通话列表数据*/
                        scope.curTaskId = task.dataMaps.id;
                        scope.getTaskOfCallList();
                    }
                    else {
                        scope.curTaskId = '';
                        $(target).removeClass('triangle-bottom').addClass('triangle-right');
                    }
                    $(target).parent().parent().parent().parent().siblings().find('.triangle').removeClass('triangle-bottom').addClass('triangle-right');
                };

                /**
                 * [remarkindex 排序]
                 * @param  {[type]} order     [description]
                 * @param  {[type]} orderType [description]
                 * @return {[type]}           [description]
                 */
                scope.remarkindex = function (order, orderType) {
                    if (orderType == 'asc') {
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
                    scope.getCallList();
                };

                scope.markClusterView = function (e) {
                    $(e.target).addClass('visited');
                    return true;
                };

                // 重置参数
                function resetData() {
                    // 匹配通话分页
                    scope.pageOptions = {
                        pageNum: 1,
                        pageSize: 10
                    };
                    // 排序
                    scope.sortParams = {
                        sortColumn: 'id',
                        sortType: 'asc'
                    };
                }

                scope.markListView = function (e) {
                    $(e.target).addClass('visited');
                    return true;
                };

                /*将HTML转化为base64*/
                scope.divToBase64 = function () {
                    var deferred = $q.defer();
                    var canvasContent = document.getElementById('clusteringContentCanvas');
                    html2canvas(canvasContent, {
                        onrendered: function (canvas) {
                            // 添加属性
                            // canvas.setAttribute('id','thecanvas');
                            // console.log(canvas.toDataURL());
                            deferred.resolve(canvas.toDataURL());
                            // 读取属性值
                            // canvas.setAttribute('id','thecanvas');
                            // document.getElementById('images').appendChild(canvas);
                        }
                    });
                    return deferred.promise;
                };

                /*向上传递生成图形base64*/
                scope.emitBase64 = function () {
                    // 将svg转化为canvas
                    setTimeout(function () {
                        var code = clusteringTypeChart.getChartHTML();
                        canvg(document.getElementById('clusteringTypeChartCanvas'), code);
                    }, 1000);
                    // 将HTML文档转化为canvas
                    setTimeout(function () {
                        scope.divToBase64().then(function (base64) {
                            // console.log(base64);
                            scope.$emit('clusterCanvasCode', {
                                imgCode: base64,
                                clusteringFinished: scope.clusteringFinished
                            });
                        });
                    }, 1500);

                };

            }
        };
    }]);
});
