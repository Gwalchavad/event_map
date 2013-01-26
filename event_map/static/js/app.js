/*global define*/
var app;
define([
  'underscore',
  'backbone',
  'router', // Request router.js
  'routefilter',
  'debug'
], function(_,Backbone, Router){
    "use strict";
    Backbone.View.prototype.close = function() {
        if (this.onClose) {
            this.onClose();
        }
        this.remove();
        this.unbind();
    };
    var initialize = function(options){
        app = new Router({
            map: options
        });
        Backbone.history.start();
    };
    return {
       initialize: initialize
    };
});
