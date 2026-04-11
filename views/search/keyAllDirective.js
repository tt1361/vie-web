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
    *  reportGroupCtrl 实现报表管理  分组区域的逻辑
    *   @params:
    *       $http:  http请求服务Service
    *       $scope: $scope, 作用域Service
    *
    */
    app.directive('keyAll', ['dialogService', function (dialogService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'search/key-all-directive.htm',
            scope: {
                item: '=',
                callId: '='
            },
            link: function ($scope, element, attrs) {
                var textReplace = new RegExp('[`~!@$%^&*()=|{}\':;\',\\[\\].<>/?~！@￥……&*（）——|{}【】‘；：”“\'。，、？]');
                element.find('input').placeholder();
                $scope.$watch('item', function (newValue, oldValue) {
                    if (!newValue) {
                        return;
                    }

                    $scope.showItem = angular.copy($scope.item);
                });

                // 按enter键
                $scope.enterKey = function (event) {
                    event = event || window.event;
                    if (event.keyCode === 13) {
                        $scope.searchKey();
                    }

                };
                // 搜索
                $scope.searchKey = function () {
                    if (!$scope.validWord()) {
                        return;
                    }

                    var validItem = [];
                    angular.forEach($scope.item, function (item) {
                        if (item.word.indexOf($scope.searchKeyword) > -1) {
                            validItem.push(item);
                        }

                    });
                    $scope.showItem = validItem;
                };

                $scope.validWord = function () {
                    if ($scope.searchKeyword) {
                        if ($scope.searchKeyword.replace(/[^\x00-\xff]/g, 'xx').length > 100) {
                            dialogService.alert('搜索字段不能超过100个字符');
                            return false;
                        }

                        if (textReplace.test($scope.searchKeyword)) {
                            dialogService.alert('搜索字段不能包含特殊字符');
                            return false;
                        }
                    }

                    return true;
                };

                $scope.$on('resetKeyWord', function (event, data) {
                    $scope.searchKeyword = '';
                });

                // 关闭弹窗
                $scope.hideKeyAllMapper = function () {
                    $scope.$parent.bubbleShow = false;
                    $scope.$parent.bubbleItem = [];
                    $scope.searchKeyword = '';
                };

                $(window.document).click(function (event) {
                    if (!angular.element(event.target).parents('.key-all-wrapper').length
                        && !angular.element(event.target).hasClass('more-key-bubble')
                        && $scope.bubbleShow) {
                        $scope.bubbleShow = false;
                        $scope.bubbleItem = [];
                        $scope.$broadcast('resetKeyWord');
                    }

                    $scope.$apply();
                });

            }
        };
    }]);

});
