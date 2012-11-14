define([
    'backbone'
  // Load our app module and pass it to our definition function
], function(Backbone){
    var UserModel = Backbone.Model.extend({
        urlRoot:"/api/user",
        defaults: {
            username: "",
            description: "",
        },
        getTitle:function(){
            return this.get("username");
        },
    });
    
    return UserModel;
});


