require.config({
    paths: {
        'modelSCInstrument' : './model_SCinstrument',
        'modelChannel'      : './model_channel',
        'modelKnob'         : './model_knob',
        'viewControlPanel'  : './view_control_panel',
        'viewChannel'       : './view_channel',
        'viewSCInstrument'  : './view_SCinstrument',
        'viewSCBank'        : './view_SCbank',
        'viewTapeReel'      : './view_tape_reel',
        'routerLoop'        : './router_loop',
        'underscore'        : '../lib/underscore',
        'backbone'          : '../lib/backbone',
        'soundcloud'        : 'http://connect.soundcloud.com/sdk',
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
        },
        'soundcloud' : {
            exports: 'SC'
        }
    }
});
require([
    'modelSCInstrument',
    'modelChannel',
    'modelKnob',
    'viewControlPanel',
    'viewChannel',
    'viewSCInstrument',
    'viewSCBank',
    'viewTapeReel',
    'routerLoop',
    'backbone',
    'soundcloud',
    'underscore',
    'jQuery',
    'jQueryUI',
    'jQueryTouch'

], function (

    Soundcloud_Instrument_Model,
    Channel_Model,
    Knob_Model,
    Control_Panel_View,
    Channel_View,
    Soundcloud_Instrument_View,
    Soundcloud_Bank_View,
    Tape_Reel_View,
    Loop_Router,
    Backbone,
    SC,
    _,
    $

) {
    console.log ('start')

    // initialize client with app credentials
    // We define the collection, associate the map for every item in the list
    var ControlCollection = Backbone.Collection.extend({
        model: Knob_Model,
        url: 'json/controls.json'
    });

    var SoundCloudCollection = Backbone.Collection.extend({
        model: Soundcloud_Instrument_Model,
        initialize : function () {
            this.on( "change:sndLoaded", this.onModelSoundLoadComplete, this);
            // should turn this off after completing all of them
        },
        onModelSoundLoadComplete : function () {
            var allCompleted = 1;
            _.each( this.models, function ( model, index ) {
                var loaded = model.get('sndLoaded');
                // all of them need to be true to equal 1
                allCompleted *= loaded;
                if(!allCompleted) return false; // just a tad faster
            });
            if ( allCompleted ) {
                console.log('onModelSoundLoadComplete - allCompleted');

                tapeReelView.putScheduleOnTrack( soundCloudCollection );
                this.off( "change:sndLoaded");
            }
        }

    });

    // e- appEvent aggrogation pubsub nugget
    var appEvent = _.extend({}, Backbone.Events);

    // create the instance of control collection:
    var controlCollection = new ControlCollection();
    var controlPanel = new Control_Panel_View({
        collection  : controlCollection,
        appEvent    : appEvent
    });
    controlPanel.load();

    var ChannelCollection = Backbone.Collection.extend({
        model: Channel_Model,
        url: 'json/channel.json'
    });

    // create the instance of track collection:
    var channelCollection = new ChannelCollection();

    var tapeReelView = new Tape_Reel_View({
        collection  : channelCollection,
        appEvent    : appEvent,

    });
    tapeReelView.load();

    // this is where I can add the sequence from ids
    // channelCollection.add( 'whammo' );

    var soundCloudCollection = new SoundCloudCollection();
    var soundcloudBank = new Soundcloud_Bank_View({ collection: soundCloudCollection });
    soundcloudBank.load();

    // icky
    window.TN_controls = controlPanel;
    window.TN_tapereel = tapeReelView;
    window.TN_scbank = soundCloudCollection;
});
