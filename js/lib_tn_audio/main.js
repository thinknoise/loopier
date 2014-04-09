/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var context;
var bufferLoader;
var source = [];
var audioBuffer = [];

window.addEventListener('load', init, false);


window.onload = function() {
    audioBuffer[0] = null;
    loadSound( "audio/r2d2_20.mp3" , 0);
    loadSound( "audio/r2d2_16.mp3" , 1);
    loadSound( "audio/r2d2_18.mp3" , 2);
    loadSound( "audio/r2d2_19.mp3" , 3);
    $(".audio-player").click( fireOffSound );
};

function fireOffSound ( e ) { 
    var soundIndex = $(this).data('sound-index');
    playSound( audioBuffer[soundIndex] );
}

function init() {
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    context = new AudioContext();

//    bufferLoader = new BufferLoader(
//        context,
//        [
//            'audio/r2d2_15.mp3',
//            'audio/r2d2_16.mp3',
//            'audio/r2d2_17.mp3',
//            'audio/r2d2_18.mp3',
//            'audio/r2d2_19.mp3',
//        ],
//        finishedLoading
//        );
//
//    bufferLoader.load();
}

//function finishedLoading(bufferList) {
//    // Create two sources and play them both together.
//    source[0] = context.createBufferSource();
//    source[1] = context.createBufferSource();
//
//    source[0].buffer = bufferList[2];
//    source[1].buffer = bufferList[3];
//
//    source[0].connect(context.destination);
//    source[1].connect(context.destination);
//    source[0].start(0);
//    source[1].start(0);
//
//}

function loadSound(url, index) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // Decode asynchronously
    request.onload = function() {
        context.decodeAudioData(request.response, function(buffer) {
            audioBuffer[index] = buffer;
        }, onError);
    }
    request.send();
}

function playSound(buffer) {
  var source = context.createBufferSource(); // creates a sound source
  source.buffer = buffer;                    // tell the source which sound to play
  source.connect( context.destination );       // connect the source to the context's destination (the speakers)
  source.start(0);                           // play the source now
                                             // note: on older systems, may have to use deprecated noteOn(time);
}

function onError ( error ) {
    console.log( error );
}