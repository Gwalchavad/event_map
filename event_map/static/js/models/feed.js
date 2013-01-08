define([
    'underscore',
    'backbone',
],function (_,Backbone){
    var FeedModel = Backbone.Model.extend({
        urlRoot:"/api/feed",
        defaults: {
            url:"",
        },
    });
    return FeedModel;
});
