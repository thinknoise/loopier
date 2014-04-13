define([
    
    'jQuery',
    'jQueryUI'
    
], function (
        
    $

) {

     var DragAndDrop = {
         
        activate : function( AudioMain ) {

           $( ".draggable" ).draggable({
               revert   : 'invalid',
               helper   : "clone",
               snap     : '.mixing-track',
               snapMode : 'inner',

               create   : DragAndDrop.create,
               start    : DragAndDrop.starting,
               drag     : DragAndDrop.dragging,
               stop     : DragAndDrop.stopped,
           });

           $( ".mixing-track" ).droppable({
               drop     : DragAndDrop.dropped,
               over     : DragAndDrop.overed,
               out      : DragAndDrop.outed
           });
           return true;
       },

       create : function  ( event, ui ) {
           //console.log( 'create', ui );
           return true;
       },
       starting : function  ( event, ui ) {

           event.stopPropagation();
           var index = $(this).data('sound-index'),
               soundLength = TN_Sequencer.getSoundLength( index );
       
           $(ui.helper).css({ "width" : soundLength })
           //console.log( "starting", ui.offset.top );
           return true;
        },
        dragging : function  ( event, ui ) {
           // console.log( "dragging", ui, trackPosition.top );
        },
        overed : function ( event, ui ) {
            $(this).addClass('track-hover')
        },
        outed : function ( event, ui ) {
            $(this).removeClass('track-hover')
        },
        dropped : function  ( event, ui ) {
           //console.log( 'dropped', ui );
            $(this).removeClass('track-hover')
            $(this).removeClass( "empty" );

           //to communicate which track recieved the sound
           $(this).addClass( "currentReciever" );

           //
           $(ui.draggable).addClass('tracked');
       },
       stopped : function ( event, ui ) {
           //console.log( 'stopped', ui );
           var $this = $(this);
           
           if( $this.hasClass('tracked') ) {
               $this.removeClass('tracked');
               
               var title = $(ui.helper).data('sound-name'),
                   index = $this.data('sound-index'),
                   soundLength = TN_Sequencer.getSoundLength( index );

               $(ui.helper).clone(true)
                           .addClass('sound-clone')
                           .removeClass('audio-button draggable ui-draggable ui-draggable-dragging')
                           .html( title )
                           .appendTo( $('#track-container .mixing-track.currentReciever') )
                           .css({ "width" : soundLength, })
                           .draggable({
                                   snap     : '.mixing-track',
                                   snapMode : 'inner',

                                   drop     : DragAndDrop.soundDropped,
                                   stop     : DragAndDrop.soundStopped,
                               })
                           .on( 'click', TN_Sequencer.fireOffSound );
               $('#track-container .mixing-track').removeClass('currentReciever');
               //TN_Sequencer.startSequence();
           }
       },
       soundDropped : function ( event, ui ) {
           //console.log( 'soundDropped', ui );
           $(ui.draggable).addClass('tracked');   
       },
       soundStopped : function ( event, ui ) {
           //onsole.log( 'soundStopped', ui );
           if( $(this).hasClass('tracked') ) {
               $(this).removeClass('tracked');
           } else {
               $(this).remove();
           }
       }
    }
    
    return DragAndDrop;
});
