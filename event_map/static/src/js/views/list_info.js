/*global define app intro_text*/
define([
    'backbone',
    'underscore',
    'jquery',
    'jade!../../templates/list_info',
    'jade!../../templates/edit_profile'
  // Load our app module and pass it to our definition function
], function (Backbone, _, $, temp_list_info, temp_edit_profile) {
    "use strict";
    var ListInfoView = Backbone.View.extend({
        tagName: "div",
        className: "replace span3",
        id: "calender",
        events: {
            "click #editProfile": "editProfile"
        },
        childrenEL: "#listOptionPanels",
        initialize: function (options) {
            this.constructor.__super__.initialize.apply(this, [options]);
        },
        render: function () {
            var self = this;
            function _render() {
                var editable = null;
                var title;
                var permissions = self.model.get("permissions");
                var true_array = [];
                for (var i = 0; i < permissions.length; i++) {
                    true_array[i] = true;
                }
               
                self.model.set("permissions", _.object(permissions, true_array));
                //if any user, group or feed is being viewed
                if (self.model) {
                    if (self.model.get("title") == app.session.get("username")) {
                        self.model.set("title", "MY EVENTS");
                        self.model.set("permissions", {"group_admin": true, "add_event": true});
                    }
                }
                self.$el.append(
                    temp_list_info(self.model.toJSON())
                );
            }
            if (this.model.id) {
                var request = this.model.fetch();
                request.error(function () {
                    throw ("event not found");
                });
                request.success(function (data) {
                    _render();
                });
            } else {
                _render();
            }
            return this;
        },
        editProfile: function () {
            this.oldText = $("#description").text();
            $("#ListOptionView").html(temp_edit_profile({"description": this.oldText}));
            $("#Cancel").one("click", this, this.closeEditor);
            $("#Save").one("click", this, this.saveProfile);
        },
        closeEditor: function (e) {
            var self = e.data;
            self.$el.html(
                temp_list_info(self.model.toJSON())
            );

        },
        saveProfile: function (e) {
            var self = e.data;
            self.model.set("description", $("#description").val());
            self.model.save();
            self.closeEditor(e);
        }
    });
    return ListInfoView;
});
