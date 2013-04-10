define("hbs!views/../../templates/event_list",["hbs","handlebars"],function(t,e){var n=e.template(function(t,e,n){n=n||t.helpers;var i,s,o="",r="function",a=this.escapeExpression;return o+="<style>\n    #event_list li{\n        height:",s=n.height,s?i=s.call(e,{hash:{}}):(i=e.height,i=typeof i===r?i():i),o+=a(i)+'px\n    }    \n</style>\n\n<div class="row-fluid top" id="event_list_top_date">\n    <div class="span2 top_text" id="topMonthLetter"></div>\n    <div class="span8">\n        <div class="row-fluid" style="height:60px">\n            <div class="span6" id="topWeekLetter" style="text-align: center">\n                <div style="display: inline-block">\n                    <span id="day_0">S</span>\n                    <span id="day_1">M</span>\n                    <span id="day_2">T</span>\n                    <span id="day_3">W</span>\n                    <span id="day_4">T</span>\n                    <span id="day_5">F</span>\n                    <span id="day_6">S</span>\n                </div>\n            </div>\n            <div style="text-align: center;" class="span4 top_text" id="topYear"></div>\n        </div>\n    </div>\n</div>\n<div id="EventsListView" class="replace overflow setheightWithTop">\n    <div class="row-fluid">\n        <div class="span1">\n            <div class="row-fluid">\n                <div class="span5">\n                    <ul  id="event_list_month">\n                    </ul>\n                </div>\n                <div class="span5">\n                    <ul  id="event_list_day">\n                    </ul>\n                </div>\n            </div>\n        </div>\n        <div class="span9">\n            <ul id="event_list">\n            </ul>\n        </div>\n    </div>\n</div>\n'});return e.registerPartial("views_.._.._templates_event_list",n),n}),define("hbs!views/../../templates/event_list_empty",["hbs","handlebars"],function(t,e){var n=e.template(function(t,e,n){return n=n||t.helpers,'<div id="NoEvent" class="row-fluid top">\n    <div class="span10 top_text" style="text-align: center;">NO EVENTS</div>\n</div>\n<div>\n    <div id="EventsListView" class="replace overflow setheightWithTop">\n        <ul id="event_list">\n        </ul>\n    </div>\n</div>\n\n'});return e.registerPartial("views_.._.._templates_event_list_empty",n),n}),define("hbs!views/../../templates/item_open",["hbs","handlebars"],function(t,e){var n=e.template(function(t,e,n){n=n||t.helpers;var i,s,o="",r="function",a=this.escapeExpression;return o+='<div class="openIndt">[-]</div>\n<div class="list_item_width">\n    <div class="list_item_content">\n        ',s=n.start_time,s?i=s.call(e,{hash:{}}):(i=e.start_time,i=typeof i===r?i():i),o+=a(i)+" - ",s=n.end_time,s?i=s.call(e,{hash:{}}):(i=e.end_time,i=typeof i===r?i():i),o+=a(i)+' <a href="#/event/',s=n.slug,s?i=s.call(e,{hash:{}}):(i=e.slug,i=typeof i===r?i():i),o+=a(i)+'">',s=n.title,s?i=s.call(e,{hash:{}}):(i=e.title,i=typeof i===r?i():i),o+=a(i)+"</a> | ",s=n.content,s?i=s.call(e,{hash:{}}):(i=e.content,i=typeof i===r?i():i),o+=a(i)+"\n    </div>\n</div>\n"});return e.registerPartial("views_.._.._templates_item_open",n),n}),define("hbs!views/../../templates/EventClosedPartial",["hbs","handlebars"],function(t,e){var n=e.template(function(t,e,n,i,s){function o(t,e){var i,s,o="";return o+='<li id="event_',s=n.slug,s?i=s.call(t,{hash:{}}):(i=t.slug,i=typeof i===d?i():i),o+=c(i)+'" data-id="',s=n.slug,s?i=s.call(t,{hash:{}}):(i=t.slug,i=typeof i===d?i():i),o+=c(i)+'" data-date="',i=t.start_datetime,i=null==i||i===!1?i:i._i,i=typeof i===d?i():i,o+=c(i)+'" class="event_item">\n    <div class="list_item_container">\n        <div class="openIndt" style="">[+]</div>\n        <div class="list_item_width">\n            <div class="list_item_content" >\n                ',i=t.complete,i=n["if"].call(t,i,{hash:{},inverse:p.program(4,a,e),fn:p.program(2,r,e)}),(i||0===i)&&(o+=i),o+="\n            </div>\n        </div>\n    </div>\n</li>"}function r(t){var e,i,s="";return s+="\n                    ",i=n.start_time,i?e=i.call(t,{hash:{}}):(e=t.start_time,e=typeof e===d?e():e),s+=c(e)+" - ",i=n.end_time,i?e=i.call(t,{hash:{}}):(e=t.end_time,e=typeof e===d?e():e),s+=c(e)+' <a href="#/event/',i=n.slug,i?e=i.call(t,{hash:{}}):(e=t.slug,e=typeof e===d?e():e),s+=c(e)+'">',e=t.titleClose,e=typeof e===d?e():e,s+=c(e)+"</a>\n                "}function a(t){var e,i,s="";return s+="\n                    ",i=n.start_time,i?e=i.call(t,{hash:{}}):(e=t.start_time,e=typeof e===d?e():e),s+=c(e)+" - ",i=n.end_time,i?e=i.call(t,{hash:{}}):(e=t.end_time,e=typeof e===d?e():e),s+=c(e)+' <a href="#/event/',i=n.slug,i?e=i.call(t,{hash:{}}):(e=t.slug,e=typeof e===d?e():e),s+=c(e)+'">',e=t.titleClose,e=typeof e===d?e():e,s+=c(e)+"</a>\n                "}n=n||t.helpers;var l,h="",d="function",c=this.escapeExpression,p=this;return l=e.events,l=n.each.call(e,l,{hash:{},inverse:p.noop,fn:p.program(1,o,s)}),(l||0===l)&&(h+=l),h+="\n"});return e.registerPartial("views_.._.._templates_EventClosedPartial",n),n}),define("hbs!views/../../templates/liMonths",["hbs","handlebars"],function(t,e){var n=e.template(function(t,e,n,i,s){function o(t){var e,i,s="";return s+='\n    <li id="month_',i=n.month,i?e=i.call(t,{hash:{}}):(e=t.month,e=typeof e===l?e():e),s+=h(e)+"_",i=n.year,i?e=i.call(t,{hash:{}}):(e=t.year,e=typeof e===l?e():e),s+=h(e)+'" style="height:',i=n.height,i?e=i.call(t,{hash:{}}):(e=t.height,e=typeof e===l?e():e),s+=h(e)+'px">\n        <div class="rot-90 verticalMonth">',i=n.letter,i?e=i.call(t,{hash:{}}):(e=t.letter,e=typeof e===l?e():e),s+=h(e)+"</div>\n    </li>\n"}n=n||t.helpers;var r,a="",l="function",h=this.escapeExpression,d=this;return r=e.months,r=n.each.call(e,r,{hash:{},inverse:d.noop,fn:d.program(1,o,s)}),(r||0===r)&&(a+=r),a+="\n"});return e.registerPartial("views_.._.._templates_liMonths",n),n}),define("hbs!views/../../templates/liDays",["hbs","handlebars"],function(t,e){var n=e.template(function(t,e,n,i,s){function o(t){var e,i,s="";return s+='\n    <li id="day_',i=n.day,i?e=i.call(t,{hash:{}}):(e=t.day,e=typeof e===l?e():e),s+=h(e)+"_",i=n.month,i?e=i.call(t,{hash:{}}):(e=t.month,e=typeof e===l?e():e),s+=h(e)+"_",i=n.year,i?e=i.call(t,{hash:{}}):(e=t.year,e=typeof e===l?e():e),s+=h(e)+'" style="height:',i=n.height,i?e=i.call(t,{hash:{}}):(e=t.height,e=typeof e===l?e():e),s+=h(e)+'px">',i=n.day,i?e=i.call(t,{hash:{}}):(e=t.day,e=typeof e===l?e():e),s+=h(e)+"</li>\n"}n=n||t.helpers;var r,a="",l="function",h=this.escapeExpression,d=this;return r=e.days,r=n.each.call(e,r,{hash:{},inverse:d.noop,fn:d.program(1,o,s)}),(r||0===r)&&(a+=r),a+="\n"});return e.registerPartial("views_.._.._templates_liDays",n),n}),define("hbs!views/../../templates/popup",["hbs","handlebars"],function(t,e){var n=e.template(function(t,e,n,i,s){function o(t){var e,i,s="";return i=n.scoordy,i?e=i.call(t,{hash:{}}):(e=t.scoordy,e=typeof e===h?e():e),s+=d(e)+",",i=n.scoordx,i?e=i.call(t,{hash:{}}):(e=t.scoordx,e=typeof e===h?e():e),s+=d(e)}n=n||t.helpers;var r,a,l="",h="function",d=this.escapeExpression,c=this;return l+='<span id="popup_',a=n.id,a?r=a.call(e,{hash:{}}):(r=e.id,r=typeof r===h?r():r),l+=d(r)+'"><h3><a href="/#event/',a=n.slug,a?r=a.call(e,{hash:{}}):(r=e.slug,r=typeof r===h?r():r),l+=d(r)+'">',a=n.title,a?r=a.call(e,{hash:{}}):(r=e.title,r=typeof r===h?r():r),l+=d(r)+"</a></h3>",a=n.start_time,a?r=a.call(e,{hash:{}}):(r=e.start_time,r=typeof r===h?r():r),l+=d(r)+"-",a=n.end_time,a?r=a.call(e,{hash:{}}):(r=e.end_time,r=typeof r===h?r():r),l+=d(r)+' <a class="popupAddress btn btn-info btn-small" href="https://www.google.com/maps?daddr=',a=n.coordy,a?r=a.call(e,{hash:{}}):(r=e.coordy,r=typeof r===h?r():r),l+=d(r)+",",a=n.coordx,a?r=a.call(e,{hash:{}}):(r=e.coordx,r=typeof r===h?r():r),l+=d(r)+"&saddr=",r=e.scoordy,r=n["if"].call(e,r,{hash:{},inverse:c.noop,fn:c.program(1,o,s)}),(r||0===r)&&(l+=r),l+='" target="_blank">Directions</a></span>\n'});return e.registerPartial("views_.._.._templates_popup",n),n}),define("views/list",["jquery","leaflet","underscore","backbone","moment","utils","views/map","hbs!../../templates/event_list","hbs!../../templates/event_list_empty","hbs!../../templates/item_open","hbs!../../templates/EventClosedPartial","hbs!../../templates/liMonths","hbs!../../templates/liDays","hbs!../../templates/popup"],function(t,e,n,i,s,o,r,a,l,h,d,c,p,u){var f=i.View.extend({tagName:"div",className:"span4",id:"",colorRange:240,numOfFades:6,height:40,openHeight:38,nowFound:!1,colorEvents:!0,_markers:[],_eventsInView:[],_eventsViewed:[],render_var:{pre_current_date:{date:new Date},current_date:{date:new Date}},forward_lock:!1,backward_lock:!1,events:{"click .event_item":"onClick","mouseenter .event_item":"onMouseenter","mouseleave .event_item":"onMouseleave"},initialize:function(t){this.constructor.__super__.initialize.apply(this,[t]),this.model.on("add",this.onAdd,this),r.map.on("popupopen",this.onPopupOpen),r.map.on("locationfound",this.onLocationFound,this),this.baseFragment=i.history.fragment.split("?")[0]},onMarkerClick:function(e){this.eventItemOpen(e.target.options.modelID),t(e.target._icon.children).hasClass("viewing")||this.scrollToId(e.target.options.modelID)},onPopupOpen:function(e){t(e.popup._source._icon).find(".circleMarker").show(),t(e.popup._source._icon).find(".layer1").attr("transform","scale(1.2) translate(-1, -3)")},onScroll:function(e){var n=e.data,i=60;n.scrollPosition=t("#EventsListView").scrollTop(),i>=n.scrollPosition?e.data.backFetch(e.data):t("#EventsListView")[0].scrollHeight-n.scrollPosition<t("#EventsListView").outerHeight()+i&&n.forwardFetch(n),e.data.genarateColorsAndMonths(),e.data.setMonthSideBarPosition()},deScroll:n.debounce(function(t){var e=t.data;e.onScroll(t)},5),backFetch:function(e){var n=e?e:this;n.backward_lock||(n.backward_lock=!0,n.model.rfetch({successCallback:function(e){if(!n.nowFound){var i=n.renderNow();-1===i&&t("#EventsListView").scrollTop(t("#EventsListView").height())}if(n.searchDateBelow)n.gotoDate(n.options.date)&&(n.searchDateAbove=!1),n.searchDateBelow=!1;else{var s=n.scrollPosition+e.length*n.height;t("#EventsListView").scrollTop(s)}n.genarateColorsAndMonths(!0),n.backward_lock=!1}}))},forwardFetch:function(t){var e=t?t:this;e.forward_lock||(e.forward_lock=!0,e.model.ffetch({successCallback:function(){e.nowFound||e.renderNow(),e.searchDateAbove&&(e.gotoDate(e.options.date)&&(e.searchDateBelow=!1),e.searchDateAbove=!1),e.genarateColorsAndMonths(!0),e.forward_lock=!1}}))},onAdd:function(n){var i=n.get("location_point"),s=this.model.indexOf(n),o=n.get("start_datetime").format("h:mm A"),a=n.get("end_datetime").format("h:mm A");if(n.set("start_time",o),n.set("end_time",a),i){n.set("coordx",i.coordinates[0]),n.set("coordy",i.coordinates[1]),r.currentPos&&(n.set("scoordx",r.currentPos.lng),n.set("scoordy",r.currentPos.lat));var l=e.divIcon({className:"icon",html:"<div class='icon-event' id='icon-"+n.get("slug")+"'></div>",iconAnchor:[9,23],iconSize:[24,30],popupAnchor:[4,-10]}),h=n.get("location_point"),d=e.marker([h.coordinates[1],h.coordinates[0]],{icon:l,modelID:n.get("slug")});d.bindPopup(u(n.toJSON())),r.group.addLayer(d),d.on("click",this.onMarkerClick,this),this._markers[n.get("slug")]=d,this.getMarkerById(n.get("slug")).html(t("#svg svg").clone()).addClass("hidden")}this.renderEvent(s,n)},onLocationFound:function(e){this._markers.forEach(function(n){var i=t(n._popup._content),s=i.find(".popupAddress").attr("href");s=o.updateURLParameter(s,"saddr",e.latlng.toUrlString()),i.find(".popupAddress").attr("href",s),n._popup._content=i.prop("outerHTML")})},onClick:function(e){var n=e.currentTarget.id.replace(/event_/,""),i=this._markers[n];t(e.currentTarget).hasClass("open")?(this.eventItemClose(n),i&&i.closePopup()):(this.eventItemOpen(n),i&&i.openPopup())},onMouseenter:function(e){if(!t(e.currentTarget).hasClass("open")){var n=e.currentTarget.id.replace(/event_/,"");this._markers[n]&&(this.getMarkerById(n).parent().css("margin-left",-11).css("margin-top",-27).find(".layer1").attr("transform","scale(1.2) translate(-1, -3)"),this._markers[n].setZIndexOffset(200))}},onMouseleave:function(e){if(!t(e.currentTarget).hasClass("open")){var n=e.currentTarget.id.replace(/event_/,"");this._markers[n]&&(t("#icon-"+n).parent().css("margin-left",-9).css("margin-top",-23).find(".layer1").attr("transform","scale(1)"),this._markers[n].setZIndexOffset(10))}},eventItemOpen:function(e){var i=t("#event_"+e);if(!i.hasClass("open")){var s=this.model.get(e);i.addClass("open").height(this.height+this.openHeight).find(".list_item_container").html(h(s.toJSON()));var o=n.bind(function(t,e){return e+this.openHeight},this);this.getMonthLiById(e).height(o),this.getDayLiById(e).height(o),this.getMarkerById(e)&&this._markers[e].setZIndexOffset(100)}},eventItemClose:function(e){t("#icon-"+e).parent().css("margin-left",-9).css("margin-top",-23).find(".layer1").attr("transform","scale(1)").find(".circleMarker").hide(),t("#event_"+e).height(this.height).removeClass("open");var i=n.bind(function(t,e){return e-this.openHeight},this);this.getDayLiById(e).height(i),this.getMonthLiById(e).height(i),this.setMonthSideBarPosition()},onResize:function(){0!==t("#event_list").length&&this.genarateColorsAndMonths(!0)},onClose:function(){t("#EventsListView").off("scroll."+this.cid);var e=this;n.each(n.values(this._markers),function(t,n){t.off("click"),delete e._markers[n]}),delete this._markers,this.model.off("add",this.onAdd,this)},onDOMadd:function(){this.renderNow(),this.onResize(),this.scrollPosition=t("#EventsListView").scrollTop(),this.options.date=this.options.date?s(this.options.date):s(server_time_tz.substr(0,19)),this.gotoDate(this.options.date)||(this.searchDateAbove=!0,this.searchDateBelow=!0),this.backFetch(),this.forwardFetch()},renderEvent:function(e,i){var s,o,r=i.get("start_datetime"),l=this.month2FullNameOrLetter(r,0),h=r.date(),u=r.month(),f=r.year(),v={month:u,year:f,height:this.height,letter:l},m={day:h,month:u,year:f,height:this.height},g=c({months:[v]}),_=p({days:[m]}),y=d({events:[i.toJSON()]}),w=this.$el.find("#event_list"),b=w.children().length;if(0===b)return s=a({days:[m],height:this.height}),s=t(s),s.find("#event_list_month").html(g),s.find("#event_list_day").html(_),s.find("#event_list").html(y),this.$el.html(s).find("#EventsListView").on("scroll."+this.cid,this,this.onScroll),this;b>e?o="before":(o="after",e=b-1);var k=w.children().eq(e),L=this.getMonthLi(e),E=this.getDayLi(e),x=this.$el.find("#month_"+u+"_"+f),M=this.$el.find("#day_"+h+"_"+u+"_"+f);if(k[o](y),0===x.length)L[o](g),E[o](_);else{var T=n.bind(function(t,e){return e+this.height},this);x.height(T),l=this.month2FullNameOrLetter(r,x.height()),x.children().text(l),0===M.length?E[o](_):M.height(T)}return this},renderNow:function(){var t=server_time_tz.substr(0,19),e=this.model.binarySearch(s(t),"start_datetime");if(e>0){this.colorEvents=!0,this.nowFound=!0;var n=this.getMonthLi(e),i=this.getDayLi(e);this.$el.find("#event_list li").eq(e).addClass("Now").css("border-top","4px").css("border-top-style","solid"),n.height(function(t,e){return e+4}),i.height(function(t,e){return e+4})}else-2===e?this.colorEvents=!0:-1===e&&(this.colorEvents=!1);return e},render:function(){var t=l();this.$el.html(t);var e=this;return this.model.forEach(function(t){e.onAdd(t)}),this},genarateColorsAndMonths:function(e){var i=t(document.elementFromPoint(t("#event_list").position().left+.5,t("#EventsListView").position().top+20));if(i.hasClass("event_item")&&(e||this.topVisbleEl[0]!=i[0])){var o,r=this,a=t("#event_list").children().index(t(".Now")),l=t("#event_list").children().index(i);o=a>l?a:l;var h,d=s(i.data("date")),c=(r.isListFull()?t("#EventsListView").height():t("#event_list").height())-11,p=document.elementFromPoint(t("#event_list").position().left+2,t("#EventsListView").position().top+c),u=t("#event_list").children().index(p),f=[],v=u-o;this.topVisbleEl=i,this.setMonthDay(d),this.setDay(d),this.setURL(d),t(".viewing").removeClass("viewing");for(var m=l;u>=m;m++)h=this.getMarker(m),h&&(h.addClass("viewing").removeClass("hidden").find(".svgForeground").css("fill-opacity",1).css("stroke","black"),f.push(h[0]));if(this.colorEvents){for(m=o;v+o>=m;++m)if(h=this.getMarker(m),f.push(h[0]),h){var g;g=0===v?this.colorRange:(m-o)/v*this.colorRange,this.getEventLi(m).css("background-color","hsl("+g+",100%, 50%)"),h.find(".svgForeground").css("fill","hsl("+g+",100%, 50%)"),this.setZIndex(m,10)}for(m=l-1;m>l-this.numOfFades-1&&!(a>m);m--)if(h=this.getMarker(m)){if(!n.contains(this._eventsInView,h[0]))break;f.push(h[0]),h.find(".svgForeground").css("stroke","grey").css("fill","hsl(0,100%, 50%)").css("fill-opacity",1-(l-m)/this.numOfFades),this.setZIndex(m,-10)}for(m=a>u+1?a:u+1;u+this.numOfFades+1>m;m++)if(h=this.getMarker(m)){if(!n.contains(this._eventsInView,h[0]))break;f.push(h[0]),h.find(".svgForeground").css("stroke","grey").css("fill","hsl("+this.colorRange+",100%, 50%)").css("fill-opacity",1-(m-u-1)/this.numOfFades),this.setZIndex(m,-10)}}var _=n.filter(this._eventsInView,function(t){return!n.contains(f,t)},this);_.forEach(function(e){t(e).addClass("hidden")}),this._eventsInView=f}},getEventLi:function(t){return this.$el.find("#event_list li").eq(t)},getMonthLi:function(t){var e=this.getEventLi(t),n=new Date(e.data("date")),i=n.getUTCFullYear(),s=n.getUTCMonth();return this.$el.find("#month_"+s+"_"+i)},getDayLi:function(t){var e=this.$el.find("#event_list li").eq(t),n=new Date(e.data("date")),i=n.getUTCFullYear(),s=n.getUTCMonth(),o=n.getUTCDate();return this.$el.find("#day_"+o+"_"+s+"_"+i)},getDayLiById:function(t){var e=this.model.get(t),n=e.get("start_datetime").date(),i=e.get("start_datetime").month(),s=e.get("start_datetime").year();return this.$el.find("#day_"+n+"_"+i+"_"+s)},getMonthLiById:function(t){var e=this.model.get(t),n=e.get("start_datetime").month(),i=e.get("start_datetime").year();return this.$el.find("#month_"+n+"_"+i)},getMarkerById:function(e){return t("#icon-"+e).length>0?t("#icon-"+e):!1},getMarker:function(t){var e=this.model.at(t);return e?this.getMarkerById(e.get("slug")):!1},getTopEvent:function(){return document.elementFromPoint(t("#event_list").position().left+.5,t("#EventsListView").position().top+20)},setZIndex:function(t,e){var n=this.model.at(t).get("slug");this._markers[n].setZIndexOffset(e)},setDay:function(e){var n=e.day();t(".selected_day").removeClass("selected_day"),t("#day_"+n).addClass("selected_day")},setMonthDay:function(e){var n=e.format("MMM")[0],i=e.date();t("#topMonthLetter").text(n+i),t("#topYear").text(e.year())},setURL:function(t){app.navigate(this.baseFragment+"?date="+t.format("YYYY-MM-DD"),{trigger:!1,replace:!0})},setMonthSideBarPosition:function(){var e=20,n=document.elementFromPoint(t("#event_list").position().left+.5,t("#event_list_top_date").height()),i=t(n).data("id"),s=this.model.get(i).get("start_datetime"),o=t("#month_"+s.month()+"_"+s.year()),r=o.position().top+o.height(),a=o.children().width(),l=(o.next().children().width(),o.children());if(this.current_top_month&&this.current_top_month[0]===l[0]||(t(".monthFixed").removeClass("monthFixed"),this.current_top_month&&this.current_top_month.css("top",0),this.current_top_month=l),r>t("#EventsListView").position().top+a+e)l.addClass("monthFixed").removeClass("relative").css("top",t("#EventsListView").position().top);else{var h=o.height(),d=h-a-e;0>d&&(d=0),l.addClass("relative").removeClass("monthFixed").css("top",d)}},gotoDate:function(e){var n=this.model.binarySearch(e,"start_datetime");if(0>n)return!1;var i=n*this.height;t("#EventsListView").scrollTop(i),this.setMonthSideBarPosition();var s=this.getTopEvent(),o=this.getEventLi(n);return s!=o[0]?!1:!0},scrollToId:function(e){this.scrollTo(t("#event_"+e))},scrollTo:function(e){var n=t("#EventsListView").scrollTop()-t("#EventsListView").position().top+e.position().top;t("#EventsListView").animate({scrollTop:n},700)},isListFull:function(){return t("#EventsListView").height()<t("#event_list").height()?!0:!1},month2FullNameOrLetter:function(t,e){var n=e/10;return 10>n?t.format("MMM")[0]:t.format("MMMM")}});return{EventsListView:f}});var jade=function(t){function e(t){return null!=t}return Array.isArray||(Array.isArray=function(t){return"[object Array]"==Object.prototype.toString.call(t)}),Object.keys||(Object.keys=function(t){var e=[];for(var n in t)t.hasOwnProperty(n)&&e.push(n);return e}),t.merge=function(t,n){var i=t["class"],s=n["class"];(i||s)&&(i=i||[],s=s||[],Array.isArray(i)||(i=[i]),Array.isArray(s)||(s=[s]),i=i.filter(e),s=s.filter(e),t["class"]=i.concat(s).join(" "));for(var o in n)"class"!=o&&(t[o]=n[o]);return t},t.attrs=function(e,n){var i=[],s=e.terse;delete e.terse;var o=Object.keys(e),r=o.length;if(r){i.push("");for(var a=0;r>a;++a){var l=o[a],h=e[l];"boolean"==typeof h||null==h?h&&(s?i.push(l):i.push(l+'="'+l+'"')):0==l.indexOf("data")&&"string"!=typeof h?i.push(l+"='"+JSON.stringify(h)+"'"):"class"==l&&Array.isArray(h)?i.push(l+'="'+t.escape(h.join(" "))+'"'):n&&n[l]?i.push(l+'="'+t.escape(h)+'"'):i.push(l+'="'+h+'"')}}return i.join(" ")},t.escape=function(t){return(t+"").replace(/&(?!(\w+|\#\d+);)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")},t.rethrow=function(t,e,n){if(!e)throw t;var i=3,s=require("fs").readFileSync(e,"utf8"),o=s.split("\n"),r=Math.max(n-i,0),a=Math.min(o.length,n+i),i=o.slice(r,a).map(function(t,e){var i=e+r+1;return(i==n?"  > ":"    ")+i+"| "+t}).join("\n");throw t.path=e,t.message=(e||"Jade")+":"+n+"\n"+i+"\n\n"+t.message,t},t}({});define("jade",jade),define("jade",{version:"0.0.1",load:function(){}}),define("jade!views/../../templates/list_info",["jade"],function(jade){return function anonymous(locals,attrs,escape,rethrow,merge){attrs=attrs||jade.attrs,escape=escape||jade.escape,rethrow=rethrow||jade.rethrow,merge=merge||jade.merge;var buf=[];with(locals||{}){var interp;buf.push('<div class="row-fluid top"><h1>'+escape(null==(interp=title)?"":interp)+'</h1></div><div id="ListOptionView" style="margin: 20px;"><p><span id="description">'+escape(null==(interp=description)?"":interp)+"</span>"),permissions.group_admin&&buf.push('<button id="editProfile" class="btn btn-link">Edit</button>'),buf.push('</p></div><div id="actions" style="margin: 20px;">'),permissions.add_event&&buf.push('<a href="#add/event" type="button" class="btn btn-large btn-block btn-primary">Add Event</a>'),buf.push('</div><div id="listOptionPanels"><div><a href="{{icalURL}}" target="_blank">Export</a></div></div>')}return buf.join("")}}),define("jade!views/../../templates/edit_profile",["jade"],function(jade){return function anonymous(locals,attrs,escape,rethrow,merge){attrs=attrs||jade.attrs,escape=escape||jade.escape,rethrow=rethrow||jade.rethrow,merge=merge||jade.merge;var buf=[];with(locals||{}){buf.push('<textarea id="description">');var __val__=description;buf.push(escape(null==__val__?"":__val__)),buf.push('</textarea><div id="Controls"><button type="button" id="Save" class="btn btn-primary">Save</button><button type="button" id="Cancel" class="btn">Cancel</button></div>')}return buf.join("")}}),define("views/list_info",["backbone","jquery","jade!../../templates/list_info","jade!../../templates/edit_profile"],function(t,e,n,i){var s=t.View.extend({tagName:"div",className:"replace span3",id:"calender",events:{"click #editProfile":"editProfile"},childrenEL:"#listOptionPanels",initialize:function(t){this.constructor.__super__.initialize.apply(this,[t])},render:function(){function t(){e.model&&e.model.get("title")==app.session.get("username")&&(e.model.set("title","MY EVENTS"),e.model.set("permissions",{group_admin:!0,add_event:!0})),e.$el.append(n(e.model.toJSON()))}var e=this;if(this.model.id){var i=this.model.fetch();i.error(function(){throw"event not found"}),i.success(function(){t()})}else t();return this},editProfile:function(){this.oldText=e("#description").text(),e("#ListOptionView").html(i({description:this.oldText})),e("#Cancel").one("click",this,this.closeEditor),e("#Save").one("click",this,this.saveProfile)},closeEditor:function(t){var e=t.data;e.$el.html(n(e.model.toJSON()))},saveProfile:function(t){var n=t.data;n.model.set("description",e("#description").val()),n.model.save(),n.closeEditor(t)}});return s});