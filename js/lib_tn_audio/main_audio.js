require.config({
    paths: {
        'draganddrop'   : './drag_and_drop',
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
    'draganddrop',
    'backbone',
    'underscore',
    'jQuery',
    'jQueryUI',
    'jQueryTouch'
    
], function (
    
    DragAndDrop,
    Backbone,
    _,
    $

) {
    //Backbone begin
    //Individual Control Panel knob
    var KnobModel = Backbone.Model.extend({
        defaults  : {
            type    : 'default',
            contolClass   : 'control',
            buttonIcon    : 'fa fa-default'
        },
        initialize : function(){
            //This is useful to bind(or delegate) the this keyword inside all the function objects to the view
            //_.bindAll(this, 'setTotalTime');
        },
        playSequence : function () {},
        pauseSequence : function () {},
        stopSequence : function () {},
        setTotalTime : function () {},
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
            _.bindAll(this, 'playSound');
        },
        // the Model Plays/schedules its own sound 
        playSound : function ( time ) {
            var source = context.createBufferSource(); 
            source.buffer = this.get('audioBuffer'); 
            //source.loop = true;
            source.connect( context.destination );    
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
    
    var KnobView = Backbone.View.extend({
        tagName    : 'li',
        className  : 'player-controls',
        template   : null,
        events     : {
            "click .control-play" : "onClick",
        },
        initialize : function(){
            _.bindAll(this, 'render');

            this.template = _.template(
                "<span class='<%= contolClass %> <%= buttonIcon %>'></span>"
            );
        },
        render : function(){
            $(this.el).html( this.template( this.model.toJSON() ) );
        },
        onClick : function ( ) {
    
            TNSQ.startSequence;
            // TODO: lastthing of the night -  playSequence 
        }
    });
    

    var ChannelView = Backbone.View.extend({
        tagName    : 'li',
        className  : 'mixing-track empty',
        template   : null,
        events     : {},
        initialize : function(){
            _.bindAll(this, 'render', 'playSequence' );

            this.template = _.template(
                "<div class='indicator'></div>"
            );
        },
        render : function(){
            $(this.el).html( this.template( this.model.toJSON() ) );
        },
        playSequence : function () {
            //TODO: make tracks specific to sounds and onClick clones a new snd on the track
        },
    });
    
    var InstrumentView = Backbone.View.extend({
         tagName    : 'li',
         className  : 'sound-item',
         template   : null,
         events     : {
             "click .audio-player" : "onClick",
             "draggable .draggable": "dragging"
         },

         initialize : function(){
             //This is useful to bind(or delegate) the this keyword inside all the function objects to the view
             _.bindAll(this, 'render');

             //later we will see complex template engines, but is the basic from underscore
             this.template = _.template(
                 "<div class='btn btn-primary audio-player audio-button draggable' data-sound-index='<%= snd_id %>' data-sound-name='<%= name %>'>" +
                     "<div class='sound-name'><%= name %></div>" +
                 "</div>"                
             );
         },
         render : function(){
             $(this.el).html( this.template( this.model.toJSON() ) );
             DragAndDrop.activate( $(this.el) );
         },
         onClick : function () {
             this.model.playSound();
         },
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

    //Main View for the list
    var ControlPanel = Backbone.View.extend({
        id         : "dt-player-controls",
        tagName    : "ul", 
        className  : "control-block", 
        events : {},
        initialize : function(){
            _.bindAll(this,'addItemHandler', 'loadCompleteHandler', 'render');
            this.collection.bind('add', this.addItemHandler);
        },
        load : function(){      // AJAX Request
            this.collection.fetch({
                add: true,
                success: this.loadCompleteHandler,
                error: this.errorHandler
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

            // TODO: Build TrackModel
            $(".control-play").click( TNSQ.startSequence );
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
    
    var TapeReel = Backbone.View.extend({
        id         : "track-container",
        tagName    : "ul", 
        events : {},
        initialize : function(){
            _.bindAll(this,'addItemHandler', 'loadCompleteHandler', 'render');
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
        addItemHandler : function( model ){
            //model is an instance of ChannelView -tracks
            var channelView = new ChannelView({ model:model });

            channelView.render();
            $(this.el).append(channelView.el);
        },

        loadCompleteHandler : function(){
            console.log('loaded channels without errors!');
            this.render();
        },
        errorHandler : function(){ throw "Error loading JSON file"; },

        render : function(){
            //we assign our element into the available dom element
            $('#tn-tape-reel').append($(this.el));

            return this;
        },
    });
    
    //Backbone code - end

    // create the instance of track collection:
    var controlCollection = new ControlCollection();
    var controlPanel = new ControlPanel({ collection: controlCollection });
    controlPanel.load();

    // create the instance of track collection:
    var channelCollection = new ChannelCollection();
    var tapeReel = new TapeReel({ collection: channelCollection });
    tapeReel.load();

    // create the instance of soundBank collection:
    var instrumentCollection = new InstrumentCollection();
    var soundBank = new SoundBank({ collection: instrumentCollection });
    soundBank.load();

    


    var TNSQ = {

        audioObj    : [],
        totalTime   : 5000,
        
        start : function () {
            
            window.AudioContext = window.AudioContext||window.webkitAudioContext;
            context = new AudioContext();

            var data = { },
                InstrumentBank = [];
            
            //$.getJSON( "json/instruments.json", TNSQ.onLoadInstrumentUrlsSuccess );
            return TNSQ;
        },
        
        playSchedule : function ( seqSchedule ) {

            _.each(seqSchedule, function ( seqItem ) {
                seqItem.instmodel.playSound( seqItem.time);
            });
            TNSQ.onPlayUI();
            
        },

        onPlayUI : function ( ) {

            var $track      = $('.mixing-track'),
                $playBtn    = $('.control-play'),
                $indicator  = $('.indicator'),
                trackLength = parseInt( $track.width() );

            //switch the icons
            $playBtn.removeClass('glyphicon-play');
            $playBtn.addClass('glyphicon-pause');

            $indicator.animate({ 
                    "margin-left" : trackLength 
                }, 
                TNSQ.totalTime, 
                "linear",
                function () {
                    $(this).css({ "margin-left" : 0 });
                    TNSQ.onPauseUI();
                }
            );
        },
        onPauseUI : function () {
            var $playBtn    = $('.control-play');

            $playBtn.removeClass('glyphicon-pause');
            $playBtn.addClass('glyphicon-play');

        },

        startSequence : function ( e ) {

            var $track      = $('.mixing-track'),
                $clones     = $('.sound-clone'),
                trackLength = parseInt( $track.width() ),
                
                loopSchedule = [];

            $clones.each( function () {

                var $clone         = $(this),
                    soundIndex     = $clone.data('sound-index'),
                    left           = parseInt( $clone.css('left') ) - $("#track-container").offset().left,
                    percentOfTime   = left/trackLength,
                    startEventTime = ( (TNSQ.totalTime/1000) * percentOfTime );
                    
                //console.log( parseInt( $clone.css('left') ), $("#track-container").offset().left, percentOfTime );
                loopSchedule.push({
                    instmodel   : TN_sndbank.models[ soundIndex ],
                    time        : startEventTime
                });
            });
            
            TNSQ.playSchedule( loopSchedule );

            
            //LOOPING
//            setTimeout(function(){
//                TNSQ.playSchedule( loopSchedule );
//            },TNSQ.totalTime);
//            setTimeout(function(){
//                TNSQ.playSchedule( loopSchedule );
//            },TNSQ.totalTime*2);

        }
    }
    
    window.TNSQ = TNSQ.start();
    window.TN_sndbank = instrumentCollection;
    
});