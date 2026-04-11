/**
 * 本文件实现依赖任何一个 Angular 的module, 如果不采用本系统的框架，
 *      可以可以在  factory(window.app) app 修改你所创建的模块名称
 *  @dependece: Angular Module
 *
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

    app.directive('analysisCluster', ['$http', 'dialogService', 'topicService', function ($http, dialogService, topicService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'index/custom/analysis-cluster-directive.htm',
            transclude: true,
            scope: {
                item: '=',
                index: '@'
            },
            link: function (scope, element, attrs) {
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
                // 聚类进度提示
                scope.clusterProcessText = '0%';
                // 颜色值
                var color = '#EFCB48';
                var time;

                /**
                 * 当离开这个页面的时候将弹窗关闭
                */
                scope.$on('$destroy', function () {
                    clearInterval(time);
                });

                /**
                 *判断是否有聚类操作
                */
                scope.hasClustering = function () {
                    topicService.getClusterStatus({
                        cid: scope.selectedClusteringId,
                        pid: Number(scope.item.pathId)
                    }).then(function (result) {
                        clearInterval(time);
                        scope.clusterProcessText = result.value ? '0%' : scope.$parent.$parent.num + '%';
                        scope.isStartClustering = result.value ? false : true;
                        scope.clusteringFinished = result.value === 1 ? true : false;
                        if (result.value === 1) { // 已完成
                            scope.$parent.$parent.num = 1;
                            // 开始请求聚类结果
                            initClusterPie(topicService.getClusterInfoFromPia());
                        }
                        else if (result.value === 0) { // 未完成
                            if (scope.$parent.$parent.num <= 98) {
                                scope.$parent.$parent.num++;
                            }

                            time = setInterval(scope.hasClustering, 8000);
                        }
                        else {
                            scope.$parent.$parent.num = 1;
                            if (Number(scope.$parent.resultType) === 2) {
                                if (result.value === 3) { // 没有聚类操作
                                    scope.clusterFailed = true;
                                    dialogService.alert('聚类失败');
                                }
                                else if (result.value === 4) {
                                    dialogService.alert('没有聚类数据');
                                }
                                else if (result.value === 5) {
                                    scope.selectedDrill = [];
                                    dialogService.alert('路径条件已经修改，请重新保存后进行聚类');
                                }
                            }

                            return;
                        }
                    });
                };

                /**
                 * 初始化聚类饼图 
                */
                var initClusterPie = function (url) {
                    $http.post(url, {
                        cid: scope.selectedClusteringId,
                        pid: Number(scope.item.pathId)
                    })
                        .then(function (data) {
                            if (data.data.success) {
                                scope.isStartClustering = false;
                                scope.clusteringFinished = true;
                                var result = data.data.value || [];
                                angular.forEach(result, function (item) {
                                    if (item.selected) {
                                        scope.selectedClusteringId = item.clusterId;
                                        scope.selectedHierarchy = item.cluNum;
                                    }

                                });
                                if (!result.length) {
                                    return;
                                }

                                // 渲染饼图
                                renderClusteringTypeChart(result);
                                // 初始化热点
                                initClusterPoint();
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
                var renderClusteringTypeChart = function (data) {
                    var series = [{
                        type: 'pie',
                        data: data
                    }];
                    var clusteringTypeChart = new Highcharts.Chart({
                        chart: {
                            renderTo: 'clusteringTypeChart_' + scope.index,
                            zoomType: 'pie',
                            color: '#fff'
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
                                size: '120px',
                                allowPointSelect: true,
                                cursor: 'pointer',
                                colors: ['#EFCB48', '#FF8587', '#A5CF66', '#3ADFE7', '#F17452'],
                                center: ['49%', '50%'],
                                dataLabels: {
                                    enabled: true,
                                    style: {
                                        color: '#000',
                                        fontFamily: '微软雅黑',
                                        fontSize: '12px',
                                        fontWeight: 'normal'
                                    },
                                    color: '#3E3E3E',
                                    connectorWidth: 2,
                                    connectorPadding: 1,
                                    distance: 15,
                                    format: '<b>{point.cluNum}</b>:{point.name}'
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
                                                // 请求聚类数据
                                                initClusterPoint();
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

                /**
                 *初始化聚类热点 
                */
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

                                return;
                            }

                            dialogService.alert('聚类失败');
                            scope.clusterFailed = true;
                        });
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
                                            fontSize: '12px',
                                            fontWeight: 'normal'
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
                            gravity: 1.5,
                            scaling: 0.7,
                            roam: 'move',
                            nodes: data.nodes,
                            links: data.links
                        }]
                    };
                    echarts.init(document.getElementById('clusteringResultChart_' + scope.index)).setOption(option);
                };

                /**
                 * 开始聚类
                 * @return {[type]} [description]
                 */
                scope.startClustering = function (flag, trag) {
                    scope.isStartClustering = flag;
                    topicService.createCluster({
                        cid: scope.selectedClusteringId,
                        pid: Number(scope.item.pathId),
                        flushTime: trag
                    }).success(function (result) {
                        if (result.success) {
                            if (result.value === 0) { // 如果可以进行聚类
                                scope.$parent.$parent.num = 1;
                                scope.hasClustering();
                                return;
                            }
                            else if (result.value === 1) { // 已经聚类过
                                // 开始请求聚类结果
                                initClusterPie(topicService.getClusterInfoFromPia());
                                return;
                            }
                            else if (result.value === 5) { // 已经聚类过,但是路径条件已改变
                                dialogService.alert('路径条件已经修改，请重新保存后进行聚类');
                                scope.clusterProcessText = '0%';
                                scope.isStartClustering = false;
                                scope.clusteringFinished = false;
                                return;
                            }
                        }

                        dialogService.alert('无法聚类');
                        scope.clusterProcessText = '0%';
                        scope.isStartClustering = false;
                        scope.clusteringFinished = false;
                    });
                };

                scope.$watch('item', function (newValue, oldValue) {
                    if (!newValue) {
                        return;
                    }

                    scope.hasClustering();
                });

            }
        };
    }]);

});
