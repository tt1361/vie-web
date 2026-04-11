/**
 * 本文件中的directive 实现模型页面的新建模型选择所属模型组的组件
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
     * 树形结构模型组指令
     *
     */
    app.directive('newGroup', [
        'RecursionHelper',
        'modelService', function (RecursionHelper, modelService) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'model/model-tree-group-directive.htm',
                scope: {
                    item: '=',
                    model: '=',
                    type: '@'
                },
                compile: function (element) {
                    return RecursionHelper.compile(element, function (scope, $el, arrt, controller, transcludeFn) {
                        scope.isShow = scope.item.id === 0 ? true : false;
                        scope.groupId = scope.type === 'model' ? scope.model.modelGroupId : scope.model;
                        // 如果groupId不存在
                        if (!scope.groupId) {
                            modelService.searchModelGroup({
                                modelGroupName: ''
                            })
                                .then(function (result) {
                                    scope.groupId = result.value[0].children.length ? result.value[0].children[0].id : 0;
                                });
                        }

                        // 展开收起按钮
                        scope.showOpen = function () {
                            scope.isShow = !scope.isShow;
                        };

                        /**
                         * @brief 选择模型组
                         * @details [long description]
                         * @return [description]
                         */
                        scope.selectName = function () {
                            var $scope = scope;
                            while (angular.isUndefined($scope.selectType)) {
                                $scope = $scope.$parent;
                            }

                            $scope.selectType(scope.item);
                            scope.groupId = scope.item.id;
                            angular.element('.model-group-name a').removeClass('group-selected');
                            $('#model-group_' + scope.item.id).addClass('group-selected');
                        };
                    });
                }
            };
        }
    ]);
});
