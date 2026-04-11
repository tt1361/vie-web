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
     * @brief 热词分析列表指令
     * @details [long description]
     *
     * @param  [description]
     * @return [description]
     */

    app.directive('hotwordAnalyseList', function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'analysis/hotword/hotword-analyse-list-directive.htm',
            scope: {
                voiceList: '=',
                type: '@',
                isSametime: '=',
                order: '='
            },
            link: function ($scope, element, attrs) {

                /**
                 * @brief 排序
                 * @details [long description]
                 *
                 * @param r 排序规则
                 * @param e 表示是音频还是词频
                 *
                 * @return [description]
                 */
                $scope.remarkRange = function (order) {
                    $scope.$emit('remarkRange', {order: order, kwType: $scope.type});
                };
                $scope.isSametime = $scope.isSametime;
            }
        };
    });
});
