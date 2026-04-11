/**
 * 热词配置接口汇总
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

    app.service('hotWordService', ['baseService', function (baseService) {

        return {

            /*获取热词*/
            searchWord: function (params) {
                return baseService.postHttp('hotWordConfigure/searchWord', params);
            },

            /*保存热词*/
            saveWord: function (params) {
                return baseService.postHttp('hotWordConfigure/addHotWord', params);
            },

            /*删除热词*/
            deleteWord: function (params) {
                return baseService.postHttp('hotWordConfigure/deleteWord', params);
            }
        };
    }
    ]);

});
