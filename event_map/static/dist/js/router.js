define(["jquery","underscore","backbone","moment","models/users","models/events","models/session","views/frame","views/map","views/loading"],function(e,t,i,a,s,n,r,o,l,d){var u=i.Router.extend({routes:{"":"list","me(/:status)":"me","/:date":"list","event/:id":"eventDetails","event/:id/edit":"eventAdd","add/event":"eventAdd","author/:author(/:status)":"viewAuthor",about:"about","group/:group(/:status)":"viewGroup","add/group":"addGroup","feed/:feed(/:status)":"viewFeed","add/feed":"addFeed",upload:"upload",added:"addedEvents"},loginRequired:["event/:id/edit","me(/:status)","add/event","added","upload"],initialize:function(){var e=RegExp("(/)+$","g");this.route(/(.*)\/+$/,"trailFix",function(t){t=t.replace(e,""),this.navigate(t,!0)}),this.session=new r(init_user),this.appView=new o({model:this.session}),this.appView.render(),this.map=l,this.map.initialize(),this.eventList=new n.EventCollection,this.eventList.reset(init_events)},before:function(e,i){return this.map.group.clearLayers(),t.contains(this.loginRequired,i)&&!this.session.is_authenticated()?(this.appView.login(i),!1):(this.showView(new d),void 0)},list:function(e){var i={group:{title:"ALL EVENTS",description:intro_text,permissions:{allow_add:!0}}};this.viewList(t.extend(i,e))},viewAuthor:function(e,t,i){var a={data:{author:e},group:{type:"user",icalURL:"ical/user/"+e+".ical",id:e}};a.data.complete=t!==void 0&&"uncomplete"==t?!1:!0,i&&(a.date=i.date),this.viewList(a)},me:function(e,t){var i={data:{me:!0}};i.data.complete=e!==void 0&&"uncomplete"==e?!1:!0,t&&(i.date=t.date),this.viewList(i)},addedEvents:function(){this.viewList(void 0,!1,this.recentEvents)},viewList:function(e,i,s){var r=this;e===void 0&&(e={}),require(["views/list","views/list_info","models/groups"],function(o,l,d){var u,c=!1;if(e.date&&(c=a(e.date)),s!==void 0)u=new n.EventCollection(s),u._attributes.futureEvents.more=!1,u._attributes.pastEvents.more=!1;else if(e.data!==void 0){var h=r.eventList.where(e.data);c&&(e.data.start=e.date,0!==h.length&&h[0].get("start_datetime")>c&&c>t.last(h).get("start_datetime")&&(h=null)),u=new n.EventCollection(h,{data:e.data}),i&&(u._attributes.futureEvents.more=r.eventList._attributes.futureEvents.more,u._attributes.pastEvents.more=r.eventList._attributes.pastEvents.more)}else u=!c||c>r.eventList.models[0].get("start_datetime")&&t.last(r.eventList.models).get("start_datetime")>c?r.eventList:r.eventList=new n.EventCollection(null,{data:{start:e.date}});e.model=u;var p=new o.EventsListView(e),m=new d(e.group),f=new l({model:m});r.showView([f,p])})},viewGroup:function(e,t,i){var a={data:{},group:{type:"group",icalURL:"ical/group/"+e+".ical",id:e}};a.data.complete=t!==void 0&&"uncomplete"==t?!1:!0,i&&(a.date=i.date),this.viewList(a)},addGroup:function(e,t){var i=t?t:this;require(["models/groups","views/group_add"],function(e,t){var a=new e({type:"group"}),s=new t({model:a});i.showView(s)})},viewFeed:function(){},addFeed:function(e,t){var i=t?t:this;require(["models/feed","views/feed_add"],function(e,t){var a=new e,s=new t({model:a});i.showView(s)})},eventDetails:function(e,t,i){var a=i?i:this,s=t?t:a.eventList.get(e);return s?(require(["views/event"],function(e){var t=new e.EventView({model:s});a.showView(t)}),void 0):(a.fetchEvent(e,this.eventDetails),void 0)},eventAdd:function(e,t,i){var a,s=i?i:this;if(e){if(a=t?t:s.eventList.get(e),!a)return s.fetchEvent(e,s.eventAdd),void 0}else a=new n.Event;require(["views/event_add"],function(e){var t=new e.EventAddView({model:a});s.showView(t)})},about:function(){},upload:function(){var e=this;require(["views/ical_upload"],function(t){var i=new t;e.showView(i)})},showView:function(t){t instanceof Array||(t=[t]),this.currentView&&this.currentView.forEach(function(e){e.close&&e.close()});var i=document.createDocumentFragment();t.forEach(function(e){i.appendChild(e.render().el)}),e("#main").prepend(i),this.currentView=t,t.forEach(function(e){e.onDOMadd&&e.onDOMadd()})},fetchEvent:function(e,t){var i=this,a=new n.Event({slug:e}),s=a.fetch();s.error(function(){throw"event not found"}),s.success(function(){t(e,a,i)})}});return u});