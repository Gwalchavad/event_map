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
    url: "/api/events",
    comparator: function(event) {
      return event.get("start_date");
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
