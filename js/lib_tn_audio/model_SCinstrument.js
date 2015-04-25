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
  var Soundcloud_Instrument_Model = Backbone.Model.extend({
      defaults  : {
          name    : 'default',
          clientID  : 'b903a6866f959dd280635340bcefc177',
          index   : '-1',
          url     : '',
          width   : 20,
          icon    : 'icon-default',
          audioBuffer : {},
          sndDuration : '0.0 secs',
          audio_context : {},
          audio_source : {},
          sndLoaded : false
      },

      initialize : function(){

          //This is useful to bind(or delegate) the this keyword inside all the function objects to the view
          _.bindAll(this, 'loadSoundCloud', 'playSoundCloud' );
      },
      loadSoundCloud : function ( sndBankView ) {

          this.set( "audio_context", sndBankView.context );
          var request    = new XMLHttpRequest(),
              trackWidth = $('.mixing-track').width,
              self       = this;

          //this.set( "index ", this.get('snd_id') );
          request.addEventListener("load", function( e ) { self.onTransferComplete( e, sndBankView ) }, false);
          request.open('GET', 'http://api.soundcloud.com/tracks/' + this.id + '/stream?client_id=' + this.get('clientID'), true);
          request.responseType = 'arraybuffer';
          // Decode asynchronously
          request.onreadystatechange = function ( e ) {

              if( e.currentTarget.readyState == 4 && e.currentTarget.status == 200 ) {
                  console.log( "state change", e.currentTarget.response, e.currentTarget.status );
                  var audio_context = self.get("audio_context");
                  audio_context.decodeAudioData( e.currentTarget.response, function(buffer) {
                      console.log("-->",request.response);
                      self.set( "width", (buffer.duration * 100) );
                      self.set( "audioBuffer", buffer );
                      self.set( "sndDuration", buffer.duration );
                      self.set( "duration", buffer.duration.toFixed(1) + " secs" );

                  }, this.onLoadSoundError);
              }
          }
          request.send(null);
      },
      onTransferComplete : function ( event, snd_bank ) {
          // throwing back success to the sound bank
          this.set( 'sndLoaded', true );
      },
      onLoadSoundError : function ( error ) {
          console.log( error );
      },
      playSoundCloud : function ( time ) {
          context = this.get("audio_context");
          var source = context.createBufferSource();
          source.buffer = this.get('audioBuffer');
          //source.loop = true;
          source.connect( context.destination );
          //console.log( time );
          source[ source.start ? 'start' : 'noteOn'](time + context.currentTime);
      },

      playSound : function ( time ) {
          this.attributes.audio_source.mediaElement.play();
      }
  });

  return Soundcloud_Instrument_Model;

});
