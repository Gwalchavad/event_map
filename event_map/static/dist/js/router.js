define(["jquery","underscore","backbone","moment","models/users","models/events","models/session","views/frame","views/map","views/loading"],function(e,t,i,n,a,s,r,o,l,d){var u=i.Router.extend({routes:{"":"list","me(/:status)":"me","/:date":"list","event/:id":"eventDetails","event/:id/edit":"eventAdd","add/event":"eventAdd","author/:author(/:status)":"viewAuthor",about:"about","group/:group(/:status)":"viewGroup","add/group":"addGroup","feed/:feed(/:status)":"viewFeed","add/feed":"addFeed",upload:"upload",added:"addedEvents"},loginRequired:["event/:id/edit","me(/:status)","add/event","added","upload"],initialize:function(){var e=RegExp("(/)+$","g");this.route(/(.*)\/+$/,"trailFix",function(t){t=t.replace(e,""),this.navigate(t,!0)}),this.session=new r(init_user),this.appView=new o({model:this.session}),this.appView.render(),this.map=l,this.map.initialize(),this.eventList=new s.EventCollection,this.eventList.reset(init_events)},before:function(e,i){return this.map.group.clearLayers(),t.contains(this.loginRequired,i)&&!this.session.is_authenticated()?(this.appView.login(i),!1):(this.showView(new d),void 0)},list:function(e){this.viewList(e)},viewAuthor:function(e,t,i){var n={data:{author:e}};n.data.complete=t!==void 0&&"uncomplete"==t?!1:!0,i&&(n.date=i.date),this.viewList(n)},me:function(e,t){var i={data:{me:!0}};i.data.complete=e!==void 0&&"uncomplete"==e?!1:!0,t&&(i.date=t.date),this.viewList(i)},addedEvents:function(){this.viewList(void 0,!1,this.recentEvents)},viewList:function(e,i,a){var r=this;e===void 0&&(e={}),require(["views/list","views/list_info"],function(o,l){var d,u=!1;if(e.date&&(u=n(e.date)),a!==void 0)d=new s.EventCollection(a),d._attributes.futureEvents.more=!1,d._attributes.pastEvents.more=!1;else if(e.data!==void 0){var h=r.eventList.where(e.data);u&&(e.data.start=e.date,0!==h.length&&h[0].get("start_datetime")>u&&u>t.last(h).get("start_datetime")&&(h=null)),d=new s.EventCollection(h,{data:e.data}),i&&(d._attributes.futureEvents.more=r.eventList._attributes.futureEvents.more,d._attributes.pastEvents.more=r.eventList._attributes.pastEvents.more)}else d=!u||u>r.eventList.models[0].get("start_datetime")&&t.last(r.eventList.models).get("start_datetime")>u?r.eventList:r.eventList=new s.EventCollection(null,{data:{start:e.date}});e.model=d;var c=new o.EventsListView(e),p=new l;r.showView([p,c])})},viewGroup:function(){},addGroup:function(e,t){var i=t?t:this;require(["models/groups","views/group_add"],function(e,t){var n=new e,a=new t({model:n});i.showView(a)})},viewFeed:function(){},addFeed:function(e,t){var i=t?t:this;require(["models/feed","views/feed_add"],function(e,t){var n=new e,a=new t({model:n});i.showView(a)})},eventDetails:function(e,t,i){var n=i?i:this,a=t?t:n.eventList.get(e);return a?(require(["views/event"],function(e){var t=new e.EventView({model:a});n.showView(t)}),void 0):(n.fetchEvent(e,this.eventDetails),void 0)},eventAdd:function(e,t,i){var n,a=i?i:this;if(e){if(n=t?t:a.eventList.get(e),!n)return a.fetchEvent(e,a.eventAdd),void 0}else n=new s.Event;require(["views/event_add"],function(e){var t=new e.EventAddView({model:n});a.showView(t)})},about:function(){},upload:function(){var e=this;require(["views/ical_upload"],function(t){var i=new t;e.showView(i)})},showView:function(t){t instanceof Array||(t=[t]),this.currentView&&this.currentView.forEach(function(e){e.close&&e.close()});var i=document.createDocumentFragment();t.forEach(function(e){i.appendChild(e.render().el)}),e("#main").prepend(i),this.currentView=t,t.forEach(function(e){e.onDOMadd&&e.onDOMadd()})},fetchEvent:function(e,t){var i=this,n=new s.Event({slug:e}),a=n.fetch();a.error(function(){throw"event not found"}),a.success(function(){t(e,n,i)})}});return u});