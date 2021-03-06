/*global define app*/
define([
    'jquery',
    'underscore',
    'backbone',
    'utils',
    'models/users',
    'models/session',
    'jade!../../templates/app_css',
    'jade!../../templates/nav',
    'bootstrap'
// Load our app module and pass it to our definition function
], function($, _, Backbone, Utils, User, Session, temp_app_css, temp_nav) {
    "use strict";
    var frameView = Backbone.View.extend({
        el: 'body',
        height: 0,
        events: {
            "click #login": "logonmodel",
            "click #markdown": function() {
                $('#markdown_help').modal();
            },
            "click #loginButton": "onLogin",
            "click #logout": "logout",
            "hide #loginhtml": function() {
                $('#loginError').hide();
            },
            "click #signUp": "signUpModel",
            "click #signUpButton": "signUp",
            "hide #signup_html": function() {
                $('#signupError').hide();
            }
        },
        initialize: function(options) {
            this.constructor.__super__.initialize.apply(this, [options]);
            this.model.on('change',this.render,this);
            this.height = $(window).height();
            //60 height of header
            this.$el.append(temp_app_css({
                height: this.height - 10,
                topHeight: this.topHeight - 10
            }));

            this.render();
            this.onResize();
        },
        onResize: function(e){
            this.height = $(window).height();
            // shuold be $(".top").height() instead of 60, but top is not there first
            this.topHeight = $(window).height() - 60;
            $("#heightStyle").replaceWith(temp_app_css({
                height: this.height-1,
                topHeight: this.topHeight-1
            }));
            this.resizeTitleText();
        },
        resizeTitleText: function(){
            var site_title_lenght= $(window).height() - $("#mainNavList").height();
            $("#site_title").width(site_title_lenght);
            $("#site_title").textfill();
            var font_height = parseInt($("#site_title span").css("font-size"),10),
            offset = ($("#mainNavList").width() - font_height)/2;
            $("#site_title").css("left",120 - offset);
        },
        render: function() {
            //add login template
            var json = this.model.toJSON();
            $("#mainNavList").html(temp_nav(json));
            return this;
        },

        logonmodel: function(e) {
            //open the login model
            $('#loginhtml').modal({
                keyboard: true
            });
        },
        logout: function(e) {
            var self = this;
            e.preventDefault();
            this.model.destroy({
                success: function(model, response) {
                    self.model.clear();
                    self.render();
                }
            });
        },
        login: function(){
            this.logonmodel();
            var hide = function () {
                delete this.loginCallback;
                history.back();
            };
            $('#loginhtml').one('hidden',hide);
        },
        onLogin: function(e) {
            var self = this;
            e.preventDefault();
            var promise = this.model.save(Utils.form2object("#loginForm"));
            if (promise) {
                promise.error(function(response) {
                    //get the error message and display it
                    var json = JSON.parse(response.responseText);
                    $('#loginError').text(json.errors.message).show('fast');
                });
                promise.success(function(data) {
                    if(self.route !== 'undfined'){
                        //http://stackoverflow.com/questions/8550841/trigger-same-location-route#10181053
                        Backbone.history.loadUrl(Backbone.history.fragment);
                    }
                    $('#loginhtml').off('hidden');
                    $('#loginhtml').modal('hide');
                });
            }
        },
        signUpModel: function() {
            $('#loginhtml').modal('hide');
            $('#signup_html').modal('show');
            $(".label").hide();
        },
        signUp: function(e) {
            var self = this;
            e.preventDefault();
            var NewUser = new User();
            NewUser.on("error", function(model, errors) {
                _.each(errors, function(error, key) {
                    $("#" + key + "_error").show().html(error);
                });
            });
            if(NewUser.set(Utils.form2object("#SignUpForm"))){
                var promise = NewUser.save();
                promise.error(function(response) {
                    //get the error message and display it
                    var json = JSON.parse(response.responseText);
                    var list = $("<ul />");
                    _.each(json, function(error, key) {
                        var list_item = $("<li  />", {
                            text: error.message
                        });
                        list.append(list_item);
                    });
                    $('#signupError').html(list).show('fast');
                });
                promise.success(function(data) {
                    self.model.fetch();
                    $('#signup_html').modal('hide');
                });
            }
        }
    });
    return frameView;
});
