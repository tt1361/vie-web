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
    app.directive('labelValue', ['playItemService', function (playItemService) {

        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'play/label-value-directive.htm',
            scope: {
                item: '=',
                callId: '='
            },
            link: function (scope, element, attrs) {
                // 选择
                scope.chooseLabel = function (value) {
                    element.find('button').removeClass('active');
                    var isDelete = 0;
                    if (!value.selected || value.selected === 0) {
                        $('#label-btn_' + value.valueId).addClass('active');
                        isDelete = 0;
                        angular.forEach(scope.item.dimensionValue, function (item) {
                            if (value.valueId === item.valueId) {
                                item.selected = 1;
                            }
                            else {
                                item.selected = 0;
                            }
                        });
                    }
                    else {
                        isDelete = 1;
                        angular.forEach(scope.item.dimensionValue, function (item) {
                            if (value.valueId === item.valueId) {
                                item.selected = 0;
                                return;
                            }

                        });
                    }

                    // 调用后台接口
                    var params = $.extend(params, {dimensionId: scope.item.dimensionId, dimensionValueId: value.valueId, telephoneId: scope.callId, isDelete: isDelete});
                    playItemService.addSelectDimensionToES(params)
                        .then(function (result) {
                            if (!result) {
                                scope.$emit('listenMsg', {
                                    msg: result.message
                                });
                                return;
                            }

                        });

                };
            }
        };
    }]);

});
