var app = angular.module('playH5', ['playService']);
app.controller('playH5Ctrl', function ($scope, $http, $location, $sce, $window, $compile, $document, $timeout, $q, dataTaken, $anchorScroll, $rootScope) {

    /*定义变量*/
    $scope.taskID = $location.search().taskId || '';
    $scope.voiceId = $location.search().voiceId || '';
    $scope.dataSource = $location.search().dataSource || 'vie-flynull';
    $scope.showIsByTaskId = $scope.taskID || '';
    $scope.index = 1;
    var getUrl = window.location.href;
    var aa = window.location.hash;
    var getUrlLen = 11 + aa.length;
    getUrl = getUrl.substring(0, getUrl.length - getUrlLen);
    if($location.search().dataSource == undefined){
        var getUrlData = $.cookie("setDataSource").replace(/\"/g, "");
        if($scope.voiceId != ''){
            $scope.getDataSource = getUrl +'play.html#?voiceId=' + $scope.voiceId + '&dataSource=' + getUrlData;
        }else{
            $scope.getDataSource = getUrl +'play.html#?taskId=' + $scope.taskID + '&dataSource=' + getUrlData;
        }

    }else{
        $(".inval-input").addClass('dn');
    }

    // 新增token逻辑
    var token = $location.search().token
    if (token) {
        localStorage.setItem('h5-token', token)
    }

    $scope.getDataTips = false;
    /*总时长与当前进度时长*/
    $scope.totalTime = 0;
    $scope.totalTime1 = 0;
    $scope.barTime = 0;

    /*详情是否展开*/
    $scope.detailOpen = false;

    /*用于展示的详情*/
    $scope.detailName = [];

    /*用于接受所有详情*/
    $scope.rowsName = [];

    /*是否静音*/
    $scope.muted = false;

    /*是否显示通话列表*/
    $scope.isShowList = false;

    /*是否显示音量进度条*/
    $scope.showVolume = false;

    /*默认播放速率*/
    $scope.speed = 1.0;

    /*进度条位置*/
    $scope.uiValue = 0;

    /*完成事件被调的次数*/
    $scope.completeIndex = 1;

    /*判断是否已经播放过此条录音*/
    $scope.playedVoiceIdList = [];

    /*播放器定时器*/
    var myPlay = '';
    $scope.currentPlaybackUsesAudioDuration = false;

    /*浏览器为谷歌浏览器采用H5播放器*/
    if (window.navigator.userAgent.toLowerCase().indexOf('chrome') > 0) {
        $scope.hre = 'playH5.html#';
    }

    /*浏览器为ie浏览器采用sliver浏览器*/
    if (window.navigator.userAgent.toLowerCase().indexOf('msie') > 0) {
        $scope.hre = 'play.html#';
    }

    /*初始化定位播放某条语音*/
    $timeout(function () {
        var a = $('.' + $scope.voiceId).offset().top - 225;
        $('#play-content-text').animate({
            scrollTop: a
        }, 500);
    }, 500);

    /*定义*/
    var gramControl = null,
        ns = null,
        servicePath = '/VIEWEB/';

    /*插件初始化*/
    window.onload = function () {
        var ns = voiceGram;
        gramControl = ns.builder.buildGram({
            container: 'wave',
            theme: 'default',
            padding: [2],
            changeLayout: 'simplify',
            layout: {
                markIndicatorBarMinimalHeight: 0,
                markIndicatorBarHeight: 0,
                dataCursorVisible: false,
                scrollBarHeight: 1
            },
            events: {
                cursorPositionChanged: cursorPositionChanged,
                playbackStatusChanged: playbackStatusChanged
            }
        });

        /*音量控制 在最下面有setVolume()函数*/
        $('#volume').slider({
            orientation: 'vertical',
            min: 0,
            max: 100,
            value: 100,
            range: 'min',
            animate: true,
            slide: function (event, ui) {
                setVolume((ui.value) / 100);
            }
        });

        /*监空播放器是否在播放状态*/
        myPlay = setInterval(function () {
            var playback = gramControl.playback;
            var audio = getAudioElement();
            if (audio && !audio.ended && audio.currentTime === 0 && audio.readyState >= 2 && !playback.getState()) {
                playback.play();
            }

        }, 1000);
    };
    /*进度条*/
    $('#progress').slider({
        min: 0,
        max: 100,
        value: 0,
        range: 0.01,
        animate: true,
        slide: function (event, ui) {
            $('.play-mPlay').css('display', 'inline-block');
            $('.play-mPause').css('display', 'none');
            $scope.uiValue = ui.value;
            $scope.startime = (ui.value / 100000) * getCurrentDurationMs();
            gramControl.gramCursor.setPosition($scope.startime);
            gramControl.playback.play();
        }
    });

    /*语速条*/
    $('#speed').slider({
        min: 0.6,
        step: 0.2,
        max: 2.2,
        value: 1.0,
        range: 'min',
        animate: true,
        slide: function (event, ui) {
            playAddSpeed(ui.value);
        }
    });

    /*加速播放*/
    var playAddSpeed = function (ui) {
        var playback = gramControl.playback;
        var i = ui;
        playback.setPlaybackRate(i);
        $('#speedValue').html(i);
    };

    /*音量调用函数*/
    var setVolume = function (myVolume) {
        gramControl.playback.setVolume(myVolume);
    };

    var getAudioElement = function () {
        return $('audio')[0] || null;
    };

    var getCurrentDurationMs = function () {
        var audio = getAudioElement();
        if ($scope.currentPlaybackUsesAudioDuration && audio && isFinite(audio.duration) && audio.duration > 0) {
            return Math.round(audio.duration * 1000);
        }
        return $scope.totalTime || 0;
    };

    var syncDurationFromAudio = function () {
        var durationMs = getCurrentDurationMs();
        if (durationMs > 0 && durationMs !== $scope.totalTime) {
            $scope.totalTime = durationMs;
            $scope.totalTime1 = Number((durationMs / 1000).toFixed(3));
            $scope.totalTime2 = Math.round(durationMs / 1000);
            if (!$scope.$$phase) {
                $scope.$applyAsync();
            }
        }
    };

    var bindAudioLifecycle = function () {
        var audio = getAudioElement();
        if (!audio) {
            return;
        }

        $(audio).off('.playH5Duration');
        $(audio).on('loadedmetadata.playH5Duration durationchange.playH5Duration', function () {
            syncDurationFromAudio();
        });
        $(audio).on('ended.playH5Duration', function () {
            $('#progress>div:first').css('width', '100%');
            $('#progress>a:first').css('left', '100%');
        });
    };

    /*数据光标移动回调事件*/
    var cursorPositionChanged = function (gramControl) {
        updatetToolbarTime();
    };

    /*播放状态变化回调事件*/
    var playbackStatusChanged = function (gramControl) {
        // TO DO
        // updateToolbarPlayState();
    };

    /*获取测听语音列表*/
    $scope.getVoiceList = function () {
        if ($scope.showIsByTaskId) {
            var params = {
                callId: $scope.taskID,
                dataSource:$scope.dataSource
            };
        }
        else {
            var params = {
                callId: $scope.voiceId,
                dataSource:$scope.dataSource
            };
        }
        dataTaken.getVoiceList(params).then(function (result) {
            $scope.voiceList = result.value.rows || [];
            if (!$scope.showIsByTaskId) {
                $scope.totalTime = (result.value.rows[0].duration); // 获取通话时长
                $scope.totalTime1 = Number(($scope.totalTime / 1000).toFixed(3)); // 用于判断结束时间
                $scope.totalTime2 = Math.round($scope.totalTime / 1000); // 用于展示时间
            }
            $scope.rowsName = result.value.rowsName || [];
            $scope.callID = $scope.voiceList.length ? $scope.voiceList[0].id : null;
        });
    };

    /*监听模型*/
    $scope.$on('afterModel', function (event, data) {
        var models = data.models;
        $scope.pContent = [];
        angular.forEach($scope.models, function (model) {
            angular.forEach(model.ruleInfo, function (item) {
                if ($scope.pContent.indexOf(item.content) === -1) {
                    $scope.pContent.push(item.content);
                }

            });

            /*遍历所有A标签*/
            $('.content').each(function () {
                var contentext = $(this).text();
                for (var i = 0; i < $scope.pContent.length; i++) {
                    if (contentext.indexOf($scope.pContent[i]) != -1) {
                        $(this).attr({
                            style: 'color:rgb(138, 43, 226)'
                        });
                    }

                }
            });
        });
    });

    /*获取播放参数*/
    $scope.fetchSpeechInfo = function (voiceId) {
        var voiceId = voiceId || $scope.voiceId;
        dataTaken.fetchSpeechInfo({callId: $scope.taskID, voiceId: voiceId,dataSource:$scope.dataSource})
            .then(function (result) {
                var macTag = result.value.macTag || [];
                var voicePath = result.value.voicePath || [];
                var listenUrl = result.value.listenUrl;  // 新增
                if (voicePath.indexOf('#') > -1) {
                    voicePath = voicePath.replace(/#/g, '|$|');
                }

                $scope.showSingleFile(macTag, voicePath, listenUrl);
            });
    };

    /*单声道语音*/
    $scope.showSingleFile = function (macTag, voicePath, listenUrl) {
        var macTag = macTag;
        var voicePath = voicePath;
        $scope.currentPlaybackUsesAudioDuration = false;
        if (gramControl) {
            gramControl.clear();
            gramControl.beginUpdate();
            try {
                gramControl.layout.setVisibleParts(976);
                var playUrl, gramUrl, loadingMode;

                // 新录音：voicePath === '02' 且有 listenUrl
                if (voicePath === '02' && listenUrl) {
                    // 新录音使用 listenUrl
                    playUrl = 'player/play?voicePath=' + encodeURIComponent(voicePath) +
                              '&macTag=' + encodeURIComponent(macTag) +
                              '&listenUrl=' + encodeURIComponent(listenUrl) +
                              '&dataSource=' + $scope.dataSource;
                    gramUrl = playUrl;
                    loadingMode = voiceGram.builder.LoadingMode.audioContext;
                    $scope.currentPlaybackUsesAudioDuration = true;
                } else {
                    // 老录音：原有逻辑
                    playUrl = 'player/play?macTag=' + macTag + '&voicePath=' + voicePath + '&dataSource=' + $scope.dataSource;
                    gramUrl = 'player/getGramData?macTag=' + macTag + '&voicePath=' + voicePath + '&dataSource=' + $scope.dataSource;
                    loadingMode = voiceGram.builder.LoadingMode.http;
                }

                voiceGram.builder.addWavGram(gramControl, loadingMode, {
                    isThumbnailGram: false,
                    gramUrl: gramUrl,
                    playUrl: playUrl
                });
                $('#progress>div:first').css('width', '0%');
                $('#progress>a:first').css('left', '0%');
                $('#barTime').html('0');
                $scope.barTime = 0;
                bindAudioLifecycle();
            }
            finally {
                gramControl.endUpdate();
            }
        }

    };

    /*播放/暂停点击播放*/
    changePlay = function () {
        $('.play-mPlay').css('display', 'inline-block');
        $('.play-mPause').css('display', 'none');
        playOrPause();
    };

    /*播放/暂停点击播放*/
    changePause = function () {
        $('.play-mPlay').css('display', 'none');
        $('.play-mPause').css('display', 'inline-block');
        playOrPause();
    };

    /*播放或者暂停*/
    var playOrPause = function () {
        if (myPlay) {
            clearInterval(myPlay);
        }

        var playback = gramControl.playback,
            playbackState = voiceGram.enums.PlaybackState,
            position = playback.getState() == playbackState.stopped ? gramControl.gramCursor.getPosition() : gramControl.playbackCursor.getPosition();
        gramControl.gramCursor.setPosition(position);
        if (playback) {
            playback.playOrStop();
        }

    };

    /*更新播放时间*/
    var updatetToolbarTime = function () {
        var playback = gramControl.playback,
            playbackState = voiceGram.enums.PlaybackState,
            position = playback.getState() == playbackState.stopped ? gramControl.gramCursor.getPosition() : gramControl.playbackCursor.getPosition();
        wordRoll(position);
        dataCursorProgress();
        judgeCompleteEvent();
    };

    /*字滚动事件*/
    var wordRoll = function (position) {
        var playback = gramControl.playback,
            playbackState = voiceGram.enums.PlaybackState,
            position = playback.getState() == playbackState.stopped ? gramControl.gramCursor.getPosition() : gramControl.playbackCursor.getPosition();
        $scope.barTime = Math.round(position * 1000);
        $('#barTime').html(Math.round($scope.barTime / 1000));

        /*遍历所有A标签*/
        $('.content_' + $scope.voiceId).each(function () {
            var endtimes = $(this).attr('id');
            var n = endtimes.indexOf('_');
            var endtime = endtimes.substring(n + 1);
            // 模型关键字不变色
            if ($('#' + endtimes + '').css('color') != 'rgb(138, 43, 226)') {
                // 搜索结果不变色
                if ($('#' + endtimes + '').css('color') != 'rgb(7, 139, 54)') {
                    if ( (endtime < parseFloat(position) * 1000) ) {
                        $('#' + endtimes + '').attr({
                            style: 'color:red'
                        });
                        $scope.id = '#' + endtimes + '';
                        scrollTop(endtimes, HeightAuto);
                    }
                    else {
                        $('#' + endtimes + '').attr({
                            style: 'color:#000'
                        });
                    }
                }
            }

        });
    };

    /*判断是否已播放完成*/
    var dataCursorProgress = function () {
        var playback = gramControl.playback,
            playbackState = voiceGram.enums.PlaybackState,
            position = playback.getState() == playbackState.stopped ? gramControl.gramCursor.getPosition() : gramControl.playbackCursor.getPosition();
        var rate;
        var durationMs = getCurrentDurationMs();
        if (position && durationMs > 0) {
            rate = position / (durationMs / 1000);
            rate = Math.max(0, Math.min(rate, 1));
            $('#progress>div:first').css('width', rate * 100 + '%');
            $('#progress>a:first').css('left', rate * 100 + '%');
        }
        else {
            rate = 0;
        }
    };

    /*判断是否已播放完成*/
    var judgeCompleteEvent = function () {
        var n = $('audio')[0].ended ? 1 : 0,
            index = 0;
        if ($scope.playedVoiceIdList) {
            $.each($scope.playedVoiceIdList, function (a, item) {
                console.log('item.voiceId', item.voiceId, '$scope.voiceId', $scope.voiceId);
                if (item.voiceId == $scope.voiceId) {
                    index = 1;
                }
            });
        }
        if (n && index === 0) {
            $scope.playedVoiceIdList.push({
                voiceId: $scope.voiceId
            });
            completeEvent();
        }
    };

    /*找到子元素在父元素中的相对位置*/
    function getElementTop(element) {
        var el = (typeof element == 'string') ? document.getElementById(element) : element;

        if (el != null) {
            if (el.parentNode === null || el.style.display == 'none') {
                return false;
            }

            return el.offsetTop - el.parentNode.offsetTop;
        }
    }
    var HeightAuto = 360;
    function scrollTop(endtime, Height) {
        if (getElementTop(endtime) >= Height) {
            document.getElementById('play-content-text').scrollTop = document.getElementById('play-content-text').scrollTop + 30;
            HeightAuto = getElementTop(endtime) + $('#' + endtime + '').height();
        }
    }

    /*播放完成事件*/
    var completeEvent = function () {
        console.log('播放完成事件');
        $('.play-mPlay').css('display', 'none');
        $('.play-mPause').css('display', 'inline-block');
        if ($scope.child_fields) {
            $.each($scope.child_fields, function (index, item) {
                if (item.childVoiceId === $scope.voiceId) {
                    if ($scope.child_fields.length > index + 1) {
                        var data = $scope.child_fields[index + 1];
                        var newVoiceId = data.childVoiceId;
                        var oldVoiceId = $scope.child_fields[index].childVoiceId;
                        var totalTime = data.childDuration;
                        var macTag = data.childMachineId;
                        var voicePath = data.childVoiceUri;
                        var listenUrl = data.listenUrl;  // 新增
                        var a = $('.' + newVoiceId).offset().top;
                        var b = $('.' + oldVoiceId).offset().top;
                        var c = a - b;
                        $scope.showSingleFile(macTag, voicePath, listenUrl);
                        $timeout(function () {
                            $('#play-content-text').animate({
                                scrollTop: c
                            }, 500);
                            $scope.voiceId = newVoiceId;
                            $scope.totalTime2 = Math.round(totalTime / 1000);
                            $scope.totalTime = totalTime;
                            gramControl.gramCursor.setPosition(0);
                            gramControl.playback.stop();
                            changePlay();
                        }, 500);
                        return;
                    }
                }

            });
        }

    };

    /*音频信息*/
    $scope.getDetailsOfTask = function (voiceId) {
        dataTaken.getDetailsOfTask({
            callId: $scope.taskID,
            dataSource:$scope.dataSource
        }).then(function (data) {
            $scope.child_fields = data.value.values.child_fields;
            $scope.columns = data.value.values.columns;
            if (!$scope.voiceId) {
                $scope.voiceId = '';
                $scope.voiceId = data.value.values.child_fields[0].childVoiceId;
            }
            $scope.voiceId = voiceId || $scope.voiceId;
            var voiceIds = $scope.voiceId;
            $scope.fetchSpeechInfo(voiceIds);
            $scope.totalTime = 0;
            angular.forEach($scope.child_fields, function (item) {
                if (item.childVoiceId === $scope.voiceId) {
                    $scope.totalTime = item.childDuration;
                }
            });
            $scope.totalTime1 = Number(($scope.totalTime / 1000).toFixed(3)); // 用于判断结束时间
            $scope.totalTime2 = Math.round($scope.totalTime / 1000); // 用于展示时间
        });
    };

    /*是否显示音量进度条*/
    $scope.showPlayVolume = function () {
        $scope.showVolume = !$scope.showVolume;
    };

    /*音量or静音*/
    $scope.volumeOrMute = function () {
        var playback = gramControl.playback;
        if (playback.getMuted()) {
            playback.setMuted(false);
        }
        else {
            playback.setMuted(true);
        }
    };

    /*获取文本*/
    var idS = [];
    $scope.getContent = function () {
        if ($scope.showIsByTaskId) {
            var params = {
                callId: $scope.taskID,
                dataSource:$scope.dataSource
            };
        }
        else {
            var params = {
                callId: $scope.voiceId,
                dataSource:$scope.dataSource
            };
        }
        dataTaken.getContent(params).then(function (result) {
            var value = result.value;
            dataValue = result.value;
            angular.forEach(value, function (value) {
                if ($scope.showIsByTaskId) {
                    var voiceId = value[0].childVoiceId;
                }
                else {
                    var voiceId = $scope.voiceId;
                }
                var tpl = '<fieldset style=\'border:1px dashed #07b2b1;margin-bottom: 15px;\' class=\'' + voiceId + '\'><legend style=\'margin: 0 40px;\'><h3>流水号：' + voiceId + '</h3></legend><div id =' + voiceId + ' class=\'play-content-text-1\'>';
                $.each(value, function (key, value) {
                    var times = value.time.split(' ');
                    var contents = value.content.split(' ');
                    if (contents.length > 0) {
                        for (var i = 0; i < contents.length; i++) {
                            var setime = times[i].split(',');
                            var starttime = setime[0] / 1000;
                            var endtime = setime[1] / 1000;
                            idS.push(setime[0]);
                            if (contents[i].length > 1) {
                                if (i == 0) {
                                    tpl += '<a href=\'javascript:void(0)\' style=\'color: #000\' class=\'content content_' + voiceId + '\'  id=\'' + voiceId + '_' + setime[0] + '\' ng-click = setSelection1(' + starttime + ',' + endtime + ',' + '\'' + voiceId + '\'' + ')>' + value.channel + '&nbsp;&nbsp;' + contents[i] + '&nbsp;' + '</a>';
                                }
                                else {
                                    tpl += '<a href=\'javascript:void(0)\' style=\'color: #000\' class=\'content content_' + voiceId + '\'  id=\'' + voiceId + '_' + setime[0] + '\' ng-click = setSelection1(' + starttime + ',' + endtime + ',' + '\'' + voiceId + '\'' + ')>' + contents[i] + '&nbsp;' + '</a>';
                                }
                            }
                            else {
                                if (i == 0) {
                                    tpl += '<a style=\'color: #000\' class=\'content content_' + voiceId + '\'  id=\'' + voiceId + '_' + setime[0] + '\'>' + value.channel + '&nbsp;&nbsp;' + contents[i] + '&nbsp;' + '</a>';
                                }
                                else {
                                    tpl += '<a style=\'color: #000\' class=\'content content_' + voiceId + '\'  id=\'' + voiceId + '_' + setime[0] + '\'>' + contents[i] + '&nbsp;' + '</a>';
                                }
                            }
                        }
                        tpl += '<br/>';
                    }

                });
                tpl += '</div></fieldset>';
                var el = $compile(tpl)($scope);
                $('#play-content-text').append(el);
            });
        });
    };

    /*点击播放*/
    $scope.setSelection1 = function (selectStart, selectEnd, voiceId) {
        if ($scope.voiceId != voiceId) {
            var arr = $scope.child_fields;
            var newArr = arr.filter(function (item) {
                return (item.childVoiceId === voiceId);
            });
            var macTag = newArr[0].childMachineId;
            var voicePath = newArr[0].childVoiceUri;
            var listenUrl = newArr[0].listenUrl;  // 新增
            $scope.showSingleFile(macTag, voicePath, listenUrl);
            $timeout(function () {
                $scope.totalTime2 = 0;
                $scope.totalTime = newArr[0].childDuration;
                $scope.totalTime2 = Math.round(newArr[0].childDuration / 1000);
                $scope.voiceId = voiceId;
                gramControl.gramCursor.setPosition(selectStart);
                gramControl.playback.play();
                $('.play-mPlay').css('display', 'inline-block');
                $('.play-mPause').css('display', 'none');
            }, 1000);
        }
        else {
            gramControl.gramCursor.setPosition(selectStart);
            gramControl.playback.play();
            $('.play-mPlay').css('display', 'inline-block');
            $('.play-mPause').css('display', 'none');
        }
    };

    /*区间测听*/
    $scope.$on('listenPlay', function (event, data) {
        var starttime = data.item.beginTime * 1000; // 时间换算单位统一
        var targetId = $scope.getTargetId(starttime);
        $scope.goto(targetId);
        if (getElementTop($scope.voiceId + '_' + targetId) + $('#' + targetId + '').height() >= 720) {
            HeightAuto = getElementTop($scope.voiceId + '_' + targetId) + 379;
        }

        idFirst = Math.round((targetId) / 1000);
        gramControl.gramCursor.setPosition(idFirst);
        gramControl.playback.play();
        $('.play-mPlay').css('display', 'inline-block');
        $('.play-mPause').css('display', 'none');
    });

    /*获取需要的开始时间点id*/
    $scope.getTargetId = function (starttime) { // starttime统一为s
        var idsNew = []; // 设置一个符合条件的数组
        angular.forEach(idS, function (id) {
            if (id >= starttime) {
                idsNew.push(id);
                return;
            }

        });
        return idsNew[0];
    };

    // 按回车搜索
    $scope.searchEnter = function (event) {
        event = event || window.event;
        if (event.keyCode == 13) {
            $scope.searchText();
        }

    };

    /*搜索文本*/
    var posNum = 1;
    $scope.searchText = function () {
        posText = [];
        var searchTotal = 0;
        posNum = 1;
        if (search_input.value == '') {
            $scope.$broadcast('showErrorMsgEvent', {
                msg: '搜索内容不能为空'
            });
            return;
        }
        else {
            $('.content').each(function () {
                var endtime = $(this).attr('id');
                var color = $('#' + endtime + '').css('color');
                if (color === 'rgb(7, 139, 54)') {
                    $('#' + endtime + '').attr({
                        style: 'color:black'
                    });
                }

                if (color === 'color:rgb(255, 0, 0)') {
                    $('#' + endtime + '').attr({
                        style: 'rgb(255, 0, 0)'
                    });
                }

            });
            // $.each(dataValue, function (key, value) {
            angular.forEach(dataValue, function (dataValue) {
                var voiceId = dataValue[0].childVoiceId;
                if ($scope.showIsByTaskId) {
                    var voiceId = dataValue[0].childVoiceId;
                }
                else {
                    var voiceId = $scope.voiceId;
                }
                angular.forEach(dataValue, function (value) {
                    var contents = value.content.split(' ');
                    var times = value.time.split(' ');
                    if (contents.length > 0 && value.content.replace(/ /g, '').indexOf(search_input.value) != -1) {
                        for (var i = 0; i < contents.length; i++) {
                            if (contents[i].indexOf(search_input.value) != -1) { // 不完全匹配
                                if (($('#' + voiceId + '_' + times[i].split(',')[0]).text().indexOf(search_input.value)) != -1) {
                                    $('#' + voiceId + '_' + times[i].split(',')[0]).attr({
                                        style: 'color:rgb(7, 139, 54);font-weight: bold;'
                                    });
                                    var time = [];
                                    time.push(voiceId + '_' + times[i].split(',')[0]);
                                    posText.push(time.join(','));
                                    searchTotal++;
                                }
                            }
                            else if (value.content.replace(/ /g, '').indexOf(search_input.value) != -1) {
                                if ((search_input.value.indexOf(contents[i])) != -1) {
                                    var lastContent,
                                        prevContent,
                                        prevLocation,
                                        nowLocation,
                                        lastLocation,
                                        time = [],
                                        prevMatch = false,
                                        lastMatch = false;
                                    var nowLocation = search_input.value.indexOf(contents[i]);
                                    var p = i - 1,
                                        l = i + 1;
                                    if (p > -1) {
                                        prevContent = contents[p];
                                    }

                                    if (l < contents.length) {
                                        lastContent = contents[l];
                                    }

                                    while (prevContent) {
                                        if (search_input.value.indexOf(prevContent) > -1) { // 全部匹配
                                            prevLocation = search_input.value.indexOf(prevContent);
                                            if (prevLocation <= nowLocation) { // 在当前位置之前
                                                $('#' + voiceId + '_' + times[p].split(',')[0]).attr({
                                                    style: 'color:rgb(7, 139, 54);font-weight: bold;'
                                                });
                                                if ($.inArray(voiceId + '_' + times[p].split(',')[0], time) === -1) {
                                                    time.push(voiceId + '_' + times[p].split(',')[0]);
                                                }

                                                prevMatch = true;
                                                if (p >= 1) {
                                                    p--;
                                                    prevContent = contents[p];
                                                }
                                                else {
                                                    return;
                                                }
                                            }
                                            else {
                                                prevContent = '';
                                            }
                                        }
                                        else { // 不全部匹配
                                            angular.forEach(prevContent, function (item) {
                                                if (search_input.value.indexOf(item) > -1) {
                                                    prevLocation = search_input.value.indexOf(item);
                                                    if (prevLocation <= nowLocation) { // 在当前位置之前
                                                        $('#' + voiceId + '_' + times[p].split(',')[0]).attr({
                                                            style: 'color:rgb(7, 139, 54);font-weight: bold;'
                                                        });
                                                        if ($.inArray(voiceId + '_' + times[p].split(',')[0], time) === -1) {
                                                            time.push(voiceId + '_' + times[p].split(',')[0]);
                                                        }

                                                        prevMatch = true;
                                                    }

                                                    return;
                                                }

                                            });
                                            prevContent = '';
                                        }
                                    }
                                    if (prevMatch) {
                                        if ($.inArray(voiceId + '_' + times[i].split(',')[0], time) === -1) {
                                            time.push(voiceId + '_' + times[i].split(',')[0]);
                                        }
                                    }

                                    while (lastContent) {
                                        if (search_input.value.indexOf(lastContent) > -1) { // 全部匹配
                                            lastLocation = search_input.value.indexOf(lastContent);
                                            if (lastLocation >= nowLocation) { // 在当前位置之后
                                                lastMatch = true;
                                                if (lastMatch) {
                                                    if ($.inArray(voiceId + '_' + times[i].split(',')[0], time) === -1) {
                                                        time.push(voiceId + '_' + times[i].split(',')[0]);
                                                    }
                                                }

                                                $('#' + voiceId + '_' + times[l].split(',')[0]).attr({
                                                    style: 'color:rgb(7, 139, 54);font-weight: bold;'
                                                });
                                                if ($.inArray(voiceId + '_' + times[l].split(',')[0], time) === -1) {
                                                    time.push(voiceId + '_' + times[l].split(',')[0]);
                                                }

                                                if (l < contents.length - 1) {
                                                    l++;
                                                    lastContent = contents[l];
                                                }
                                                else {
                                                    return;
                                                }
                                            }
                                            else {
                                                lastContent = '';
                                            }
                                        }
                                        else { // 不完全匹配
                                            angular.forEach(lastContent, function (item) {
                                                if (search_input.value.indexOf(item) > -1) {
                                                    lastLocation = search_input.value.indexOf(item);
                                                    if (lastLocation >= nowLocation) { // 在当前位置之后
                                                        lastMatch = true;
                                                        if (lastMatch) {
                                                            if ($.inArray(times[i].split(',')[0], time) === -1) {
                                                                time.push(times[i].split(',')[0]);
                                                            }
                                                        }

                                                        $('#' + voiceId + '_' + times[l].split(',')[0]).attr({
                                                            style: 'color:rgb(7, 139, 54);font-weight: bold;'
                                                        });
                                                        if ($.inArray(voiceId + '_' + times[l].split(',')[0], time) === -1) {
                                                            time.push(voiceId + '_' + times[l].split(',')[0]);
                                                        }
                                                    }

                                                    return;
                                                }

                                            });
                                            lastContent = '';
                                        }

                                    }
                                    if (prevMatch || lastMatch) {
                                        $('#' + voiceId + '_' + times[i].split(',')[0]).attr({
                                            style: 'color:rgb(7, 139, 54);font-weight: bold;'
                                        });
                                    }

                                    if (time.length) {
                                        time = time.sort(sortNumber());
                                        if ($.inArray(time.join(','), posText) === -1) {
                                            posText.push(time.join(','));
                                            searchTotal++;
                                        }
                                    }
                                }
                            }

                        }
                    }

                });
            });
            if (posText.length) {
                var ids = posText[0].split(',');
                angular.forEach(ids, function (id) {
                    $('#' + id).attr({
                        style: 'color:rgb(7, 139, 54);font-weight: bold;background-color: rgb(252, 239, 8);'
                    });
                });
            }

            $('#searchTotal').html(searchTotal);
            if (searchTotal === 0) {
                $('#searchOrder').html('0');
            }
            else if (searchTotal > 0) {
                $('#searchOrder').html('1');
            }
        }
    };

    /*排序*/
    function sortNumber(a, b) {
        return a - b;
    }

    var round = function (v, e) {
        var t = 1;
        for (; e > 0; t *= 10, e--) {

        }
        for (; e < 0; t /= 10, e++) {

        }
        return Math.round(v * t) / t;
    };

    /*搜索文本上一个*/
    $scope.prior = function () {
        if (search_input.value == '') {
            $scope.$broadcast('showErrorMsgEvent', {
                msg: '请搜索后点击'
            });
            return;
        }

        if (posNum > 1) {
            var ids = posText[posNum - 1].split(',');
            angular.forEach(ids, function (id) {
                document.getElementById(id).scrollIntoView(false);
            });
            var ppids = posText[posNum - 2].split(',');
            var pids = posText[posNum - 1].split(',');
            angular.forEach(ppids, function (id) {
                $('#' + id).attr({
                    style: 'color:rgb(7, 139, 54);font-weight: bold;background-color: rgb(252, 239, 8);'
                });
            });

            angular.forEach(pids, function (id) {
                $('#' + id).attr({
                    style: 'color:rgb(7, 139, 54);font-weight: bold;'
                });
            });
            posNum--;
            $('#searchOrder').html(posNum);
        }

    };

    /*搜索文本下一个*/
    $scope.next = function () {
        if (search_input.value == '') {
            $scope.$broadcast('showErrorMsgEvent', {
                msg: '请搜索后点击'
            });
            return;
        }

        if (posNum < posText.length) {
            var ids = posText[posNum].split(',');
            angular.forEach(ids, function (id) {
                document.getElementById(id).scrollIntoView(false);
                $('#' + id).attr({
                    style: 'color:rgb(7, 139, 54);font-weight: bold;background-color: rgb(252, 239, 8);'
                });
            });
            var pids = posText[posNum - 1].split(',');
            angular.forEach(pids, function (id) {
                $('#' + id).attr({
                    style: 'color:rgb(7, 139, 54);font-weight: bold;'
                });
            });
            posNum++;
            $('#searchOrder').html(posNum);
        }

    };

    /*设置锚点跳转定位*/
    $scope.goto = function (id) {
        $location.hash(id);
        $anchorScroll();
        HeightAuto = 360;
    };

    $scope.$on('listenMsg', function (event, data) {
        $scope.$broadcast('showErrorMsgEvent', {
            msg: data.msg
        });
    });
    //document.addEventListener("copy", copy);
    //function copy(oEvent){
    //    //取消浏览器的默认动作，一般一定要有，请谨慎使用
    //    oEvent.preventDefault();
    //    oEvent.clipboardData.setData("text", "自定义数据");
    //    $(".play-error-tip").removeClass('dn');
    //    $timeout(function () {
    //        $(".play-error-tip").addClass('dn');
    //    }, 2000);
    //}
    $("#inviteUrl").focus(function(){
        this.select();
    });
    $("#inviteUrl1").focus(function(){
        this.select();
    });
    var clipboard = new Clipboard('.area-copy');
    clipboard.on('success', function(e) {
        $(".play-error-tip").removeClass('dn');
        $(".play-error-tip").html("测听地址已复制，可粘贴至火狐浏览器测听。")
        $timeout(function () {
            $(".play-error-tip").addClass('dn');
        }, 2000);
    });
    clipboard.on('error', function(e) {
        $(".play-error-tip").removeClass('dn');
        $(".play-error-tip").html("浏览器不支持一键复制，请点击文本框内容按Ctrl+c进行复制。")
        $timeout(function () {
           $(".play-error-tip").addClass('dn');
        }, 2000);
    });

    /*初始化*/
    var initFunction = function () {
        $scope.getVoiceList();
        $scope.getContent();
        if ($scope.showIsByTaskId) {
            $scope.getDetailsOfTask();
        }
        else {
            $scope.fetchSpeechInfo();
        }
    };

    initFunction();

});
