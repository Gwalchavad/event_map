define(["backbone","hbs!../../templates/list_info"],function(t,e){var n=t.View.extend({tagName:"div",className:"replace span3",id:"calender",childrenEL:"#listOptionPanels",render:function(){var t,n=null;return this.model?this.model.getTitle()==app.session.get("username")?(t="MY EVENTS",n=!0):t=this.model.getTitle():(t="ALL EVENTS",n=!0),this.$el.append(e({title:t,allow_add:n,description:intro_text})),this}});return n});