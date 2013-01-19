/*global define require init_user init_events*/
define([
  'jquery',
  'underscore',
  'backbone',
  'models/users',
  'models/events',
  'models/session',
  'views/frame',
  'views/map',
  'views/loading'
], function($, _, Backbone,UserModels,EventModel,SessionModel,FrameView,MapView,LoadingView,signupView){
    "use strict";
    var AppRouter = Backbone.Router.extend({
        routes: {
            "": "list",
            "/:date": "list",
            "event/:id": "eventDetails",
            "event/:id/edit": "eventAdd",
            "add/event": "eventAdd",
            "user/:user(/:status)": "viewUser",
            "about": "about",
            "group/:group(/:status)":"viewGroup",
            "add/group":"addGroup",
            "feed/:feed(/:status)":"viewFeed",
            "add/feed":"addFeed"
        },
        initialize: function(options) {
            //remove trailing slashes
            var re = new RegExp("(\/)+$", "g");
            /*jshint regexp: false*/
            this.route(/(.*)\/+$/, "trailFix", function (id) {
                // remove all trailing slashes if more than one
                id = id.replace(re, '');
                this.navigate(id, true);
            });

            //check session
            this.session = new SessionModel(init_user);
            //self.user.reset;
            //start app
            this.appView = new FrameView({
                model: this.session
            });
            this.appView.render();

            this.showView(new LoadingView());
            this.map = MapView;
            this.map.initialize();
            this.eventList = new EventModel.EventCollection();
            this.eventList.reset(init_events);
        },
        list: function(date){
            this.showView(new LoadingView());
            var self= this;
            require(['views/list','views/list_info'],function(list,ListInfoView){
                    //create a event list
                    var EventList = new list.EventsListView({
                        model: self.eventList
                    });
                    //self.appView.addChildren(ListOptionView(),EventList)
                    //   ->rendAll
                    //   ->
                    self.showView([new ListInfoView(),EventList]);
                }
            );
        },
        viewUser:function(user,status){
            this.showView(new LoadingView());
            var self = this,
            fuser = user,
            data = {user:fuser},
            complete;
            if(status == "uncomplete"){
                data.uncomplete = true;
                complete = false;
            }else{
                complete = true;
            }

            require(['views/list','views/list_info'],function(list,ListInfoView){
                var UserEventList = new EventModel.EventCollection(
                    self.eventList.where({author:fuser,complete:complete}),
                    {
                        data:data
                    }
                );
                var EventList = new list.EventsListView({
                    model:UserEventList, uncomplete:data.uncomplete
                });
                var user = new UserModels({username:fuser});
                var information = new ListInfoView({
                    model:user
                });
                self.showView([information,EventList]);
            });
        },
        viewGroup:function(id){
            var self = this;
            self.showView(new LoadingView());

            require(['views/list','models/groups','views/groups'],function(ListView,Group,GroupView){
                var group = new Group({id:id});
                group.fetch({
                    success:function(){
                        var groupEventList = new EventModel.EventCollection(
                        self.eventList.where({group:id}),
                            {
                                data:{group:id}
                            }
                        );
                        self.showView([new GroupView({ model:group }),groupEventList]);
                    }
                });
            });
        },
        addGroup:function(id,context){
            if(!this.session.is_authenticated()){
                this.appView.login();
                return;
            }
            var self = context ? context : this;
            self.showView(new LoadingView());
            require(['models/groups','views/group_add'],function(Group,AddGroupView){
                var group = new Group();
                var groupView = new AddGroupView({
                    model: group
                });
                self.showView(groupView);
            });
        },
        viewFeed:function(id){
            var self = this;
            self.showView(new LoadingView());

            require(['views/list','models/feed','views/groups'],function(ListView,Group,GroupView){
                var group = new Group({id:id});
                group.fetch({
                    success:function(){
                        var groupEventList = new EventModel.EventCollection(
                        self.eventList.where({group:id}),
                            {
                                data:{group:id}
                            }
                        );
                        self.showView([new GroupView({ model:group }),groupEventList]);
                    }
                });
            });
        },
        addFeed:function(id,context){
            if(!this.session.is_authenticated()){
                this.appView.login();
                return;
            }
            var self = context ? context : this;
            self.showView(new LoadingView());
            require(['models/feed','views/feed_add'],function(Feed,AddFeedView){
                var feed = new Feed();
                var feedView = new AddFeedView({
                    model: feed
                });
                self.showView(feedView);
            });
        },
        eventDetails: function(id,fevent,context){
            var self = context ? context : this;
            self.showView(new LoadingView());
            var event = fevent ? fevent : self.eventList.get(id);
            //check to see if we already have the event and if not fetch it
            if (!event) {
                //recusive
                self.fetchEvent(id,this.eventDetails);
                return;
            }
            require(['views/event'],function(EventView){
                var eventView = new EventView.EventView({
                    model: event
                });
                self.showView(eventView);
            });
        },
        eventAdd: function(id,fevent,context){
            if(!this.session.is_authenticated()){
                this.appView.login();
                return;
            }
            var self = context ? context : this,
            event;
            self.showView(new LoadingView());
            //edit an evet
            if (id) {
                //look up the event and fetch if it is not in the collection
                event = fevent ? fevent : self.eventList.get(id);
                if (!event) {
                    self.fetchEvent(id,self.addevent);
                    return;
                }
            }else{
                //creating a new event
                event = new EventModel.Event();
            }
            require(['views/event_add'],function(event_add){
                //create a new event
                var newEventView = new event_add.EventAddView({
                    model:event
                });
                self.showView(newEventView);
            });
        },
        about: function(){
            //about view goes here
        },
        //
        //Helper Functions
        //
        showView: function(views) {
            if(!(views instanceof Array)){
                views = [views];
            }
            if(this.currentView){
                this.currentView.forEach(function(view){
                    if(view){
                        view.close();
                    }
                });
            }
            //open new view
            var fragment = document.createDocumentFragment();
            views.forEach(function(view){
                fragment.appendChild(view.render().el);
            });
            $("#main").prepend(fragment);
            this.currentView = views;
            views.forEach(function(view){
                if(view.onDOMadd)
                    view.onDOMadd();
            });

        },
        fetchEvent:function(id, callback){
            var self = this;
            var event = new EventModel.Event({
                slug: id
            });
            var request = event.fetch();
            request.error(function() {
                throw ("event not found");
            });
            request.success(function(data) {
                callback(id,event,self);
            });
        }
    });
    return AppRouter;
});

