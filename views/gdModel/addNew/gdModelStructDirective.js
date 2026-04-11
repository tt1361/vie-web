/**
 * 本文件中的directive 实现模型详情页面结构化编辑与静音规则切换并预览组件
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
     *  modelStruct 新建模型作则规则编辑
     *  @params:
     *      $document: angular定义的document
     *      modelService: 自定义的接口服务
     *          model: 传递的模型参数
     *          silenceScreen: 传递的静音规则参数
     *          preview: 传递的预览函数
     *          status: 传递的模型状态
     *          previewAuth: 传递的预览权限
     */
    app.directive('gdModelStruct', ['$document', 'gdModelService', function ($document, gdModelService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'gdModel/addNew/gdModel-struct-directive.htm',
            scope: {
                model: '=',
                silenceScreen: '=',
                preview: '&',
                status: '@',
                previewAuth: '@'
            },
            link: function ($scope, element, attrs) {
                // ie8兼容placeholder
                $document.find('textarea').placeholder();

                // 标识是按字还是按词区分， true是按词， false是按字
                $scope.isHaveSilence = true;
                $scope.isTab = 0; // 0结构化编辑，1静音规则

                /*if($scope.model.modelId === -1){
                    // 初始化 FragmentId
                    modelService.getFragmentId($scope.model.previewId).then(function(data){
                        $scope.model.modelFragmentRelation.fragmentId = data.value;
                    })
                }*/

                if ($scope.model.modelId === -1) { // 新增
                    gdModelService.addFregment({
                        previewId: $scope.model.previewId,
                        fragmentContent: '',
                        ruleType: 2,
                        fragmentNum: 0,
                        channel: '2',
                        remark: '',
                        isTag: 0,
                        tagContent: '',
                        tagText: ''
                    }).then(function (response) {
                        if (response.status === 200 && response.data.success) {
                            $scope.model.modelFragmentRelation.fragmentId = response.data.value;
                        }

                        return;
                    });
                }

                /**
                 *   获取是否需要条件配置的接口
                 *    @params: None
                 */
                $scope.getIsHaveSilence = function () {
                    gdModelService.isHaveSilence()
                        .then(function (result) {
                            $scope.isHaveSilence = Number(result.value.isHaveSilence) === 1 ? true : false;
                            // 测试数据
                            // $scope.isHaveSilence = true;
                            $scope.$parent.$parent.preIsHavaSilent = $scope.isHaveSilence;
                            $scope.getTagDimension();
                        });
                };

                /**
                 *   模型标签查询
                 *    @params: None
                 */
                $scope.getTagDimension = function () {
                    gdModelService.getTagDimension({
                        searchType: $scope.isHaveSilence ? 0 : 1
                    }).then(function (result) {
                        $scope.tagDimension = result.value || [];
                    });
                };

                /**
                 *   结构化编辑与静音规则的切换
                 *    @params:
                 *        type: 传递参数， 0显示结构化编辑， 1显示静音规则
                 */
                $scope.showPreGZ = function (type) {
                    $scope.isTab = type;
                    $scope.emitIsTab();
                };

                $scope.emitIsTab = function () {
                    $scope.$emit('get-isTab', {
                        isTab: $scope.isTab
                    });
                };
                $scope.emitIsTab();

                $scope.getIsHaveSilence();

            }
        };
    }]);
});
