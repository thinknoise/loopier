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
                var clone_bits     = clone.split(":");

                schedule.push({
                        snd_id      : clone_bits[0],
                        time        : (totalTime/1000) *  (clone_bits[1]/100),
                        percentage  : clone_bits[1]/100,
                        track       : clone_bits[2]
                });
            });

            _.each(TN_tapereel.collection.models, function ( reel ) {
                reel.set('urlSchedule', [] );
            });
            _.each(schedule, function ( schedule_item ) {
                var reels = TN_tapereel.collection.models;

                if( schedule_item.track < reels.length ) {
                    var track_items = reels[ schedule_item.track ].get('urlSchedule');
                    track_items.push( schedule_item )
                    reels[ schedule_item.track ].set('urlSchedule', track_items );
                }
            });
        },

        noLoop: function () {

        },

        buildSchedule: function( $clones , track_length ) {
            var loop_url       = '',
                loopSchedule   = [];

            $clones.each( function () {
                //this is where its taken from the DOM and
                var $clone         = $(this),
                    sound_index    = $clone.data('sound-index'),
                    trackNo        = $clone.parent().index(),
                    percentOfTime  = parseInt( $clone.css('left') )/track_length,
                    startEventTime = ( (track_length/1000) * percentOfTime );

                // Array of all the clones
                loopSchedule.push({
                    snd_id      : sound_index,
                    time        : startEventTime,
                    width       : $clone.width(),
                    track       : $clone.parent().index()
                });
                loop_url += sound_index + ":" + Math.round(percentOfTime*100) + ":" + trackNo + ","
            });

            loop_url = loop_url.substr(0, (loop_url.length-1) );

            // which inturn sends it to doLoop
            this.navigate("loop/" + loop_url  + "/cycle/2000", true);

            return loopSchedule; // Array of all the clones

        }
    });

    return Loop_Router;

});
