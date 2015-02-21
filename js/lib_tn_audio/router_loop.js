define([
    'modelChannel',
    'backbone',
    'underscore',
    'jQuery',
    'jQueryUI',
    'jQueryTouch'

], function (
    Channel_Model,
    Backbone,
    _,
    $

) {
    //////////////////////////////////
    // begin router
    // define router class

    var Loop_Router = Backbone.Router.extend ({
        routes: {
          'loop/:cloneData/cycle/:totalTime': 'doLoop',
          '': 'noLoop'
        },

        initialize: function() {
            //console.log('begin');
            //window.AudioContext = window.AudioContext||window.webkitAudioContext;
            //context = new AudioContext();
        },

        doLoop: function( cloneData, totalTime ) {

            var clones   = cloneData.split(","),
                schedule = [];
            _.each( clones, function ( clone, index) {
                var soundId =  clone.split(":")[0],
                    loopPercentage =  clone.split(":")[1],
                    startEventTime = (totalTime/1000) *  (loopPercentage/100),
                    track          = clone.split(":")[2];

                schedule.push({
                        instmodel   : TN_sndbank.models[ soundId ],
                        time        : startEventTime,
                        percentage  : loopPercentage/100,
                        track       : track
                });
                //TN_sndbank.models[ soundId ].playSound();
            });

            TN_tapereel.collection.models[0].set('urlSchedule', schedule );
        },

        noLoop: function () {

        }
    });
    // end router
    //////////////////////////////////

  return Loop_Router;

});
