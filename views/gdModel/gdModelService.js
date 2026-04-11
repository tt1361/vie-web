/**
 * 模型接口汇总
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
    *  modelService 实现模型与后台交互的接口
    *   @params:
    *       $http:  http请求服务Service
    *       baseService: 自定义的基础服务，封装$http请求
    *
    */
    app.service('gdModelService', ['$http', 'baseService', function ($http, baseService) {

        return {

            /*获取全部模型组*/
            allModelGroups: function () {
                return $http.post('modelGroup/queryGroupList');
            },

            /*获取预览编号*/
            getPreviewId: function () {
                return baseService.postHttp('model/getPreviewId');
            },

            /*获取模型*/
            getModel: function (id, status) {
                return baseService.postHttp('model/getModelById', {
                    modelId: id
                });
            },

            /*添加模型规则*/
            addFregment: function (params) {
                return $http.post('model/addModelFragment', params);
            },

            /*添加或更新模型*/
            addModel: function (params) {
                return baseService.postHttp('model/saveModel', params);
            },

            /*录音备注*/
            voiceMark: function (parmas) {
                return baseService.postHttp('model/voiceMark', parmas);
            },

            /*模型预览*/
            getCallList: function (params) {
                return baseService.postHttp('model/previewModel', params);
            },

            /*获取标记列表*/
            getMarkList: function (params) {
                return baseService.postHttpNoDialog('model/previewMarks', params);
            },

            /*获取匹配数量*/
            getHitCount: function (params) {
                return baseService.postHttp('model/getHitCount', params);
            },

            /*获取标记各个状态数量*/
            getMarkData: function (params) {
                return baseService.postHttp('model/dealMarkData', params);
            },

            /*获取标记状态*/
            getTelephonIdState: function (params) {
                return baseService.postHttp('model/getTelephoneMarkState', params);
            },

            /*获取标记总数量*/
            getMarkTotalData: function (params) {
                return baseService.postHttp('model/getMarkCount', params);
            },

            /*获取不同显示类型结果*/
            getColumData: function (params) {
                return baseService.postHttp('model/getColumData', params);
            },

            /*获取模型上线时间*/
            getOnlineTime: function (params) {
                return baseService.postHttp('model/getModelOnLineDate', params);
            },

            /*获取通话列表详细信息*/
            getTableData: function (params) {
                return baseService.postHttp('model/getTableData', params);
            },

            /*获取首页聚类通话列表详细信息*/
            getTableDataCluster: function (params) {
                return baseService.postHttp('home/getTableData', params);
            },

            /*按照模型树结构返回所有模型*/
            searchModelGroup: function (params) {
                return baseService.postHttp('modelGroup/queryGroupTree', params);
            },

            /*根据模型组id获取搜索模型*/
            findModels: function (params) {
                return baseService.postHttp('model/queryModels', params);
            },

            /*删除模型*/
            deleteModel: function (params) {
                return baseService.postHttp('model/deleteModel', params);
            },

            /*下线模型*/
            offlineModel: function (params) {
                return baseService.postHttp('model/offlineModel', params);
            },

            /*模型置顶*/
            setModelUp: function (params) {
                return baseService.postHttp('model/setModelUp', params);
            },

            /*获取模型组下所有的已上线模型*/
            getAllOnLineModelsByGroup: function (params) {
                return baseService.postHttp('model/queryOnLineModelsByGroup', params);
            },

            /*获取模型状态*/
            getModelStatus: function (params) {
                return baseService.postHttp('model/getModelStatus', params);
            },

            /*上线模型*/
            onlineModel: function (params) {
                return $http.post('model/onlineModel', params);
            },

            /*单个导出*/
            exportSingleRule: function () {
                return 'model/exportSingleRule';
            },

            /*批量导出*/
            exportMoreRule: function () {
                return 'model/exportMoreRule';
            },

            /*导入规则*/
            importRule: function () {
                return baseService.postHttp('model/importRule');
            },

            /*导出规则*/
            exportRule: function () {
                return 'model/exportRule';
            },

            /*获取是否需要条件配置的接口*/
            isHaveSilence: function () {
                return baseService.postHttp('model/isHaveSilence');
            },

            /*模型标签查询*/
            getTagDimension: function (params) {
                return baseService.postHttp('model/getTagDimension', params);
            },

            /*智能助手查询*/
            association: function (params) {
                return baseService.postHttp('association/queryWordAssociation', params);
            },

            /*查询词切分*/
            getSplitWord: function (params) {
                return baseService.postHttp('model/getSplitWord.do', params);
            },

            /*查询同义词*/
            analogy: function (params) {
                return baseService.postHttp('api/analogy.do', params);
            },

            /*查询相关词*/
            associationImple: function (params) {
                return baseService.postHttp('api/association.do', params);
            },

            /*获取标签操作类型*/
            getTagProperty: function (params) {
                return baseService.postHttp('model/getTagProperty', params);
            },

            /*获取操作对象*/
            getTagOperation: function (params) {
                return baseService.postHttp('model/getTagOperation', params);
            },

            /*提交备注*/
            voiceRemark: function (params) {
                return baseService.postHttp('model/voiceRemark', params);
            },

            /*全部清空*/
            clearAllMarks: function (params) {
                return baseService.postHttp('model/clearVoiceMark', params);
            },

            /*删除模型组*/
            deleteModelGroup: function (params) {
                return baseService.postHttp('modelGroup/deleteModelGroup', params);
            },

            /*新增或更新模型组*/
            addModelGroup: function (params) {
                return baseService.postHttp('modelGroup/saveModelGroup', params);
            },

            /*获取全部已上线模型*/
            findAllOnlineModelGroup: function (params) {
                return baseService.postHttp('model/queryOnlineModelByGroup', params);
            },

            /*检验重命名*/
            checkModelName: function (params) {
                return $http.post('model/checkModelName', params);
            },
            // 石勇 新增 三个导出和一个获取是否禁用

            /*导出预览模型*/
            exportPreviewModel: function () {
                return 'model/exportPreviewModel';
            },
            exportExcleMore: function () {
                return 'model/exportExcleMore';
            },
            exportExcleAll: function () {
                return 'model/exportExcleAll';
            },
            // 是否禁用弹窗的维度
            fetchOnSwitch: function () {
                return $http.post('model/fetchOnSwitch');
            },

            // 石勇 新增 按任务分析显示模型预览结果
            // 按任务分析显示模型预览结果
            queryVoiceCallList: function (params) {
                return baseService.postHttp('callFilter/queryVoiceCallList', params);
            },

            /*添加或更新模型*/
            addCondition: function (params) {
                return baseService.postHttp('model/saveCondition', params);
            },

            // 石勇 新增 用于保存模型模块的通话列表维度

            /*保存维度*/
            saveFiltersOrDimension: function (params) {
                return baseService.postHttp('callFilter/saveFiltersOrDimension', params);
            },

            /*获取用户维度*/
            queryDimensions: function (params) {
                return baseService.postHttp('callFilter/queryDimensions', params);
            },
            // 是否引用筛选条件
            queryCondition: function (params) {
                return $http.post('model/queryCondition', params);
            }
        };
    }
    ]);

});
