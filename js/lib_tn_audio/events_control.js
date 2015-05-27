define([
    'viewTapeReel',
    'backbone',
    'underscore',
    'jQuery',
    'jQueryUI',
    'jQueryTouch'
], function (

    View_Tape_Reel,
    Backbone,
    _,
    $
) {


    var Events_Control = Backbone.Events;

    Events_Control.on("alert", function(msg) {
        //alert("Triggered " + msg);
        View_Tape_Reel.playSchedule();
    });

    //Events_Control.trigger("alert", "an event");
    return Events_Control;
})
