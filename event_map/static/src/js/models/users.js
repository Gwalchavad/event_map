define([
    'backbone'
  // Load our app module and pass it to our definition function
], function(Backbone){
    var UserModel = Backbone.Model.extend({
        urlRoot:"/api/user",
        defaults: {
            authenticated: "",
            description: "",
            email: "",
            password: "",
            password_again: "",
            username: ""
        },
        getTitle:function(){
            return this.get("username");
        },
        validate: function(attrs) {
            var errors = new Object();
        
            if (attrs.username == "" ) {
               errors[attrs.authenticated+"_"+'username']= "please enter an username";
            }
            if (attrs.password == "") {
               errors[attrs.authenticated+"_"+'password']= "please enter a password";
            }
            
            if (attrs.email == "") {
               errors[attrs.authenticated+"_"+'email']= "please enter an email";
            }
            
            if (attrs.password !=attrs.password_again) {
               errors[attrs.authenticated+"_"+'password_again']= "passwords don't match";
            }
            //count keys
            if(Object.keys(errors).length > 0){
                return errors;
            }
        }
    });
    
    return UserModel;
});


