/**
 * 维度接口汇总
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

    app.service('dimensionService', ['$http', 'baseService', function ($http, baseService) {

        return {

            /*获取自定义维度*/
            getCustomDim: function (params) {
                return baseService.postHttp('dimension/searchAllDimension', params);
            },

            /*编辑维度*/
            searchDimensionById: function (params) {
                return baseService.postHttp('dimension/searchDimensionById', params);
            },

            /*删除自定义维度*/
            deletePersonalDimension: function (params) {
                return baseService.postHttp('dimension/deletePersonalDimension', params);
            },

            /*更新自定义维度*/
            updatePersonalDimension: function (params) {
                return baseService.postHttp('dimension/updatePersonalDimension', params);
            },

            /*新增自定义维度*/
            addPersonalDimension: function (params) {
                return baseService.postHttp('dimension/addPersonalDimension', params);
            },

            /*获取系统维度*/
            getSystemDimension: function (params) {
                return baseService.postHttp('dimension/getSystemDimension', params);
            },

            /*更新系统维度*/
            updateSystemDimension: function (params) {
                return baseService.postHttp('dimension/updateSystemDimension', params);
            },

            /*查看导入的错误原因*/
            getDimensionValueMessage: function (params) {
                return baseService.postHttp('dimension/getDimensionValueMessage', params);
            },

            /*导入维度*/
            importPersonalDimension: function () {
                return $http.post('dimension/importPersonalDimension');
            },

            /*获取所有任务*/
            searchDimensionTask: function (params) {
                return baseService.postHttp('dimension/searchDimensionTask', params);
            },

            /*获取全部维度信息*/
            searchDim: function (params) {
                return baseService.postHttp('dimension/searchDim', params);
            },

            /*导出模板*/
            exportDimensionExcel: function () {
                return 'dimension/exportDimensionExcel';
            },

            /*保存维度*/
            saveFiltersOrDimension: function (params) {
                return baseService.postHttp('callFilter/saveFiltersOrDimension', params);
            },

            /*获取用户维度*/
            queryDimensions: function (params) {
                return baseService.postHttp('callFilter/queryDimensions', params);
            }
        };
    }
    ]);

});
