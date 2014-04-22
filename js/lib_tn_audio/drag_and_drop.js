define([
    
    'jQuery',
    'jQueryUI'
    
], function (
        
    $

) {

     var DragAndDrop = {
         
        activate : function( $this ) {
           $this.find( ".draggable" ).draggable({
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

       create : function  ( event, ui ) { return true; },
       starting : function  ( event, ui ) {
           event.stopPropagation();
           var index = $(this).data('sound-index'),
               soundLength = TN_sndbank.models[ index ].get('sndDuration') *88;
       
           $(ui.helper).css({ "width" : soundLength })
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
            $(this).removeClass('track-hover')
            $(this).removeClass( "empty" );
            
            // TODO: get the play tooltip to show up
            //$( ".selector" ).tooltip({ show: { effect: "blind", duration: 800 } });
            //$('.control-play').tooltip( "option", "show", { effect: "blind", duration: 800 } );
            
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
               
               var $uiHelper = $(ui.helper),
                   title = $uiHelper.data('sound-name'),
                   index = $this.data('sound-index'),
                   soundLength = TN_sndbank.models[ index ].get('sndDuration') *88;

               $uiHelper.find('.sound-name').remove();
               $uiHelper.clone(true)
                        .addClass('sound-clone glyphicon glyphicon-play' ) //
                        .removeClass('audio-button draggable ui-draggable ui-draggable-dragging')
                        .css({ "width" : soundLength,  })
                        .appendTo( $('#track-container .mixing-track.currentReciever') )
                        .draggable({
                            snap     : '.mixing-track',
                            snapMode : 'inner',
                            drop     : DragAndDrop.soundDropped,
                            stop     : DragAndDrop.soundStopped,
                        })
                        .on( 'click', TNSQ.fireOffSound );
               $('#track-container .mixing-track').removeClass('currentReciever');
               //TNSQ.startSequence();
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
