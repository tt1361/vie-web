require.config({
    baseUrl: './',
    paths: {
        'angular': 'framework/angular/angular.min',
        'angular-ui-router': 'framework/angular-ui-router/angular-ui-router.min',
        'angular-async-loader': 'framework/angular-async-loader/angular-async-loader.min',
        'angular-loading-bar': 'framework/angular-loading-bar/angular-loading-bar.min',
        'jquery': 'framework/jquery/jquery.min',
        'colResizable': 'framework/colResizable/colResizable-1.5.min',
        'angular-recursion': 'framework/angular-recursion/angular-recursion.min',
        'ngDialog': 'framework/ng-dialog/js/ngDialog.min',
        'highcharts': 'framework/highcharts/highcharts',
        'echarts': 'framework/echarts/echarts.min',
        'echarts-all': 'framework/echarts/echarts-all',
        'exporting': 'framework/highcharts/modules/exporting',
        'jquery-ui': 'framework/jquery-ui/jquery-ui.min',
        'mousewheel': 'framework/mCustomScrollbar/jquery.mousewheel.min',
        'mCustomScrollbar': 'framework/mCustomScrollbar/jquery.mCustomScrollbar',
        'jquery-ui-draggable': 'framework/jquery-ui-draggable/jquery-ui-draggable.min',
        'uploadify': 'framework/uploadify/jquery.uploadify.min',
        'placeholder': 'framework/placeholder/jquery.placeholder.min',
        'canvas2svg': 'framework/html2image/canvg',
        'rgbcolor': 'framework/html2image/rgbcolor',
        'html2canvas': 'framework/html2image/html2canvas.min',
        'json2': 'framework/jquery/json2',
        'jqueryCookie': 'framework/jquery/jquery.cookie',
        'app': 'app'
    },
    shim: {
        'angular': {
            exports: 'angular',
            deps: [
                'jquery',
                'highcharts',
                'exporting'
            ]
        },
        'highcharts': {
            deps: [
                'jquery'
            ]
        },

        'echarts': {
            deps: [
                'jquery'
            ]
        },

        'uploadify': {
            deps: [
                'jquery'
            ]
        },

        'placeholder': {
            deps: [
                'jquery'
            ]
        },

        'jquery-ui-draggable': {
            deps: [
                'jquery'
            ]
        },
        'exporting': {
            deps: [
                'highcharts'
            ]
        },
        'colResizable': {
            deps: [
                'jquery'
            ]
        },
        'angular-ui-router': {
            deps: [
                'angular'
            ]
        },
        'angular-loading-bar': {
            deps: [
                'angular'
            ]
        },
        'angular-async-loader': {
            deps: [
                'angular'
            ]
        },
        'ngDialog': {
            deps: [
                'angular'
            ]
        },
        'jqueryCookie': {
            deps: [
                'jquery'
            ]
        },

        'angular-recursion': {
            deps: [
                'angular'
            ]
        },
        'jquery-ui': {
            deps: [
                'jquery'
            ]
        },
        'mousewheel': {
            deps: [
                'jquery',
                'jquery-ui'
            ]
        },
        'mCustomScrollbar': {
            deps: [
                'jquery',
                'jquery-ui',
                'mousewheel'
            ]
        }
    }
});

require([
    'angular',
    'app-routes',
    'interceptor/interceptor',
    'jquery'
], function (angular) {
    angular.element(document).ready(function () {
        angular.bootstrap(document, [
            'app'
        ]);
        angular.element(document).find('html').addClass('ng-app');
    });
});
