define([
    'backbone',
    'hbs!../../templates/list_info',
  // Load our app module and pass it to our definition function
], function(Backbone,temp_list_info){ 
    var ListInfoView = Backbone.View.extend({
        tagName: "div",
        className: "replace span3",
        id: "calender",
        childrenEL: "#listOptionPanels",
        render: function() {
            var editable = null;
            //if any user, group or feed is being viewed
            if (this.model) {
                if (this.model.getTitle() == app.session.get("username")) {
                    var title = "MY EVENTS"
                    editable = true;
                } else {
                    var title = this.model.getTitle();
                }
            } else {
                //else all things are being viewed
                var title = "ALL EVENT";
                editable = true;
            }

            this.$el.append(
                temp_list_info({
                    title: title,
                    allow_add: editable
                })
            );
            return this;
        },
    });
    
    return ListInfoView;
});
