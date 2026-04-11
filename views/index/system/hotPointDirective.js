/**
 * 系统首页热点聚类
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
    app.directive('hotPoint', ['$timeout', 'systemIndexService', function ($timeout, systemIndexService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'index/system/hot-point.htm',
            link: function (scope, element, attrs) {
                scope.dotSelected = 0;
                scope.colors = ['#EFCB48', '#FF8587', '#A5CF66', '#3ADFE7', '#F17452'];

                // 圆点切换点击
                scope.clickDot = function (index) {
                    scope.dotSelected = index;
                    var step = 0 - index;
                    $('.hot-point-wrapper').animate({
                        left: step * 420 + 'px'
                    }, 600);
                    scope.count = scope.hotPointData[index].count || 0;
                    scope.percent = scope.hotPointData[index].percent || 0;
                    scope.clusterId = scope.hotPointData[index].clusterId || 0;
                };

                /**
                 * [getModulData 查询前一天聚类热点]
                 * @return {[type]} [description]
                 */
                scope.getFetchHotViewData = function () {
                    var selectCenter = scope.selectCenter;
                    if (selectCenter === '汇总') {
                        selectCenter = '';
                    }

                    var params = {
                        selectTime: scope.selectTime.split(' ')[0],
                        selectCenter: selectCenter,
                        centerFlag: scope.centerFlag
                    };
                    systemIndexService.fetchHotViewData(params)
                        .then(function (result) {
                            scope.hotPointData = result.value || [];
                            scope.dotSelected = 0;
                            $('.hot-point-wrapper').animate({
                                left: '0px'
                            }, 600);
                            scope.count = scope.hotPointData.length ? scope.hotPointData[scope.dotSelected].count || 0 : 0;
                            scope.percent = scope.hotPointData.length ? scope.hotPointData[scope.dotSelected].percent || 0 : 0;
                            scope.clusterId = scope.hotPointData.length ? scope.hotPointData[scope.dotSelected].clusterId : 0;

                            var pretime = scope.selectTime; // 首页热点切换到通话列表，对日期减一天处理
                            pretime = pretime.substring(0, 10);
                            pretime = pretime.replace(/-/g, '/');
                            var pre = new Date(pretime);
                            var timeSecond = pre.getTime() - 24 * 3600 * 1000;
                            var now = new Date(timeSecond);
                            var year = now.getFullYear();
                            var month = now.getMonth() + 1;
                            var day = now.getDate();
                            if (month < 10) {
                                month = '0' + month;
                            }

                            if (day < 10) {
                                day = '0' + day;
                            }

                            var fullDay = year + '-' + month + '-' + day;
                            scope.selectTimePoint = fullDay;

                            $timeout(function () {
                                if (element.find('.hot-point-chart').length === scope.hotPointData.length) {
                                    for (var i = 0, length = scope.hotPointData.length; i < length; i++) {
                                        var colorIndex = i;
                                        if (i >= scope.colors.length) {
                                            colorIndex = i % scope.colors.length;
                                        }

                                        renderHotPoint(scope.hotPointData[i], i, scope.colors[colorIndex]);
                                    }
                                }

                            }, 0);
                        });
                };

                var renderHotPoint = function (data, index, color) {
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
                                            fontFamily: '微软雅黑'
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
                                    nodeStyle: {
                                    },
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
                    echarts.init(document.getElementById('hotPointChart' + index)).setOption(option);
                };

                // 接收广播
                scope.$on('hotPoint', function (event, data) {
                    scope.selectCenter = data.selectCenter;
                    scope.selectTime = data.selectTime;
                    scope.centerFlag = data.centerFlag;
                    scope.getFetchHotViewData();
                });
            }
        };
    }]);

});
