define([
  'backbone',
  'router', // Request router.js
], function(Backbone, Router){
  
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



