/**
 * 采用兼容 AMD, noModule 三种形式的， 方便后面的模块化扩展
 * 由于本系统采用是 AMD规范，　只考虑AMD 和 NO Modeule 的兼容
 *
 *  @dependeces:
 *      angular: http://angularjs.org
 *      angular-async-loader: https://github.com/subchen/angular-async-loader
 *      jQuery: http://jquery.com/
 *      ngDialog: http://github.com/likeastore/ngDialog
 *      angular-recursion: https://github.com/marklagendijk/angular-recursion
 *
 *  如果不采用AMD 模块加载该文件， 该文件可以不需要考虑
 */
(function (factory) {
    if (typeof define === 'function' && !!define.amd) {
        define([
            'angular',
            'angular-async-loader',
            'angular-loading-bar',
            'angular-ui-router',
            'jquery',
            'colResizable',
            'ngDialog',
            'jquery-ui',
            'mousewheel',
            'mCustomScrollbar',
            'angular-recursion',
            'uploadify',
            'placeholder',
            'canvas2svg',
            'rgbcolor',
            'html2canvas',
            'jqueryCookie'], factory);
    }
    else {
        factory(window.angular, window.asyncLoader, window.jQuery);
    }
})(function (angular, asyncLoader, jQuery) {
    var app = angular.module('app', [
        'ui.router',
        'ngDialog',
        'RecursionHelper',
        'angular-loading-bar'
    ]);

    // 设置 $state params
    app.run([
        '$state',
        '$stateParams',
        '$rootScope', function ($state, $stateParams, $rootScope) {

            // 全局的路径检测
            $rootScope.urlCheck = function (router) {
                var url = $state.$current.url.source;
                for (var pro in $stateParams) {
                    url = url.replace(':' + pro, $stateParams[pro]);
                }
                if (url.indexOf('analysis/detail') > -1) { // 表示当前路径是专题详情
                    url = '/analysis/manage';
                }

                // 获取当前的URL全路径
                if (!router) {
                    return false;
                }

                router = router.substr(1);
                if (router === '/report/download/0/list') {
                    router = '/report/download';
                }

                if (router === '/report/manage/-1/0/list') {
                    router = '/report/manage';
                }

                if (router === '/model/-1/list') {
                    router = '/model';
                }

                // 如果两个路径完全匹配
                if (url === router) {
                    return true;
                }

                // 如果传入的路径是当前路由路径的一部分
                if (url.indexOf(router) === 0) {
                    return url.indexOf(router + '/') === 0;
                }

                return false;
            };
            // 获取浏览器信息
            $rootScope.getBowerserInfo = function () {
                var agent = navigator.userAgent.toLowerCase();
                var bowerVersion = '';
                var regStr_ie = /msie [\d.]+;/gi;
                var regStr_ff = /firefox\/[\d.]+/gi;
                var regStr_chrome = /chrome\/[\d.]+/gi;
                var regStr_saf = /safari\/[\d.]+/gi;
                // IE
                if (agent.indexOf('msie') > 0) {
                    bowerVersion = agent.match(regStr_ie);
                }

                // firefox
                if (agent.indexOf('firefox') > 0) {
                    bowerVersion = agent.match(regStr_ff);
                }

                // Chrome
                if (agent.indexOf('chrome') > 0) {
                    bowerVersion = agent.match(regStr_chrome);
                }

                // Safari
                if (agent.indexOf('safari') > 0 && agent.indexOf('chrome') < 0) {
                    bowerVersion = agent.match(regStr_saf);
                }

                var browser = ''; // 播放器种类
                var verinfo = (bowerVersion + '').replace(/[^0-9.]/ig, ''); // 播放器版本
                if (bowerVersion[0].indexOf('msie') != -1) {
                    browser = 'msie';
                }
                else if (bowerVersion[0].indexOf('chrome') != -1) {
                    browser = 'chrome';
                }
                else {
                    browser = 'other';
                }

                return browser;
            };

            // 获取当前局点
            $rootScope.getGamePoint = function () {
                return 'JD';
            };

            // 判断数组中是否存在某个维度/指标/计算项
            $rootScope.myInArray = function (array, key1, key, type) {
                var index = -1;
                for (var i = 0; i < array.length; i++) {
                    var item = array[i];
                    if (type) {
                        if (item[key1] === key && item.type === type) {
                            index = i;
                            break;
                        }
                    }
                    else {
                        if (item[key1] === key || Number(item[key1]) === Number(key)) {
                            index = i;
                            break;
                        }
                    }
                }
                return index;
            };

        }
    ]);

    app.service('timestamp', function () {
        return function () {
            return new Date().getTime();
        };
    });

    app.constant('CONSTANT', {
        textReplace: new RegExp('[`~!@#$%^&*()=|{}\':;\',\\\\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“\'。，、？]'),
        number: new RegExp('^[0-9]\.[0-9]{1,28}$|^[1-9][0-9]*\.{0,1}[0-9]+$|^[1-9][0-9]*$'),
        negateReplace: new RegExp('[`~!@#$%^&()=|{}\':;\',\\[\\].<>/?~！@#￥……&（）——|{}【】‘；：”“\'。，、？]'),
        searchReplace: new RegExp('[`~!@#$%^&*={}\':;\',\\\\\[\\].<>/?~！@#￥……&*（）{}【】‘；：”“\'、]'),
        ONLY_ONE_CHOOSE: '至少选择一条记录',
        SEARCH_WORD_MAXLENGTH: '搜索字段不能超过100个字符',
        SEARCH_WORD_UNVALID: '搜索字段不能包含特殊字符'
    });

    // initialze app module for async loader
    asyncLoader.configure(app);

    return app;
});
