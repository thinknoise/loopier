define([
    'backbone',
    'underscore',
    'jQuery',
    'jQueryUI',
    'jQueryTouch'

], function (

    Backbone,
    _,
    $

) {
  //Individual Sample
  var Instrument_Model = Backbone.Model.extend({
      defaults  : {
          name    : 'default',
          index   : '-1',
          url     : '',
          width   : 20,
          icon    : 'icon-default',
          audioBuffer : {},
          sndDuration : '0.0 secs',
          audio_context : {},
          sndLoaded : false
      },
      initialize : function(){
          //This is useful to bind(or delegate) the this keyword inside all the function objects to the view
          _.bindAll(this, 'playSound' );
      },
      loadSound : function ( sndBankView ) {

          this.set( "audio_context", sndBankView.context );
          var request = new XMLHttpRequest(),
              trackWidth = $('.mixing-track').width,
              self = this;

          //this.set( "index ", this.get('snd_id') );
          request.addEventListener("load", function( e ) { self.onTransferComplete( e, sndBankView ) }, false);
          request.open('GET', self.get("url"), true);
          request.responseType = 'arraybuffer';
          // Decode asynchronously
          request.onload = function () {
              // TODO: listen to the loading
              var audio_context = self.get("audio_context");
              audio_context.decodeAudioData( request.response, function(buffer) {
                  self.set( "width", (buffer.duration * 100) );
                  self.set( "audioBuffer", buffer );
                  self.set( "sndDuration", buffer.duration );
                  self.set( "duration", buffer.duration.toFixed(1) + " secs" );

              }, this.onLoadSoundError);
          }
          request.send();
      },
      onTransferComplete : function ( event, snd_bank ) {
          // throwing back success to the sound bank
          this.set( 'sndLoaded', true );
      },
      onLoadSoundError : function ( error ) {
          //console.log( error );
      },
      // the Model Plays/schedules its own sound
      playSound : function ( time ) {
          context = this.get("audio_context");
          var source = context.createBufferSource();
          source.buffer = this.get('audioBuffer');
          //source.loop = true;
          source.connect( context.destination );
          //console.log( time );
          source[ source.start ? 'start' : 'noteOn'](time + context.currentTime);
      }
  });

  return Instrument_Model;

});
