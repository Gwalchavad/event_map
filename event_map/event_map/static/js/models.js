window.Event = Backbone.Model.extend({
    urlRoot: "/api/event",
    defaults: {
		title:"",
		start_date:"",
		end_date:"",
		organization:"",
		user:"",
		city:"",
        location:"",
        location_point:""
    },
    initialize: function () {
        this.computeTimes();
        this.on("change",this.computeTimes);
    },    
    computeTimes:function(){
        var _start_date = new Date(this.get("start_date"));
        this.set("start_date", _start_date);
        var _end_date = new Date(this.get("end_date"));
        this.set("end_date", _end_date);
        //remove the spaces in time
        this.set("start_time", _start_date.getTimeCom().replace(/\s+/g, ""));
        this.set("end_time", _end_date.getTimeCom().replace(/\s+/g, ""));       
    },
    
    computeCloseValues:function(){
        //the lenght the title is on the list when the event is closed
        var trimmedTitleLength = 42;
        if(this.get("title").length > trimmedTitleLength){
            this.set("titleClose",this.get("title").slice(0,trimmedTitleLength)+"...");
        }else{
            this.set("titleClose",this.get("title"));
        }       
    },
    computeOpenValues:function(){
        //the length of the content and the title when a event on the list is open
        var trimmedTitleContentLength = 58;
        //for item open,
        if(this.get("title").length > trimmedTitleContentLength){
            this.set("titleOpen",this.get("title").slice(0,trimmedTitleContentLength)+"...");
        }else{
            this.set("titleOpen",this.get("title"));
            var contentLength = this.get("title").length + this.get("content").length + 3;
            if(contentLength > trimmedTitleContentLength){
                var newLength =  trimmedTitleContentLength - this.get("title").length - 3;
                this.set("contentOpen",this.get("content").slice(0,newLength)+"...");
            }else{
                this.set("contentOpen",this.get("content"));
            }
        }        
    },
    validate: function(attrs) {
		var errors = new Object();
		if (attrs.title == "" ) {
		   errors['title']= "please enter a title";
		}
		if (attrs.start_date == "" ) {
		   errors['start_date']= "please enter a start date";
		}
		if (attrs.end_date == "" ) {
		   errors['end_date']= "please enter an end date";
		}
		if(attrs.content == ""){
			errors['content'] = "remind me agian, why should should I come?";
		}		
		if(attrs.street == ""){
			errors['location'] =  "where's the party at bro?";
		}
		if(attrs.lat == "" || attrs.lng == ""  ){
			errors['latlng'] = "drag the maker somewhere";
		}	
		//count keys
		if(Object.keys(errors).length > 0){
			return errors;
		}
		
	}
	    
});

window.EventCollection = Backbone.Collection.extend({
    model: Event,
    defaults:{
        futureEvents:{
            numOfEventsToFetch:10,
            more:true,
            updateOffset:10
        },
        pastEvents:{
            numOfEventsToFetch:-10,
            more:true,
            updateOffset:-10
        },
    },
    url: "/api/events",
    initialize: function (models,options) {
        this._attributes = {};
        $.extend(true,this._attributes,this.defaults);
        if(models){
            //this assumes that incoming initail models are in order
            this._attributes.data = {start:models[0].attributes.start_date.toJSON()};
            this._attributes.futureEvents.updateOffset = models.length;
        }
        if(options)
            $.extend(true,this._attributes,options);
        this.on("reset",function(models){
            $.extend(true,this._attributes,this.defaults);
            this._attributes.futureEvents.updateOffset = models.length;
        });
    },
    comparator: function(event) {
      return event.get("start_date").getTime() + 1/event.get("id");
    },
    //Setting attributes on a collection
    //http://stackoverflow.com/questions/5930656/setting-attributes-on-a-collection-backbone-js  
    attr: function(prop, value) {
        if (value === undefined) {
            return this._attributes[prop]
        } else {
            this._attributes[prop] = value;
        }
    },

    //forward fetch
    ffetch:function(options){
        options.forward = true;
        this._fetch(options);
    },
    //reverse fetch
    rfetch: function(options){
        options.forward = false;
        this._fetch(options);
    },
    _fetch:function(options){
        var options = options ? _.clone(options) : {};
        var self = this;
        if(typeof options.forward === "undefined" || options.forward){
            var eventSettings = this._attributes.futureEvents;
        }else{
            var eventSettings = this._attributes.pastEvents;
        }
        var successCallback = function(evt, request) {
            if(request.length != 0){
                events=request.map(function(event){
                    event = new Event(event);
                    return event;
                });      
                eventSettings.updateOffset += eventSettings.numOfEventsToFetch;  
                if(options.successCallback)
                    options.successCallback(events);
            }
            if (request.length < Math.abs(eventSettings.numOfEventsToFetch)){
                eventSettings.more = false;
            }
        };
        if(eventSettings.more){
            data = {
                n: Math.abs(eventSettings.numOfEventsToFetch),
                offset: eventSettings.updateOffset,
            };
            if(this._attributes.data)
                _.extend(data, this._attributes.data);              
            
            if(options.data)
                _.extend(data, options.data);
                
            this.fetch({
                data:data,
                add: true,
                success: successCallback
            });
        }        
    }
});

window.UserModel = Backbone.Model.extend({
    url: "/api/session",
    defaults: {
        authenticated: false,
        username: "",
        password: "",
        email: ""
    },
    logout: function(){
        loggedin = false;
        username = "";
        this.save({silent: true});
    },
    validate: function(attrs) {
		var errors = new Object();
    
        if (attrs.username == "" && (attrs.authenticated == "login" ||  attrs.authenticated == "signup")) {
		   errors[attrs.authenticated+"_"+'username']= "please enter an username";
		}
        if (attrs.password == "" && (attrs.authenticated == "login" ||  attrs.authenticated == "signup")) {
		   errors[attrs.authenticated+"_"+'password']= "please enter a password";
		}
        
        if( attrs.authenticated == "signup"){
            if (attrs.email == "") {
               errors[attrs.authenticated+"_"+'email']= "please enter an email";
            }
            
            if (attrs.password !=attrs.password_again) {
               errors[attrs.authenticated+"_"+'password_again']= "passwords don't match";
            }
        }
		//count keys
		if(Object.keys(errors).length > 0){
			return errors;
		}
    },

});  


