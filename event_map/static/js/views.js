define([
    'jquery',
    'underscore',
    'backbone',
    'models',
    'utils',
    'timeDatePicker',

    'hbs!../templates/app_css',
    'hbs!../templates/list_option', 
    'hbs!../templates/event',
    'hbs!../templates/event_add',
    'hbs!../templates/login',
    'hbs!../templates/sign_up',
    'hbs!../templates/markdown',
    'hbs!../templates/nav',
    
    'lib/bootstrap',
  // Load our app module and pass it to our definition function
], function($,_,Backbone,Models,Utils,timeDatePicker,
            temp_app_css,
            temp_list_option,
            temp_event,
            temp_event_add,
            temp_login,
            temp_sign_up,
            temp_markdown,
            temp_nav){
    Backbone.View.prototype.close = function () {
        _.each(this.children,function(child){
           child.close();     
        });
        
        if (this.onClose) {
            this.onClose();
        }
        this.remove();
        this.unbind();
    };
    Backbone.View.prototype.children = [];
    Backbone.View.prototype.addChild = function (child) {
        this.children.push(child);
    };
    Backbone.View.prototype.renderAll = function (child) {
        this.render();
        _.each(this.children,function(child){
            if(child.render){
                if(this.childrenEl){
                    $(this.childrenEL).appendTo(child.render());
                }else{
                    this.$el.appendTo(child.render());               
                }
            }
        });
        return this.el;
    };


    var ListOptionView = Backbone.View.extend({
        tagName: "div",
        className: "replace span3",
        id: "calender",
        childrenEL: "#listOptionPanels",
        initialize: function() {

        },
        render: function() {
            var editable = null;
            //if any user, group or feed is being viewed
            if(this.model){
                if(this.model.getTitle() == app.user.get("username")){
                    var title = "MY EVENTS"
                    editable = true;
                }else{
                    var title = this.model.getTitle();
                }
            }else{
                //else all things are being viewed
                var title = "ALL EVENT";
                editable = true;
            }
            
            this.$el.append(
                temp_list_option(
                    {title:title, allow_add:editable}
                )
            );
            return this;
        },
    });

    var EventView = Backbone.View.extend({
        tagName: "div",
        className: "replace span7 overflow setheight",
        id: "event_view",
        height: 0,
        initialize: function() {
            app.user.on("change", function(model) {
                app.eventView.render()
            });
        },
        render: function() {
            Swarm.group.clearLayers();
            if (app.event.get("author") == app.user.get("username")) {
                this.edit = true;
            } else {
                this.edit = false;
            }
            this.model.set("edit", this.edit, {
                silent: true
            });
            this.$el.html(temp_event(this.model.toJSON()));
            return this;
        },
    });

    var AppView = Backbone.View.extend({
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

        initialize: function(map_setting) {
            var self = this;
            this.model.on("error", function(model, errors) {
                _.each(errors, function(error, key) {
                    $("#" + key + "_error").show().html(error);
                });
            });
            $(window).on('resize', function(){
                this.height = $(window).height();
                this.topHeight = $(window).height()- $(".top").height();
                $("#heightStyle").replaceWith(temp_app_css({height: this.height,topHeight:this.topHeight}));
               
            });
            //static render
            this.$el.append(temp_login(null));
            this.$el.append(temp_markdown(null));
            this.$el.append(temp_sign_up(null));
            this.height = $(window).height();
            //60 height of header
            this.topHeight = $(window).height()- 60;
            this.$el.append(temp_app_css({height: this.height,topHeight: this.topHeight}));
            //start the map with the div the proper size

            Swarm.int_map(self.options.map_settings.map);
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
                    self.render();
                });
            }
        },
        signUpModel: function() {
            $('#loginhtml').modal('hide');
            $('#signup_html').modal('show');
        },
        signUp: function(e) {
            self = this;
            e.preventDefault();
            $(".label").hide();
            var NewUser = new UserModel(Utils.form2object("#SignUpForm")),
                promise = NewUser.save();

            if (promise) {
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
                    $('#signup_html').modal('hide');
                    self.render()
                });
            }
        }
    });
    
    var self = {
        ListOptionView:ListOptionView,
        EventView:EventView,
        AppView:AppView
    };
    
    return self;
});


