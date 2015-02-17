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
        codifyDomToLoop : function () {
          var $track       = this.$el.find('.mixing-track'),
              $clones      = this.$el.find('.sound-clone'),
              trackLength  = this.trackWidth,
              leftOffset   = this.$el.offset().left,
              timeLength   = this.totalTime,
              loopUrl      = "",
              loopSchedule = [];

          $clones.each( function () {
              //this is where its taken from the DOM and
              var $clone         = $(this),
                  soundIndex     = $clone.data('sound-index'),// this should come from soundbank model - cant until this is seporrated from the router
                  left           = parseInt( $clone.css('left') ),// - leftOffset,
                  percentOfTime  = left/trackLength,
                  startEventTime = ( (timeLength/1000) * percentOfTime ),
                  trackNo        = $clone.parent().index();

              //console.log( parseInt( $clone.css('left') ), $("#track-container").offset().left, percentOfTime );
              //should loopSchedule be a model?
              loopSchedule.push({
                  instmodel   : TN_sndbank.models[ soundIndex ],
                  time        : startEventTime,
                  track       : $clone.parent().index()
              });
              loopUrl += soundIndex + ":" + Math.round(percentOfTime*100) + ":" + trackNo + ","
          });
          loopUrl = loopUrl.substr(0, (loopUrl.length-1) ) + "/cycle/2000";
          // when should this happen
          this.router.navigate("loop/" + loopUrl, true);
          this.collection.models[0].set('urlSchedule', loopSchedule );

        },
        startTapeLoop : function () {
            $clones      = this.$el.find('.sound-clone')
            if($clones.length) {
                this.playSchedule();
            } else {
                //nothing on the track
                this.stopSequence();
                return false;
            }
        },
        playSchedule : function () {
            var seqSchedule = this.collection.models[0].get('urlSchedule')
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
