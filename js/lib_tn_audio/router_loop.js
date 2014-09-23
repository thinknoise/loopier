define([
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
    //////////////////////////////////
    // begin router
    // define router class

    var Loop_Router = Backbone.Router.extend ({
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

  return Loop_Router;

});
