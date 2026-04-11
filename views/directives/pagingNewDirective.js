/**
*  本 directive 页面上所有的分页功能
* @params
*      options: Object; 分页的相关参数，实现数据的双向绑定
*      changed: Function; 当分页参数发送改变的时候，通知父controller 数据发送改变
*
*   本directive 实现分页功能思路如下，
*      1、页面所有的点击翻页，和调整 统一调用 go方法
*           Go方法有参数的时候， 分页的页码采用传递的参数，
*           没有参数的时候， 获取scope上ng-model中的参数，
*           检查参数的有效并且发生改变的时候， 调用changed 方法 通知父controller 更新数据 
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

    app.directive('newpaging', [
        '$timeout', function ($timeout) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'directives/paging-new-directive.htm',
                scope: {
                    options: '=pageOptions',
                    counts: '=totalCounts',
                    update: '&'
                },
                link: function (scope, element, attrs) {

                    scope.$watch('options', function (newValue, oldValue) {
                        if (!newValue || newValue === +oldValue) {
                            return;
                        }

                        // 初始化分页参数
                        scope.options.pageNum = scope.options.pageNum || 1;
                        scope.options.pageSize = scope.options.pageSize || 6;
                        scope.num = 1;

                        // 分页组件需要在页面上展示的信息
                        scope.viewData = {
                            size: scope.options.pageSize,
                            counts: scope.counts
                        };

                        if (scope.counts) {
                            calculate();
                        }

                    });

                    // 监控页面上总记录数的变化
                    scope.$watch('counts', function (newVal, oldVal) {
                        if (newVal == oldVal) {
                            return;
                        }

                        scope.viewData.counts = scope.counts;
                        scope.gotoNum = '';
                        calculate();
                    });

                    scope.$watch('options.pageNum', function (newVal, oldVal) {
                        calculate();
                    });

                    // 跳转到指定分页
                    scope.go = function (num) {
                        if (!(/^[0-9]+$/ig.test(num))
                            || Number(num) === 0 ||
                            Number(num) > scope.viewData.pages) {
                            scope.isError = true;
                            $timeout(function () {
                                scope.isError = false;
                            }, 3000);
                            return;
                        }

                        num = Number(num);

                        if (num === scope.options.pageNum) {
                            return;
                        }

                        scope.options.pageNum = num;

                        calculate();

                        scope.update(scope.options);
                    };

                    // 动态计算分页的需要在页面上展示的信息
                    function calculate() {
                        // if(scope.counts <= scope.options.size){
                        //     // 当总记录少于每页显示数量的时候，， 不显示分页按钮
                        //     scope.viewData.showButtons = false;
                        //     return ;
                        // }
                        // 计算总页数
                        scope.viewData.pages = Math.floor((scope.counts + scope.options.pageSize - 1) / scope.options.pageSize);
                        // 获取当前页
                        scope.viewData.curPage = scope.options.pageNum;
                        // 判断是否是第一页
                        scope.viewData.isFirst = scope.viewData.curPage === 1;
                        // 判断是否为最后一页
                        scope.viewData.isLast = scope.viewData.curPage === scope.viewData.pages;

                        // 按钮组的信息
                        scope.viewData.prevBtns = [];
                        scope.viewData.currentBtns = [];
                        scope.viewData.endBtns = [];
                        scope.viewData.prevEllipsis = false;
                        scope.viewData.endEllipsis = false;

                        // 如果总页数小于 5也
                        if (scope.viewData.pages <= 5) {
                            for (var i = 1; i <= scope.viewData.pages; i++) {
                                scope.viewData.currentBtns.push(i);
                            }
                            return;
                        }

                        // 如果当前页小于 3 
                        if (scope.viewData.curPage <= 3) {
                            for (var i = 1; i <= scope.viewData.curPage + 1; i++) {
                                scope.viewData.currentBtns.push(i);
                            }
                            scope.viewData.endBtns.push(scope.viewData.pages);
                            scope.viewData.endEllipsis = true;
                            return;
                        }

                        // 当当前页在尾部的时候
                        if (scope.viewData.pages - scope.viewData.curPage < 3) {
                            for (var i = scope.viewData.curPage - 1; i <= scope.viewData.pages; i++) {
                                scope.viewData.currentBtns.push(i);
                            }
                            scope.viewData.prevBtns.push(1);
                            scope.viewData.prevEllipsis = true;
                            return;
                        }

                        // 最终 既不靠头也不靠尾
                        scope.viewData.prevBtns.push(1);
                        scope.viewData.prevEllipsis = true;
                        scope.viewData.endBtns.push(scope.viewData.pages);
                        scope.viewData.endEllipsis = true;
                        for (i = -1; i <= 1; i++) {
                            scope.viewData.currentBtns.push(i + scope.viewData.curPage);
                        }
                    }
                }

            };
        }]);
});
