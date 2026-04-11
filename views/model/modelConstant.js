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
    *  modelConstant 实现模型的相关常量设置
    *   @params: None
    *
    */
    app.constant('modelConstant', {

        // confirm tip
        MODEL_DEL_TIP: '是否删除该模型？',
        MODEL_BATCH_DEL_TIP: '是否删除选中模型？',
        MODEL_OFFLINE_TIP: '是否下线该模型？',
        MODEL_BATCH_OFFLINE_TIP: '是否下线选中模型？',

        MODEL_TAB_LENGTH: '标签最多只能展示8个！',
        MODEL_NAME_EMPTY: '请填写模型名称！',
        MODEL_NAME_LENGTH: '模型名称不能超过100个字符！',
        MODEL_NAME_UNVALID: '模型名称不能包含特殊字符！',
        MODEL_GROUP_EMPTY: '请选择模型组！',

        MODEL_FTAMENT_EMPTY: '请输入组合规则！',
        MODEL_FTAMENT_VALID: '运算规则有误，请检查后重新输入！',
        MODEL_EXPORT_EMPTY: '导出时规则不能为空！',

        MODEL_BACK_TIP: '该模型未保存，确定关闭吗？',

        MODEL_SUCCESS: '保存成功！',
        MODEL_ONLINE_ERROR: '上线失败',

        MODEL_REMARK_TIP: '备注不能超过20个字符！',

        // model link
        MODEL_LINK: '/model.do',

        // model operate auth
        MODEL_ADD: 'add',
        MODEL_EXPORT: 'export',
        MODEL_DELETE: 'delete',
        MODEL_ONLINE: 'online',
        MODEL_OFFLINE: 'offline',
        MODEL_SETTOP: 'setTop',
        MODEL_CALLLIST: 'callList',
        MODEL_GROUP_ADD: 'groupAdd',
        MODEL_GROUP_EDIT: 'groupEdit',
        MODEL_GROUP_DEL: 'groupDel',
        MODEL_SAVE: 'save',
        MODEL_RETURN: 'return',
        MODEL_UPDATE: 'update',
        MODEL_PREVIEW: 'preview',
        MODEL_SEARCH: 'search',
        MODEL_ASSIGN: 'assignDimension',

        // model status
        MODEL_STATUS: {
            OPTIMIZING: -2, // 优化中
            ONLINED: -1, // 已上线
            ONLING: 0, // 上线中
            OFFLINED: -3, // 已下线
            FAILURE: -4 // 上线失败
        },

        // model silence code
        MODEL_SILENCE_CODE: {
            KEYWORD_ZI: 'OBJ001', // 关键词（字）
            KEYWORD_CI: 'OBJ002', // 关键词（词）
            PROP_LIST_ZI: 'ATR005', // 关键词列表（字）
            PROP_LIST_CI: 'OPJ008', // 关键词列表（词）
            MUTE_ZI: 'OBJ002', // 静音（字）
            MUTE_CI: 'OBJ001', // 静音（词）
            PROP_VALUE_ZI: 'ATR003', // 静音数值（字）
            PROP_VALUE_CI: 'OPJ002', // 静音大小（词）

            /*石勇 新增 静音规则增加语速音量*/
            SPEED_ZI: 'OBJ003', // 语速（字）
            PROP_TRACK_ZI: 'ATR001', // 语速音量的声道（字）
            VOLUME_ZI: 'OBJ004', // 音量（字）
            SPEED_AVERAGE_ZI: 'ATR011', // 语速平均（字）
            SPEED_ONE_ZI: 'ATR010', // 语速单句（字）
            SPEED_NUMBER_ZI: 'ATR002', // 语速次数（字）
            VOLUME_DECIBEL_ZI: 'ATR003', // 音量分贝（字）
            RELATIVE_ZI: 'ATR004', // 相对位置
            ABSOLUTE_ZI: 'ATR009', // 绝对位置
        }

    });

});
