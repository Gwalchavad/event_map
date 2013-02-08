define([
    'underscore',
    'backbone'
],function (_,Backbone){
    var Notification = Backbone.Model.extend({
        url: "/api/notifications",
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
        is_authenticated: function(){
            return this.attributes.authenticated; 
        }
    });
    
    var NotificationCollection = Backbone.Collection.extend({
        url: "/api/notifications",
        model:Notification
    })
    
    return {
        Notification:Notification,
        NotificationCollection:NotificationCollection
    }
});
