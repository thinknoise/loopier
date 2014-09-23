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

    // Individual Channel/track
    var Channel_Model = Backbone.Model.extend({
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

    return Channel_Model;

});
