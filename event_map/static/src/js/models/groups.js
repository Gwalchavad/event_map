/*global define*/
define([
    'underscore',
    'backbone'
],function (_,Backbone){
    "use strict";
    var GroupModel = Backbone.Model.extend({
        type: "user",
        urlRoot: function(){ return "/api/group/" + this.type;},
        defaults: {
            title:"test",
            description:"",
            visibility:"",
            posting_option:""
        },
        initialize: function(options){

        },
        validate: function(attrs) {
            var errors = {};
            if (attrs.title === "" ) {
               errors.title= "please enter a title";
            }
            if (attrs.description === "" ) {
               errors.description= "please enter a Description";
            }
            //count keys
            if(Object.keys(errors).length > 0){
                return errors;
            }
        }
    });
    return GroupModel;
});
