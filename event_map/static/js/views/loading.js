define([
    'backbone',
    'hbs!../../templates/loading',
  // Load our app module and pass it to our definition function
], function(Backbone,temp_loading){

    var LoadingView = Backbone.View.extend({
        tagname: "div",
        className: "span7",
        render: function() {
            this.$el.html(temp_loading());
            return this;
        }
    });
    
    return LoadingView;
});
