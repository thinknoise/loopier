/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var MainAudio = {},
    context,
    bufferLoader,
    totalTime = 1000
    audioObj = [];


window.addEventListener('load', init, false);

function init() {
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    context = new AudioContext();

    var audioInfos = [   
        {
            url:"audio/808KICK.WAV",
            name:"808 Kick"
        },
        {
            url:"audio/Plastic Zipper Short.wav",
            name:"Zipper"
        },
        {
            url:"audio/Water Drip 02.wav",
            name:"Drip"
        },
        {
            url:"audio/Switch 09.wav",
            name:"Switch"
        },
        {
            url:"audio/Briefcase Latch 2.wav",
            name:"Latch"
        },
        {
            url:"audio/percussion/bongo-hi-edge.wav",
            name:"Bongo hi"
        },
        {
            url:"audio/percussion/bongo-lo-hrd.wav",
            name:"Bongo low"
        },
        {
            url:"audio/percussion/cowbell.wav",
            name:"Cowbell"
        },
        {
            url:"audio/percussion/caxixi-1.wav",
            name:"Caxixi"
        },
        {
            url:"audio/percussion/ping.wav",
            name:"pingpong"
        },
        {
            url:"audio/percussion/tamb-hit.wav",
            name:"Tamborine"
        }
    ]

    _.each( audioInfos, function ( audioInfo, index ) {

        audioObj.push({
            "index"       : index,
            "url"         : audioInfo.url,
            "audioBuffer" : null,
            "width"       : 0,
            "trackSize"   : 0,
            "duration"    : "0 secs",
            "source"      : null
        });
        
        loadSound( index );
        var soundButton = 
                "<li class='sound-item'>" +
                    "<div class='audio-player audio-button draggable' data-sound-index=" + index + " data-sound-name='" +audioInfo.name+ "'>" +
                        "<div class='sound-name'>" + audioInfo.name + "</div>"
                    "</div>" +
                "</li>";
        
        $(soundButton).appendTo("#samples-container");
    });

    DragAndDrop.activate();
    $(".audio-player").click( MainAudio.fireOffSound );
    $(".control-play.glyphicon-play").click( MainAudio.startSequence );
}

function loadSound( index ) {
    var request = new XMLHttpRequest(),
        trackWidth = $('.mixing-track').width;

    request.open('GET', audioObj[index].url, true);
    
    request.buttonIndex = index;
    
    request.responseType = 'arraybuffer';

    // Decode asynchronously
    request.onload = function( ) {
        
        context.decodeAudioData(request.response, function(buffer) {
            //console.log(request);
            
            audioObj[request.buttonIndex] = {
                "index"       : request.buttonIndex,
                "audioBuffer" : buffer,
                "width"       : (buffer.duration * 100),
                "trackSize"   : buffer.duration * 88,
                "duration"    : buffer.duration.toFixed(1) + " secs"
            };
            
        }, onError);
    }
    request.send();
}


function onError ( error ) {
    console.log( error );
}


MainAudio.fireOffSound = function  ( e ) { 
    var soundIndex = $(this).data('sound-index');
    MainAudio.playSound( audioObj[soundIndex].audioBuffer );
}

MainAudio.playSound = function (audioBuffer, time) {
    
    var source = context.createBufferSource(); 
    source.buffer = audioBuffer;                    
    source.connect( context.destination );    
    console.log( context.currentTime);
    source[ source.start ? 'start' : 'noteOn'](time + context.currentTime);
}


MainAudio.onPlayUI = function ( ) {

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
        totalTime, 
        "linear",
        function () {
            $(this).css({ "margin-left" : 0 });
            MainAudio.onPauseUI();
        }
    );
}
MainAudio.onPauseUI = function () {
    var $playBtn    = $('.control-play');

    $playBtn.removeClass('glyphicon-pause');
    $playBtn.addClass('glyphicon-play');
    
}

MainAudio.startSequence = function ( e ) {
    
    var $track      = $('.mixing-track'),
        $clones     = $('.sound-clone'),
        trackLength = parseInt( $track.width() );
    
    MainAudio.onPlayUI();
    
    $clones.each( function () {
        
        var $clone         = $(this),
            soundIndex     = $clone.data('sound-index'),
            left           = parseInt( $clone.css('left') ),
            perentOfTime   = left/trackLength;

        console.log(audioObj[soundIndex]);
        MainAudio.playSound( audioObj[soundIndex].audioBuffer, ( (totalTime/1000) * perentOfTime ) );
                
    });
}
