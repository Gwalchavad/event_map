define(["backbone","underscore","jquery","jade!../../templates/list_info","jade!../../templates/edit_profile"],function(e,t,i,s,n){var r=e.View.extend({tagName:"div",className:"replace span3",id:"calender",events:{"click #editProfile":"editProfile"},childrenEL:"#listOptionPanels",initialize:function(e){this.constructor.__super__.initialize.apply(this,[e])},render:function(){function e(){for(var e=i.model.get("permissions"),n=[],r=0;e.length>r;r++)n[r]=!0;i.model.set("permissions",t.object(e,n)),i.model&&i.model.get("title")==app.session.get("username")&&(i.model.set("title","MY EVENTS"),i.model.set("permissions",{group_admin:!0,add_event:!0})),i.$el.append(s(i.model.toJSON()))}var i=this;if(this.model.id){var n=this.model.fetch();n.error(function(){throw"event not found"}),n.success(function(){e()})}else e();return this},editProfile:function(){this.oldText=i("#description").text(),i("#ListOptionView").html(n({description:this.oldText})),i("#Cancel").one("click",this,this.closeEditor),i("#Save").one("click",this,this.saveProfile)},closeEditor:function(e){var t=e.data;t.$el.html(s(t.model.toJSON()))},saveProfile:function(e){var t=e.data;t.model.set("description",i("#description").val()),t.model.save(),t.closeEditor(e)}});return r});