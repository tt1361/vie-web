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
    app.directive('bubble', [
        'RecursionHelper',
        '$document',
        '$timeout',
        '$rootScope',
        '$sce',
        '$location',
        'bubbleService', function (RecursionHelper, $document, $timeout, $rootScope, $sce, $location, bubbleService) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'search/bubble-directive.htm',
                scope: {
                    item: '=',
                    callId: '=',
                    voiceId: '=',
                    trIndex: '@'
                },
                compile: function (element) {
                    return RecursionHelper.compile(element, function (scope, $el, arrt, controller, transcludeFn) {
                        scope.uid = Math.floor(Math.random() * 1000) + 1000;
                        scope.point = $rootScope.getGamePoint();
                        scope.autoPlay = false;
                        var bubbleAjaxID = 0;
                        var unHoverTime = 0;
                        var hoverTimer,
                            outTimer;
                        if (scope.point != 'JD') {
                            $el.hover(function (e) {
                                clearTimeout(outTimer);
                                var $this = $(this).find('.bubblue-warp');
                                hoverTimer = setTimeout(function () {
                                    angular.element('.bubblue-warp.active').removeClass('active');
                                    var exitbubble = $this.hasClass('bubble');
                                    if (exitbubble) {
                                        angular.element('.bubblue-warp.active').removeClass('active');
                                        $this.addClass('active');
                                        scope.resetPHeight();
                                        var $iframe = $this.find('iframe');
                                        return;
                                    }

                                    var content = $.trim($this.find('.key-bubblue').text());
                                    if (content === '') {
                                        return;
                                    }

                                    var params = {callId: scope.callId, begin: scope.item.begin, end: scope.item.end};
                                    getKWDContent(content, params, bubbleAjaxID, unHoverTime, $this);
                                }, 500);

                            }, function (e) {
                                clearTimeout(hoverTimer);
                                var $this = $(this).find('.bubblue-warp');
                                outTimer = setTimeout(function () {
                                    // 从元素上移开的时候，如果ajax 请求没有完成， 则取消 Ajax 请求
                                    if (bubbleAjaxID !== 0) {
                                        bubbleAjaxID.abort();
                                        bubbleAjaxID = 0;
                                    }

                                    var $iframe = $this.removeClass('active').find('iframe');
                                    $iframe.attr('src', 'about:blank');
                                }, 500);

                            });
                        }

                        // 判断是否根据任务id查询
                        scope.isShowByTask = false;
                        if ($rootScope.isTask == '1' || $rootScope.isTask === 1) {
                            scope.isShowByTask = true;
                        }
                        else {
                            scope.isShowByTask = false;
                        }
                        scope.getContent = function () {
                            var $this = $el.find('.bubblue-warp');
                            angular.element('.bubblue-warp.active').removeClass('active');
                            var exitbubble = $this.hasClass('bubble');
                            if (exitbubble) {
                                angular.element('.bubblue-warp.active').removeClass('active');
                                $this.addClass('active');
                                scope.resetPHeight();
                                var $iframe = $this.find('iframe');
                                return;
                            }

                            var content = $.trim($this.find('.key-bubblue').text());
                            if (content === '') {
                                return;
                            }

                            var params = {};
                            if (scope.voiceId) {
                                params = {callId: scope.callId, voiceId: scope.voiceId, begin: scope.item.begin, end: scope.item.end};
                            }
                            else {
                                params = {voiceId: scope.callId, begin: scope.item.begin, end: scope.item.end};
                            }
                            getKWDContent(content, params, bubbleAjaxID, unHoverTime, $this);
                        };

                        function getKWDContent(content, params, bubbleAjaxID, unHoverTime, $this) {
                            var nowTime = new Date().getTime();
                            if (unHoverTime + 1000 <= nowTime) {
                                $('.bubble.active').removeClass('active').find('iframe').remove(); // 移出上一次的标签
                                bubbleAjaxID = bubbleService.fetchContactKwContext(params)
                                    .then(function (data) {
                                        var result = data.value ? data.value.context : '';
                                        scope.start = data.value ? data.value.start : 0;
                                        scope.end = data.value ? data.value.end : 0;
                                        scope.duration = data.value ? data.value.duration : 0;
                                        if (!result) {
                                            return;
                                        }

                                        scope.text = result;
                                        if (scope.voiceId) {
                                            bubbleService.getWavFormat({
                                                callId: scope.callId,
                                                voiceId: scope.voiceId,
                                                dataSource: 'vie-flynull'
                                            }).then(function (result) {
                                                scope.chanel = result.value ? result.value.channels : 2;
                                                var $bubble = $el.find('.bubblue-warp-bubblue');
                                                $this.addClass('bubble active');
                                                scope.resetPHeight();
                                            });
                                        }
                                        else {
                                            bubbleService.getWavFormat({
                                                voiceId: scope.callId,
                                                dataSource: 'vie-flynull'
                                            }).then(function (result) {
                                                scope.chanel = result.value ? result.value.channels : 2;
                                                var $bubble = $el.find('.bubblue-warp-bubblue');
                                                $this.addClass('bubble active');
                                                scope.resetPHeight();
                                            });
                                        }

                                    });
                            }
                        }

                        scope.resetPHeight = function () {
                            if (Number(scope.trIndex) === 0) { // 首行
                                var pHeight = $('#p_' + scope.uid).height();
                                if (pHeight > 20) {
                                    $('#p_' + scope.uid).parent().siblings('i.arrow-bubblue.first-list').addClass('hp');
                                    $('#p_' + scope.uid).parents('.bubblue-warp-bubblue.first-list').addClass('hp');
                                }
                                else {
                                    $('#p_' + scope.uid).parent().siblings('i.arrow-bubblue.first-list').removeClass('hp');
                                    $('#p_' + scope.uid).parents('.bubblue-warp-bubblue.first-list').removeClass('hp');
                                }
                            }

                        };

                        // 播放小气泡
                        scope.playbubbleRange = function () {
                            scope.autoPlay = !scope.autoPlay;
                            var $input = $el.find('input:hidden');
                            if ($input.length === 0) {
                                return;
                            }

                            if ($rootScope.isTask) {
                                var URL = $location.protocol() + '://' + $location.host() + ':' + $location.port() + location.pathname.substring(0, location.pathname.indexOf('/', 1))
                                + '/VIE/playRange.jsp?callId=' + scope.callId + '&voiceId=' + scope.voiceId + '&begin=' + scope.start + '&end=' + scope.end + '&duration=' + scope.duration + '&channel=' + scope.chanel;
                            }
                            else {
                                var URL = $location.protocol() + '://' + $location.host() + ':' + $location.port() + location.pathname.substring(0, location.pathname.indexOf('/', 1))
                                + '/VIE/playRange.jsp?voiceId=' + scope.callId + '&begin=' + scope.start + '&end=' + scope.end + '&duration=' + scope.duration + '&channel=' + scope.chanel;
                            }
                            $input.siblings('iframe').remove();
                            $input.after('<iframe src="' + URL + '" name="RangelistenerIframe"></iframe>');
                        };

                        // if clicked outside of calendar
                        $document.on('click', function (e) {
                            if (scope.point === 'JD') {
                                var active = $el.find('.bubblue-warp').hasClass('active');
                                if (!active) {
                                    return;
                                }

                                var i = 0,
                                    ele;

                                if (!e.target) {
                                    return;
                                }

                                for (ele = e.target; ele; ele = ele.parentNode) {
                                    // var nodeName = angular.lowercase(element.nodeName)
                                    if (angular.lowercase(ele.nodeName) === 'bubble' || ele.nodeType === 9) {
                                        break;
                                    }

                                    var uid = scope.$eval(ele.getAttribute('uid'));
                                    if (!!uid && uid === scope.uid) {
                                        return;
                                    }

                                }

                                var $this = $el.find('.bubblue-warp');
                                if (bubbleAjaxID !== 0) {
                                    bubbleAjaxID.abort();
                                    bubbleAjaxID = 0;
                                }

                                var $iframe = $this.removeClass('active').find('iframe');
                                $iframe.attr('src', 'about:blank');
                                scope.$apply();
                            }

                        });
                    });
                }
            };

        }
    ]);

});
