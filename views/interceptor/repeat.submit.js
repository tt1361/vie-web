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
    app.factory('repeatsubmitInterceptor', ['$q', function ($q) {

        var requesting = [];
        var filerQuesting = [
            'topic/getModelStatus',
            'player/getGramData',
            'report/getTableData',
            'report/getLineColumData',
            'report/getPieData',
            'cluster/getClusterStatus',
            'cluster/getClusterInfoFromPia',
            'cluster/getHotviewById',
            'report/getAllMeasure',
            'topic/editTopic',
            'cluster/createCluster',
            'hotWord/queryHotWordStat',
            'funnel/getTotalRate',
            'funnel/getFunnelChart',
            'topic/updateTopic',
            'topic/getPathValue',
            'model/previewModel',
            'model/previewMarks',
            'model/getTagProperty',
            'model/getTagOperation',
            'hotWordConfigure/searchWord',
            'hotWordAnalysis/getHotWordRank',
            'dimension/searchDim',
            'commonFilter/queryAllFilter'
        ];

        return {
            request: function (config) {
                config.headers = config.headers || {};
                config.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
                config.headers.Accept = 'application/json, text/javascript, */*; q=0.01';
                config.headers['X-Requested-With'] = 'XMLHttpRequest';
                // 不拦截 Get请求
                if (angular.uppercase(config.method) !== 'POST') {
                    return config;
                }

                if ($.inArray(config.url, filerQuesting) > -1) {
                    return config;
                }

                // 判断请求是否正在发出
                var index = requesting.indexOf(config.url);

                if (index === -1) {
                    requesting.push(config.url);
                    return config;
                }

                return $q.reject({
                    config: config
                });
            },
            response: function (response) {
                // 不拦截 Get请求
                if (angular.uppercase(response.config.method) !== 'POST') {
                    return response;
                }

                if ($.inArray(response.config.url, filerQuesting) > -1) {
                    return response;
                }

                // 判断请求是否在拦截队列中
                var index = requesting.indexOf(response.config.url);

                if (index !== -1) {
                    // 请求结束， 删除请求的URL
                    requesting.splice(index, 1);
                }

                return response;
            }
        };
    }]);

});
