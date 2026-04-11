/**
 * Created by jwni on 2015/3/19.
 */

'use strict';

voiceGram = voiceGram || {};

voiceGram.builder = (function(){


    var _buildWaveGram = function(gramName, dataReader,horizontalAxisStyle,horizontalZoomRangeMin) {
        var gram = new voiceGram.components.WaveGram(gramName, dataReader,horizontalAxisStyle),
            view = gram.view,
            h_fullRange = view.horizontal.getFullRange(),
            v_fullRange = view.vertical.getFullRange(),
            fixedLines = gram.getVerticalAxis().getFixedLines();

        view.horizontal.setNavigateRange(h_fullRange);
        view.vertical.setNavigateRange(v_fullRange);

        if(horizontalZoomRangeMin)
            view.horizontal.setZoomRange(new voiceGram.data.Range(horizontalZoomRangeMin,h_fullRange.getMaximum()));

        fixedLines.add(0);

        return gram;
    };

    var _addGramForFileReader = function (gramControl, fr, options) {
        gramControl.beginUpdate();
        try {
            gramControl.playback.setPlayer(gramControl.getAudioPlayer(options.playUrl));
            for(var i=0; i<fr.getChannelCount(); ++i) {
                var dr = new voiceGram.data.WaveDataReader(fr, i),
                    gram = _buildWaveGram(options.name || 'Gram', dr,gramControl.config.horizontalAxisStyle,gramControl.config.horizontalZoomRangeMin),
                    panel = new voiceGram.components.GramPanel(null,gramControl.config.gridLineStyle);

                if (i == 0) {
                    if (options.isThumbnailGram) {
                        gramControl.scrollBar.setThumbnailGram(gram);
                    }
                }
                else {
                    panel.setIsSubPanel(true);
                }

                gram.setPanel(panel);

                gramControl.panels.items.add(panel);
                gramControl.grams.items.add(gram);
            }
        }
        finally {
            gramControl.endUpdate();
        }
    };

    var _createWaveGramByHttpReader = function (gramControl, options) {
        var WaveFileReader = voiceGram.data.http.WaveFileReader;

        WaveFileReader.load(options.gramUrl, function(fr){
            _addGramForFileReader(gramControl, fr, options);
        }, _loadWaveFileError);
    };

    var _loadWaveFileError = function () {
        throw new voiceGram.exception.Exception('语音文件读取失败');
    };

    var _createWavGramByAudioContextReader = function (gramControl, options) {
        var WaveFileReader = voiceGram.data.audioContext.WaveFileReader;

        WaveFileReader.load(options.gramUrl, function(fr) {
            _addGramForFileReader(gramControl, fr, options);
        }, _loadWaveFileError);
    };

    var _createWavGramByNodejsReader = function(gramControl, options) {
        var WaveFileReader = voiceGram.data.nodejs.WaveFileReader,
            fr = new WaveFileReader(options.gramUrl);

        _addGramForFileReader(gramControl, fr, options);
    };

     var LoadingMode = {
             audioContext: 0,
             http: 1,
             nodejs: 2
         },
         loadingMethods = {},
         audioContextFactory = loadingMethods[LoadingMode.audioContext] = _createWavGramByAudioContextReader,
         defaultFactory = loadingMethods[LoadingMode.http] = _createWaveGramByHttpReader,
         nodejsFactory = loadingMethods[LoadingMode.nodejs] = _createWavGramByNodejsReader;

    var addWavGram = function (gramControl, loadingMode, options) {
        var factory = loadingMethods[loadingMode] || defaultFactory;

        factory(gramControl, options);
    };

    var buildGram = function (options) {
        var defaultLayout = {
            visibleParts: voiceGram.enums.GramParts.all,
            axisHeight: 25,
            axisWidth: 50,
            markIndicatorBarMinimalHeight: 0,
            markIndicatorBarHeightAutoAdjust: true,
            markIndicatorBarHeight: 0,
            panelSplitterHeight: 6,
            scrollBarHeight: 26,
            gridLineStyle:null
        };

        var containerId = options.container || 'wave',
            theme = options.theme || 'default',
            padding = options.padding || [0],
            topBorder = options.topBorder == undefined ? 2 : options.topBorder,
            cellspacing = options.cellspacing == undefined ? 2 : options.cellspacing,
            bottomBorder = options.bottomBorder == undefined ? 2 : options.bottomBorder,
            layout = options.layout || defaultLayout,
            config = options.config ,
            grams = options.grams || [],
            marks = options.marks || [],
            gramControl = new voiceGram.VoiceGramControl(document.getElementById(containerId), {
                theme: theme,
                padding: padding,
                topBorder: topBorder,
                cellspacing: cellspacing,
                bottomBorder: bottomBorder,
                layout: layout,
                config: config
            });


        //region event

        var i = 0,
            controlNs = voiceGram.VoiceGramControl,
            playbackNs = voiceGram.components.Playback,
            controlEvents = gramControl.events,
            playbackEvents = gramControl.playback.events,
            eventHandles = options.events,
            eventMap = eventHandles == null ? [] : [
                //[event subject, event name, handler]
                [controlEvents, controlNs.eventGramLoaded, eventHandles.gramLoadedEvent],
                [controlEvents, controlNs.eventSelectionChanged, eventHandles.selectionChanged],
                [controlEvents, controlNs.eventMarkerAdded, eventHandles.markerAdded],
                [controlEvents, controlNs.eventMarkerRemoved, eventHandles.markerRemoved],
                [controlEvents, controlNs.eventMarkerChanged, eventHandles.markerChanged],
                [controlEvents, controlNs.eventMarkerSelectionChanged, eventHandles.markerSelectionChanged],
                [controlEvents, controlNs.eventPlaybackStateChanged, eventHandles.playbackStatusChanged],
                [controlEvents, controlNs.eventPanelsChanged, eventHandles.panelsChanged],
                [controlEvents, controlNs.eventCursorPositionChanged, eventHandles.cursorPositionChanged],
                [controlEvents, controlNs.eventGramCollectionChanged, eventHandles.gramCollectionChanged],
                [controlEvents, controlNs.eventMouseDoubleClick, eventHandles.mouseDoubleClick],
                [controlEvents, controlNs.eventMouseClick, eventHandles.mouseClick],
                [controlEvents, controlNs.eventMouseWheel, eventHandles.mouseWheel],
                [controlEvents, controlNs.eventMouseDown, eventHandles.mouseDown],
                [controlEvents, controlNs.eventMouseMove, eventHandles.mouseMove],
                [controlEvents, controlNs.eventMouseUp, eventHandles.mouseUp],
                [controlEvents, controlNs.eventMouseOut, eventHandles.mouseOut],
                [controlEvents, controlNs.eventKeyDown, eventHandles.keyDown],
                [controlEvents, controlNs.eventKeyUp, eventHandles.keyUp],
                [playbackEvents, playbackNs.eventLoadStart, eventHandles.playbackLoadStart],
                [playbackEvents, playbackNs.eventLoadProgress, eventHandles.playbackLoadProgress]
            ];

        for(i = 0; i< eventMap.length; ++i) {
            var item = eventMap[i];
            if (item[2]) {
                item[0].on.apply(item[0], item.slice(1));
            }
        }

        //endregion

        for (i = 0; i < grams.length; i++) {
            addWavGram(gramControl, grams[i].loadingMode, {
                isThumbnailGram: grams[i].isThumbnailGram || false,
                gramUrl: grams[i].gramUrl,
                playUrl: grams[i].playUrl ? grams[i].playUrl : grams[i].gramUrl
            });
        }

        var markers = gramControl.markers;
        for (i = 0; i < marks.length; i++) {
            markers.add(new voiceGram.data.Range(marks[i].min, marks[i].max), marks[i].name, marks[i].description);
        }

        return gramControl;
    };

    return {
        LoadingMode: LoadingMode,
        buildGram: buildGram,
        addWavGram: addWavGram
    };
})();