require.config({
    paths: {
        'modelInstrument'   : './model_instrument',
        'modelChannel'      : './model_channel',
        'modelKnob'         : './model_knob',
        'viewControlPanel'  : './view_control_panel',
        'viewChannel'       : './view_channel',
        'viewInstrument'    : './view_instrument',
        'viewSoundBank'     : './view_sound_bank',
        'viewTapeReel'      : './view_tape_reel',
        'routerLoop'        : './router_loop',
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
    'viewChannel',
    'viewInstrument',
    'viewSoundBank',
    'viewTapeReel',
    'routerLoop',
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
    Channel_View,
    Instrument_View,
    Sound_Bank_View,
    Tape_Reel_View,
    Loop_Router,
    Backbone,
    _,
    $

) {

    //We define the collection, associate the map for every item in the list
    var ControlCollection = Backbone.Collection.extend({
        model: Knob_Model,
        url: 'json/controls.json'
    });

    var SoundBankCollection = Backbone.Collection.extend({
        model: Instrument_Model,
        url: 'json/instruments.json',
        initialize : function () {
            this.on( "change:sndLoaded", this.onModelSoundLoadComplete, this);
            // should turn this off after completing all of them
        },
        onModelSoundLoadComplete : function () {
            var allCompleted = 1;
            _.each( this.models, function ( model, index ) {
                var loaded = model.get('sndLoaded');
                allCompleted *= loaded;
            });
            // all of them need to be true to equal 1
            if ( allCompleted ) {
                TN_tapereel.putScheduleOnTrack( TN_sndbank_view );
            }
        }
    });

    var ChannelCollection = Backbone.Collection.extend({
        model: Channel_Model,
        url: 'json/channel.json'
    });

    // create the instance of control collection:
    var controlCollection = new ControlCollection();
    var controlPanel = new Control_Panel_View({ collection: controlCollection });
    controlPanel.load();

    // create the instance of track collection:
    var channelCollection = new ChannelCollection();
    var tapeReelView = new Tape_Reel_View({ collection: channelCollection });
    tapeReelView.load();

    // create the instance of Sound_Bank_View collection:
    var soundBankCollection = new SoundBankCollection();
    var soundBank = new Sound_Bank_View({ collection: soundBankCollection });
    soundBank.load();


    window.TN_controls = controlPanel;
    window.TN_tapereel = tapeReelView;
    window.TN_sndbank_view = soundBank;
    window.TN_sndbank = soundBankCollection;


});
