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

////////////////////////////////////////////
//  CHANNEL VIEW - TRACKS
////////////////////////////////////////////
    var Channel_View = Backbone.View.extend({
        tagName    : 'li',
        className  : 'mixing-track',
        template   : null,
        events     : {},
        initialize : function(){
            _.bindAll(this, 'render', 'playSequence', 'onDropped', 'makeClone' );

            $(this.el).droppable({
                over     : this.onOvered,
                out      : this.onOuted,
                drop     : this.onDropped
            });

            this.template = _.template(
                "<div class='indicator'></div>"
            );
        },
        render : function(){
            $(this.el).html( this.template( this.model.toJSON() ) );
        },
        // TODO: ??
        renderClone : function( track, pos ){
            //console.log( track, pos )
        },
        playSequence : function () {
            //TODO: make tracks specific to sounds and onClick clones a new snd on the track
        },
        onOvered : function ( event, ui ) {
            $(this).addClass('track-hover');
        },
        onOuted : function ( event, ui ) {
            $(this).removeClass('track-hover');
        },
        onDropped : function  ( event, ui ) {
            // the eagle has landed
            var $this = $(this.el);

            $this.removeClass('track-hover')

            $(ui.draggable).addClass('tracked');

            var $uiHelper = $(ui.helper);

            if( !$uiHelper.hasClass('sound-clone') ) {
                // remove the title for icone replacement
                //$uiHelper.find('.sound-name').remove();
                // this doesn't set a track clone model (thats done on load)
                // btw $cloneParent is $this
                var $cloneParent = $('.mixing-track'),
                    $clone = $uiHelper.clone(true)
                         .addClass('sound-clone') // ' + $uiHelper.data('icon') )
                         .removeClass('audio-button draggable ui-draggable ui-draggable-dragging')
                         .css({ "padding-left" : "3px", "text-align": "left" })
                         .appendTo( $this )
                         .draggable({
                            snap     : '.mixing-track',
                            snapMode : 'inner',
                            drag     : this.cloneDragged,
                            drop     : this.cloneDropped,
                            stop     : this.cloneStopped,
                         })
                         .on( 'click', function (e) { TN_sndbank.models[$uiHelper.data('sound-index')].playSound(0) } );

                var leftAdjust = $clone.position().left - $cloneParent.offset().left + 10;
                var topAdjust = 0;
                $clone.css({left: leftAdjust, top: "0px" });
            }
        },
        makeClone : function () {
            //console.log("makeClone");
        },
        cloneDragged : function ( event, ui ) {
            //console.log( 'cloneStarted', ui );
        },
        cloneDropped : function ( event, ui ) {
            //console.log( 'cloneDropped', ui );
        },
        cloneStopped : function ( event, ui ) {
            //onsole.log( 'cloneStopped', ui );
            if( $(this).hasClass('tracked') ) {
                //this isn't pretty -
                $(this).css({ top:'0px' });
                $(this).removeClass('tracked');
            } else {
                $(this).remove();
            }
        }
    });

    return Channel_View;

});
