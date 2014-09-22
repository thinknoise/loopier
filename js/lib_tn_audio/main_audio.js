require.config({
    paths: {
        'modelInstrument'   : './model_instrument',
        'modelChannel'      : './model_channel',
        'modelKnob'         : './model_knob',
        'viewControlPanel'  : './view_control_panel',
        'underscore'        : '../lib/underscore',
        'backbone'          : '../lib/backbone',
        'jQuery'            : '../lib/jquery',
        'jQueryUI'          : '../lib/jquery-ui-1.10.4.min',
        'jQueryTouch'       : '../lib/jquery.ui.touch-punch.min'
    },
    shim: {
        'jQuery': {
            exports: '$'
        },
        'jQueryUI': {
            deps: ['jQuery']
         },
        'jQueryTouch': {
            deps: ['jQueryUI']
         },
        'underscore': {
            exports: '_'
        },
        'backbone': {
            deps: ['underscore', 'jQuery'],
            exports: "Backbone"
        }
    }
});
require([
    'modelInstrument',
    'modelChannel',
    'modelKnob',
    'viewControlPanel',
    'backbone',
    'underscore',
    'jQuery',
    'jQueryUI',
    'jQueryTouch'

], function (

    Instrument_Model,
    Channel_Model,
    Knob_Model,
    Control_Panel_View,
    Backbone,
    _,
    $

) {
////////////////////////////////////////////
//  CHANNEL VIEW - TRACKS
////////////////////////////////////////////
    var ChannelView = Backbone.View.extend({
        tagName    : 'li',
        className  : 'mixing-track',
        template   : null,
        events     : {},
        initialize : function(){
            _.bindAll(this, 'render', 'playSequence', 'onDropped', 'makeClone' );

            $(this.el).droppable({
                over     : this.onOvered,
                out      : this.onOuted,
                drop     : this.onDropped
            });

            this.template = _.template(
                "<div class='indicator'></div>"
            );
        },
        render : function(){
            $(this.el).html( this.template( this.model.toJSON() ) );
        },
        // TODO: ??
        renderClone : function( track, pos ){
            //console.log( track, pos )
        },
        playSequence : function () {
            //TODO: make tracks specific to sounds and onClick clones a new snd on the track
        },
        onOvered : function ( event, ui ) {
            $(this).addClass('track-hover');
        },
        onOuted : function ( event, ui ) {
            $(this).removeClass('track-hover');
        },
        onDropped : function  ( event, ui ) {
            // the eagle has landed
            var $this = $(this.el);

            $this.removeClass('track-hover')

            $(ui.draggable).addClass('tracked');

            var $uiHelper = $(ui.helper);

            if( !$uiHelper.hasClass('sound-clone') ) {
                // remove the title for icone replacement
                //$uiHelper.find('.sound-name').remove();
                var $cloneParent = $('.mixing-track'),
                    $clone = $uiHelper.clone(true)
                         .addClass('sound-clone') // ' + $uiHelper.data('icon') )
                         .removeClass('audio-button draggable ui-draggable ui-draggable-dragging')
                         .css({ "padding-left" : "3px", "text-align": "left" })
                         .appendTo( $this )
                         .draggable({
                            snap     : '.mixing-track',
                            snapMode : 'inner',
                            drag     : this.cloneDragged,
                            drop     : this.cloneDropped,
                            stop     : this.cloneStopped,
                         })
                         .on( 'click', function (e) { TN_sndbank.models[$uiHelper.data('sound-index')].playSound() } );

                var leftAdjust = $clone.position().left - $cloneParent.offset().left + 10;
                var topAdjust = 0;
                $clone.css({left: leftAdjust, top: "0px" });
            }
        },
        makeClone : function () {
            //console.log("makeClone");
        },
        cloneDragged : function ( event, ui ) {
            //console.log( 'cloneStarted', ui );
        },
        cloneDropped : function ( event, ui ) {
            //console.log( 'cloneDropped', ui );
        },
        cloneStopped : function ( event, ui ) {
            //onsole.log( 'cloneStopped', ui );
            if( $(this).hasClass('tracked') ) {
                //this isn't pretty -
                $(this).css({ top:'0px' });
                $(this).removeClass('tracked');
            } else {
                $(this).remove();
            }
        }
    });
    // called with its Own Model
    var InstrumentView = Backbone.View.extend({
        tagName    : 'li',
        className  : 'sound-item',
        template   : null,
        events     : {
            "click .audio-player" : "onClick"
        },

        initialize : function(){
            _.bindAll(this, 'render', 'onStarting', 'onDragging' );

            if(this.model) {
                this.model.on('change',this.render,this);
            }

            //later we will see complex template engines, but is the basic from underscore
            this.template = _.template(
                "<div class='btn btn-primary audio-player audio-button draggable' data-sound-index='<%= snd_id %>' data-icon='<%= glyphicon %>' data-sound-name='<%= name %>'>" +
                    //"<div class='clue-popup arrow_box'>drag me onto a track</div>" +
                    "<div class='sound-name'><%= name %></div>" +
                "</div>"
            );
        },
        render : function(){
            $(this.el).html( this.template( this.model.toJSON() ) );

            $(this.el).find('.audio-player').draggable({
                revert   : 'invalid',
                helper   : "clone",
                snap     : '.mixing-track',
                snapMode : 'inner',

                start    : this.onStarting, //that.model.onStart,
                drag     : this.onDragging,
            });
        },
        onClick : function () {
            this.model.playSound();
        },
        popupOn : function () {
            // TODO: this needs different triggers
            // needs to be tied to model - random child of the collection?
            //$(this.el).find(".clue-popup").css({display:"block"});
        },
        popupOff : function () {
            //$(this.el).find(".clue-popup").css({display:"none"});
        },
        onStarting : function ( event, ui ) {
            $(ui.helper).css({ 'width': this.model.get('width') });
        },
        onDragging : function () {}
    });

    //We define the collection, associate the map for every item in the list
    var ControlCollection = Backbone.Collection.extend({
        model: Knob_Model,
        url: 'json/controls.json'
    });

    var InstrumentCollection = Backbone.Collection.extend({
        model: Instrument_Model,
        url: 'json/instruments.json'
    });

    var ChannelCollection = Backbone.Collection.extend({
        model: Channel_Model,
        url: 'json/channel.json'
    });


///////////////
    var SoundBank = Backbone.View.extend({
        id         : "samples-table",
        tagName    : "ul",
        className  : "sound-bank-wrap",
        events : {},
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
            var instView = new InstrumentView({model:model});

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

                    //get ur done - wait till the last one is loaded and play the schedule
                    if(request.buttonIndex == 23 && urlSchedule) {
                        //console.log(urlSchedule);
                        _.each( urlSchedule, function ( soundEvent, index ) {
                            var i = soundEvent.instmodel.get("index"),
                                t = soundEvent.percentage;
                            self.makeClone( $(self.el.children[ i ].children[0]), t );
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
        makeClone : function ( $master, percentOnTrack ) {

            if( !$master.hasClass('sound-clone') ) {
                //
                var $cloneParent = $('.mixing-track').first(),
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
                        .on( 'click', function (e) { TN_sndbank.models[index].playSound(); } );

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

    // create the instance of soundBank collection:
    var instrumentCollection = new InstrumentCollection();
    var soundBank = new SoundBank({ collection: instrumentCollection });
    soundBank.load();
    window.TN_sndbank = instrumentCollection;

//////////////////////////////////
    // begin router
    // define router class

    var LoopRouter = Backbone.Router.extend ({
        routes: {
          'loop/:cloneData/cycle/:totalTime': 'doLoop'
        },

        initialize: function() {
            //console.log('begin');
            window.AudioContext = window.AudioContext||window.webkitAudioContext;
            context = new AudioContext();
       },

        doLoop: function( cloneData, totalTime ) {

            var clones   = cloneData.split(","),
                schedule = [];
            _.each( clones, function ( clone, index) {
                var soundId =  clone.split(":")[0],
                    loopPercentage =  clone.split(":")[1],
                    startEventTime = (totalTime/1000) *  (loopPercentage/100);

                schedule.push({
                        instmodel   : TN_sndbank.models[ soundId ],
                        time        : startEventTime,
                        percentage  : loopPercentage/100
                });
                //TN_sndbank.models[ soundId ].playSound();
            });

            // GET UR DONE
            urlSchedule = schedule;
            //console.log('doLoop totalTime ' );
            // need to wait for buffers to be loaded
        }
    });
    // end router
//////////////////////////////////


    var TapeReelView = Backbone.View.extend({
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
            //model is an instance of ChannelView -tracks
            var channelView = new ChannelView({ model:model });
            channelView.render();

            $(this.el).append(channelView.el);
        },
        loadCompleteHandler : function(){
            //console.log('loaded channels without errors!');
            this.render();
            this.router = new LoopRouter();
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


    // create the instance of control collection:
    var controlCollection = new ControlCollection();
    var controlPanel = new Control_Panel_View({ collection: controlCollection });
    controlPanel.load();

    // create the instance of track collection:
    var channelCollection = new ChannelCollection();
    var tapeReelView = new TapeReelView({ collection: channelCollection });
    tapeReelView.load();


    window.TN_tapereel = tapeReelView;
    window.TN_controls = controlPanel;

});
