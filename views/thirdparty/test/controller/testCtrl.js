var test = angular.module('test', ['testService']);
test.controller('testCtrl', function ($scope, $http, $location, $sce, $document, dataTaken) {
    $scope.taskID = '2015122710490419130';
    // 获取测听语音列表
    $scope.getVoiceList = function () {
        dataTaken.getVoiceList({
            callID: $scope.taskID
        })
            .then(function (result) {
                $scope.voiceList = result.rows || [];
                $scope.rowsName = result.rowsName || [];
            });
    };
    $scope.getVoiceList();
});
