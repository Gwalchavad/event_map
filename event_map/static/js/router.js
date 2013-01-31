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
], function($, _, Backbone,UserModels,EventModel,SessionModel,FrameView,MapView,LoadingView){
    "use strict";
    var AppRouter = Backbone.Router.extend({
        routes: {
            "": "list",
            "/:date": "list",
            "event/:id": "eventDetails",
            "event/:id/edit": "eventAdd",
            "add/event": "eventAdd",
            "author/:author(/:status)": "viewAuthor",
            "about": "about",
            "group/:group(/:status)":"viewGroup",
            "add/group":"addGroup",
            "feed/:feed(/:status)":"viewFeed",
            "add/feed":"addFeed",
            "upload": "upload",
            "me(/:status)":"me"
        },
        loginRequired: [
            "event/:id/edit",
            "me(/:status)",
            "add/event"
        ],
        initialize: function(options) {
            //remove trailing slashes
            var re = new RegExp("(\/)+$", "g");
            /*jshint regexp: false*/
            this.route(/(.*)\/+$/, "trailFix", function (id) {
                // remove all trailing slashes if more than one
                id = id.replace(re, '');
                this.navigate(id, true);
            });
            this.session = new SessionModel(init_user);
            this.appView = new FrameView({
                model: this.session
            });
            this.appView.render();
            this.map = MapView;
            this.map.initialize();
            this.eventList = new EventModel.EventCollection();
            this.eventList.reset(init_events);
        },
        before: function(prama,route){
            if(_.contains(this.loginRequired,route)){
                if(!this.session.is_authenticated()){
                    this.appView.login(route);
                    return false;
                }
            }
            this.showView(new LoadingView());
        },
        list: function(date){
            this.viewList();
        },
        viewAuthor:function(user,status){
            var data = {author:user};
            if(typeof(status) != 'undefined' && status == "uncomplete"){
                data.complete = false;
            }else{
                data.complete = true;
            }
            this.viewList(data,status);
        },
        me: function(status){
            var data = {me:true};
            if(typeof(status) != 'undefined' && status == "uncomplete"){
                data.complete = false;
            }else{
                data.complete = true;
            }
            this.viewList(data,status);
        },
        viewList:function(data,status){
            var self = this;
            require(['views/list','views/list_info'],function(list,ListInfoView){
                //TODO: test to see if eventlist is in a hash based on the filter, first
                var newEventList,
                options = {};
                if(typeof(data) != 'undefined'){
                    options = data;
                    newEventList = new EventModel.EventCollection(
                        self.eventList.where(data),
                        {
                            data:data
                        }
                    );
                    //if the filter produces an subset of all, current only happens when filtering by author
                    if(data.author){
                        newEventList._attributes.futureEvents.more = self.eventList._attributes.futureEvents.more;
                        newEventList._attributes.pastEvents.more = self.eventList._attributes.pastEvents.more;
                    }else{
                        newEventList._attributes.futureEvents = {
                            numOfEventsToFetch:20,
                            more:true,
                            updateOffset:0
                       };
                       newEventList._attributes.pastEvents.more = {
                            numOfEventsToFetch:20,
                            more:true,
                            updateOffset:0
                       };
                    }
                }else{
                    newEventList = self.eventList;
                }
                options.model = newEventList;
                var eventListView = new list.EventsListView(options);
                var information = new ListInfoView();
                self.showView([information,eventListView]);
            });
        },
        viewGroup:function(id){
        },
        addGroup:function(id,context){
            var self = context ? context : this;
            require(['models/groups','views/group_add'],function(Group,AddGroupView){
                var group = new Group();
                var groupView = new AddGroupView({
                    model: group
                });
                self.showView(groupView);
            });
        },
        viewFeed:function(id){
        },
        addFeed:function(id,context){
            var self = context ? context : this;
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
            var self = context ? context : this,
            event;
            if(id) {
                //look up the event and fetch if it is not in the collection
                event = fevent ? fevent : self.eventList.get(id);
                if (!event) {
                    self.fetchEvent(id,self.eventAdd);
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
        upload:function(){
            var self= this;
            require(['views/ical_upload'],function(UploadView){
                var feedView = new UploadView();
                self.showView(feedView);
            });

        },
        //
        //Helper Functions
        //
        requireLogin: function(callback){
            callback();
        },
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
