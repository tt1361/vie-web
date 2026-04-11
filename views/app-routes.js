/**
 * 采用兼容 AMD, noModule 两种种形式的， 方便后面的非模块化扩展
 * 由于本系统采用是 AMD规范，　只考虑AMD 和 NO Modeule 的兼容
 *
 *  @dependeces:
 *      angular: Any Angular Modeule
 *
 *   如果不采用本系统文件， 可以忽略该文件
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
    app.config([
        '$stateProvider',
        '$urlRouterProvider',
        '$httpProvider', function ($stateProvider, $urlRouterProvider, $httpProvider) {

            $httpProvider.interceptors.push('httpInterceptor');

            $urlRouterProvider.when('', '/index/system');
            $stateProvider.state('main', {
                url: '',
                templateUrl: 'menu/menu.htm',
                controllerUrl: 'menu/menuCtrl',
                controller: 'menuCtrl',
                dependencies: [
                    'menu/menuDirective',
                    'menu/menuOpenDirective',
                    'menu/resetPwdCtrl',
                    'menu/menuDetailDirective',
                    'menu/menuService',
                    'menu/menuAddDirective',
                    'menu/menuChildrenDirective',
                    'directives/onFinishRender',
                    'directives/pagingNewDirective',
                    'services/winHeightService',
                    'services/dialogService',
                    'services/filterService',
                    'services/baseService',
                    'search/bubbleDirective',
                    'search/bubbleService',
                    'search/keyAllDirective',
                    'analysis/topicService',
                    'index/custom/customIndexService',
                    'setting/dimension/dimensionService'
                ]
            }).state('main.report', {
                url: '/report',
                template: '<div ui-view class="content-inner-wrap"></div>',
                dependencies: [
                    'report/reportService',
                    'index/custom/customIndexService'
                ]
            }).state('main.report.favorite', {
                url: '/favorite',
                templateUrl: 'report/favorite/list.htm',
                controllerUrl: 'report/favorite/listCtrl',
                controller: 'favoriteReportListCtrl',
                dependencies: [
                    'report/favorite/favrItemDirective'
                ]
            }).state('main.report.detail', {
                url: '/detail/:group/:id/:name/:fromType',
                templateUrl: 'report/detail/detail.htm',
                controllerUrl: 'report/detail/detailCtrl',
                controller: 'reportDetailCtrl',
                dependencies: [
                    'directives/detailTableDirective',
                    'directives/computerListDirective',
                    'directives/computerDirective',
                    'directives/detailChartCLDirective',
                    'directives/detailChartPDirective',
                    'report/detail/dimension/mulEquDirective',
                    'report/detail/dimension/mulSelDirective',
                    'report/detail/dimension/radioDirective',
                    'report/detail/dimension/rangeDirective',
                    'report/detail/dimension/offLineTagIdDirective',
                    'report/detail/reportConditionCtrl',
                    'directives/createComputerDirective',
                    'directives/draggableDirective',
                    'directives/measureDirective',
                    'directives/addMeasureDirective',
                    'directives/addDimensionDirective',
                    'directives/myselectDirective',
                    'directives/addColumnDirective',
                    'directives/addTabDirective',
                    'directives/addToIndexDirective',
                    'report/detail/tabTitle',
                    'search/modelKeywordCtrl',
                    'search/moreKeyDirective',
                    'search/searchService',
                    'directives/calendarDirective',
                    'model/modelService',
                    'report/manage/manageNewCreate'
                ]
            }).state('main.report.indexDetail', {
                url: '/indexDetail/:id/:chartType',
                templateUrl: 'report/detail/indexDetail.htm',
                controllerUrl: 'report/detail/indexDetailCtrl',
                controller: 'reportIndexDetailCtrl',
                dependencies: [
                    'directives/addToIndexDirective',
                    'directives/detailTableDirective',
                    'directives/computerListDirective',
                    'directives/computerDirective',
                    'directives/detailChartCLDirective',
                    'directives/detailChartPDirective',
                    'report/detail/dimension/mulEquDirective',
                    'report/detail/dimension/mulSelDirective',
                    'report/detail/dimension/radioDirective',
                    'report/detail/dimension/rangeDirective',
                    'report/detail/dimension/offLineTagIdDirective',
                    'report/detail/reportConditionCtrl',
                    'directives/createComputerDirective',
                    'directives/draggableDirective',
                    'directives/measureDirective',
                    'directives/addMeasureDirective',
                    'directives/addDimensionDirective',
                    'directives/myselectDirective',
                    'directives/addColumnDirective',
                    'directives/addTabDirective',
                    'report/detail/tabTitle',
                    'search/modelKeywordCtrl',
                    'search/moreKeyDirective',
                    'search/searchService',
                    'directives/calendarDirective',
                    'model/modelService',
                    'report/manage/manageNewCreate'
                ]
            }).state('main.report.manage', {
                url: '/manage',
                templateUrl: 'report/manage/group.htm'
            }).state('main.report.manage.list', {
                url: '/:group/:edit/list',
                templateUrl: 'report/manage/list.htm',
                controllerUrl: 'report/manage/listCtrl',
                controller: 'reportManageListCtrl',
                dependencies: [
                    'report/reportService',
                    'directives/myselectDirective',
                    'report/manage/manageNewCreate',
                    'report/manage/groupDirective'
                ]
            }).state('main.report.download', {
                url: '/download',
                templateUrl: 'report/downLoad/category.htm'
            }).state('main.report.download.list', {
                url: '/:type/list',
                templateUrl: 'report/downLoad/list.htm',
                controllerUrl: 'report/downLoad/listCtrl',
                controller: 'reportDownloadListCtrl',
                dependencies: [
                    'report/downLoad/reportProgressDirective'
                ]
            }).state('main.model', {
                url: '/model',
                template: '<div ui-view class="content-inner-wrap"></div>',
                dependencies: [
                    'model/modelService',
                    'model/modelConstant',
                    'model/voice/timeSelectDirective',
                    'analysis/topicService',
                    'analysis/detail/dimensionLibsCtrl'
                ]
            }).state('main.model.list', {
                url: '/:group/list',
                templateUrl: 'model/list.htm',
                controllerUrl: 'model/listCtrl',
                controller: 'modelListCtrl',
                dependencies: [
                    'model/onlingDirective',
                    'model/modelNewGroupDirective',
                    'model/modelDetailCtrl',
                    'model/modelTreeGroupDirective',
                    'model/onlineModelCtrl',
                    // 石勇 新增
                    'model/addNew/calendarModelDirectiveCtrl',
                    'model/addNew/onlineScreenConditionDirective',
                    // 石勇 新增 模型上线增加筛选器
                    'directives/wholeFilterDirectiveCtrl',
                    'directives/commonFilterService',
                    'directives/mulSelfilterDirective',
                    'directives/mulSelModelFilterDirective',
                    'directives/offLineTagIdfilterDirective'
                ]
            }).state('main.model.voice', {
                url: '/:id/:day/:type/:selectCenter/:selectFlag/voice',
                templateUrl: 'model/voice/voice.htm',
                controllerUrl: 'model/voice/voiceCtrl',
                controller: 'voiceListCtrl',
                dependencies: [
                    'search/modelKeywordCtrl',
                    'search/moreKeyDirective',
                    'search/searchService',
                    'directives/calendarDirective',
                    'model/voice/callShowDirective'
                ]
            }).state('main.model.add', {
                url: '/addNew/:group/:name/:remark/:id',
                templateUrl: 'model/addNew/addNew.htm',
                controllerUrl: 'model/addNew/modelNewAddCtrl',
                controller: 'modelNewAddCtrl',
                dependencies: [
                    'model/addNew/screenConditionDirective',
                    'model/modelDetailCtrl',
                    'model/addNew/fragmentNewDirective',
                    'model/addNew/modelStructDirective',
                    'model/addNew/modelResultDirective',
                    'search/result/searchResultDirective',
                    'model/onlineModelCtrl',
                    'model/modelTreeGroupDirective',
                    'model/addNew/fragmentRemarkCtrl',
                    'search/modelKeywordCtrl',
                    'search/moreKeyDirective',
                    'search/searchService',
                    'directives/calendarDirective',
                    'model/addNew/silentRuleDirective',
                    'model/addNew/silentScreenDirective',
                    'model/addNew/silenceService',
                    'model/addNew/ruleEditorDirective',
                    'model/addNew/znzsNewDirective',
                    'model/addNew/znzsImpleDirective',
                    'model/addNew/cyssNewDirective',
                    'model/addNew/tjpzNewDirective',
                    'model/addNew/screenNewDirective',
                    'model/addNew/optionSelectDirective',
                    'model/addNew/searchViewDirective',
                    'directives/wholeFilterDirectiveCtrl',
                    'directives/commonFilterService',
                    'directives/mulSelfilterDirective',
                    'directives/offLineTagIdfilterDirective',
                    // 石勇 新增
                    'model/addNew/calendarModelDirectiveCtrl',
                    'directives/mulSelModelFilterDirective',
                    'model/addNew/onlineScreenConditionDirective'
                ]
            }).state('main.search', {
                url: '/search',
                templateUrl: 'search/index.htm',
                controllerUrl: 'search/searchCtrl',
                controller: 'globalSearchCtrl',
                dependencies: [
                    'model/modelService',
                    'analysis/topicService',
                    'analysis/detail/dimensionLibsCtrl',
                    'search/result/searchResultDirective',
                    'search/modelKeywordCtrl',
                    'search/moreKeyDirective',
                    'search/common/commonSearchDirective',
                    'search/result/viewSearchDirective',
                    'search/advance/advanceSearchDirective',
                    'search/common/timeRangeDirective',
                    'search/common/chanelSelectDirective',
                    'search/result/exportSearchResultDirective',
                    'search/advance/advanceTimeDirective',
                    'search/advance/advanceChanelDirective',
                    'search/advance/dimSetDirective',
                    'search/result/exportSearchResultDirective',
                    'search/result/viewDetailSearchDirective',
                    'search/result/viewListSearchDirective',
                    'search/searchService'
                ]
            }).state('main.analysis', {
                url: '/analysis',
                template: '<div ui-view class="content-inner-wrap"></div>',
                dependencies: [
                    'analysis/topicService',
                    'index/custom/customIndexService'
                ]
            }).state('main.analysis.manage', {
                url: '/manage',
                templateUrl: 'analysis/list.htm',
                controllerUrl: 'analysis/listCtrl',
                controller: 'listCtrl',
                dependencies: [
                    'analysis/detail/multiDimensionalCtrl',
                    'model/modelTreeGroupDirective'
                ]
            }).state('main.analysis.busiOverview', {
                url: '/overview',
                templateUrl: 'analysis/busiOverview/busiList.htm',
                controllerUrl: 'analysis/busiOverview/busiListCtrl',
                controller: 'busiListCtrl',
                dependencies: [
                    'analysis/topicTreeDirective',
                    'analysis/busiOverview/callChartDirective',
                    'analysis/busiOverview/modelCallListDirective',
                    'analysis/detail/dimensionLibsCtrl',
                    'directives/calendarDirective',
                    'services/filterService'
                ]
            }).state('main.analysis.groupSetting', {
                url: '/groupSetting/:groupType',
                templateUrl: 'analysis/groupSetting/groupSetting.htm',
                controllerUrl: 'analysis/groupSetting/groupSettingCtrl',
                controller: 'groupSettingCtrl',
                dependencies: [
                    'analysis/groupSetting/groupSettingTreeDirective',
                    'model/modelService'
                ]
            }).state('main.analysis.focusPush', {
                url: '/focuspush',
                templateUrl: 'analysis/focusPush/focusPush.htm',
                controllerUrl: 'analysis/focusPush/focusPushCtrl',
                controller: 'focusPushCtrl',
                dependencies: [
                    'analysis/topicTreeDirective',
                    'analysis/busiOverview/modelCallListDirective',
                    'analysis/detail/dimensionLibsCtrl',
                    'directives/calendarDirective'
                ]
            }).state('main.analysis.detail', {
                url: '/detail/:id/:pathId/:contentType/:moduleId',
                templateUrl: 'analysis/detail/detail.htm',
                controllerUrl: 'analysis/detail/analysisDetailCtrl',
                controller: 'analysisDetailCtrl',
                dependencies: [
                    'analysis/detail/call/callListDirective',
                    'analysis/detail/call/callResultDirective',
                    'analysis/detail/clustering/clusteringResultDirective',
                    'analysis/detail/call/callChartDirective',
                    'directives/addToIndexDirective',
                    'model/modelService',
                    'analysis/detail/dimensionLibsCtrl',
                    'analysis/detail/call/markerLibDiaCtrl',
                    'analysis/detail/multiDimensionalCtrl',
                    'analysis/detail/path/newPathCtrl',
                    'analysis/detail/path/pathManageCtrl',
                    'analysis/detail/dimension/dimensionPopupCtrl',
                    'search/modelKeywordCtrl',
                    'search/moreKeyDirective',
                    'search/searchService',
                    'directives/calendarDirective',
                    'analysis/detail/hotview/hotViewDirective',
                    'analysis/detail/funnel/funnelToolDirective',
                    'model/modelTreeGroupDirective',
                    'analysis/detail/manualRefreshDirective',
                    'analysis/detail/funnel/funnelCallListDirective',
                    'index/custom/customIndexService',
                    'report/reportService',
                    'analysis/detail/dimension/dimensionItemDirective',
                    'analysis/detail/dimension/dimensionValueDirective',
                    'analysis/detail/path/modelPushDirective',
                    'analysis/detail/path/pathEditDirective',
                    'analysis/detail/path/modelRouteDirective',
                    'analysis/detail/viewResultDirective'
                ]
            }).state('main.analysis.hotword', {
                url: '/hotword',
                templateUrl: 'analysis/hotword/hotword-analysis.htm',
                controllerUrl: 'analysis/hotword/hotwordAnalysisCtrl',
                controller: 'hotWordAnalysisCtrl',
                dependencies: [
                    'directives/calendarDirective',
                    'index/system/systemIndexService',
                    'analysis/hotword/hotwordAnalyseListDirective'
                ]
            }).state('main.index', {
                url: '/index',
                template: '<div ui-view class="content-inner-wrap"></div>'
            }).state('main.index.system', {
                url: '/system',
                templateUrl: 'index/system/index.htm',
                controllerUrl: 'index/system/indexCtrl',
                controller: 'indexCtrl',
                dependencies: [
                    'model/modelService',
                    'index/system/callDurationDirective',
                    'index/system/modelStateDirevtive',
                    'index/system/hotPointDirective',
                    'index/system/hotWordDirective',
                    'model/modelTreeGroupDirective',
                    'index/system/timeSelectIndexDirective',
                    'index/system/systemIndexService',
                    'index/system/hotwordHeaderDirective',
                    'index/system/hotwordListDirective',
                    'index/system/indexFooterDirective',
                    'directives/calendarDirective'
                ]
            }).state('main.index.custom', {
                url: '/custom/:id',
                templateUrl: 'index/custom/custom.htm',
                controllerUrl: 'index/custom/customCtrl',
                controller: 'customCtrl',
                dependencies: [
                    'index/custom/reportListDirective',
                    'index/custom/reportColumnDirective',
                    'index/custom/reportChartDirective',
                    'index/custom/selectionTimeDirective',
                    'index/custom/selectionTypeDirective',
                    'menu/menuDetailDirective',
                    'index/custom/analysisChartDirective',
                    'index/custom/analysisClusterDirective',
                    'index/custom/analysisFunnelDirective',
                    'index/custom/analysisHotviewDirective',
                    'index/custom/analysisCustomDirective',
                    'index/custom/customIndexService',
                    'report/reportService',
                    'analysis/topicService'
                ]
            }).state('main.setting', {
                url: '/setting',
                template: '<div ui-view class="content-inner-wrap"></div>'
            }).state('main.setting.dimension', {
                url: '/dimension',
                templateUrl: 'setting/dimension/dimension.htm',
                controllerUrl: 'setting/dimension/globalDimensionCtrl',
                controller: 'globalDimensionCtrl',
                dependencies: [
                    'directives/draggableDirective',
                    'setting/dimension/dimensionService',
                    'setting/dimension/customDimDirective',
                    'setting/dimension/customItemDirective',
                    'setting/dimension/customSelectDirective',
                    'setting/dimension/exportDimensionDirective',
                    'setting/dimension/enumItemDirective',
                    'setting/dimension/systemDimDirective',
                    'setting/dimension/exportErrorDirective',
                    'setting/dimension/exportManageDirective'
                ]
            }).state('main.callList', { // 通话列表
                url: '/callList',
                templateUrl: 'callList/callList.htm',
                controllerUrl: 'callList/callListCtrl',
                controller: 'callListCtrl',
                dependencies: [
                    'directives/calendarDirective',
                    'callList/dimensionCtrl',
                    'callList/callListService',
                    'directives/pagingNewDirective',
                    'services/dialogService',
                    'services/baseService',
                    'services/filterService'
                ]
            }).state('main.setting.hotword', {
                url: '/hotword',
                templateUrl: 'setting/hotword/hotword.htm',
                controllerUrl: 'setting/hotword/globalHotWordCtrl',
                controller: 'globalHotWordCtrl',
                dependencies: [
                    'setting/hotword/hotWordService',
                    'setting/hotword/itemWordDirective'
                ]
            }).state('main.centerdownload', {
                url: '/centerdownload',
                templateUrl: 'centerdownload/centerDownload.htm',
                controllerUrl: 'centerdownload/centerDownloadCtrl',
                controller: 'centerDownloadCtrl',
                dependencies: [
                    'centerdownload/centerDownloadService',
                    'directives/calendarDirective',
                    'directives/pagingNewDirective'
                ]
            }).state('main.others', {
                url: '/others/:url',
                templateUrl: 'others/others.htm',
                controllerUrl: 'others/othersCtrl',
                controller: 'othersCtrl'
            }).state('main.datastatus', { // 数据处理状态模块，leichen13@2017-09-14
                url: '/datastatus',
                templateUrl: 'datastatus/datastatus.htm',
                controllerUrl: 'datastatus/datastatusCtrl',
                controller: 'datastatusCtrl',
                dependencies: [
                    'directives/pagingNewDirective',
                    'datastatus/timeSelectDataDirective',
                    'datastatus/datastatusService'
                ]
            });
        }
    ]);

    // 请求过滤，session过期跳转至登录页
    app.factory('httpInterceptor', ['$q', '$injector', function ($q, $injector) {
        var httpInterceptor = {
            responseError: function (response) {
                return $q.reject(response);
            },
            response: function (response) {
                if (typeof (response.data.errorCode) !== 'undefined' && response.data.errorCode == 'SessionOut') {
                    window.location.href = response.data.value;
                }

                return response;
            }
        };
        return httpInterceptor;
    }]);
});
