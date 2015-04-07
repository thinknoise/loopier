define([
    'viewChannel',
    'modelChannel',
    'routerLoop',
    'backbone',
    'underscore',
    'jQuery',
    'jQueryUI',
    'jQueryTouch'

], function (
    Channel_View,
    Channel_Model,
    Loop_Router,
    Backbone,
    _,
    $

) {

    var Tape_Reel_View = Backbone.View.extend({
        id         : "track-container",
        tagName    : "ul",
        totalTime  : 2000,
        sharedSchedule : [],
        events : {},
        initialize : function(){
            $(this.el).append('<div class="loading">LOADING tracks</div>');
            this.render();
            _.bindAll(this, 'addItemHandler', 'addTrackToReel', 'loadCompleteHandler', 'rescaleLoopClones', 'codifyDomToLoop', 'startTapeLoop', 'playSchedule', 'stopSequence', 'onClearTapeReel', 'render' );
            this.collection.bind('add', this.addItemHandler);
            $(window).on( 'resize', this.rescaleLoopClones );
        },
        load : function(){
            // AJAX Request
            this.collection.fetch({
                add     : true,
                success : this.loadCompleteHandler,
                error   : this.errorHandler
            });
        },
        //we arrived  per item in list
        addItemHandler : function( model ){
            //model is an instance of Channel_View -tracks
            var channelView = new Channel_View({ model:model });
            channelView.render();

            $(this.el).append(channelView.el);
        },
        addTrackToReel : function() {
            var newChannelModel = new Channel_Model();
            var newChannelview = new Channel_View({ model:newChannelModel });
            newChannelview.render();

            $(this.el).append(newChannelview.el);
            return true;
        },
        loadCompleteHandler : function(){
            //console.log('loaded channels without errors!');
            $(this.el).find('.loading').remove();
            this.render();
            this.router = new Loop_Router();
            // cheating? or should it be in init?
            Backbone.history.start();

        },
        errorHandler : function(){ throw "Error loading JSON file"; },
        returnUrlSchedule : function ( ) {
            //console.log(this.sharedSchedule)
        },
        rescaleLoopClones : function ( ) {
            var $track       = this.$el.find('.mixing-track'),
                $clones      = this.$el.find('.sound-clone'),
                trackWidth   = $track.width(),
                startWidth   = this.trackWidth;

            if($clones.length) {
                $clones.each( function () {
                    var newLeft = (parseInt($(this).css('left'))*(trackWidth/startWidth));
                    $(this).css({ left: newLeft + 'px' });
                });
            }

            this.trackWidth = trackWidth;

        },
        putScheduleOnTrack: function ( SoundBank ) {
            var self = this;
            // track model
            models = self.collection.models;
            _.each( models, function ( reel, index ) {
                if( reel.get('urlSchedule') ) {
                    var urlSchedule = reel.get('urlSchedule');
                    console.log(urlSchedule);
                    _.each( urlSchedule, function ( item, index ) {
                        self.makeClone( SoundBank.$el.find('.sound-item [data-sound-index='+item.snd_id+']'), item.percentage, item.track );
                    });
                }
            });
        },
        codifyDomToLoop : function () {
            var $clones      = $(this.$el.find('.sound-clone')),
                trackLength  = this.trackWidth,
                leftOffset   = this.$el.offset().left,
                timeLength   = this.totalTime,
                loopSchedule = [],
                self = this;

            loopSchedule = this.router.buildSchedule( $clones, trackLength );

        },
        startTapeLoop : function () {
            $clones = this.$el.find('.sound-clone');

            if($clones.length) {
                this.playSchedule();
            } else {
                //nothing on the track
                this.stopSequence();
                return false;
            }
        },
        playSchedule : function () {
            var seqSchedule = [],
                self = this;

            _.each( self.collection.models, function ( model ) {
                var track_items = model.get('urlSchedule');

                _.each( track_items, function ( item ) {
                    //console.log('item', item)
                    TN_scbank.get( item.snd_id ).playSoundCloud( item.time )
                })

            });

            var $track      = this.$el.find('.mixing-track'),
                trackLength = parseInt( $track.width() ),
                self = this;

            this.$el.find('.indicator').stop().css({ "margin-left" : 0 }).animate({
                    "margin-left" : trackLength
                },
                this.totalTime,
                "linear",
                function () { // start at beginning again when this is done
                    if( TN_controls.getControlState( "control-loop" ) && TN_controls.getControlState( "control-play" ) ) {
                        self.playSchedule();
                    } else {
                        self.stopSequence();
                    }
                }
            );
            return true;

        },
        stopSequence : function () {
            this.$el.find('.indicator').stop().css({ "margin-left" : 0 });
            // and reset playbutton
            TN_controls.setPlayButtonToPlay();
        },
        onClearTapeReel : function () {
            var $tracks = $(this.el).find('.mixing-track');
            _.each($tracks, function ( track, index ) {
                var clones = $(track).find('.sound-clone');
                _.each( clones, function(clone) {
                    $(clone).remove()
                })
            });
            this.codifyDomToLoop();
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
                           stop     : this.madeCloneStop
                        })
                        .on( 'click', function (e) {
                            TN_scbank.get(index).playSound(0);
                        });

                var leftAdjust = percentOnTrack * $cloneParent.width();
                // set width
                //console.log( TN_sndbank.models[index].get('width'));
                $clone.css({ 'width': TN_scbank.get(index).get('width'), left: leftAdjust, top: "0px" });
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
            TN_tapereel.codifyDomToLoop();
        },
        render : function(){
            //we assign our element into the available dom element
            //$('#tn-tape-reel').append("<div class='clue-popup arrow_box  hidden  '>drag a sound onto a track</div>");
            $('#tn-tape-reel').append($(this.el));
            this.trackWidth = $(this.el).width();

            return this;
        },
    });

    return Tape_Reel_View;

});
