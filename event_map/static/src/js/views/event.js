/*global define app*/
define([
    'utils',
    'backbone',
    'hbs!../../templates/event'
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
            json.start_date = this.model.get("start_datetime").getWeekdayName();
            json.start_date += " "+this.model.get("start_datetime").getDateWithSlash();
            json.start = this.model.get("start_datetime").getTimeCom();
            json.end = this.model.get("end_datetime").getTimeCom();
            if(this.model.get("end_datetime").toDateString() != this.model.get("start_datetime").toDateString()){
                json.end_date = this.model.get("end_datetime").getWeekdayName() +
                " " + this.model.get("start_datetime").getDateWithSlash();
            }else{
                delete json.end_date;
            }
            this.$el.html(temp_event(json));
            return this;
        }
    });
    return {
        EventView:EventView
    };
});
