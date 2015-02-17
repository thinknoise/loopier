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
    // CONTROL KNOBS
    var KnobView = Backbone.View.extend({
        tagName    : 'li',
        className  : 'player-controls list-inline',
        template   : null,
        state      : "default",// knob 3 is looping by default and tus set ot true by json
        events     : {},
        initialize : function(){
            _.bindAll(this, 'render' );

            this.template = _.template(
                "<span title='<%= altText %>' class='<%= contolClass %> <%= buttonIcon %> '></span>"
            );
        },
        render : function(){
            $(this.el).html( this.template( this.model.toJSON() ) );
        }
    });

    //Main View for the list
    var Control_Panel = Backbone.View.extend({
        id         : "dt-player-controls",
        tagName    : "ul",
        className  : "control-block",
        events : {
            "click .control-play"   : "onPlaySequence",
            "click .control-plus"   : "onPlusTrack",
            "click .control-minus"  : "onMinusTrack",
            "click .control-loop"   : "onChangeLoopState",
            "click .control-stop"   : "onLastCall",
            "click .control-share"  : "onShareClick",
            "click .control-reset"  : "onResetTracks",
        },
        initialize : function(){
            _.bindAll(this,'addItemHandler', 'loadCompleteHandler', 'render', 'onPlaySequence', 'onPlusTrack', 'onMinusTrack', 'onChangeLoopState', 'onLastCall', 'onShareClick', 'setPlayButtonToPlay', 'onResetTracks' );
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
            $('#tn-controls-container').append($(this.el));
            return this;
        },
        onPlusTrack : function () {
            TN_tapereel.addTrackToReel()
        },
        onMinusTrack : function () {
            //TN_tapereel.removeTrackToReel()
        },
        onPlaySequence : function ( event ) {

            var playBtn_m = this.collection.findWhere({ contolClass : "control-play"});

            var isStarted = TN_tapereel.playSchedule();
            if( isStarted ) {
                this.setControlState( "control-play", true )
                $(".control-play").removeClass( playBtn_m.get("buttonIcon") +' '+ playBtn_m.get("contolClass") )
                                  .addClass   ( playBtn_m.get("toggleIcon") +' '+ playBtn_m.get("toggleClass") );
            }

        },
        onChangeLoopState : function ( event ) {
            var loop_m = this.collection.findWhere({ contolClass : "control-loop"});

            //toggle the looping button
            if ( this.getControlState( "control-loop" ) ) {
                this.setControlState( "control-loop", false ); // oneshot
                $(event.target).removeClass( loop_m.get("buttonIcon") +' '+ loop_m.get("contolClass") )
                                  .addClass( loop_m.get("toggleIcon") +' '+ loop_m.get("toggleClass") );
                // flip play button to play state - flag for stop
                this.onLastCall();
            } else {
                this.setControlState( "control-loop", true ); // looping
                $(event.target).removeClass( loop_m.get("toggleIcon") +' '+ loop_m.get("toggleClass") )
                                  .addClass( loop_m.get("buttonIcon") +' '+ loop_m.get("contolClass") );
            }
        },
        onLastCall : function ( event ) {
            $(this.el).find('.control-stop').addClass('danger') ;
            this.setControlState( "control-play", false ); // oneshot
        },
        setControlState : function ( knobControl, state ) {
            //console.log (knobControl, " set to ", state )
            return this.collection.findWhere({ contolClass : knobControl }).set("state", state);
        },
        getControlState : function ( knobControl ) {
            return this.collection.findWhere({ contolClass : knobControl }).get("state");
        },
        setPlayButtonToPlay : function () {
            var playBtn_m = this.collection.findWhere({ contolClass : "control-play"});

            $(this.el).find('.control-stop').removeClass( playBtn_m.get("toggleClass") + ' danger ' + playBtn_m.get("toggleIcon") )
                                               .addClass( playBtn_m.get("buttonIcon") +' '+ playBtn_m.get("contolClass") );
        },
        onShareClick : function () {
            window.open('mailto:""?subject=A loop from Thinknoise Loopier&body="http://www.thinknoise.com/loopier/#' + Backbone.history.fragment + '"');
        },
        onResetTracks : function ( ) {
            TN_tapereel.onClearTapeReel();
            this.onLastCall();
        }
    });

    return Control_Panel;

});
