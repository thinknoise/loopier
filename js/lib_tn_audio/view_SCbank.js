define([
    'viewSCInstrument',
    'backbone',
    'soundcloud',
    'underscore',
    'jQuery',
    'jQueryUI',
    'jQueryTouch'

], function (
    Soundcloud_Instrument_View,
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

        initialize : function(){
            $(this.el).append('<div class=" ">LOADING SOUNDCLOUD</div>');
            this.render();

            window.AudioContext = window.AudioContext || window.webkitAudioContext; // this is needed elsewhere
            this.context = new AudioContext();

            this.clientID = 'b903a6866f959dd280635340bcefc177';

            _.bindAll(this, 'SCmakeModel', 'render');
            this.collection.bind('add', this.SCmakeModel);

        },
        load : function(){
            var self = this
            SC.initialize({
                client_id: this.clientID,
                redirect_uri: 'http://thinknoise.com/loopier/callback.html'
            });

            // need to add a seporate query for the ids in the tape_reel
            $.each(new Array(1), function ( index ) {
                SC.get('/tracks', { track_type: 'sample', license: 'cc-by', streamable: true, limit: 10, duration: {from: 50, to: 500} }, function(tracks) {
                    _.each(tracks, function (track, index) {
                        track.url = 'http://api.soundcloud.com/tracks/' + track.id + '/stream?client_id=' + self.clientID;
                        console.log( index, track.url );
                        switch (track.license) {
                            case 'cc-by'    : track.license = 'icon-cc'; break;
                            case 'cc-by-nc' : track.license = 'icon-cc-nc'; break;
                            case 'cc-by-nd' : track.license = 'icon-cc-nd'; break;
                            case 'cc-by-sa' : track.license = 'icon-cc-sa'; break;
                            case 'cc-by-nc-nd' : track.license = 'icon-cc-nc icon-cc-nd'; break;
                            case 'cc-by-nc-sa' : track.license = 'icon-cc-nc icon-cc-sa'; break;
                        }
                        self.collection.add(track);
                    });
                });


            });
        },

        SCmakeModel : function( model ) {
            var instView = new Soundcloud_Instrument_View({model:model});
            $(this.el).append(instView.el);
            model.loadSoundCloud( this );
            instView.render();
        },

        render : function(){
            //we assign our element into the available dom element
            $('#tn-soundcloud-container').append($(this.el));

            return this;
        }

    });

    return Soundcloud_Bank_View;

});
