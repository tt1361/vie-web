/**
 * 模板页
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

    app.controller('othersCtrl', [
        '$scope',
        '$stateParams', function ($scope, $stateParams) {
            $scope.url = $stateParams.url;
            $scope.url = $scope.url.replace(/-/g, '/') + '.html';
        }
    ]);
});
