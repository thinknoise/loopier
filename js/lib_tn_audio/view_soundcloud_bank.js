define([
    'viewInstrument',
    'backbone',
    'soundcloud',
    'underscore',
    'jQuery',
    'jQueryUI',
    'jQueryTouch'

], function (
    Instrument_View,
    Backbone,
    SC,
    _,
    $

) {

    var Soundcloud_Bank_View = Backbone.View.extend({
        id         : "samples-table",
        tagName    : "ul",
        className  : "soundcloud-bank-wrap",
        events     : {},
        context    : {},
        clientID  : 'b903a6866f959dd280635340bcefc177',

        initialize : function(){
            $(this.el).append('<div class=" ">LOADING SOUNDCLOUD</div>');
            this.render();

            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();

            this.SCinit();
            //this.SCgetAsset('198317176');
        },

        SCinit : function() {
            self = this
            SC.initialize({
                client_id: this.clientID,
                redirect_uri: 'http://thinknoise.com/loopier/callback.html'
            });

            // initiate auth popup
            SC.connect(function() {
              SC.get('/me', function(me) {
                  console.log('Hello, ' + me.id);
                  var trackid = '198317176';

                  SC.get('/tracks', { track_type: 'sound effect', duration: { to: 1200 } }, function(tracks) {
                      _.each(tracks, function (track) {
                          console.log(track);
                          trackid = track.id
                      })
                      var r = Math.floor(Math.random()*tracks.length);
                      console.log(r)
                      self.SCgetAsset(tracks[r].id)
                  });

                  url = 'http://api.soundcloud.com/users/' + me.id + '.json?client_id=' + self.clientID;
                  console.log(url)
              });

            });

        },

        SCgetAsset : function(trackid) {
            var audio = new Audio(),
                source,
                // `stream_url` you'd get from
                // requesting http://api.soundcloud.com/tracks/6981096.json
                url = 'http://api.soundcloud.com/tracks/' + trackid + '/stream?client_id=' + this.clientID;

            audio.src = url;
            source = this.context.createMediaElementSource(audio);
            source.connect( this.context.destination );
            source.mediaElement.play();

        },

        scstream : function() {
            SC.stream("/tracks/198126376", function(sound){
                sound.play();
            });
        },

        render : function(){
            //we assign our element into the available dom element
            $('#tn-soundcloud-container').append($(this.el));

            return this;
        }

    });

    return Soundcloud_Bank_View;

});
