define([
    'underscore',
    'backbone',
],function (_,Backbone,Models){
     
    var GroupModel = Backbone.Model.extend({
        urlRoot:"/api/group",
        defaults: {
            username: "",
            description: "",
        },
    });
    
    return GroupModel
});
