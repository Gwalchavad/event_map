//get site settings
$.ajax({
    url: "/static/site_settings.json",
    dataType: 'json',
    error: function(jqXHR, textStatus) {
        throw new Error("Invalid Settings Syntax! Check " + this.url);
    }
}).done(function(settings) {
    document.Settings = settings;
});

var AppRouter = Backbone.Router.extend({
    routes: {
        "": "list",
        "/:date": "list",
        "event/add": "addEvent",
        "event/:id": "eventDetails",
        "editevent/:id": "addevent",
        "addevent": "addevent",
        "about": "about"
    },

    initialize: function(options) {
        var self = this;
        //check session
        self.user = new UserModel(init_user);
        //self.user.reset;
        //start app
        self.appView = new AppView({
            model: self.user,
            map_settings: options.map
        });
        this.eventList = new EventCollection();
        this.eventList.reset(init_events);

    },
    list: function(date) {
        //create a event list
        EventList = new EventsListView({
            model: this.eventList
        });
        
        this.showView([EventList,new Cal_BarView()]);
        $(window).resize();
    },
    eventDetails: function(id) {
        var self = this;
        self.event = self.eventList.get(id);
        if (self.event) {
            var eventView = new EventView({
                model: self.event
            });

            this.showView(eventView);
            //$('.replace').replaceWith();
            $(window).resize();
        } else {
            self.event = new Event({
                id: id
            });
            request = self.event.fetch();
            request.error(function() {
                throw ("event not found");
            });
            request.success(function(data) {
                var eventView = new EventView({
                    model: self.event
                });
                this.showView(eventView);
            });
        }
    },
    addevent: function(id) {
        //edit an evet
        var self = this;
        if (id) {
            self.event = this.eventList.get(id);
            if (self.event) {
                self.showView(new EventAddView({
                    model: self.event
                }));
            } else {
                self.event = new Event({
                    id: id
                });
                request = self.event.fetch();
                request.error(function() {
                    throw ("event not found");
                });
                request.success(function(data) {
                    self.showView(new EventAddView({
                        model: self.event
                    }));
                });
            }
        } else {
            //create a new event
            newEventView = new EventAddView({
                model: new Event()
            });
            self.showView(newEventView);
        }
    },
    about: function() {
        if (!this.aboutView) {
            // this.aboutView = new AboutView();
        }
    },
    showView: function(views) {
        $('.replace').remove();
        if(views instanceof Array){
            views.forEach(function(view){
                $("#main").prepend(view.render().el);
            });
        }else{
            $("#main").prepend(views.render().el);
        }
        $(window).resize();
    }

});

$(function() {
    Utils.loadtemps(['login', 'nav', 'event', "event_item", 'event_add', 'left_side', 'markdown', 'cal_bar', 'sign_up', 'event_list'], function() {
        //load map
        $.ajax({
            url: "/static/map_settings.json",
            dataType: 'json',
            error: function(jqXHR, textStatus) {
                throw new Error("Invalid Maps Settings Syntax! Check " + this.url);
            }
        }).done(function(settings) {
            app = new AppRouter({
                map: settings
            });
            Backbone.history.start();
        });
    });
});
