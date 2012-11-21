define(['jquery', 'underscore', 'backbone', 'utils', 'models/users','models/session', 'hbs!../../templates/app_css', 'hbs!../../templates/nav', 'lib/bootstrap',
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
            "click #loginButton": "login",
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
            this.model.on('change',this.render);
            
            $(window).on('resize', function() {
                this.height = $(window).height();
                this.topHeight = $(window).height() - $(".top").height();
                $("#heightStyle").replaceWith(temp_app_css({
                    height: this.height,
                    topHeight: this.topHeight
                }));

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
        },
        render: function() {
            //add login template
            $("#mainNav").html(temp_nav(this.model.toJSON()));
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
        login: function(e) {
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
                    _.each(json.errors, function(error, key) {
                        list_item = $("<li  />", {
                            text: error
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
