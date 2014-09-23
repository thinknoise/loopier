define([
    'viewChannel',
    'routerLoop',
    'backbone',
    'underscore',
    'jQuery',
    'jQueryUI',
    'jQueryTouch'

], function (
    Channel_View,
    Loop_Router,
    Backbone,
    _,
    $

) {

    var Tape_Reel_View = Backbone.View.extend({
        id         : "track-container",
        tagName    : "ul",
        totalTime  : 2000,
        loopState  : true,
        sharedSchedule : [],
        events : {},
        initialize : function(){
            _.bindAll(this, 'addItemHandler', 'loadCompleteHandler', 'rescaleLoopClones', 'startTapeLoop', 'playSchedule', 'stopSequence', 'onClearTapeReel', 'render' );
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
        loadCompleteHandler : function(){
            //console.log('loaded channels without errors!');
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
        startTapeLoop : function () {

            var $track       = this.$el.find('.mixing-track'),
                $clones      = this.$el.find('.sound-clone'),
                trackLength  = this.trackWidth,
                leftOffset   = this.$el.offset().left,
                timeLength   = this.totalTime,
                loopUrl      = "",
                loopSchedule = [];

            if($clones.length) {
                $clones.each( function () {

                    var $clone         = $(this),
                        soundIndex     = $clone.data('sound-index'),//this should come from soundbank model
                        left           = parseInt( $clone.css('left') ),// - leftOffset,
                        percentOfTime  = left/trackLength,
                        startEventTime = ( (timeLength/1000) * percentOfTime );

                    //console.log( parseInt( $clone.css('left') ), $("#track-container").offset().left, percentOfTime );
                    loopSchedule.push({
                        instmodel   : TN_sndbank.models[ soundIndex ],
                        time        : startEventTime
                    });
                    loopUrl += soundIndex + ":" + Math.round(percentOfTime*100) + ","
                });
                loopUrl = loopUrl.substr(0, (loopUrl.length-1) ) + "/cycle/2000";
                this.router.navigate("loop/" + loopUrl, true);

                this.playSchedule( loopSchedule );
                //LOOPING
    //            setTimeout(function(){
    //                TNSQ.playSchedule( loopSchedule );
    //            },TNSQ.totalTime);
                return true;
            } else {
                //nothing on the track
                //console.log('nothing on the track');
                this.stopSequence();
                return false;
            }
        },
        playSchedule : function ( seqSchedule ) {

            _.each(seqSchedule, function ( seqItem ) {
                seqItem.instmodel.playSound( seqItem.time);
            });

            var $track      = this.$el.find('.mixing-track'),
                trackLength = parseInt( $track.width() ),
                self = this;

            this.$el.find('.indicator').stop().css({ "margin-left" : 0 }).animate({
                    "margin-left" : trackLength
                },
                this.totalTime,
                "linear",
                function () {
                    //console.log(self.loopState);
                    if(self.loopState) {
                        self.startTapeLoop();
                    } else {
                        self.stopSequence();
                    }
                }
            );

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
            this.router.navigate("loop", true);
        },
        render : function(){
            //we assign our element into the available dom element
            $('#tn-tape-reel').append("<div class='clue-popup arrow_box  hidden  '>drag a sound onto a track</div>");
            $('#tn-tape-reel').append($(this.el));
            this.trackWidth = $(this.el).width();

            return this;
        },
    });

    return Tape_Reel_View;

});
