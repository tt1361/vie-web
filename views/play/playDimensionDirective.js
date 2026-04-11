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
     *  本 interceptor 防止 http 重复提交
     *
     *   本 interceptor 实现功能如下，
     *      1、拦截HTTp 重复的Http 请求;
     *
     * update: Function;　更新报表的接口
     *
     */
    app.directive('playDimension', ['playItemService', function (playItemService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'play/play-dimension-directive.htm',
            scope: {
                callId: '='
            },
            link: function (scope, element, attrs) {

                scope.showAll = false; // 是否显示全部维度信息

                scope.selectDim = [];

                scope.showDim = [];

                // 点击配置按钮获取自定义维度
                scope.setZdyDim = function () {
                    scope.isShow = !scope.isShow;
                };

                // 监听保存维度
                scope.$on('saveDimension', function (event, data) {
                    // 调用保存到数据库的接口
                    playItemService.saveSelectDimension({
                        dimensionIdList: data.result.dimeName.join(',')
                    })
                        .then(function (result) {
                            if (result) {
                                scope.selectDim = data.result.pushDim || [];
                                scope.setZdyDim();
                                scope.getShowDim();
                            }
                            else {
                                scope.$emit('listenMsg', {
                                    msg: '保存失败'
                                });
                                return;
                            }
                        });
                });

                // 获取显示维度
                scope.getShowDim = function () {
                    if (scope.showAll) {
                        scope.showDim = scope.selectDim;
                    }
                    else {
                        if (scope.selectDim.length > 2) {
                            scope.showDim = scope.selectDim.slice(0, 2);
                        }
                        else {
                            scope.showDim = scope.selectDim;
                        }
                    }
                };

                // 展示与收起
                scope.showAllOpen = function () {
                    scope.showAll = !scope.showAll;
                    scope.getShowDim();
                };

                // 获取上次选择的自定义维度
                scope.getAllZdyDim = function () {
                    playItemService.getAllZdyDim({
                        telephoneId: scope.callId
                    })
                        .then(function (result) {
                            if (result) {
                                scope.selectDim = result.value ? result.value || [] : [];
                                scope.getShowDim();
                            }
                            else {
                                if (result) {
                                    scope.$emit('listenMsg', {
                                        msg: '查询失败'
                                    });
                                    return;
                                }
                            }
                        });
                };
                // 监听
                scope.$watch('callId', function (newValue, oldValue) {
                    if (!newValue) {
                        return;
                    }

                    scope.getAllZdyDim();
                });

                $(window.document).click(function (event) {
                    if (!angular.element(event.target).parents('.push-model-dialog.play-other').length
                        && !angular.element(event.target).hasClass('picture-set')
                        && scope.isShow) {
                        scope.isShow = false;
                    }

                    scope.$apply();
                });
            }
        };
    }]);

});
