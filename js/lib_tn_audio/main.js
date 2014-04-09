/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var MainAudio = {},
    context,
    bufferLoader,
    audioObj = [];


window.addEventListener('load', init, false);

function init() {
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    context = new AudioContext();

    var soundUrls = [   "audio/808KICK.WAV",
                        "audio/Plastic Zipper Short.wav",
                        "audio/Switch 02.aif",
                        "audio/Switch 09.aif",
                        "audio/Briefcase Latch 2.wav",
                        "audio/percussion/bongo-hi-edge.wav",
                        "audio/percussion/bongo-lo-hrd.wav",
                        "audio/percussion/cowbell.wav",
                        "audio/percussion/caxixi-1.wav",
                        "audio/percussion/ping.wav",
                        "audio/percussion/tamb-hit.wav"
    ]

    _.each( soundUrls, function ( url, index ) {

        audioObj.push({
            "index"       : index,
            "url"         : url,
            "audioBuffer" : null,
            "width"       : 0,
            "trackSize"   : 0,
            "duration"    : "0 secs",
            "source"      : null
        });
        
        loadSound( index );
        var soundButton = "<li class='audio-player audio-button draggable' data-sound-index=" + index + " data-sound-name='sfx'></li>"
        $(soundButton).appendTo("#samples-container");
    });

    DragAndDrop.activate();
    $(".audio-player").click( MainAudio.fireOffSound );
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
            console.log(request);
            
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
    MainAudio.playSound( soundIndex );
}

MainAudio.playSound = function (index) {
  audioObj[index].source = context.createBufferSource(); 
  audioObj[index].source.buffer = audioObj[index].audioBuffer;                    
  audioObj[index].source.connect( context.destination );    
  audioObj[index].source.start(0);                          

  console.log(audioObj[index]);

}
