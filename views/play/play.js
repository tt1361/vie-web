var app = angular.module('play', ['playService']);
app.controller('playCtrl', function ($scope, $location, $sce, $window, $document, $timeout, dataTaken) {
    $document.find('input').placeholder();
    $scope.taskID = $location.search().taskId || '';
    $scope.voiceId = $location.search().voiceId || '';
    $scope.showIsByTaskId = $scope.taskID || '';
    $scope.dataSource = $location.search().dataSource || 'vie-flynull';
    $scope.isLoad = $location.search().isLoad || 0;
    var sizeStore = 0;
    var getUrl = window.location.href;
    if($location.search().dataSource == undefined){
        var getUrlData = $.cookie("setDataSource").replace(/\"/g, "");
        $scope.getDataSource = getUrl + '&dataSource=' + getUrlData;
    }else{
        $(".inval-input").addClass('dn');
    }
    
    // 新增token逻辑
    var token = $location.search().token
    if (token) {
        localStorage.setItem('h5-token', token)
    }

    // 浏览器为谷歌浏览器采用H5播放器
    if (window.navigator.userAgent.toLowerCase().indexOf('chrome') > 0) {
        $scope.hre = 'playH5.html#';
    }

    // 浏览器为ie浏览器采用sliver浏览器
    if (window.navigator.userAgent.toLowerCase().indexOf('msie') > 0) {
        $scope.hre = 'play.html#';
    }

    // 获取测听语音列表
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
        dataTaken.getVoiceList(params)
            .then(function (result) {
                $scope.voiceList = result.value.rows || [];
                $scope.rowsName = result.value.rowsName || [];
                $scope.callID = $scope.voiceList.length ? $scope.voiceList[0].id : null;
            });
    };

    // 监听模型
    $scope.$on('afterModel', function (event, data) {
        var models = data.models;
        $scope.pContent = [];
        angular.forEach($scope.models, function (model) {
            angular.forEach(model.ruleInfo, function (item) {
                if ($scope.pContent.indexOf(item.content) === -1) {
                    $scope.pContent.push(item.content);
                }

            });
        });
        var width = $(window.parent.document).find('.playtion-right-wrap').width() - 4;
        // 获取音频声道
        dataTaken.getWavFormat({callId: $scope.taskID, voiceId: $scope.voiceId, dataSource:$scope.dataSource})
            .then(function (result) {
                var chanel = result.value ? result.value.channels : 2;
                var URL = $location.protocol() + '://' + $location.host() + ':' +
                $location.port() + location.pathname.substring(0, location.pathname.indexOf('/', 1)) +
                '/VIE/play.jsp?taskId=' + $scope.taskID + '&voiceId=' + $scope.voiceId + '&dataSource=' + $scope.dataSource +  '&width=' + width + '&channel=' + chanel + '&pContent=' + encodeURI(encodeURI($scope.pContent.join('|')));

                $scope.playUrl = $sce.trustAsResourceUrl(URL);
            });
    });

    // 区间测听
    $scope.$on('listenPlay', function (event, data) {
        $window.listenerIframe.playRange(data.item.beginTime * 1000, data.item.endTime * 1000);
    });

    $scope.$on('listenMsg', function (event, data) {
        $scope.$broadcast('showErrorMsgEvent', {
            msg: data.msg
        });
    });

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
        });
    };
    $scope.getVoiceList();
    if ($scope.showIsByTaskId) {
        $scope.getDetailsOfTask();
    }
    $(".area-copy").click(function(){
        if($scope.taskID){
            $("#inviteUrl1").select();
        }else{
            $("#inviteUrl").select();
        }
        document.execCommand('Copy');
        alert("测听地址已复制，可粘贴至火狐浏览器测听。")
    });

});
