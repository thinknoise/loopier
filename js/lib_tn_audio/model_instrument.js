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
          icon    : 'icon-default'
      },
      initialize : function(){
          //This is useful to bind(or delegate) the this keyword inside all the function objects to the view
          _.bindAll(this, 'playSound' );
      },
      // the Model Plays/schedules its own sound
      playSound : function ( time ) {
          var source = context.createBufferSource();
          source.buffer = this.get('audioBuffer');
          //source.loop = true;
          source.connect( context.destination );
          console.log( time );
          source[ source.start ? 'start' : 'noteOn'](time + context.currentTime);
      }
  });

  return Instrument_Model;

});
