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
    app.directive('selectionTime', ['$http', '$window', '$document', '$q', function ($http, $window, $document, $q) {

        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'index/custom/selection-time-directive.htm',
            scope: {
                item: '=',
                type: '@',
                time: '='
            },
            link: function (scope, element, attrs) {
                scope.timeOpen = false;
                scope.timeDimKey = scope.time ? scope.time : 'dimDay'; // 默认是按天
                if (scope.timeDimKey === 'dimDay') {
                    scope.timeDimText = '按天';
                }

                if (scope.timeDimKey === 'dimHour') {
                    scope.timeDimText = '按小时';
                }

                if (scope.timeDimKey === 'dimMonth') {
                    scope.timeDimText = '按月';
                }

                if (scope.timeDimKey === 'dimYear') {
                    scope.timeDimText = '按年';
                }

                scope.uid = Math.floor(Math.random() * 1000) + 1000;

                /**
                 *展开/收起
                */
                scope.showTimeOpen = function () {
                    scope.timeOpen = !scope.timeOpen;
                };

                /**
                 *切换时间规则
                */
                scope.selectType = function (type) {
                    var timeDimText;
                    scope.timeDimKey = type;
                    if (type === 'dimDay') {
                        scope.timeDimText = '按天';
                        timeDimText = '精确到天';
                    }

                    if (type === 'dimHour') {
                        scope.timeDimText = '按小时';
                        timeDimText = '精确到时';
                    }

                    if (type === 'dimMonth') {
                        scope.timeDimText = '按月';
                        timeDimText = '精确到月';
                    }

                    if (type === 'dimYear') {
                        scope.timeDimText = '按年';
                        timeDimText = '精确到年';
                    }

                    if (Number(scope.type) === 11) { // 表格
                        scope.$emit('repostTableData', {timeDimKey: type, timeDimText: timeDimText});
                    }

                    if (Number(scope.type) === 12) { // 饼状图
                        scope.$emit('repostChartData', {timeDimKey: type, timeDimText: timeDimText});
                    }

                    if (Number(scope.type) === 13) { // 柱状图
                        scope.$emit('repostColumnData', {timeDimKey: type, timeDimText: timeDimText});
                    }

                    scope.showTimeOpen();
                };

                // if clicked outside of calendar
                $document.on('click', function (e) {
                    if (!scope.timeOpen) {
                        return;
                    }

                    var i = 0,
                        ele;

                    if (!e.target) {
                        return;
                    }

                    for (ele = e.target; ele; ele = ele.parentNode) {
                        // var nodeName = angular.lowercase(element.nodeName)
                        if (angular.lowercase(ele.nodeName) === 'selection-time' || ele.nodeType === 9) {
                            break;
                        }

                        var uid = scope.$eval(ele.getAttribute('uid'));
                        if (!!uid && uid === scope.uid) {
                            return;
                        }

                    }

                    scope.showTimeOpen();
                    scope.$apply();
                });
            }

        };
    }]);
});
