

var DragAndDrop = {},
    trackPosition = $('.mixing-track').first().position(),
    startPositionTop = null;


DragAndDrop.activate = function() {

    $( ".draggable" ).draggable({
        revert: 'invalid',
        helper   : "clone",
        snap     : '.mixing-track',
        snapMode : 'inner',

        create   : create,
        start    : starting,
        drag     : dragging,
        stop     : stopped,
    });
    
    $( ".mixing-track" ).droppable({
        drop     : dropped
    });

};

function create ( event, ui ) {
    //console.log( 'create', ui );
}
function starting ( event, ui ) {
    
    var index = $(this).data('sound-index');
    $(ui.helper).css({ "width" : audioObj[index].trackSize, })
    event.stopPropagation();
    //console.log( "starting", ui.offset.top );
}
function dragging ( event, ui ) {
    // console.log( "dragging", ui, trackPosition.top );
} 
function dropped ( event, ui ) {
    //console.log( 'dropped', ui );
    $(this).removeClass( "empty" );
    $(ui.draggable).addClass('tracked');
}

function stopped ( event, ui ) {
    //console.log( 'stopped', ui );
    if( $(this).hasClass('tracked') ) {
        $(this).removeClass('tracked');
        var title = $(ui.helper).data('sound-name');
        
        var index = $(this).data('sound-index');
        
        $(ui.helper).clone(true)
                    .addClass('sound-clone')
                    .removeClass('audio-button draggable ui-draggable ui-draggable-dragging')
                    .html( title )
                    .appendTo( $(this).parent().next('.sequence-source') )
                    .css({ "width" : audioObj[index].trackSize, })
                    .draggable({
                            snap     : '.mixing-track',
                            snapMode : 'inner',

                            drop     : soundDropped,
                            stop     : soundStopped,
                        })
                    .on( 'click', MainAudio.fireOffSound );
    
    }
} 

function soundDropped ( event, ui ) {
    console.log( 'soundDropped', ui );
    $(ui.draggable).addClass('tracked');   
}

function soundStopped ( event, ui ) {
    console.log( 'soundStopped', ui );
    if( $(this).hasClass('tracked') ) {
        $(this).removeClass('tracked');
    } else {
        $(this).remove();
    }
}
