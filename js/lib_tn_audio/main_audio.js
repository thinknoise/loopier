require.config({
    paths: {
        'underscore'    : '../lib/underscore',
        'backbone'      : '../lib/backbone',
        'jQuery'        : '../lib/jquery',
        'jQueryUI'      : '../lib/jquery-ui-1.10.4.min',
        'jQueryTouch'   : '../lib/jquery.ui.touch-punch.min'
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
    //Backbone begin
    //Individual Control Panel knob
    var KnobModel = Backbone.Model.extend({
        defaults  : {
            type          : 'default',
            contolClass   : 'control',
            buttonIcon    : 'fa fa-default'
        },
        initialize : function(){
            //This is useful to bind(or delegate) the this keyword inside all the function objects to the view
            //_.bindAll(this, 'setTotalTime');
        },
    });
    
    //Individual Sample
    var InstrumentModel = Backbone.Model.extend({
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
            //console.log( context.currentTime );    
            source[ source.start ? 'start' : 'noteOn'](time + context.currentTime);
        }
    });
    
    // Individual Channel/track
    var ChannelModel = Backbone.Model.extend({
        defaults  : {
            id      : null,
            volume  : 0.7,
            pan     : 0
        },
        initialize : function(){
            //_.bindAll(this, 'playSound');
        },
        // TODO: maybe line up sequences here
    });
    
    // CONTROL KNOBS being called with the model
    var KnobView = Backbone.View.extend({
        tagName    : 'li',
        className  : 'player-controls list-inline',
        template   : null,
        state      : "default",
        events     : {},
        initialize : function(){
            _.bindAll(this, 'render' );
            
            this.template = _.template(
                "<span title='<%= altText %>' class='<%= contolClass %> <%= buttonIcon %> '></span>"
            );
        },
        render : function(){
            $(this.el).html( this.template( this.model.toJSON() ) );
        }
    });
    
    
    //Main View for the list
    var ControlPanel = Backbone.View.extend({
        id         : "dt-player-controls",
        tagName    : "ul", 
        className  : "control-block",
        events : {
            "click .control-play"   : "onPlaySequence",
            "click .control-loop"   : "onChangeLoopState",
            "click .control-stop"   : "onLastCall",
            "click .control-reset"  : "onResetTracks",
        },
        initialize : function(){
            _.bindAll(this,'addItemHandler', 'loadCompleteHandler', 'render', 'onPlaySequence', 'onChangeLoopState', 'onLastCall', 'setPlayButtonToPlay', 'onResetTracks' );
            this.collection.bind('add', this.addItemHandler);
        },
        load : function(){      // AJAX Request
            this.collection.fetch({
                add: true,
                success: this.loadCompleteHandler,
                error: this.errorHandler,
            });
        },  
        //once per item in list
        addItemHandler : function(model){
            var knobView = new KnobView({model:model});
            knobView.render();
            $(this.el).append(knobView.el);
        },
        loadCompleteHandler : function(){
            console.log('loaded knobs without errors!');
            this.render();
        },
        errorHandler : function(){ throw "Error loading JSON file"; },
        render : function(){
            // stick it in
            $('#tn-controls-container').append($(this.el));
            return this;
        },
        onPlaySequence : function ( event ) {
    
            var index = 0,
                controlClass = this.collection.models[index].get("contolClass"),
                defaultIcon  = this.collection.models[index].get("buttonIcon"),
                toggleIcon   = this.collection.models[index].get("toggleIcon"),
                toggleClass  = this.collection.models[index].get("toggleClass"),
                playButtonState = this.collection.models[1].get("state");
        
            // if loop buttton state is on set loopState to true
            if (playButtonState === 'default' || playButtonState === 'looping') {
                //button state
                this.collection.models[1].set("state", 'looping' )
                // dictates the track state on play seq
                TN_tapereel.loopState = true;
            }
            var isStarted = TN_tapereel.startTapeLoop();
            
            if( isStarted ) {
                $(event.target).removeClass( defaultIcon +' '+ controlClass )
                                  .addClass( toggleIcon +' '+ toggleClass );
            }
            

        },
        onChangeLoopState : function ( event ) {
            //console.log(this.collection.models[1].get("contolClass"), $(event.target) )
            var index = 1,
                controlClass = this.collection.models[index].get("contolClass"),
                defaultIcon  = this.collection.models[index].get("buttonIcon"),
                toggleIcon   = this.collection.models[index].get("toggleIcon"),
                toggleClass  = this.collection.models[index].get("toggleClass"),
                playButtonState = this.collection.models[1].get("state");
        
            if ( playButtonState === 'looping' ) {
                // button state
                this.collection.models[1].set("state", 'oneshot' )
                // track state
                TN_tapereel.loopState = false;
                // flip play button to play state
                this.onLastCall();
                $(event.target).removeClass( defaultIcon +' '+ controlClass )
                                  .addClass( toggleIcon +' '+ toggleClass );
            } else {
                // button state
                this.collection.models[1].set("state", 'looping' );
                // track state
                TN_tapereel.loopState = true;
                $(event.target).removeClass( toggleIcon +' '+ toggleClass )
                                  .addClass( defaultIcon +' '+ controlClass );
            }
        },
                // not there yet
        onLastCall : function ( event ) {
            $(this.el).find('.control-stop').addClass('danger') ;
            TN_tapereel.loopState = false;
            //this.setPlayButtonToPlay( event )
        },
        setPlayButtonToPlay : function () {
            var index = 0,
                controlClass = this.collection.models[index].get("contolClass"),
                defaultIcon  = this.collection.models[index].get("buttonIcon"),
                toggleIcon   = this.collection.models[index].get("toggleIcon"),
                toggleClass  = this.collection.models[index].get("toggleClass");
        
            $(this.el).find('.control-stop').removeClass( toggleClass + ' danger ' + toggleIcon )
                                               .addClass( defaultIcon +' '+ controlClass );
        },
        onResetTracks : function ( ) {
            TN_tapereel.onClearTapeReel();
            this.onLastCall();
        }
    });

    var ChannelView = Backbone.View.extend({
        tagName    : 'li',
        className  : 'mixing-track',
        template   : null,
        events     : {},
        initialize : function(){
            _.bindAll(this, 'render', 'playSequence', 'onDropped' );

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
            console.log( track, pos )
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
                $uiHelper.find('.sound-name').remove();
                var $cloneParent = $('.mixing-track'),
                    $clone = $uiHelper.clone(true)
                         .addClass('sound-clone ' + $uiHelper.data('icon') ) 
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
                         .on( 'click', TNSQ.fireOffSound );
                 
                var leftAdjust = $clone.position().left - $cloneParent.offset().left + 10;
                var topAdjust = 0;
                $clone.css({left: leftAdjust, top: "0px" });
            }
        },
        cloneDragged : function ( event, ui ) {
            //console.log( 'cloneStarted', ui );
        },
        cloneDropped : function ( event, ui ) {
            console.log( 'cloneDropped', ui );
        },
        cloneStopped : function ( event, ui ) {
            //onsole.log( 'cloneStopped', ui );
            if( $(this).hasClass('tracked') ) {
                //this isn't pretty -
                $(this).css({ top:'0px' })
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
            "click .audio-player" : "onClick",
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
        onDragging : function () {},
    });
     
    //We define the collection, associate the map for every item in the list
    var ControlCollection = Backbone.Collection.extend({
        model: KnobModel,
        url: 'json/controls.json'
    });

    var InstrumentCollection = Backbone.Collection.extend({
        model: InstrumentModel,
        url: 'json/instruments.json'
    });

    var ChannelCollection = Backbone.Collection.extend({
        model: ChannelModel,
        url: 'json/channel.json'
    });

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
            //model is an instance of InstrumentModel
            var instView = new InstrumentView({model:model});

            // load sound here 
            this.loadSound( model );
            
            instView.render();
            $(this.el).append(instView.el);
        },

        loadCompleteHandler : function(){
            console.log('loaded SoundBank without errors!');
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
                trackWidth = $('.mixing-track').width;

            request.open('GET', model.get("url"), true);
            request.buttonIndex = model.attributes.snd_id;
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
                    
                }, this.onLoadSoundError);
            }
            request.send();
        },
        onLoadSoundError : function ( error ) {
            console.log( error );
        },
    });
    
    var TapeReelView = Backbone.View.extend({
        id         : "track-container",
        tagName    : "ul", 
        totalTime  : 2000,
        loopState  : true,
        events : {},
        initialize : function(){
            _.bindAll(this, 'addItemHandler', 'loadCompleteHandler', 'rescaleLoopClones', 'startTapeLoop', 'playSchedule', 'stopSequence', 'onClearTapeReel', 'render' );
            this.collection.bind('add', this.addItemHandler);
            $(window).on( 'resize', this.rescaleLoopClones )
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
        },
        errorHandler : function(){ throw "Error loading JSON file"; },
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
        startTapeLoop : function ( e ) {

            var $track       = this.$el.find('.mixing-track'),
                $clones      = this.$el.find('.sound-clone'),
                trackLength  = this.trackWidth,
                leftOffset   = this.$el.offset().left - 30,
                timeLength   = this.totalTime,
                loopSchedule = [];

            if($clones.length) {
                $clones.each( function () {

                    var $clone         = $(this),
                        soundIndex     = $clone.data('sound-index'),
                        left           = parseInt( $clone.css('left') ) - leftOffset,
                        percentOfTime  = left/trackLength,
                        startEventTime = ( (timeLength/1000) * percentOfTime );

                    //console.log( parseInt( $clone.css('left') ), $("#track-container").offset().left, percentOfTime );
                    loopSchedule.push({
                        instmodel   : TN_sndbank.models[ soundIndex ],
                        time        : startEventTime
                    });
                });

                this.playSchedule( loopSchedule );
                //LOOPING
    //            setTimeout(function(){
    //                TNSQ.playSchedule( loopSchedule );
    //            },TNSQ.totalTime);
                return true;
            } else {
                //nothing on the track
                console.log('nothing on the track');
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
        },
        render : function(){
            //we assign our element into the available dom element
            $('#tn-tape-reel').append("<div class='clue-popup arrow_box  hidden  '>drag a sound onto a track</div>");
            $('#tn-tape-reel').append($(this.el));
            this.trackWidth = $(this.el).width();

            return this;
        },
    });
    
    //Backbone code - end

    // create the instance of control collection:
    var controlCollection = new ControlCollection();
    var controlPanel = new ControlPanel({ collection: controlCollection });
    controlPanel.load();

    // create the instance of track collection:
    var channelCollection = new ChannelCollection();
    var tapeReelView = new TapeReelView({ collection: channelCollection });
    tapeReelView.load();

    // create the instance of soundBank collection:
    var instrumentCollection = new InstrumentCollection();
    var soundBank = new SoundBank({ collection: instrumentCollection });
    soundBank.load();

//////////////////////////////////
    // begin router
    // define router class 
    
    var LoopRouter = Backbone.Router.extend ({ 
        routes: { 
            '' : 'home', 
            'random': 'setRandom' 
        }, 
    }); 
    
// define new router instance
	var appRouter = new LoopRouter();

// using router.on()
	appRouter.on('route:home', function() {
		//code here
                alert('home');
	});

	appRouter.on('route:setRandom', function() {
		//code here
                alert('setRandom');
	});
    
    // use html5 History API 
    Backbone.history.start({pushState: true}); 

    // end router
//////////////////////////////////

    
    var TNSQ = {
        start : function () {
            
            window.AudioContext = window.AudioContext||window.webkitAudioContext;
            context = new AudioContext();
            return TNSQ;
        },
    }
    
    window.TNSQ = TNSQ.start();
    window.TN_sndbank = instrumentCollection;
    window.TN_tapereel = tapeReelView;
    window.TN_controls = controlPanel;
    
});