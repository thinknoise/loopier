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

    //Individual Control Panel knob
    var Knob_Model = Backbone.Model.extend({
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

    return Knob_Model;

});
