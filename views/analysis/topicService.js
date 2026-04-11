/**
 * 自定义专题调接口函数
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

    app.service('topicService', ['$http', 'baseService', function ($http, baseService) {

        return {

            /*根据专题id获取详情信息*/
            getDetailTopic: function (params) {
                return baseService.postHttp('topic/editTopic', params);
            },

            /*获取全局变量*/
            getLoadCount: function (params) {
                return baseService.postHttp('topic/getLoadCount', params);
            },

            /*更新专题名称*/
            updateTopicName: function (params) {
                return $http.post('custom/topic/updateTopicName', params);
            },

            /*更新专题时间*/
            updateTopicTime: function (params) {
                return baseService.postHttp('topic/updateTopicTime', params);
            },

            /*获取路径值*/
            getPathValue: function (params) {
                return baseService.postHttpNoDialog('topic/getPathValue', params);
            },

            /*更新新增路径*/
            editPath: function (params) {
                return $http.post('topic/editPath', params);
            },

            /*删除路径*/
            delPath: function (params) {
                return baseService.postHttp('topic/deletePath', params);
            },

            /*更新专题*/
            updateTopic: function (params) {
                return $http.post('topic/updateTopic', params);
            },

            /*获取模型状态*/
            getModelStats: function (params) {
                return baseService.postHttp('topic/getModelStatus', params);
            },

            /*批量更新路径*/
            editBatchPath: function (params) {
                return baseService.postHttp('path/editBatchPath', params);
            },

            /*新增获取更新路径维度*/
            addPathDim: function (params) {
                return baseService.postHttp('path/addPathDim', params);
            },

            /*删除选中维度值*/
            delPathDim: function (params) {
                return baseService.postHttp('path/delPathDim', params);
            },

            /*查询某个路径下的所有维度*/
            searchPathDim: function (params) {
                return baseService.postHttp('path/searchPathDim', params);
            },

            /*获取上次热词更新时间*/
            getHotWordLastFlushTime: function (params) {
                return baseService.postHttp('hotWord/getHotWordLastFlushTime', params);
            },

            /*获取上次聚类更新时间*/
            getClusterLastFlushTime: function (params) {
                return baseService.postHttp('cluster/flushClusterTime', params);
            },

            /*创建专题*/
            createTopic: function (params) {
                return $http.post('custom/topic/createTopic', params);
            },

            /*获取通话列表数据*/
            getPathData: function (params) {
                return baseService.postHttp('topic/getPathData', params);
            },

            /*添加或更新备注*/
            addMark: function (params) {
                return baseService.postHttp('topic/addMark', params);
            },

            /*获取标记库数据*/
            getMarkData: function (params) {
                return baseService.postHttp('topic/getMarkData', params);
            },

            /*删除标记库数据*/
            deleteMark: function (params) {
                return baseService.postHttp('topic/deleteMark', params);
            },

            /*查询总体转化率*/
            getTotalRate: function (params) {
                return baseService.postHttp('funnel/getTotalRate', params);
            },

            /*查询漏斗分析图表*/
            getFunnelChart: function (params) {
                return baseService.postHttp('funnel/getFunnelChart', params);
            },

            /*查询漏斗分析图列表*/
            getFunnelTable: function (params) {
                return baseService.postHttp('funnel/getFunnelTable', params);
            },

            /*查询漏斗分析通话列表*/
            getFunnelList: function (params) {
                return baseService.postHttp('funnel/getFunnelList', params);
            },

            /*查询热词分析状态*/
            getHotWordTaskStatus: function (params) {
                return baseService.postHttp('hotWord/getHotWordTaskStatus', params);
            },

            /*开始分析热词任务*/
            createHotWordTask: function (params) {
                return $http.post('hotWord/addHotWordTask', params);
            },

            /*查询热词数据*/
            queryHotWordStat: function (params) {
                return baseService.postHttp('hotWord/queryHotWordStat', params);
            },

            /*获取全部专题*/
            findAllTopics: function (params) {
                return baseService.postHttp('topic/findAllTopics', params);
            },

            /*删除专题*/
            deleteTopics: function (params) {
                return baseService.postHttp('custom/topic/deleteTopics', params);
            },

            /*获取聚类操作*/
            getClusterStatus: function (params) {
                return baseService.postHttp('cluster/getClusterStatus', params);
            },

            /*开始聚类*/
            createCluster: function (params) {
                return $http.post('cluster/createCluster', params);
            },

            /*请求热点数据*/
            getHotviewById: function (params) {
                return $http.post('cluster/getHotviewById', params);
            },

            /*获取聚类数据*/
            getTogatherData: function (params) {
                return baseService.postHttp('cluster/getTogatherData', params);
            },

            /*业务概览*/
            busiOverview: function (params) {
                // return baseService.postHttpNoDialog('businessOverview/queryBusiOverview', params);
                return baseService.postHttp('businessOverview/queryBusiOverview', params);
            },

            /*获取未读通话数量*/
            getUnReadCallCount: function (params) {
                return baseService.postHttp('emphasisPush/getUnReadCallCount', params);
            },

            /*查询所有数据*/
            getAllGroupDatas: function (params) {
                return baseService.postHttp('emphasisPush/queryAllGroupDatas', params);
            },

            /*查询子节点*/
            getChildrenGroup: function (params) {
                return baseService.postHttp('subject/queryChildrenGroup', params);
            },

            /*获取业务概览的通话趋势*/
            getCallCountTrend: function (params) {
                return baseService.postHttp('businessOverview/getCallCountTrend', params);
            },

            /*业务概览接口*/
            setCallRead: function (params) {
                return baseService.postHttp('emphasisPush/updateCallRead', params);
            },
            getCallList: function () {
                return 'businessOverview/queryCallList';
            },
            getPushCallList: function () {
                return 'emphasisPush/queryPushCallList';
            },
            setAllCallRead: function (params) {
                return baseService.postHttp('emphasisPush/updateAllCallRead', params);
            },

            /*移除模型*/
            deleteGroupModel: function (params) {
                return baseService.postHttp('subject/deleteGroupModel', params);
            },

            /*业务概览添加模型*/
            addGroupModels: function (params) {
                return baseService.postHttp('subject/addGroupModels', params);
            },

            /*删除专题模型组*/
            deleteTopicGroup: function (params) {
                return baseService.postHttp('subject/deleteTopicGroup', params);
            },

            /*更新专题模型组*/
            updateTopicGroup: function (params) {
                return baseService.postHttp('subject/updateTopicGroup', params);
            },

            /*新增专题模型组*/
            addTopicGroup: function (params) {
                return baseService.postHttp('subject/addTopicGroup', params);
            },

            /*开始请求聚类结果*/
            getClusterInfoFromPia: function () {
                return 'cluster/getClusterInfoFromPia';
            },
            getClusterInfoFromPath: function () {
                return 'cluster/getClusterInfoFromPath';
            },

            /*获取任务下通话列表*/
            getCallFilter: function (params) {
                return baseService.postHttp('callFilter/queryVoiceCallList', params);
            },

            /*基础分析导出*/
            exportBase: function () {
                return 'topic/exportBase';
            },

            /*聚类导出*/
            exportCluster: function () {
                return 'topic/exportCluster';
            },

            /*热词分析导出*/
            exportTopicHotWordData: function () {
                return 'topic/exportTopicHotWordData';
            },

            /*漏斗导出*/
            exportFunnel: function () {
                return 'custom/topic/exportFunnel';
            }
        };
    }
    ]);

});
