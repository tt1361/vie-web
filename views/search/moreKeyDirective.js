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
    *  本文件中的Controller 实现so
    *
    */
    app.directive('moreKey', [
        '$http',
        'ngDialog',
        '$document',
        '$rootScope',
        'dialogService',
        '$rootScope',
        function ($http, ngDialog, $document, $rootScope, dialogService,$rootScope) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'search/more-keyword-directive.htm',
                scope: {
                  item:'=',
                  callId: '=',
                  taskId:'='
                },
                link: function(scope, element, attrs){
                    if($rootScope.isTask == '1' || $rootScope.isTask == 1){
                        scope.isShowByTask = true;
                    }else{
                        scope.isShowByTask = false;
                    }

                    //内外层判断
                    if(scope.taskId){
                        scope.showMoreByinfo = true;
                    }else{
                        scope.showMoreByinfo = false;
                    }
                    scope.browser = $rootScope.getBowerserInfo();
                    scope.uid = Math.floor(Math.random() * 1000) + 1000;
                    scope.showMoreKeyWord = function(){
                        scope.item.showMore = !scope.item.showMore;
                        element.siblings().find(".bubble.active").removeClass("active");
                    }

                    scope.showMoreKey = function(){
                        if(!scope.taskId){
                            scope.$emit('bubble-more', {item: scope.item, callId: scope.callId});
                        }else{
                            scope.$emit('bubble-more', {item: scope.item, callId: scope.taskId});
                        }
                    }

                     //if clicked outside of calendar
                    $document.on('click', function(e) {
                        var icon = scope.item.showMore;
                        if (!icon) return;

                        var i = 0,
                            ele;

                        if (!e.target) return;

                        for (ele = e.target; ele; ele = ele.parentNode) {
                            // var nodeName = angular.lowercase(element.nodeName)
                            if (angular.lowercase(ele.nodeName) === 'more-key' || ele.nodeType === 9) break;

                            var uid = scope.$eval(ele.getAttribute('uid'));
                            if (!!uid && uid === scope.uid || angular.lowercase(ele.className).indexOf('ngdialog')>-1) {
                                return;
                            }
                            if(angular.lowercase(ele.className).indexOf('menu-wrapper-hidden')>-1){
                                return;
                            }
                        }

                        scope.showMoreKeyWord();
                        scope.$apply();
                    });
                }
            }

        }
    ]);

});