/**
 * 第三方拦截器
 *
 */
(function (factory) {
    if (typeof define === 'function' && !!define.amd) {
        define([
            'test'
        ], factory);
    }
    else {
        factory(window.test);
    }
})(function (test) {

    /**
     *  本 interceptor 防止 http 重复提交
     *
     *   本 interceptor 实现功能如下，
     *      1、拦截HTTp 重复的Http 请求;
     *   
     * update: Function;　更新报表的接口
     *
     */
    test.factory('repeatsubmitInterceptor', ['$q', function ($q) {

        var requesting = [];
        var filerQuesting = [
            'topic/getModelStatus',
            'api/gram.do',
            'model/getTagDimension.do',
            'model/getTagProperty.do',
            'model/getTagOperation.do',
            'report/getTableData.do',
            'report/getLineColumData.do',
            'report/getPieData.do',
            'topic/getClusterStatus.do',
            'topic/getClusterInfoFromPia.do',
            'topic/getHotviewById.do',
            'report/getAllMeasure.do',
            'topic/editTopic.do',
            'topic/createCluster.do',
            'topic/queryHotWordStat.do',
            'topic/getTotalRate.do',
            'topic/getFunnelChart.do',
            'topic/updateTopic.do',
            'topic/getPathValue.do',
            'model/previewModel.do',
            'model/previewMarks.do'
        ];

        return {
            request: function (config) {
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
