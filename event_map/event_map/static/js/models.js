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
    numOfEventsToFetch: 10,
    updateOffset: 10,
    updateOffsetPastEvents: -10,
    moreEvents: true,
    morePastEvents: true,
    url: "/api/events",
    comparator: function(event) {
      return event.get("start_date").getTime() + 1/event.get("id");
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
    }
});   
