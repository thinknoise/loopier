define([
    'modelInstrument',
    'modelChannel',
    'modelKnob',
    'backbone',
    'underscore',
    'jQuery',
    'jQueryUI',
    'jQueryTouch'

], function (
    Instrument_Model,
    Channel_Model,
    Knob_Model,
    Backbone,
    _,
    $

) {

    var Instrument_View = Backbone.View.extend({
        tagName    : 'li',
        className  : 'sound-item',
        template   : null,
        events     : {
            "click .audio-player" : "onClick"
        },

        initialize : function(){
            _.bindAll(this, 'render', 'onStarting', 'onDragging' );

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
            this.model.playSound(0);
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
        onDragging : function () {}
    });

    return Instrument_View;

});
