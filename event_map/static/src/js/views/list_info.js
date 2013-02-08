/*global define app intro_text*/
define([
    'backbone',
    'hbs!../../templates/list_info'
  // Load our app module and pass it to our definition function
], function(Backbone,temp_list_info){
    "use strict";
    var ListInfoView = Backbone.View.extend({
        tagName: "div",
        className: "replace span3",
        id: "calender",
        childrenEL: "#listOptionPanels",
        render: function() {
            var editable = null;
            var title;
            //if any user, group or feed is being viewed
            if (this.model) {
                if (this.model.getTitle() == app.session.get("username")) {
                    title = "MY EVENTS";
                    editable = true;
                } else {
                    title = this.model.getTitle();
                }
            } else {
                //else all things are being viewed
                title = "ALL EVENT";
                editable = true;
            }

            this.$el.append(
                temp_list_info({
                    title: title,
                    allow_add: editable,
                    description: intro_text
                })
            );
            return this;
        }
    });
    return ListInfoView;
});
