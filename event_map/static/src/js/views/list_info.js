/*global define app intro_text*/
define([
    'backbone',
    'jquery',
    'hbs!../../templates/list_info',
    'hbs!../../templates/profile',
    'hbs!../../templates/edit_profile'
  // Load our app module and pass it to our definition function
], function(Backbone, $, temp_list_info, temp_profile, temp_edit_profile){
    "use strict";
    var ListInfoView = Backbone.View.extend({
        tagName: "div",
        className: "replace span3",
        id: "calender",
        events: {
            "mouseenter #ListOptionView": "onMouseenter",
            "mouseleave #ListOptionView": "onMouseleave",
            "click #editProfile": "editProfile"
        },
        childrenEL: "#listOptionPanels",
        initialize: function(options) {
            this.constructor.__super__.initialize.apply(this, [options]);
        },
        render: function() {
            var self = this;
            function _render () {
                var editable = null;
                var title;
                //if any user, group or feed is being viewed
                if (self.model) {
                    if (self.model.get("title") == app.session.get("username")) {
                        title = "MY EVENTS";
                        editable = true;
                    } else {
                        title = self.model.get("title");
                    }
                } else {
                    //else all things are being viewed
                    title = "ALL EVENTS";
                    editable = true;
                }

                self.$el.append(
                    temp_list_info(self.model.toJSON())
                );
            }
            if(this.model.id){
                var request = this.model.fetch();
                request.error(function() {
                    throw ("event not found");
                });
                request.success(function(data) {
                    _render();
                });
            }else{
               _render();
            }

            return this;
        },
        onMouseenter: function(){
            $("#editProfile").show();
        },
        onMouseleave: function(){
            $("#editProfile").hide();
        },
        editProfile: function (){
            this.oldText = $("#description").text();
            $("#ListOptionView").html(temp_edit_profile({"description": this.oldText}));
            $("#Cancel").one("click", this, this.closeEditor);
            $("#Save").one("click", this, this.saveProfile);
        },
        closeEditor: function(e){
            $("#ListOptionView").html(temp_profile(e.data.model.toJSON()));
        },
        saveProfile: function(e){
            var self = e.data;
            self.model.set("description", $("#description").val());
            self.model.save();
            self.closeEditor(e);
        }
    });
    return ListInfoView;
});
