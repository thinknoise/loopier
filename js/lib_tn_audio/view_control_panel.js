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
    //Main View for the list
    var Control_Panel = Backbone.View.extend({
        id         : "dt-player-controls",
        tagName    : "ul",
        className  : "control-block",
        events : {
            "click .control-play"   : "onPlaySequence",
            "click .control-loop"   : "onChangeLoopState",
            "click .control-stop"   : "onLastCall",
            "click .control-share"  : "onShareClick",
            "click .control-reset"  : "onResetTracks",
        },
        initialize : function(){
            _.bindAll(this,'addItemHandler', 'loadCompleteHandler', 'render', 'onPlaySequence', 'onChangeLoopState', 'onLastCall', 'onShareClick', 'setPlayButtonToPlay', 'onResetTracks' );
            this.collection.bind('add', this.addItemHandler);
        },
        load : function(){      // AJAX Request
            this.collection.fetch({
                add: true,
                success: this.loadCompleteHandler,
                error: this.errorHandler,
            });
        },
        //once per item in list
        addItemHandler : function(model){
            var knobView = new KnobView({model:model});
            knobView.render();
            $(this.el).append(knobView.el);
        },
        loadCompleteHandler : function(){
            //console.log('loaded knobs without errors!');
            this.render();
        },
        errorHandler : function(){ throw "Error loading JSON file"; },
        render : function(){
            // stick it in
            $('#tn-controls-container').append($(this.el));
            return this;
        },
        onPlaySequence : function ( event ) {

            var index = 0,
                controlClass    = this.collection.models[index].get("contolClass"),
                defaultIcon     = this.collection.models[index].get("buttonIcon"),
                toggleIcon      = this.collection.models[index].get("toggleIcon"),
                toggleClass     = this.collection.models[index].get("toggleClass"),
                playButtonState = this.collection.models[1].get("state");

            // if loop buttton state is on set loopState to true
            if (playButtonState === 'default' || playButtonState === 'looping') {
                //button state
                this.collection.models[1].set("state", 'looping' )
                // dictates the track state on play seq
                TN_tapereel.loopState = true;
            }
            var isStarted = TN_tapereel.startTapeLoop();

            if( isStarted ) {
                $(".control-play").removeClass( defaultIcon +' '+ controlClass )
                                  .addClass( toggleIcon +' '+ toggleClass );
            }


        },
        onChangeLoopState : function ( event ) {
            //console.log(this.collection.models[1].get("contolClass"), $(event.target) )
            var index = 1,
                controlClass = this.collection.models[index].get("contolClass"),
                defaultIcon  = this.collection.models[index].get("buttonIcon"),
                toggleIcon   = this.collection.models[index].get("toggleIcon"),
                toggleClass  = this.collection.models[index].get("toggleClass"),
                playButtonState = this.collection.models[1].get("state");

            if ( playButtonState === 'looping' ) {
                // button state
                this.collection.models[1].set("state", 'oneshot' )
                // track state
                TN_tapereel.loopState = false;
                // flip play button to play state
                this.onLastCall();
                $(event.target).removeClass( defaultIcon +' '+ controlClass )
                                  .addClass( toggleIcon +' '+ toggleClass );
            } else {
                // button state
                this.collection.models[1].set("state", 'looping' );
                // track state
                TN_tapereel.loopState = true;
                $(event.target).removeClass( toggleIcon +' '+ toggleClass )
                                  .addClass( defaultIcon +' '+ controlClass );
            }
        },
                // not there yet
        onLastCall : function ( event ) {
            $(this.el).find('.control-stop').addClass('danger') ;
            TN_tapereel.loopState = false;
            //this.setPlayButtonToPlay( event )
        },
        onShareClick : function () {
            window.open('mailto:""?subject=A loop from Thinknoise Loopier&body="http://www.thinknoise.com/loopier/#' + Backbone.history.fragment + '"');
            //alert( "http://www.thinknoise.com/loopier/#" + Backbone.history.fragment );
        },
        setPlayButtonToPlay : function () {
            var index = 0,
                controlClass = this.collection.models[index].get("contolClass"),
                defaultIcon  = this.collection.models[index].get("buttonIcon"),
                toggleIcon   = this.collection.models[index].get("toggleIcon"),
                toggleClass  = this.collection.models[index].get("toggleClass");

            $(this.el).find('.control-stop').removeClass( toggleClass + ' danger ' + toggleIcon )
                                               .addClass( defaultIcon +' '+ controlClass );
        },
        onResetTracks : function ( ) {
            TN_tapereel.onClearTapeReel();
            this.onLastCall();
        }
    });

    return Control_Panel;

});
