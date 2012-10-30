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
            Handlebars.loadedTemps["list_option_template"](
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
        this.$el.html(Handlebars.loadedTemps["event_template"](this.model.toJSON()));
        return this;
    },
});

var EventAddView = Backbone.View.extend({
    tagname: "div",
    className: "span7 overflow setheight replace",
    events: {
        "click #geocode_button": "geocode",
        "click #add_event": "add_event",
        "click .cancel": "cancel",
        "click #delete_event": "delete_event"
    },

    initialize: function() {
        //validation error handling
        if(this.options.eventId){
            this.event = this.model.get(id); 
        }else{
            this.event = new Event();
            self.newEvent = true;
        }
        
        this.event.on("error", function(model, errors) {
            _.each(errors, function(error, key) {
                $("#" + key + "_error").show().html(error);
            });
        });
    },
    render: function() {
        Swarm.group.clearLayers();
        var context = _.extend({
            "settings": document.Settings
        }, this.model.toJSON());
        this.$el.append(Handlebars.loadedTemps["event_add_template"](context));
        $("#left_notifcation").text("ADD A NEW EVENT");
        $("#right_notifcation").html("DRAG TEH MARKER TO SELECT THE LOCTION <br> (or use the FIND button)&nbsp" + "<span id=\"latlng_error\" class=\"label label-important hide\"></span>");
        //place marker
        marker = Swarm.add_marker();
        marker.on('dragend', function(e) {
            $('#id_lat').val(e.target._latlng.lat);
            $('#id_lng').val(e.target._latlng.lng);
        });
        //trigger resive event            
        //set up datetime picker. destroy?
        this.$el.find("#id_start_date").datetimepicker({
            dateFormat: 'yy-mm-dd',
            onClose: function(dateText, inst) {
                var endDateTextBox = $('#id_end_date');
                if (endDateTextBox.val() != '') {
                    var testStartDate = new Date(dateText);
                    var testEndDate = new Date(endDateTextBox.val());
                    if (testStartDate > testEndDate) endDateTextBox.val(dateText);
                } else {
                    endDateTextBox.val(dateText);
                }
            },
            onSelect: function(selectedDateTime) {
                var start = $(this).datetimepicker('getDate');
                $('#id_end_date').datetimepicker('option', 'minDate', new Date(start.getTime()));
            }
        });
        this.$el.find("#id_end_date").datetimepicker({
            dateFormat: 'yy-mm-dd',
            onClose: function(dateText, inst) {
                var startDateTextBox = $('#id_start_date');
                if (startDateTextBox.val() != '') {
                    var testStartDate = new Date(startDateTextBox.val());
                    var testEndDate = new Date(dateText);
                    if (testStartDate > testEndDate) startDateTextBox.val(dateText);
                } else {
                    startDateTextBox.val(dateText);
                }
            },
            onSelect: function(selectedDateTime) {
                var end = $(this).datetimepicker('getDate');
                $('#id_start_date').datetimepicker('option', 'maxDate', new Date(end.getTime()));
            }
        });
        return this;
    },
    geocode: function() {
        Swarm.geocode($("#id_street").val() + " " + $("#id_city").val(), {
            onSuccess: function(lat, lng) {
                $('#id_lat').val(lat);
                $('#id_lng').val(lng);
            },
            onFail: function() {
                alert("Could not Find, Please drag the Marker to the location of the event");
            }
        });
    },
    add_event: function(e){
        self = this;
        //override the na
        e.preventDefault();
        //hide error messages
        $(".label").hide();
        this.event.set(Utils.form2object("#event_add_form"));
        promise = this.event.save();
        if (promise) {
            promise.error(function(response) {
                throw new Error("Server Error:" + response);
            });
            promise.success(function(response) {
                //if new event then add to event list
                if (!self.options.eventId)     
                    self.model.add(self.event);
                Swarm.remove_marker();
                app.navigate('event/' + self.event.id, {
                    trigger: true
                });
            });
        }
    },
    cancel: function(e) {
        //todo addddddd delete
        e.preventDefault();
        Swarm.remove_marker();
        app.navigate('/#', {
            trigger: true
        });
    },
    delete_event: function(e) {
        e.preventDefault();
        self = this;
        if (confirm("Do you want to Delete your event?")) {
            self.model.destroy({
                success: function() {
                    app.navigate('/#', {
                        trigger: true
                    });
                }
            });
        }
    }
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
            $("#heightStyle").replaceWith(Handlebars.loadedTemps["app_css_template"]({height: this.height,topHeight:this.topHeight}));
           
        });
        //static render
        this.$el.append(Handlebars.loadedTemps["login_template"](null));
        this.$el.append(Handlebars.loadedTemps["markdown_template"](null));
        this.$el.append(Handlebars.loadedTemps["sign_up_template"](null));
        this.height = $(window).height();
        //60 height of header
        this.topHeight = $(window).height()- 60;
        this.$el.append(Handlebars.loadedTemps["app_css_template"]({height: this.height,topHeight: this.topHeight}));
        //start the map with the div the proper size

        Swarm.int_map(self.options.map_settings);
        self.render();
    },
    render: function() {
        //add login template
        var self = this;
        $("#mainNav").html(Handlebars.loadedTemps["nav_template"](self.model.toJSON()));
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

