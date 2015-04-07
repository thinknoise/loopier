define([
    'viewInstrument',
    'backbone',
    'underscore',
    'jQuery',
    'jQueryUI',
    'jQueryTouch'

], function (
    Instrument_View,
    Backbone,
    _,
    $

) {

    var Sound_Bank_View = Backbone.View.extend({
          id         : "samples-table",
          tagName    : "ul",
          className  : "sound-bank-wrap",
          events     : {},
          context    : {},

        initialize : function(){
            $(this.el).append('<div class="loading">LOADING SOUNDS</div>');
            this.render();

            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();

            //This is useful to bind(or delegate) the this keyword inside all the function objects to the view
            _.bindAll(this, 'addItemHandler', 'loadCompleteHandler', 'loadCompleteHandler', 'render');
            this.collection.bind('add', this.addItemHandler);

        },
        load : function(){
            // AJAX Request
            this.collection.fetch({
                add: true,
                success: this.loadCompleteHandler,
                error: this.errorHandler
            });
        },
        //we arrived  per item in list
        addItemHandler : function( model ){
            //console.log(model);
            //model is an instance of Instrument_Model
            var instView = new Instrument_View({model:model});
            // load sound here
            model.loadSound( this );
            $(this.el).append(instView.el);

            instView.render();
        },
        //
        loadCompleteHandler : function(){
            //console.log('loaded SoundBank without errors!');
            var self = this;

            $(self.el).find('.loading').remove();
            self.render();

        },

        errorHandler : function(){
            throw "Error loading JSON file";
        },

        render : function(){
            //we assign our element into the available dom element
            $('#tn-samples-container').append($(this.el));

            return this;
        }
    });

    return Sound_Bank_View;

});
