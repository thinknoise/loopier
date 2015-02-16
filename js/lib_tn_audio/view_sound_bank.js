define([
    'viewInstrument',
    'backbone',
    'underscore',
    'jQuery',
    'jQueryUI',
    'jQueryTouch'

], function (
    Instrument_View,
    Backbone,
    _,
    $

) {

    var Sound_Bank = Backbone.View.extend({
        id         : "samples-table",
        tagName    : "ul",
        className  : "sound-bank-wrap",
        events     : {},
        context    : new AudioContext(),

        initialize : function(){
            //This is useful to bind(or delegate) the this keyword inside all the function objects to the view
            _.bindAll(this,'addItemHandler', 'loadCompleteHandler', 'loadCompleteHandler', 'render', 'loadSound');
            this.collection.bind('add', this.addItemHandler);
        },
        load : function(){
            // AJAX Request
            this.collection.fetch({
                add: true,
                success: this.loadCompleteHandler,
                error: this.errorHandler
            });
        },
        //we arrived  per item in list
        addItemHandler : function(model){
            //model is an instance of Instrument_Model
            var instView = new Instrument_View({model:model});

            //console.log( model );
            // load sound here
            this.loadSound( model );
            instView.render();
            $(this.el).append(instView.el);
        },

        loadCompleteHandler : function(){
            //console.log('loaded SoundBank without errors!');
            this.render();

        },

        errorHandler : function(){
            throw "Error loading JSON file";
        },

        render : function(){
            //we assign our element into the available dom element
            $('#tn-samples-container').append($(this.el));

            return this;
        },
        /// need to load here for loading feed back
        loadSound : function ( model ) {
            var request = new XMLHttpRequest(),
                trackWidth = $('.mixing-track').width,
                self = this;

            request.open('GET', model.get("url"), true);
            request.buttonIndex = model.get('snd_id');
            request.responseType = 'arraybuffer';
            // Decode asynchronously
            request.onload = function( ) {
                // TODO: listen to the loading
                context.decodeAudioData(request.response, function(buffer) {
                    var modelBuffer = {
                        index       : request.buttonIndex,
                        audioBuffer : buffer,
                        width       : (buffer.duration * 100),
                        sndDuration : buffer.duration,
                        duration    : buffer.duration.toFixed(1) + " secs"
                    };

                    model.set(modelBuffer);

                    if(request.buttonIndex == 23 && TN_tapereel.collection.models[0].get('urlSchedule') ) {
                        var urlSchedule = TN_tapereel.collection.models[0].get('urlSchedule');
                        //console.log(urlSchedule);
                        _.each( urlSchedule, function ( soundEvent, index ) {
                            var index = soundEvent.instmodel.get("index"),
                                percentage = soundEvent.percentage
                                track      = soundEvent.track;

                            self.makeClone( $(self.el.children[ index ].children[0]), percentage, track );
                        });
                        //would rather trigger the event but..
                        //TN_controls.onPlaySequence();
                        //TN_tapereel.startTapeLoop();
                    }
                }, this.onLoadSoundError);
            }
            request.send();
        },
        onLoadSoundError : function ( error ) {
            //console.log( error );
        },
        makeClone : function ( $master, percentOnTrack, trackNo ) {

            if( !$master.hasClass('sound-clone') ) {
                //
                var $cloneParent = $('.mixing-track').eq(trackNo),
                    $clone = $master.clone(),
                    index  = $clone.data('sound-index');

                $clone.addClass('sound-clone' )
                        .removeClass('audio-button draggable ui-draggable ')
                        .appendTo( $cloneParent )
                        .draggable({
                           snap     : '.mixing-track',
                           snapMode : 'inner',
                           stop     : this.madeCloneStop,
                        })
                        .on( 'click', function (e) { TN_sndbank.models[index].playSound(0); } );

                // set width
                $clone.css({ 'width': this.collection.models[index].get('width') });
                var leftAdjust = percentOnTrack * $cloneParent.width();
                var topAdjust = 0;
                $clone.css({left: leftAdjust, top: "0px" });
                $clone
            }
        },
        madeCloneStop : function ( event, ui ) {
            //console.log( 'cloneStopped', ui );
            if( $(this).hasClass('tracked') ) {
                //this isn't pretty -
                $(this).css({ top:'0px' });
                $(this).removeClass('tracked');
            } else {
                $(this).remove();
            }
        }
    });

    return Sound_Bank;

});
