define([
  'underscore',
  'backbone',
  'router', // Request router.js
  'debug'
], function(_,Backbone, Router){

    Backbone.View.prototype.close = function() {
        _.each(this.children, function(child) {
            child.close();
        });

        if (this.onClose) {
            this.onClose();
        }
        this.remove();
        this.unbind();
    };
    Backbone.View.prototype.children = [];
    Backbone.View.prototype.addChild = function(child) {
        this.children.push(child);
    };
    Backbone.View.prototype.renderAll = function(child) {
        this.render();
        _.each(this.children, function(child) {
            if (child.render) {
                this.$el.appendTo(child.render());
            }
        });
        return this.el;
    };
    
    var initialize = function(options){
        app = new Router({
            map: options
        });
        Backbone.history.start();
    }
  
  return {
    initialize: initialize
  };
});



