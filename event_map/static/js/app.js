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
        "user/:user": "viewUser",
        "group/:group":"viewGroup",
        "addevent": "addevent",
        "about": "about"
    },
    initialize: function(options) {
        var self = this;
        //check session
        self.user = new SessionModel(init_user);
        //self.user.reset;
        //start app
        self.appView = new AppView({
            model: self.user,
            map_settings: options.map
        });
        this.eventList = new EventCollection();
        this.eventList.reset(init_events);
    },
    list: function(date){
        //create a event list
        EventList = new EventsListView({
            model: this.eventList
        });
        
        this.showView([new ListOptionView(),EventList]);
    },
    eventDetails: function(id){
        var self = this;
        self.event = self.eventList.get(id);
        if (self.event) {
            var eventView = new EventView({
                model: self.event
            });
            this.showView(eventView);

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
                self.showView(eventView);
            });
        }
    },
    addevent: function(id){
        //edit an evet
        var self = this;
        if (id) {
            self.event = this.eventList.get(id);
            if (self.event) {
                self.showView(new EventAddView({
                    model: self.event,
                    eventId:id
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
                        model: self.event,
                        eventId:id
                    }));
                });
            }
        }else{
            //create a new event
            newEventView = new EventAddView({
                model:this.eventList,
                eventId:id
            });
            self.showView(newEventView);
        }
    },
    viewUser:function(user){
        var self = this;
        var UserEventList = new EventCollection(
            this.eventList.where({author:user}),
            {
                data:{user:user}
            }
        );
        var EventList = new EventsListView({
            model:UserEventList
        });
        var user = new UserModel({username:user});
        //user.fetch();
        var information = new ListOptionView({
            model:user
        });
        
        this.showView([information,EventList]);                     
    },
    viewGroup:function(group){
        this.eventList.reset();
        this.eventList.fetch({
            data: {
                group:group
            }
        });
        EventList = new EventsListView({
            model: this.eventList,
            group:group
        });
        
        this.showView([new ListOptionView(),EventList]);          
    },
    about: function() {
        if (!this.aboutView) {
            // this.aboutView = new AboutView();
        }
    },
    showView: function(views) {
        //close last view
        //$('.replace').remove();
        if(this.currentView instanceof Array){
            this.currentView.forEach(function(view){
                if(view){
                    view.close();  
                }
            });
        }else{
            if (this.currentView){
                this.currentView.close();
            }
        }
        //open new view
        if(views instanceof Array){
            var fragment = document.createDocumentFragment();
            views.forEach(function(view){
                fragment.appendChild(view.render().el);
            });
            $("#main").prepend(fragment);
            views.forEach(function(view){
                if(view.onDOMadd)
                    view.onDOMadd();   
            });
        }else{
            $("#main").prepend(views.render().el);
            if(views.onDOMadd)
                    views.onDOMadd();
        }
        this.currentView = views;
        return views;
    }

});

$(function() {
    Utils.loadtemps(
    ['login', 
    'nav', 'event', 
    "event_item",
    'event_add', 
    'left_side', 
    'markdown', 
    'list_option', 
    'sign_up', 
    'event_list',
    'item_open',
    'item_closed',
    'app_css',
    'li_days',
    'li_months',
    'event_list_empty'
    ], function() {
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
