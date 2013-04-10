/*global define confirm app*/
define([
    'underscore',
    'jquery',
    'backbone',
    'utils',
    'jade!../../templates/group_add'
], function (_, $, Backbone, Utils, temp_group_add) {
    "use strict";
    var groupAdd = Backbone.View.extend({
        tagname: "div",
        template: temp_group_add,
        className: "span7 overflow setheight",
        events: {
            "click #add_group": "add_group",
            "click .cancel": "cancel",
            "click #delete_group": "delete_group"
        },
        initialize : function () {
            this.model.on("error", function (model, errors) {
                _.each(errors, function (error, key) {
                    $("#" + key + "_error").show().html(error);
                });
            });
        },
        render: function () {
            this.$el.append(this.template(this.model.toJSON()));
            return this;
        },
        cancel: function (e) {
            e.preventDefault();
            app.navigate('/#', {
                trigger: true
            });
        },
        add_group: function (e) {
            var self = this;
            //override the na
            e.preventDefault();
            //hide error messages
            $(".label").hide();
            if (this.model.set(Utils.form2object("#group_add_form"))) {
                var promise = this.model.save();
                if (promise) {
                    promise.error(function (response) {
                        var errors = JSON.parse(response.responseText);
                        _.each(errors.errors, function (error, key) {
                                $("#" + key + "_error").show().html(error[0]);
                            }
                        );
                    });
                    promise.success(function (response) {
                        app.navigate('feed/' + self.model.id, {
                            trigger: true
                        });
                    });
                }
            }
        },
        delete_group: function (e) {
            e.preventDefault();
            var self = this;
            if (confirm("Do you want to Delete your Group?")) {
                self.model.destroy({
                    success: function () {
                        app.navigate('/#', {
                            trigger: true
                        });
                    }
                });
            }
        }
        
    });
    
    return groupAdd;
});

