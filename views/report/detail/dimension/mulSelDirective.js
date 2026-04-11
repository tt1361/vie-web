/**
    *  本文件中的directives 实现维度选取组件
    * @ item: 维度的详细信息
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
    app.directive('mulSelDimension', ['$timeout', '$document', function ($timeout, $document) {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                item: '=',
                condition: '='
            },
            templateUrl: 'report/detail/dimension/mulSel-directive.htm',
            link: function (scope, element, attrs) {
                $timeout(function () {
                    $document.find('input').placeholder();
                }, 500);
                // 获取该维度下所有的值
                // 为了保护directive 的 维度对象，采用clone的方式返回维度对象
                scope.dimensions = angular.copy(scope.item).value;

                // 展示维度选取框
                scope.name = getName();

                // 是否全部选中，默认全选中
                scope.allChecked = true;

                scope.dialogShow = false;

                // 当有一个未选中是，全选未选中
                angular.forEach(scope.dimensions, function (item) {
                    if (!item.isSelect) {
                        scope.allChecked = false;
                        return;
                    }

                });

                // content
                scope.content = '';

                // 全选切换
                scope.toggleAllChecked = function () {
                    scope.allChecked = !scope.allChecked;
                    angular.forEach(scope.dimensions, function (item) {
                        // if(!scope.content){
                        item.isSelect = scope.allChecked;
                        // }else if(item.value.indexOf(scope.content)>-1){
                        //     item.isSelect = scope.allChecked;
                        // }
                    });
                };

                scope.checkedThis = function (item) {
                    if (!item.isSelect) {
                        scope.allChecked = false;
                        return;
                    }

                    var allchecked = true;
                    angular.forEach(scope.dimensions, function (item) {
                        if (!item.isSelect) {
                            allchecked = false;
                            return false;
                        }

                    });

                    scope.allChecked = allchecked;
                };

                scope.changeDimension = function () {
                    // 组装新的数组
                    var result = {
                        dimensions: [],
                        conditions: []
                    };

                    angular.forEach(scope.dimensions, function (item) {
                        var isPushed = false;
                        angular.forEach(scope.dimensions, function (selectedItem) {
                            if (item.key === selectedItem.key) {
                                result.dimensions.push(selectedItem);
                                if (selectedItem.isSelect) {
                                    result.conditions.push(selectedItem.key);
                                }

                                isPushed = true;
                            }

                        });

                        if (!isPushed) {
                            item.isSelect = false;
                            result.dimensions.push(item);
                        }

                    });

                    scope.item.value = result.dimensions;
                    scope.item.selectValue = getName() === '未选择' ? '' : getName();

                    // 设置条件
                    var haveSetCondition = false;
                    angular.forEach(scope.condition, function (item) {
                        if (item.filed === scope.item.key) {
                            item.value = result.conditions;
                            haveSetCondition = true;
                        }

                    });
                    if (!haveSetCondition) {
                        scope.condition.push({
                            filed: scope.item.key,
                            type: scope.item.type,
                            value: result.conditions
                        });
                    }

                    scope.name = getName();
                    scope.dialogShow = false;
                };

                scope.showSelectDimension = function () {
                    scope.dialogShow = !scope.dialogShow;
                    if (scope.dialogShow) {
                        scope.content = '';
                        scope.dimensions = angular.copy(scope.item).value;
                        scope.allChecked = true;
                        // 当有一个未选中是，全选未选中
                        angular.forEach(scope.dimensions, function (item) {
                            if (!item.isSelect) {
                                scope.allChecked = false;
                                return;
                            }

                        });
                    }

                };

                function getName() {
                    var result = [];

                    angular.forEach(scope.item.value, function (item) {
                        if (angular.isDefined(item.value) && item.isSelect) {
                            result.push(item.value);
                        }

                    });

                    return result.length ? result.join(',') : '未选择';
                }

                // 关闭弹框
                $(window.document).click(function (event) {
                    if (!angular.element(event.target).parents('.dialog-wrap').length
                        && !angular.element(event.target).hasClass('dimension-button')
                        && !angular.element(event.target).hasClass('picture-select-down')
                        && scope.dialogShow) {
                        scope.dialogShow = false;
                    }

                    scope.$apply();
                });
            }
        };

    }
    ]);

});
