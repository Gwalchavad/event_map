define(["underscore","backbone"],function(e,t){var i=t.Model.extend({type:"user",urlRoot:function(){return"/api/group/"+this.type},defaults:{title:"test",description:"",visibility:"",posting_option:""},initialize:function(){},validate:function(e){var t={};return""===e.title&&(t.title="please enter a title"),""===e.description&&(t.description="please enter a Description"),Object.keys(t).length>0?t:void 0}});return i});