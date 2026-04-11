/**
 * 自定义维度控制
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

    app.directive('customDim', ['$document', '$timeout', 'ngDialog', 'dialogService', 'dimensionService', function ($document, $timeout, ngDialog, dialogService, dimensionService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'setting/dimension/custom-dim-directive.htm',
            scope: {
                addAuth: '@',
                delAuth: '@',
                saveAuth: '@',
                importAuth: '@'
            },
            link: function ($scope, element, attrs) {
                // 引入placeholder，解决ie8兼容问题
                $document.find('input').placeholder();
                // 特殊字符的过滤验证，支持.号输入
                var textValidReplace = new RegExp('[`~!@#$%^&*()=|{}\':;\',\\[\\]<>/?~！@#￥……&*（）——|{}【】‘；：”“\'。，、？]');
                // 新增维度
                $scope.addDimension = function () {
                    var item = {
                        dimensionName: '', // 维度名称
                        dimensionType: 'mulSel', // 维度类型英文标识
                        typeName: '枚举', // 维度类型中文标识
                        dimensionValues: [] // 枚举项
                    };
                    // 赋值
                    $scope.chooseItem = angular.copy(item);
                };

                // 导入维度按钮
                $scope.showExportOpen = function () {
                    $scope.exportOpen = !$scope.exportOpen;
                };

                // 搜索框按enter键
                $scope.enterCustomKey = function (event) {
                    event = event || window.event;
                    if (event.keyCode === 13) {
                        $scope.getCustomDim();
                    }
                };

                // 获取自定义维度
                $scope.getCustomDim = function (type) {
                    // 关键词验证
                    if (!$scope.$parent.validKeyWord($scope.keyCustomWord)) {
                        return;
                    }
                    // 调用查询接口
                    dimensionService.getCustomDim({
                        dimensionName: $scope.keyCustomWord
                    })
                        .then(function (result) {
                            $scope.zdyDim = result.value || [];
                            if ($scope.zdyDim.length) {
                                if (angular.isUndefined(type)) {
                                    $scope.showZdyDetail($scope.zdyDim[0]);
                                }
                            }
                            else {
                                $scope.addDimension();
                            }
                        });
                };

                // 编辑维度
                $scope.showZdyDetail = function (item) {
                    $scope.chooseItem = angular.copy(item);
                    dimensionService.searchDimensionById({
                        dimensionId: item.dimensionId
                    })
                        .then(function (result) {
                            $scope.chooseItem.dimensionType = result.value ? result.value.dimensionType : 'mulEqu';
                            $scope.chooseItem.dimensionValues = result.value ? result.value.dimensionValues || [] : [];
                            if ($scope.chooseItem.dimensionType === 'mulSel') {
                                $scope.chooseItem.typeName = '枚举';
                            }
                            else if ($scope.chooseItem.dimensionType === 'mulEqu'
                                || $scope.chooseItem.dimensionType === 'range') {
                                $scope.chooseItem.typeName = '输入';
                            }
                        });

                };

                // 自定义删除按钮
                $scope.delItem = function (id) {
                    if (!id) {
                        return;
                    }
                    dialogService.confirm('确认要删除该维度吗?').then(function () {
                        dimensionService.deletePersonalDimension({
                            dimensionId: id
                        })
                            .then(function (result) {
                                $scope.getCustomDim();
                                dialogService.success(result.message);
                                $timeout(function () {
                                    ngDialog.close('successDialog');
                                }, 500);
                            });
                    });
                };

                // 自定义保存按钮
                $scope.saveItem = function () {
                    if (!$scope.validPreZdy()) {
                        return;
                    }
                    // var params = {dimensionCondition: JSON.stringify($scope.chooseItem)};

                    var params = {
                        dimensionName: $scope.chooseItem.dimensionName,
                        dimensionType: $scope.chooseItem.dimensionType,
                        typeName: $scope.chooseItem.typeName,
                        dimensionValues: JSON.stringify($scope.chooseItem.dimensionValues)
                    };
                    var paramsUpdate = {
                        dimensionName: $scope.chooseItem.dimensionName,
                        dimensionId: $scope.chooseItem.dimensionId,
                        dimensionType: $scope.chooseItem.dimensionType,
                        typeName: $scope.chooseItem.typeName,
                        dimensionValues: JSON.stringify($scope.chooseItem.dimensionValues)

                    };
                    $scope.chooseItem.dimensionId ? $scope.updateZdyDim(paramsUpdate) : $scope.addZdyDim(params);
                    // $scope.addDimension(); //保存后直接到新建维度
                };

                // 更新自定义维度
                $scope.updateZdyDim = function (params) {
                    dimensionService.updatePersonalDimension(params)
                        .then(function (result) {
                            $scope.getCustomDim(1);
                            dialogService.success(result.message);
                            $timeout(function () {
                                ngDialog.close('successDialog');
                            }, 500);
                        });
                };

                // 新增自定义维度
                $scope.addZdyDim = function (params) {
                    dimensionService.addPersonalDimension(params)
                        .then(function (result) {
                            $scope.chooseItem.dimensionId = result.value.dimensionId || 0;
                            $scope.getCustomDim(1);
                            dialogService.success(result.message);
                            $timeout(function () {
                                ngDialog.close('successDialog');
                            }, 500);
                        });
                };

                // 保存前的验证
                $scope.validPreZdy = function () {
                    if (!$scope.$parent.preValidName($scope.chooseItem.dimensionName)) {
                        return;
                    }
                    if ($scope.chooseItem.dimensionType === 'mulSel') {
                        if (!$scope.chooseItem.dimensionValues.length) {
                            dialogService.alert('维度枚举项不能为空');
                            return false;
                        }
                        var isEmpty = false,
                            isValidError = false,
                            isError = false;
                        angular.forEach($scope.chooseItem.dimensionValues, function (item) {
                            if (!item.dimensionName) {
                                isEmpty = true;
                                return;
                            }
                            else {
                                if (item.dimensionName.replace(/[^\x00-\xff]/g, 'xx').length > 20) {
                                    isError = true;
                                    return;
                                }
                                if (textValidReplace.test(item.dimensionName)) {
                                    isValidError = true;
                                    return;
                                }
                            }
                        });

                        if (isEmpty) {
                            dialogService.alert('维度枚举项有名称为空的项存在');
                            return false;
                        }
                        if (isError) {
                            dialogService.alert('枚举项名称不能超过20个字符');
                            return false;
                        }
                        if (isValidError) {
                            dialogService.alert('枚举项名称不能包含特殊字符');
                            return false;
                        }
                        if (isError) {
                            return;
                        }
                        var dinName = [];
                        angular.forEach($scope.chooseItem.dimensionValues, function (item) {
                            dinName.push(item.dimensionName);
                        });
                        var s = dinName.length ? repeatValue(dinName) : '';
                        if (s) {
                            dialogService.alert('枚举项存在重复内容：' + s);
                            return false;
                        }
                    }
                    return true;
                };

                // 判断数组中是否有重复值
                function repeatValue(ary) {
                    var nary = ary.sort();
                    for (var i = 0; i < ary.length; i++) {
                        if (nary[i] === nary[i + 1]) {
                            return nary[i];
                        }
                    }
                    return;
                }

                // 点击页面其他地方关闭导入管理弹窗框
                $(window.document).click(function (event) {
                    if (!angular.element(event.target).parents('.export-dim-wrapper').length
                        && !angular.element(event.target).hasClass('picture-export')
                        && $scope.exportOpen) {
                        $scope.exportOpen = false;
                        $scope.$broadcast('setErrorType');
                    }
                    $scope.$apply();
                });

                $scope.getCustomDim();
            }
        };
    }]);
});
