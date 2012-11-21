define([
  'jquery',
  'underscore',
  'backbone',
  'models/users',
  'models/events',
  'models/session',
  'views/frame',
  'views/map',
  'views/loading',
 
], function($, _, Backbone,UserModels,EventModel,SessionModel,FrameView,MapView,LoadingView,signupView){
    var AppRouter = Backbone.Router.extend({
        routes: {
            "": "list",
            "/:date": "list",
            "event/:id": "eventDetails",
            "editevent/:id": "eventAdd",
            "user/:user": "viewUser",
            "addevent": "eventAdd",
            "about": "about",
            "group/:group":"viewGroup",
            "addGroup":"addGroup"
        },
        initialize: function(options) {
            var self = this;
            //check session
            self.session = new SessionModel(init_user);
            //self.user.reset;
            //start app
            self.appView = new FrameView({
                model: self.session
            });
            self.appView.render()
            
    
            self.showView(new LoadingView());
            self.map = new MapView();

            this.eventList = new EventModel.EventCollection();
            this.eventList.reset(init_events);
        },
        list: function(date){
            var self= this;
            require(['views/list','views/list_info'],function(list,ListInfoView){
                    //create a event list
                    EventList = new list.EventsListView({
                        model: self.eventList
                    });
                    //self.appView.addChildren(ListOptionView(),EventList)
                    //   ->rendAll
                    //   ->
                    self.showView([new ListInfoView(),EventList]);
                }
            );
        },
        viewUser:function(user){
            var self = this;
            var fuser = user;
            require(['views/list','views/list_info'],function(list,ListInfoView){
                var UserEventList = new EventModel.EventCollection(
                    self.eventList.where({author:fuser}),
                    {
                        data:{user:fuser}
                    }
                );
                var EventList = new list.EventsListView({
                    model:UserEventList
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
                        var groupEventList = new ListView.EventsListView({
                            model:groupEventList
                        });         
                               
                        self.showView([new GroupView({ model:group }),groupEventList]);    
                    }
                });
                   
            });  
        },
        addGroup:function(){
            var self = this;
            require(['models/groups','views/group_add'],function(Group,AddGroupView){
                var group = new Group();
                var groupView = new AddGroupView({
                    model: group
                });
                self.showView(groupView);
            });
        },
        eventDetails: function(id,fevent,context){
            var self = context ? context : this; 
            var event = fevent ? fevent : self.eventList.get(id);
            //check to see if we already have the event and if not fetch it
            if (!event) {
                //recusive 
                self.fetchEvent(id);
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
            var self = context ? context : this; 
            //edit an evet
            if (id) {
                //look up the event and fetch if it is not in the collection
                var event = fevent ? fevent : self.eventList.get(id);
                if (!event) {
                    self.fetchEvent(id,self.addevent);
                    return;
                } 
            }else{
                //creating a new event
                var event = new EventModel.Event();
            }
            require(['views/event_add'],function(event_add){
                //create a new event
                newEventView = new event_add.EventAddView({
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
            views.forEach(function(view){
                if(view.onDOMadd)
                    view.onDOMadd();   
            });
            this.currentView = views;
        },
        fetchEvent:function(id, context){
            var self = this;
            var callback = arguments.callee.caller;
            var event = new EventModel.Event({
                id: id
            });
            request = event.fetch();
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
