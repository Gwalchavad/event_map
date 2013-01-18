define([
    'utils',
    'backbone',
    'hbs!../../templates/event',
  // Load our app module and pass it to our definition function
], function(Utils,Backbone,temp_event){
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
            app.map.group.clearLayers();
            if(this.model.get("location_point"))
                var marker = app.map.add_marker(this.model.get("location_point").coordinates)
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
            json.start_date = this.model.get("_start_date").getWeekdayName();
            json.start_date += " "+this.model.get("_start_date").getDateWithSlash();
            json.start = this.model.get("_start_date").getTimeCom();
            json.end = this.model.get("_end_date").getTimeCom();
            if(this.model.get("_end_date").toDateString() != this.model.get("_start_date").toDateString()){
                json.end_date = this.model.get("_end_date").getWeekdayName() 
                + " "+this.model.get("_start_date").getDateWithSlash();
            }else{
                delete json.end_date;
            }
           
            this.$el.html(temp_event(json));
            return this;
        },
    });
    return {
        EventView:EventView
    };
});
