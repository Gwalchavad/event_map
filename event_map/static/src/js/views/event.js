/*global define app*/
define([
    'utils',
    'backbone',
    'jade!../../templates/event'
  // Load our app module and pass it to our definition function
], function(Utils,Backbone,temp_event){
    "use strict";
    var EventView = Backbone.View.extend({
        tagName: "div",
        className: "replace span7 overflow setheight",
        id: "event_view",
        height: 0,
        initialize: function(){
            var self = this;
            app.session.on("change", function(model) {
                self.render();
            });
        },
        render: function() {
            if(this.model.get("location_point"))
                var marker = app.map.add_marker(this.model.get("location_point").coordinates);
            if (this.model.get("author") == app.session.get("username")) {
                this.edit = true;
            } else {
                this.edit = false;
            }
            this.model.set("edit", this.edit, {
                silent: true
            });
            var json = this.model.toJSON();
            //format the date
            json.content = json.content.replace(/\n/g, '<br>');
            json.start_date = this.model.get("start_datetime").format("dddd, MMMM Do YYYY, h:mm:ss a");
            json.end_date = this.model.get("end_datetime").format("dddd, MMMM Do YYYY, h:mm:ss a");
            this.$el.html(temp_event(json));
            return this;
        }
    });
    return {
        EventView:EventView
    };
});
