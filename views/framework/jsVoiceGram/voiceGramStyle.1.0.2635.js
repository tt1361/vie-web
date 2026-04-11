/**
 * Created by jwni on 2014/12/4.
 */

'use strict';

voiceGram = voiceGram || {};
voiceGram.styles = voiceGram.styles || {};

/// <summary>
/// 内嵌资源的枚举
/// </summary>
/// <remarks>
/// BuildInStyles枚举了所有内嵌的风格
/// </remarks>
voiceGram.styles.BuildInStyles = (function () {

    var defaultStyle = {
        backColor: 'rgb(64, 64, 64)',
        borderHighColor: 'rgb(78, 78, 78)',
        borderLowColor: 'rgb(0, 0, 0)',
        defaultGramColor: 'rgb(67, 217, 150)',
        gramArea: {
            defaultBackColor: 'black',
            gridLineDefault: {
                color: 'rgb(0, 53, 0)',
                dashStyle: 'solid'
            },
            fixedLineDefault: {
                color: 'red',
                dashStyle: 'solid'
            },
            fixedLabelDefaultStyle: {
                name: 'arial,sans-serif',
                size: 8,
                unit: 'pt',
                style: 'normal'
            },
            drawDataPoints: true
        },
        axis: {
            backColor: 'rgb(55, 55, 55)',
            tickMarkColor: 'rgb(201, 201, 201)',
            tickMarkLabelColor: 'rgb(201, 201, 201)',
            tickMarkLabelFont: {
                name: 'arial,sans-serif',
                size: 8,
                unit: 'pt',
                style: 'normal'
            },
            majorTickMarkSize: 6,
            minorTickMarkSize: 4
        },
        scrollBar: {
            backColor: 'black',
            contentColor: 'white',
            contentBorderColor: 'orange'
        },
        selection: {
            axisHighlightColor: '',
            axisBorderColor: 'white',
            gramAreaHighlightColor: '#F5F5FF',
            gramAreaBorderColor: 'white'
        },
        marker: {
            markerLine: {
                color: '#ffffff',
                dashStyle: 'custom',
                dashPattern: [2, 2]
            },
            labelColor: '#ffffff',
            labelFont: {
                name: 'arial,sans-serif',
                size: 8,
                unit: 'pt',
                style: 'normal'
            },
            indicatorColor: 'white',
            indicatorHeight: '15'
        },
        cursor: {
            indicatorColor: 'rgb(235, 180, 4)',
            cursorLine: {
                color: 'rgb(191, 0, 0)',
                dashStyle: 'solid'
            }
        },
        dataCursor: {
            dataLabel: {
                textColor: 'black',
                borderColor: 'black',
                backColor: 'rgb(255, 255, 204)',
                borderStyle: 'fixedSingle',
                fixedSingleBorderStyle: 'solid',
                fixed3DBorderStyle: 'sunkenInner'
            },
            dataLabelFont: {
                name: 'arial,sans-serif',
                size: 9,
                unit: 'pt',
                style: 'normal'
            },
            axisLabel: {
                textColor: 'black',
                borderColor: 'black',
                backColor: 'rgb(255, 255, 204)',
                borderStyle: 'fixedSingle',
                fixedSingleBorderStyle: 'solid',
                fixed3DBorderStyle: 'sunkenInner'
            },
            dataCursorLine: {
                color: 'rgb(255, 0, 0)',
                dashStyle: 'dot'
            }
        }
    };

    var gray = {
        backColor: 'rgb(52, 52, 52)',
        borderHighColor: 'rgb(62, 62, 62)',
        borderLowColor: 'rgb(10, 10, 10)',
        defaultGramColor: 'rgb(67, 217, 150)',
        gramArea: {
            defaultBackColor: 'black',
            gridLineDefault: {
                color: 'rgb(0, 53, 0)',
                dashStyle: 'solid'
            },
            fixedLineDefault: {
                color: 'red',
                dashStyle: 'solid'
            },
            fixedLabelDefaultStyle: {
                name: 'arial,sans-serif',
                size: 8,
                unit: 'pt',
                style: 'normal'
            },
            drawDataPoints: true
        },
        axis: {
            backColor: 'rgb(44, 44, 44)',
            tickMarkColor: 'rgb(185, 185, 185)',
            tickMarkLabelColor: 'rgb(196, 196, 196)',
            tickMarkLabelFont: {
                name: 'arial,sans-serif',
                size: 8,
                unit: 'pt',
                style: 'normal'
            },
            majorTickMarkSize: 6,
            minorTickMarkSize: 4
        },
        scrollBar: {
            backColor: 'black',
            contentColor: 'white',
            contentBorderColor: 'orange'
        },
        selection: {
            axisHighlightColor: '',
            axisBorderColor: 'white',
            gramAreaHighlightColor: '#F5F5FF',
            gramAreaBorderColor: 'white'
        },
        marker: {
            markerLine: {
                color: 'yellow',
                dashStyle: 'custom',
                dashPattern: [2, 2]
            },
            labelColor: 'white',
            labelFont: {
                name: 'arial,sans-serif',
                size: 8,
                unit: 'pt',
                style: 'normal'
            },
            indicatorColor: 'yellow',
            indicatorHeight: '15'
        },
        cursor: {
            indicatorColor: 'rgb(236, 181, 5)',
            cursorLine: {
                color: 'yellow',
                dashStyle: 'solid'
            }
        },
        dataCursor: {
            dataLabel: {
                textColor: 'black',
                borderColor: 'black',
                backColor: 'rgb(255, 255, 204)',
                borderStyle: 'fixedSingle',
                fixedSingleBorderStyle: 'solid',
                fixed3DBorderStyle: 'sunkenInner'
            },
            dataLabelFont: {
                name: 'arial,sans-serif',
                size: 9,
                unit: 'pt',
                style: 'normal'
            },
            axisLabel: {
                textColor: 'black',
                borderColor: 'black',
                backColor: 'rgb(255, 255, 204)',
                borderStyle: 'fixedSingle',
                fixedSingleBorderStyle: 'solid',
                fixed3DBorderStyle: 'sunkenInner'
            },
            dataCursorLine: {
                color: 'rgb(255, 0, 0)',
                dashStyle: 'dot'
            }
        }
    };

    var light = {
        backColor: 'rgb(242, 242, 242)',
        borderHighColor: 'white',
        borderLowColor: 'rgb(102, 102, 102)',
        defaultGramColor: 'rgb(67, 217, 150)',
        gramArea: {
            defaultBackColor: 'black',
            gridLineDefault: {
                color: 'rgb(0, 53, 0)',
                dashStyle: 'solid'
            },
            fixedLineDefault: {
                color: 'red',
                dashStyle: 'solid'
            },
            fixedLabelDefaultStyle: {
                name: 'arial,sans-serif',
                size: 8,
                unit: 'pt',
                style: 'normal'
            },
            drawDataPoints: true
        },
        axis: {
            backColor: 'rgb(217, 217, 217)',
            tickMarkColor: 'rgb(43, 43, 43)',
            tickMarkLabelColor: 'rgb(79, 79, 79)',
            tickMarkLabelFont: {
                name: 'arial,sans-serif',
                size: 8,
                unit: 'pt',
                style: 'normal'
            },
            majorTickMarkSize: 6,
            minorTickMarkSize: 4
        },
        scrollBar: {
            backColor: 'black',
            contentColor: 'white',
            contentBorderColor: 'rgb(20, 110, 255)'
        },
        selection: {
            axisHighlightColor: '',
            axisBorderColor: 'rgb(44, 44, 44)',
            gramAreaHighlightColor: '#F5F5FF',
            gramAreaBorderColor: 'white'
        },
        marker: {
            markerLine: {
                color: 'white',
                dashStyle: 'custom',
                dashPattern: [2, 2]
            },
            labelColor: 'rgb(64, 64, 64)',
            labelFont: {
                name: 'arial,sans-serif',
                size: 8,
                unit: 'pt',
                style: 'normal'
            },
            indicatorColor: 'rgb(64, 64, 64)',
            indicatorHeight: '15'
        },
        cursor: {
            indicatorColor: 'rgb(0, 146, 228)',
            cursorLine: {
                color: 'rgb(191, 0, 0)',
                dashStyle: 'solid'
            }
        },
        dataCursor: {
            dataLabel: {
                textColor: 'black',
                borderColor: 'black',
                backColor: 'rgb(255, 255, 204)',
                borderStyle: 'fixedSingle',
                fixedSingleBorderStyle: 'solid',
                fixed3DBorderStyle: 'sunkenInner'
            },
            dataLabelFont: {
                name: 'arial,sans-serif',
                size: 9,
                unit: 'pt',
                style: 'normal'
            },
            axisLabel: {
                textColor: 'black',
                borderColor: 'black',
                backColor: 'rgb(255, 255, 204)',
                borderStyle: 'fixedSingle',
                fixedSingleBorderStyle: 'solid',
                fixed3DBorderStyle: 'sunkenInner'
            },
            dataCursorLine: {
                color: 'rgb(255, 0, 0)',
                dashStyle: 'dot'
            }
        }
    };

    var metal = {
        backColor: 'rgb(130, 130, 130)',
        borderHighColor: 'rgb(155, 155, 155)',
        borderLowColor: 'rgb(52, 52, 52)',
        defaultGramColor: 'rgb(78, 95, 162)',
        gramArea: {
            defaultBackColor: 'black',
            gridLineDefault: {
                color: 'rgb(0, 53, 0)',
                dashStyle: 'solid'
            },
            fixedLineDefault: {
                color: 'red',
                dashStyle: 'solid'
            },
            fixedLabelDefaultStyle: {
                name: 'arial,sans-serif',
                size: 8,
                unit: 'pt',
                style: 'normal'
            },
            drawDataPoints: true
        },
        axis: {
            backColor: 'rgb(117, 117, 117)',
            tickMarkColor: 'black',
            tickMarkLabelColor: 'black',
            tickMarkLabelFont: {
                name: 'arial,sans-serif',
                size: 8,
                unit: 'pt',
                style: 'normal'
            },
            majorTickMarkSize: 6,
            minorTickMarkSize: 4
        },
        scrollBar: {
            backColor: 'black',
            contentColor: 'white',
            contentBorderColor: 'rgb(20, 110, 255)'
        },
        selection: {
            axisHighlightColor: '',
            axisBorderColor: 'white',
            gramAreaHighlightColor: 'rgb(242, 219, 232)',
            gramAreaBorderColor: 'white'
        },
        marker: {
            markerLine: {
                color: 'white',
                dashStyle: 'custom',
                dashPattern: [2, 2]
            },
            labelColor: 'black',
            labelFont: {
                name: 'arial,sans-serif',
                size: 8,
                unit: 'pt',
                style: 'normal'
            },
            indicatorColor: 'rgb(50, 140, 140)',
            indicatorHeight: '15'
        },
        cursor: {
            indicatorColor: 'rgb(0, 144, 226)',
            cursorLine: {
                color: 'yellow',
                dashStyle: 'solid'
            }
        },
        dataCursor: {
            dataLabel: {
                textColor: 'black',
                borderColor: 'black',
                backColor: 'rgb(255, 255, 204)',
                borderStyle: 'fixedSingle',
                fixedSingleBorderStyle: 'solid',
                fixed3DBorderStyle: 'sunkenInner'
            },
            dataLabelFont: {
                name: 'arial,sans-serif',
                size: 9,
                unit: 'pt',
                style: 'normal'
            },
            axisLabel: {
                textColor: 'black',
                borderColor: 'black',
                backColor: 'rgb(255, 255, 204)',
                borderStyle: 'fixedSingle',
                fixedSingleBorderStyle: 'solid',
                fixed3DBorderStyle: 'sunkenInner'
            },
            dataCursorLine: {
                color: 'rgb(255, 0, 0)',
                dashStyle: 'dot'
            }
        }
    };

    var metalLight = {
        backColor: 'rgb(219, 222, 229)',
        borderHighColor: 'rgb(181, 181, 181)',
        borderLowColor: 'rgb(65, 65, 65)',
        defaultGramColor: 'rgb(16, 16, 16)',
        gramArea: {
            defaultBackColor: 'white',
            gridLineDefault: {
                color: 'rgb(180, 200, 180)',
                dashStyle: 'solid'
            },
            fixedLineDefault: {
                color: 'red',
                dashStyle: 'solid'
            },
            fixedLabelDefaultStyle: {
                name: 'arial,sans-serif',
                size: 8,
                unit: 'pt',
                style: 'normal'
            },
            drawDataPoints: true
        },
        axis: {
            backColor: 'rgb(143, 143, 143)',
            tickMarkColor: 'rgb(8, 8, 8)',
            tickMarkLabelColor: 'rgb(8, 8, 8)',
            tickMarkLabelFont: {
                name: 'arial,sans-serif',
                size: 8,
                unit: 'pt',
                style: 'normal'
            },
            majorTickMarkSize: 6,
            minorTickMarkSize: 4
        },
        scrollBar: {
            backColor: 'white',
            contentColor: 'gainsboro',
            contentBorderColor: 'rgb(20, 110, 255)'
        },
        selection: {
            axisHighlightColor: '',
            axisBorderColor: 'black',
            gramAreaHighlightColor: 'rgb(242, 219, 232)',
            gramAreaBorderColor: 'rgb(255, 128, 0)'
        },
        marker: {
            markerLine: {
                color: 'white',
                dashStyle: 'custom',
                dashPattern: [2, 2]
            },
            labelColor: 'rgb(248, 94, 42)',
            labelFont: {
                name: 'arial,sans-serif',
                size: 8,
                unit: 'pt',
                style: 'normal'
            },
            indicatorColor: 'rgb(248, 94, 42)',
            indicatorHeight: '16'
        },
        cursor: {
            indicatorColor: 'rgb(0, 146, 228)',
            cursorLine: {
                color: 'rgb(255, 128, 0)',
                dashStyle: 'solid'
            }
        },
        dataCursor: {
            dataLabel: {
                textColor: 'black',
                borderColor: 'black',
                backColor: 'rgb(255, 255, 204)',
                borderStyle: 'fixedSingle',
                fixedSingleBorderStyle: 'solid',
                fixed3DBorderStyle: 'sunkenInner'
            },
            dataLabelFont: {
                name: 'arial,sans-serif',
                size: 9,
                unit: 'pt',
                style: 'normal'
            },
            axisLabel: {
                textColor: 'black',
                borderColor: 'black',
                backColor: 'rgb(255, 255, 204)',
                borderStyle: 'fixedSingle',
                fixedSingleBorderStyle: 'solid',
                fixed3DBorderStyle: 'sunkenInner'
            },
            dataCursorLine: {
                color: 'rgb(255, 0, 0)',
                dashStyle: 'dot'
            }
        }
    };

    var oldTime = {
        backColor: 'rgb(98, 108, 123)',
        borderHighColor: 'rgb(174, 181, 190)',
        borderLowColor: 'rgb(43, 47, 54)',
        defaultGramColor: 'cornflowerBlue',
        gramArea: {
            defaultBackColor: 'black',
            gridLineDefault: {
                color: 'rgb(0, 53, 0)',
                dashStyle: 'solid'
            },
            fixedLineDefault: {
                color: 'red',
                dashStyle: 'solid'
            },
            fixedLabelDefaultStyle: {
                name: 'arial,sans-serif',
                size: 8,
                unit: 'pt',
                style: 'normal'
            },
            drawDataPoints: true
        },
        axis: {
            backColor: 'rgb(65, 71, 81)',
            tickMarkColor: 'rgb(174, 181, 190)',
            tickMarkLabelColor: 'white',
            tickMarkLabelFont: {
                name: 'arial,sans-serif',
                size: 8,
                unit: 'pt',
                style: 'normal'
            },
            majorTickMarkSize: 6,
            minorTickMarkSize: 4
        },
        scrollBar: {
            backColor: 'black',
            contentColor: 'white',
            contentBorderColor: 'orange'
        },
        selection: {
            axisHighlightColor: '',
            axisBorderColor: 'white',
            gramAreaHighlightColor: 'rgb(246, 246, 255)',
            gramAreaBorderColor: 'white'
        },
        marker: {
            markerLine: {
                color: 'white',
                dashStyle: 'custom',
                dashPattern: [2, 2]
            },
            labelColor: 'white',
            labelFont: {
                name: 'arial,sans-serif',
                size: 8,
                unit: 'pt',
                style: 'normal'
            },
            indicatorColor: 'yellow',
            indicatorHeight: '15'
        },
        cursor: {
            indicatorColor: 'rgb(236, 181, 5)',
            cursorLine: {
                color: 'white',
                dashStyle: 'solid'
            }
        },
        dataCursor: {
            dataLabel: {
                textColor: 'black',
                borderColor: 'black',
                backColor: 'rgb(255, 255, 204)',
                borderStyle: 'fixedSingle',
                fixedSingleBorderStyle: 'solid',
                fixed3DBorderStyle: 'sunkenInner'
            },
            dataLabelFont: {
                name: 'arial,sans-serif',
                size: 9,
                unit: 'pt',
                style: 'normal'
            },
            axisLabel: {
                textColor: 'black',
                borderColor: 'black',
                backColor: 'rgb(255, 255, 204)',
                borderStyle: 'fixedSingle',
                fixedSingleBorderStyle: 'solid',
                fixed3DBorderStyle: 'sunkenInner'
            },
            dataCursorLine: {
                color: 'yellow',
                dashStyle: 'dot'
            }
        }
    };

    var blue = {
        backColor: 'rgb(255, 255, 255)',
        borderHighColor: 'white',
        borderLowColor: 'white',
        defaultGramColor: 'rgb(69, 148, 227)',
        gramArea: {
            defaultBackColor: 'rgb(234, 242, 251)',
            gridLineDefault: {
                color: 'rgb(167, 187, 207)',
                dashStyle: 'solid'
            },
            fixedLineDefault: {
                color: 'red',
                dashStyle: 'solid'
            },
            fixedLabelDefaultStyle: {
                name: 'Microsoft Yahei',
                size: 8,
                unit: 'pt',
                style: 'normal'
            }
        },
        axis: {
            backColor: 'rgb(255, 255, 255)',
            tickMarkColor: 'rgb(127, 149, 162)',
            tickMarkLabelColor: 'rgb(127, 149, 162)',
            tickMarkLabelFont: {
                name: 'Microsoft Yahei',
                size: 8,
                unit: 'pt',
                style: 'normal'
            },
            majorTickMarkSize: 6,
            minorTickMarkSize: 4
        },
        scrollBar: {
            backColor: 'rgb(234, 242, 251)',
            contentColor: 'white',
            contentBorderColor: 'rgb(69, 148, 227)'
        },
        selection: {
            axisHighlightColor: '',
            axisBorderColor: 'rgb(69, 148, 227)',
            gramAreaHighlightColor: 'rgb(182, 215, 248)',
            gramAreaBorderColor: 'rgb(69, 148, 227)'
        },
        marker: {
            markerLine: {
                color: 'rgb(127, 149, 162)',
                dashStyle: 'custom',
                dashPattern: [2, 2]
            },
            labelColor: 'rgb(127, 149, 162)',
            labelFont: {
                name: 'arial,sans-serif',
                size: 8,
                unit: 'pt',
                style: 'normal'
            },
            indicatorColor: 'rgb(235, 180, 4)',
            indicatorHeight: '15'
        },
        cursor: {
            indicatorColor: 'rgb(235, 180, 4)',
            cursorLine: {
                color: 'rgb(235, 180, 4)',
                dashStyle: 'solid'
            }
        },
        dataCursor: {
            dataLabel: {
                textColor: 'black',
                borderColor: 'black',
                backColor: 'rgb(255, 255, 204)',
                borderStyle: 'fixedSingle',
                fixedSingleBorderStyle: 'solid',
                fixed3DBorderStyle: 'sunkenInner'
            },
            dataLabelFont: {
                name: 'arial,sans-serif',
                size: 0,
                unit: 'pt',
                style: 'normal'
            },
            axisLabel: {
                textColor: 'black',
                borderColor: 'black',
                backColor: 'rgb(69, 148, 227)',
                borderStyle: 'fixedSingle',
                fixedSingleBorderStyle: 'solid',
                fixed3DBorderStyle: 'sunkenInner'
            },
            dataCursorLine: {
                color: 'rgb(69, 148, 227)',
                dashStyle: 'dot'
            }
        }
    };

    return {
        'default': defaultStyle,
        gray: gray,
        light: light,
        metal: metal,
        metalLight: metalLight,
        oldTime: oldTime,
        blue:blue
    };
})();





