define(["underscore","backbone"],function(e,t){var i=t.Model.extend({urlRoot:function(){return"/api/group/"+this.get("type")},defaults:{id:!1,type:"user",title:"",description:"",visibility:"",posting_option:"",permissions:[]},initialize:function(){},validate:function(e){var t={};return""===e.title&&(t.title="please enter a title"),""===e.description&&(t.description="please enter a Description"),Object.keys(t).length>0?t:void 0}});return i});