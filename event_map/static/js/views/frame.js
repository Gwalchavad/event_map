define(['jquery', 'underscore', 'backbone', 'utils', 'models/users','models/session', 'hbs!../../templates/app_css', 'hbs!../../templates/nav', 'bootstrap',
// Load our app module and pass it to our definition function
], function($, _, Backbone, Utils, User, Session,
    temp_app_css,
    temp_nav
) {
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

        initialize: function() {
            var self = this;
            this.model.on('change',this.render,this);
            
            $(window).on('resize', function() {
                self.height = $(window).height();
                // shuold be $(".top").height() instead of 60, but top is not there first
                self.topHeight = $(window).height() - 60;
                $("#heightStyle").replaceWith(temp_app_css({
                    height: self.height,
                    topHeight: self.topHeight
                }));
                self.resizeTitleText();
                

            });

            //this.$el.append(temp_markdown(null));
            this.height = $(window).height();
            //60 height of header
            this.topHeight = $(window).height() - 60;
            this.$el.append(temp_app_css({
                height: this.height,
                topHeight: this.topHeight
            }));
            self.render();
            $(window).trigger("resize");
        },
        resizeTitleText: function(){

            var site_title_lenght= $(window).height() - $("#mainNavList").height();
            $("#site_title").width(site_title_lenght);
            $("#site_title").textfill();
            var font_height = parseInt($("#site_title span").css("font-size"),10);
            $("#site_title").css("left",35 + font_height); 
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
            this.loginCallback = arguments.callee.caller;
            this.logonmodel();
            var hide = function () {
                delete this.loginCallback;
                history.back();
            }
            $('#loginhtml').one('hidden',hide);
        },
        onLogin: function(e) {
            self = this;
            e.preventDefault();
            promise = this.model.save(Utils.form2object("#loginForm"));
            if (promise) {
                promise.error(function(response) {
                    //get the error message and display it
                    json = JSON.parse(response.responseText);
                    $('#loginError').text(json.errors.message).show('fast');
                });
                promise.success(function(data) {
                    if(self.loginCallback)
                        self.loginCallback();
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
            self = this;
            e.preventDefault();

            var NewUser = new User();
            
            NewUser.on("error", function(model, errors) {
                _.each(errors, function(error, key) {
                    $("#" + key + "_error").show().html(error);
                });
            });    
            
            if(NewUser.set(Utils.form2object("#SignUpForm"))){
                promise = NewUser.save();
                promise.error(function(response) {
                    //get the error message and display it
                    json = JSON.parse(response.responseText);
                    var list = $("<ul />");
                    _.each(json, function(error, key) {
                        list_item = $("<li  />", {
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
