require.config({
    paths: {
        'draganddrop'   : './drag_and_drop',
        //'canvasgrid'    : './canvas_grid',
        'underscore'    : '../lib/underscore',
        'jQuery'        : '../lib/jquery',
        'jQueryUI'      : '../lib/jquery-ui-1.10.4.custom.min',
        'jQueryTouch'   : '../lib/jquery.ui.touch-punch.min'
    },
    shim: {
        'jQuery': {
            exports: '$'
        },
        'jQueryUI': {
            deps: ['jQuery']
         },
        'jQueryTouch': {
            deps: ['jQueryUI']
         },
        'underscore': {
            exports: '_'
        }
    }
});
require([
    'draganddrop',
    //'canvasgrid',
    'underscore',
    'jQuery',
    'jQueryUI',
    'jQueryTouch'
    
], function (
    
    DragAndDrop,
    //Grids,
    _,
    $

) {

    var TN_Sequencer = {
        
        audioObj    : [],
        totalTime   : 1000,

        
        start : function () {
            window.AudioContext = window.AudioContext||window.webkitAudioContext;
            context = new AudioContext();

            var audioInfos = [   
                {
                    url :"audio/808KICK.WAV",
                    name:"808 Kick"
                },
                {
                    url :"audio/Plastic Zipper Short.wav",
                    name:"Zipper"
                },
                {
                    url :"audio/Water Drip 02.wav",
                    name:"Drip"
                },
                {
                    url :"audio/Switch 09.wav",
                    name:"Switch"
                },
                {
                    url :"audio/Briefcase Latch 2.wav",
                    name:"Latch"
                },
                {
                    url :"audio/percussion/bongo-hi-edge.wav",
                    name:"Bongo hi"
                },
                {
                    url :"audio/percussion/bongo-lo-hrd.wav",
                    name:"Bongo low"
                },
                {
                    url :"audio/percussion/cowbell.wav",
                    name:"Cowbell"
                },
                {
                    url :"audio/percussion/caxixi-1.wav",
                    name:"Caxixi"
                },
                {
                    url :"audio/percussion/ping.wav",
                    name:"pingpong"
                },
                {
                    url :"audio/percussion/tamb-hit.wav",
                    name:"Tamborine"
                }
            ]
            
            _.each( audioInfos, function ( audioInfo, index ) {

                TN_Sequencer.audioObj.push({
                    "index"       : index,
                    "url"         : audioInfo.url,
                    "audioBuffer" : null,
                    "width"       : 0,
                    "sndDuration"   : 0,
                    "duration"    : "0 secs",
                    "source"      : null
                });

                TN_Sequencer.loadSound( index );
                var soundButton = 
                        "<li class='sound-item'>" +
                            "<div class='btn btn-primary audio-player audio-button draggable' data-sound-index=" + index + " data-sound-name='" +audioInfo.name+ "'>" +
                                "<div class='sound-name'>" + audioInfo.name + "</div>"
                            "</div>" +
                        "</li>";

                $(soundButton).appendTo("#samples-container");
            });

            DragAndDrop.activate();
            //Grids.buildVertical( 800, #888, 8, 'myCanvas' );
            
            $(".audio-player").click( TN_Sequencer.fireOffSound );
            
            $(".control-play.glyphicon-play").click( TN_Sequencer.startSequence );
            
            return TN_Sequencer;
        },
                
        loadSound : function ( index ) {
            var request = new XMLHttpRequest(),
                trackWidth = $('.mixing-track').width;

            request.open('GET', TN_Sequencer.audioObj[index].url, true);

            request.buttonIndex = index;

            request.responseType = 'arraybuffer';

            // Decode asynchronously
            request.onload = function( ) {

                context.decodeAudioData(request.response, function(buffer) {
                    //console.log(request);

                    TN_Sequencer.audioObj[request.buttonIndex] = {
                        "index"       : request.buttonIndex,
                        "audioBuffer" : buffer,
                        "width"       : (buffer.duration * 100),
                        "sndDuration" : buffer.duration,
                        "duration"    : buffer.duration.toFixed(1) + " secs"
                    };

                }, TN_Sequencer.onError);
            }
            request.send();
        },


        onError : function ( error ) {
            console.log( error );
        },

        getBuffer : function ( i ) {
            
            var instrument = null;
            
            //can request with the object or the index
            if( typeof i === "object" ) {
                instrument = i;
            } else {
                instrument = TN_Sequencer.audioObj[i];
            }
            return instrument.audioBuffer;
            
        },

        getSoundLength : function ( index ) {
            
            var sndlength = TN_Sequencer.audioObj[index].sndDuration,
                trklength = parseInt( $('#track-container').width() ),
                length    = ( sndlength*100000 )/TN_Sequencer.totalTime;
                console.log( length );
            return length;
        },

        fireOffSound : function  ( e ) { 
            var soundIndex = $(this).data('sound-index');
            TN_Sequencer.playSound( TN_Sequencer.getBuffer(soundIndex) );
        },

        playSound : function (audioBuffer, time) {

            var source = context.createBufferSource(); 
            source.buffer = audioBuffer;        
            //source.loop = true;
            source.connect( context.destination );    
            console.log( context.currentTime);
            source[ source.start ? 'start' : 'noteOn'](time + context.currentTime);
        },


        onPlayUI : function ( ) {

            var $track      = $('.mixing-track'),
                $playBtn    = $('.control-play'),
                $indicator  = $('.indicator'),
                trackLength = parseInt( $track.width() );

            //switch the icons
            $playBtn.removeClass('glyphicon-play');
            $playBtn.addClass('glyphicon-pause');

            $indicator.animate({ 
                    "margin-left" : trackLength 
                }, 
                TN_Sequencer.totalTime, 
                "linear",
                function () {
                    $(this).css({ "margin-left" : 0 });
                    TN_Sequencer.onPauseUI();
                }
            );
        },
        onPauseUI : function () {
            var $playBtn    = $('.control-play');

            $playBtn.removeClass('glyphicon-pause');
            $playBtn.addClass('glyphicon-play');

        },

        startSequence : function ( e ) {

            var $track      = $('.mixing-track'),
                $clones     = $('.sound-clone'),
                trackLength = parseInt( $track.width() );

            TN_Sequencer.onPlayUI();

            $clones.each( function () {

                var $clone         = $(this),
                    soundIndex     = $clone.data('sound-index'),
                    left           = parseInt( $clone.css('left') ),
                    percentOfTime   = left/trackLength,
                    startEventTime = ( (TN_Sequencer.totalTime/1000) * percentOfTime );
                    
                TN_Sequencer.playSound( TN_Sequencer.audioObj[soundIndex].audioBuffer, startEventTime );

            });
        }
    }
    
    window.TN_Sequencer = TN_Sequencer.start();
    
});