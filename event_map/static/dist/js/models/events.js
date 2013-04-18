define(["underscore","backbone","jquery","moment"],function(e,t,i,a){var s=t.Model.extend({urlRoot:"/api/event",idAttribute:"slug",defaults:{id:!1,title:"",start_date:"",end_date:"",organization:"",author:"",user:"",address:"",venue:"",link:"",city:"",content:"",location:"",location_point:""},initialize:function(){this.on("change:start_date",this.computeStartTimes),this.on("change:end_date",this.computeEndTimes),this.on("change:title",function(){this.computeCloseValues(),this.computeOpenValues()}),this.get("start_date")&&(this.computeStartTimes(),this.computeEndTimes(),this.computeCloseValues(),this.computeOpenValues())},computeStartTimes:function(){var e=a(this.get("start_date")),t=a(this.get("start_date").substring(0,19));this.set("start_datetime",t),this.set("start_datetime_tz",e)},computeEndTimes:function(){var e=a(this.get("end_date")),t=a(this.get("end_date").substring(0,19));this.set("end_datetime",t),this.set("end_datetime_tz",e)},computeCloseValues:function(){var e=42;this.get("title").length>e?this.set("titleClose",this.get("title").slice(0,e)+"..."):this.set("titleClose",this.get("title"))},computeOpenValues:function(){var e=58;if(this.get("title").length>e)this.set("titleOpen",this.get("title").slice(0,e)+"...");else{this.set("titleOpen",this.get("title"));var t=this.get("title").length+this.get("content").length+3;if(t>e){var i=e-this.get("title").length-3;this.set("contentOpen",this.get("content").slice(0,i)+"...")}else this.set("contentOpen",this.get("content"))}},validate:function(e,t){var i={};return e.title||(i.title="please enter a title"),e.start_date||(i.start_date="please enter a start date"),t.isComplete&&(e.end_date||(i.end_date="please enter an end date"),e.content||(i.content="remind me agian, why should should I come?"),e.address||(i.address="where is this event at?"),e.lat&&e.lng||(i.latlng="drag the maker somewhere")),Object.keys(i).length>0?i:(this.set("complete",!0),void 0)}}),n=t.Collection.extend({model:s,defaults:{futureEvents:{numOfEventsToFetch:20,more:!0,updateOffset:0},pastEvents:{numOfEventsToFetch:-20,more:!0,updateOffset:-20}},url:"/api/events",initialize:function(e,t){this._attributes={},this._attributes.modified=(new Date).toISOString(),i.extend(!0,this._attributes,this.defaults),t&&i.extend(!0,this._attributes,t),this.on("reset",function(){if(this.models&&this.models.length){this.attr("data",{start:this.models[0].attributes.start_datetime.toJSON()});var e=this.attr("futureEvents");e.updateOffset=this.models.length,this.attr("futureEvents",e);var t=this.attr("pastEvents");t.updateOffset-=1,this.attr("pastEvents",t)}}),this.trigger("reset")},comparator:function(e){return[e.get("start_datetime").unix(),e.get("start_date_index")]},binarySearch:function(e,t){for(var i,a,s=this.models.length-1,n=0,r=this.models;s>=n;)if(i=parseInt((n+s)/2,10),a=r[i].get(t),a>e)s=i-1;else{if(!(e>a))return i;n=i+1}return-1===s?-2:n>this.models.length-1?-1:r[n].get(t)>r[s].get(t)?n:s},attr:function(e,t){return void 0===t?this._attributes[e]:(this._attributes[e]=t,void 0)},update_modified:function(e){var t=this;({offset:this._attributes.pastEvents.updateOffset,n:Math.abs(this._attributes.pastEvents.updateOffset)+this._attributes.futureEvents.updateOffset,modified:this._attributes.modified}),this.fetch({update:!0,remove:!1,success:function(i,a){if(e){var n=a.map(function(e){return e=new s(e)});e(n)}t._attributes.modified=(new Date).toISOString()}})},ffetch:function(e){e.forward=!0,this._fetch(e)},rfetch:function(e){e.forward=!1,this._fetch(e)},_fetch:function(t){t=t?t:{};var i,a=this;i=t.forward===void 0||t.forward?"futureEvents":"pastEvents";var n=function(e,n){var r=a.attr(i);if(n.length<Math.abs(r.numOfEventsToFetch)&&(r.more=!1),a.attr(i,r),n.length){var o=n.map(function(e){return e=new s(e)});t.successCallback&&t.successCallback(o)}};if(this.attr(i).more){var r=this.attr(i),o={n:Math.abs(r.numOfEventsToFetch),offset:r.updateOffset};r.updateOffset+=r.numOfEventsToFetch,this.attr(i,r),this.attr("data")&&e.extend(o,this.attr("data")),this.fetch({update:!0,remove:!1,data:o,add:!0,success:n,error:t.fail_callback})}}});return{Event:s,EventCollection:n}});