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
        }
    });
    
    return SessionModel
});
