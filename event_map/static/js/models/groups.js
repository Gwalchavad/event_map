define([
    'underscore',
    'backbone',
],function (_,Backbone){
     
    var GroupModel = Backbone.Model.extend({
        urlRoot:"/api/group",
        defaults: {
            title:"",
            description:"",
            visibility:"",
            posting_option:""  
        },
        validate: function(attrs) {
            var errors = new Object();
            if (attrs.title == "" ) {
               errors['title']= "please enter a title";
            }
            if (attrs.description == "" ) {
               errors['description']= "please enter a Description";
            }
            //count keys
            if(Object.keys(errors).length > 0){
                return errors;
            }
        }   
    });

    
    return GroupModel;
});
