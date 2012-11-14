define([
    'underscore',
    'backbone'
],function (_,Backbone){
    var SessionModel = Backbone.Model.extend({
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
    
    return SessionModel
});
