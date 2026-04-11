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
    app.directive('selectionType', ['$http', '$window', '$document', '$q', function ($http, $window, $document, $q) {

        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'index/custom/selection-type-directive.htm',
            scope: {
                type: '@'
            },
            link: function (scope, element, attrs) {
                scope.typeOpen = false;

                /**
                 *切换分析类型
                */
                scope.changeType = function () {
                    if (Number(scope.type) === 43) {
                        scope.typeText = '基础分析';
                    }
                    else if (Number(scope.type) === 44) {
                        scope.typeText = '热词分析';
                    }
                    else if (Number(scope.type) === 42) {
                        scope.typeText = '漏斗工具';
                    }
                    else if (Number(scope.type) === 41) {
                        scope.typeText = '聚类工具';
                    }

                };

                scope.changeType();

                scope.uid = Math.floor(Math.random() * 1000) + 1000;

                /**
                 *展开/收起
                */
                scope.showTypeOpen = function () {
                    scope.typeOpen = !scope.typeOpen;
                };

                /**
                 *切换时间规则
                */
                scope.selectType = function (type) {
                    scope.type = type;
                    scope.changeType();
                    scope.showTypeOpen();
                    scope.$emit('changeContentType', {
                        contentType: type
                    });
                };

                // if clicked outside of calendar
                $document.on('click', function (e) {
                    if (!scope.typeOpen) {
                        return;
                    }

                    var i = 0,
                        ele;

                    if (!e.target) {
                        return;
                    }

                    for (ele = e.target; ele; ele = ele.parentNode) {
                        // var nodeName = angular.lowercase(element.nodeName)
                        if (angular.lowercase(ele.nodeName) === 'selection-type' || ele.nodeType === 9) {
                            break;
                        }

                        var uid = scope.$eval(ele.getAttribute('uid'));
                        if (!!uid && uid === scope.uid) {
                            return;
                        }

                    }

                    scope.showTypeOpen();
                    scope.$apply();
                });
            }

        };
    }]);
});
