define([
    'backbone',
    'hbs!../../templates/event',
  // Load our app module and pass it to our definition function
], function(Backbone,temp_event){
    var EventView = Backbone.View.extend({
        tagName: "div",
        className: "replace span7 overflow setheight",
        id: "event_view",
        height: 0,
        initialize: function() {
            var self = this;
            app.user.on("change", function(model) {
                self.render();
            });
        },
        render: function() {
            app.map.group.clearLayers();
            if (this.model.get("author") == app.user.get("username")) {
                this.edit = true;
            } else {
                this.edit = false;
            }
            this.model.set("edit", this.edit, {
                silent: true
            });
            this.$el.html(temp_event(this.model.toJSON()));
            return this;
        },
    });
    
    return {
        EventView:EventView
    };
});
