/**
 * 文档高度控制，底部优化
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

    app.service('winHeightService', ['$window', function ($window) {

        // 重新计算文档高度，对底部优化
        return {
            calculate: function () {

                var winHeight = angular.element(window).height(), // 是文档窗口高度
                    headerHeight = angular.element('.section-header').height(), // 顶部高度
                    centerHeight = angular.element('.section-content').height(), // 中间内容高度
                    $footer = angular.element('.section-footer'), // 底部jquery对象
                    footerHeight = $footer.height(); // 底部高度
                if (centerHeight < (winHeight - headerHeight - footerHeight - 25)) { // 若文档高度小于浏览器高度
                    $footer.addClass('fixed');
                }
                else {
                    // $footer.removeClass('fixed');
                }
                // return contHeight;
            }
        };
    }]);

});
