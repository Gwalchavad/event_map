define("hbs!views/../../templates/event_list",["hbs","handlebars"],function(t,e){var n=e.template(function(t,e,n){n=n||t.helpers;var i,s,o="",a="function",r=this.escapeExpression;return o+="<style>\n    #event_list li{\n        height:",s=n.height,s?i=s.call(e,{hash:{}}):(i=e.height,i=typeof i===a?i():i),o+=r(i)+'px\n    }    \n</style>\n\n<div class="row-fluid top" id="event_list_top_date">\n    <div class="span2 top_text" id="topMonthLetter"></div>\n    <div class="span8">\n        <div class="row-fluid" style="height:60px">\n            <div class="span6" id="topWeekLetter" style="text-align: center">\n                <div style="display: inline-block">\n                    <span id="day_0">S</span>\n                    <span id="day_1">M</span>\n                    <span id="day_2">T</span>\n                    <span id="day_3">W</span>\n                    <span id="day_4">T</span>\n                    <span id="day_5">F</span>\n                    <span id="day_6">S</span>\n                </div>\n            </div>\n            <div style="text-align: center;" class="span4 top_text" id="topYear"></div>\n        </div>\n    </div>\n</div>\n<div id="EventsListView" class="replace overflow setheightWithTop">\n    <div class="row-fluid">\n        <div class="span1">\n            <div class="row-fluid">\n                <div class="span5">\n                    <ul  id="event_list_month">\n                    </ul>\n                </div>\n                <div class="span5">\n                    <ul  id="event_list_day">\n                    </ul>\n                </div>\n            </div>\n        </div>\n        <div class="span9">\n            <ul id="event_list">\n            </ul>\n        </div>\n    </div>\n</div>\n'});return e.registerPartial("views_.._.._templates_event_list",n),n}),define("hbs!views/../../templates/event_list_empty",["hbs","handlebars"],function(t,e){var n=e.template(function(t,e,n){return n=n||t.helpers,'<div id="NoEvent" class="row-fluid top">\n    <div class="span10 top_text" style="text-align: center;">NO EVENTS</div>\n</div>\n<div>\n    <div id="EventsListView" class="replace overflow setheightWithTop">\n        <ul id="event_list">\n        </ul>\n    </div>\n</div>\n\n'});return e.registerPartial("views_.._.._templates_event_list_empty",n),n}),define("hbs!views/../../templates/item_open",["hbs","handlebars"],function(t,e){var n=e.template(function(t,e,n){n=n||t.helpers;var i,s,o="",a="function",r=this.escapeExpression;return o+='<div class="openIndt">[-]</div>\n<div class="list_item_width">\n    <div class="list_item_content">\n        ',s=n.start_time,s?i=s.call(e,{hash:{}}):(i=e.start_time,i=typeof i===a?i():i),o+=r(i)+" - ",s=n.end_time,s?i=s.call(e,{hash:{}}):(i=e.end_time,i=typeof i===a?i():i),o+=r(i)+' <a href="#/event/',s=n.slug,s?i=s.call(e,{hash:{}}):(i=e.slug,i=typeof i===a?i():i),o+=r(i)+'">',s=n.title,s?i=s.call(e,{hash:{}}):(i=e.title,i=typeof i===a?i():i),o+=r(i)+"</a> | ",s=n.content,s?i=s.call(e,{hash:{}}):(i=e.content,i=typeof i===a?i():i),o+=r(i)+"\n    </div>\n</div>\n"});return e.registerPartial("views_.._.._templates_item_open",n),n}),define("hbs!views/../../templates/EventClosedPartial",["hbs","handlebars"],function(t,e){var n=e.template(function(t,e,n,i,s){function o(t,e){var i,s,o="";return o+='<li id="event_',s=n.slug,s?i=s.call(t,{hash:{}}):(i=t.slug,i=typeof i===d?i():i),o+=c(i)+'" data-id="',s=n.slug,s?i=s.call(t,{hash:{}}):(i=t.slug,i=typeof i===d?i():i),o+=c(i)+'" data-date="',i=t.start_datetime,i=null==i||i===!1?i:i._i,i=typeof i===d?i():i,o+=c(i)+'" class="event_item">\n    <div class="list_item_container">\n        <div class="openIndt" style="">[+]</div>\n        <div class="list_item_width">\n            <div class="list_item_content" >\n                ',i=t.complete,i=n["if"].call(t,i,{hash:{},inverse:p.program(4,r,e),fn:p.program(2,a,e)}),(i||0===i)&&(o+=i),o+="\n            </div>\n        </div>\n    </div>\n</li>"}function a(t){var e,i,s="";return s+="\n                    ",i=n.start_time,i?e=i.call(t,{hash:{}}):(e=t.start_time,e=typeof e===d?e():e),s+=c(e)+" - ",i=n.end_time,i?e=i.call(t,{hash:{}}):(e=t.end_time,e=typeof e===d?e():e),s+=c(e)+' <a href="#/event/',i=n.slug,i?e=i.call(t,{hash:{}}):(e=t.slug,e=typeof e===d?e():e),s+=c(e)+'">',e=t.titleClose,e=typeof e===d?e():e,s+=c(e)+"</a>\n                "}function r(t){var e,i,s="";return s+="\n                    ",i=n.start_time,i?e=i.call(t,{hash:{}}):(e=t.start_time,e=typeof e===d?e():e),s+=c(e)+" - ",i=n.end_time,i?e=i.call(t,{hash:{}}):(e=t.end_time,e=typeof e===d?e():e),s+=c(e)+' <a href="#/event/',i=n.slug,i?e=i.call(t,{hash:{}}):(e=t.slug,e=typeof e===d?e():e),s+=c(e)+'">',e=t.titleClose,e=typeof e===d?e():e,s+=c(e)+"</a>\n                "}n=n||t.helpers;var l,h="",d="function",c=this.escapeExpression,p=this;return l=e.events,l=n.each.call(e,l,{hash:{},inverse:p.noop,fn:p.program(1,o,s)}),(l||0===l)&&(h+=l),h+="\n"});return e.registerPartial("views_.._.._templates_EventClosedPartial",n),n}),define("hbs!views/../../templates/liMonths",["hbs","handlebars"],function(t,e){var n=e.template(function(t,e,n,i,s){function o(t){var e,i,s="";return s+='\n    <li id="month_',i=n.month,i?e=i.call(t,{hash:{}}):(e=t.month,e=typeof e===l?e():e),s+=h(e)+"_",i=n.year,i?e=i.call(t,{hash:{}}):(e=t.year,e=typeof e===l?e():e),s+=h(e)+'" style="height:',i=n.height,i?e=i.call(t,{hash:{}}):(e=t.height,e=typeof e===l?e():e),s+=h(e)+'px">\n        <div class="rot-90 verticalMonth">',i=n.letter,i?e=i.call(t,{hash:{}}):(e=t.letter,e=typeof e===l?e():e),s+=h(e)+"</div>\n    </li>\n"}n=n||t.helpers;var a,r="",l="function",h=this.escapeExpression,d=this;return a=e.months,a=n.each.call(e,a,{hash:{},inverse:d.noop,fn:d.program(1,o,s)}),(a||0===a)&&(r+=a),r+="\n"});return e.registerPartial("views_.._.._templates_liMonths",n),n}),define("hbs!views/../../templates/liDays",["hbs","handlebars"],function(t,e){var n=e.template(function(t,e,n,i,s){function o(t){var e,i,s="";return s+='\n    <li id="day_',i=n.day,i?e=i.call(t,{hash:{}}):(e=t.day,e=typeof e===l?e():e),s+=h(e)+"_",i=n.month,i?e=i.call(t,{hash:{}}):(e=t.month,e=typeof e===l?e():e),s+=h(e)+"_",i=n.year,i?e=i.call(t,{hash:{}}):(e=t.year,e=typeof e===l?e():e),s+=h(e)+'" style="height:',i=n.height,i?e=i.call(t,{hash:{}}):(e=t.height,e=typeof e===l?e():e),s+=h(e)+'px">',i=n.day,i?e=i.call(t,{hash:{}}):(e=t.day,e=typeof e===l?e():e),s+=h(e)+"</li>\n"}n=n||t.helpers;var a,r="",l="function",h=this.escapeExpression,d=this;return a=e.days,a=n.each.call(e,a,{hash:{},inverse:d.noop,fn:d.program(1,o,s)}),(a||0===a)&&(r+=a),r+="\n"});return e.registerPartial("views_.._.._templates_liDays",n),n}),define("hbs!views/../../templates/popup",["hbs","handlebars"],function(t,e){var n=e.template(function(t,e,n,i,s){function o(t){var e,i,s="";return i=n.scoordy,i?e=i.call(t,{hash:{}}):(e=t.scoordy,e=typeof e===h?e():e),s+=d(e)+",",i=n.scoordx,i?e=i.call(t,{hash:{}}):(e=t.scoordx,e=typeof e===h?e():e),s+=d(e)}n=n||t.helpers;var a,r,l="",h="function",d=this.escapeExpression,c=this;return l+='<span id="popup_',r=n.id,r?a=r.call(e,{hash:{}}):(a=e.id,a=typeof a===h?a():a),l+=d(a)+'"><h3><a href="/#event/',r=n.slug,r?a=r.call(e,{hash:{}}):(a=e.slug,a=typeof a===h?a():a),l+=d(a)+'">',r=n.title,r?a=r.call(e,{hash:{}}):(a=e.title,a=typeof a===h?a():a),l+=d(a)+"</a></h3>",r=n.start_time,r?a=r.call(e,{hash:{}}):(a=e.start_time,a=typeof a===h?a():a),l+=d(a)+"-",r=n.end_time,r?a=r.call(e,{hash:{}}):(a=e.end_time,a=typeof a===h?a():a),l+=d(a)+' <a class="popupAddress btn btn-info btn-small" href="https://www.google.com/maps?daddr=',r=n.coordy,r?a=r.call(e,{hash:{}}):(a=e.coordy,a=typeof a===h?a():a),l+=d(a)+",",r=n.coordx,r?a=r.call(e,{hash:{}}):(a=e.coordx,a=typeof a===h?a():a),l+=d(a)+"&saddr=",a=e.scoordy,a=n["if"].call(e,a,{hash:{},inverse:c.noop,fn:c.program(1,o,s)}),(a||0===a)&&(l+=a),l+='" target="_blank">Directions</a></span>\n'});return e.registerPartial("views_.._.._templates_popup",n),n}),define("views/list",["jquery","leaflet","underscore","backbone","moment","utils","views/map","hbs!../../templates/event_list","hbs!../../templates/event_list_empty","hbs!../../templates/item_open","hbs!../../templates/EventClosedPartial","hbs!../../templates/liMonths","hbs!../../templates/liDays","hbs!../../templates/popup"],function(t,e,n,i,s,o,a,r,l,h,d,c,p,u){var f=i.View.extend({tagName:"div",className:"span4",id:"",colorRange:240,numOfFades:6,height:40,openHeight:38,nowFound:!1,colorEvents:!0,_markers:[],_eventsInView:[],_eventsViewed:[],render_var:{pre_current_date:{date:new Date},current_date:{date:new Date}},forward_lock:!1,backward_lock:!1,events:{"click .event_item":"onClick","mouseenter .event_item":"onMouseenter","mouseleave .event_item":"onMouseleave"},initialize:function(t){this.constructor.__super__.initialize.apply(this,[t]),this.model.on("add",this.onAdd,this),a.map.on("popupopen",this.onPopupOpen),a.map.on("locationfound",this.onLocationFound,this),this.baseFragment=i.history.fragment.split("?")[0]},onMarkerClick:function(e){this.eventItemOpen(e.target.options.modelID),t(e.target._icon.children).hasClass("viewing")||this.scrollToId(e.target.options.modelID)},onPopupOpen:function(e){t(e.popup._source._icon).find(".circleMarker").show(),t(e.popup._source._icon).find(".layer1").attr("transform","scale(1.2) translate(-1, -3)")},onScroll:function(e){var n=e.data,i=60;n.scrollPosition=t("#EventsListView").scrollTop(),i>=n.scrollPosition?e.data.backFetch(e.data):t("#EventsListView")[0].scrollHeight-n.scrollPosition<t("#EventsListView").outerHeight()+i&&n.forwardFetch(n),e.data.genarateColorsAndMonths(),e.data.setMonthSideBarPosition()},deScroll:n.debounce(function(t){var e=t.data;e.onScroll(t)},5),backFetch:function(e){var n=e?e:this;n.backward_lock||(n.backward_lock=!0,n.model.rfetch({successCallback:function(e){if(n.nowFound||n.renderNow(),n.searchDateBelow)n.gotoDate(n.options.date)&&(n.searchDateAbove=!1),n.searchDateBelow=!1;else{var i=n.scrollPosition+e.length*n.height;t("#EventsListView").scrollTop(i)}n.genarateColorsAndMonths(!0),n.backward_lock=!1}}))},forwardFetch:function(t){var e=t?t:this;e.forward_lock||(e.forward_lock=!0,e.model.ffetch({successCallback:function(){e.nowFound||e.renderNow(),e.searchDateAbove&&(e.gotoDate(e.options.date)&&(e.searchDateBelow=!1),e.searchDateAbove=!1),e.genarateColorsAndMonths(!0),e.forward_lock=!1}}))},onAdd:function(n){var i=n.get("location_point"),s=this.model.indexOf(n),o=n.get("start_datetime").format("h:mm A"),r=n.get("end_datetime").format("h:mm A");if(n.set("start_time",o),n.set("end_time",r),i){n.set("coordx",i.coordinates[0]),n.set("coordy",i.coordinates[1]),a.currentPos&&(n.set("scoordx",a.currentPos.lng),n.set("scoordy",a.currentPos.lat));var l=e.divIcon({className:"icon",html:"<div class='icon-event' id='icon-"+n.get("slug")+"'></div>",iconAnchor:[9,23],iconSize:[24,30],popupAnchor:[4,-10]}),h=n.get("location_point"),d=e.marker([h.coordinates[1],h.coordinates[0]],{icon:l,modelID:n.get("slug")});d.bindPopup(u(n.toJSON())),a.group.addLayer(d),d.on("click",this.onMarkerClick,this),this._markers[n.get("slug")]=d,this.getMarkerById(n.get("slug")).html(t("#svg svg").clone()).addClass("hidden")}this.renderEvent(s,n)},onLocationFound:function(e){this._markers.forEach(function(n){var i=t(n._popup._content),s=i.find(".popupAddress").attr("href");s=o.updateURLParameter(s,"saddr",e.latlng.toUrlString()),i.find(".popupAddress").attr("href",s),n._popup._content=i.prop("outerHTML")})},onClick:function(e){var n=e.currentTarget.id.replace(/event_/,""),i=this._markers[n];t(e.currentTarget).hasClass("open")?(this.eventItemClose(n),i&&i.closePopup()):(this.eventItemOpen(n),i&&i.openPopup())},onMouseenter:function(e){if(!t(e.currentTarget).hasClass("open")){var n=e.currentTarget.id.replace(/event_/,"");this._markers[n]&&(this.getMarkerById(n).parent().css("margin-left",-11).css("margin-top",-27).find(".layer1").attr("transform","scale(1.2) translate(-1, -3)"),this._markers[n].setZIndexOffset(200))}},onMouseleave:function(e){if(!t(e.currentTarget).hasClass("open")){var n=e.currentTarget.id.replace(/event_/,"");this._markers[n]&&(t("#icon-"+n).parent().css("margin-left",-9).css("margin-top",-23).find(".layer1").attr("transform","scale(1)"),this._markers[n].setZIndexOffset(10))}},eventItemOpen:function(e){var i=t("#event_"+e);if(!i.hasClass("open")){var s=this.model.get(e);i.addClass("open").height(this.height+this.openHeight).find(".list_item_container").html(h(s.toJSON()));var o=n.bind(function(t,e){return e+this.openHeight},this);this.getMonthLiById(e).height(o),this.getDayLiById(e).height(o),this.getMarkerById(e)&&this._markers[e].setZIndexOffset(100)}},eventItemClose:function(e){t("#icon-"+e).parent().css("margin-left",-9).css("margin-top",-23).find(".layer1").attr("transform","scale(1)").find(".circleMarker").hide(),t("#event_"+e).height(this.height).removeClass("open");var i=n.bind(function(t,e){return e-this.openHeight},this);this.getDayLiById(e).height(i),this.getMonthLiById(e).height(i),this.setMonthSideBarPosition()},onResize:function(){0!==t("#event_list").length&&this.genarateColorsAndMonths(!0)},onClose:function(){t("#EventsListView").off("scroll."+this.cid);var e=this;n.each(n.values(this._markers),function(t,n){t.off("click"),delete e._markers[n]}),delete this._markers,this.model.off("add",this.onAdd,this)},onDOMadd:function(){this.renderNow(),this.onResize(),this.scrollPosition=t("#EventsListView").scrollTop(),this.options.date=this.options.date?s(this.options.date):s(server_time_tz.substr(0,19)),this.gotoDate(this.options.date)||(this.searchDateAbove=!0,this.searchDateBelow=!0),this.backFetch(),this.forwardFetch()},renderEvent:function(e,i){console.log(e,i);var s,o,a=i.get("start_datetime"),l=this.month2FullNameOrLetter(a,0),h=a.date(),u=a.month(),f=a.year(),v={month:u,year:f,height:this.height,letter:l},m={day:h,month:u,year:f,height:this.height},g=c({months:[v]}),_=p({days:[m]}),y=d({events:[i.toJSON()]}),b=this.$el.find("#event_list"),w=b.children().length;if(0===w)return s=r({days:[m],height:this.height}),s=t(s),s.find("#event_list_month").html(g),s.find("#event_list_day").html(_),s.find("#event_list").html(y),this.$el.html(s).find("#EventsListView").on("scroll."+this.cid,this,this.onScroll),this;w>e?o="before":(o="after",e=w-1);var k=b.children().eq(e),L=this.getMonthLi(e),E=this.getDayLi(e),x=this.$el.find("#month_"+u+"_"+f),M=this.$el.find("#day_"+h+"_"+u+"_"+f);if(k[o](y),0===x.length)L[o](g),E[o](_);else{var P=n.bind(function(t,e){return e+this.height},this);x.height(P),l=this.month2FullNameOrLetter(a,x.height()),x.children().text(l),0===M.length?E[o](_):M.height(P)}return this},renderNow:function(){var t=server_time_tz.substr(0,19),e=this.model.binarySearch(s(t),"start_datetime");if(e>0){this.colorEvents=!0,this.nowFound=!0;var n=this.getMonthLi(e),i=this.getDayLi(e);this.$el.find("#event_list li").eq(e).addClass("Now").css("border-top","4px").css("border-top-style","solid"),n.height(function(t,e){return e+4}),i.height(function(t,e){return e+4})}else-2===e?this.colorEvents=!0:-1===e&&(this.colorEvents=!1)},render:function(){var t=l();this.$el.html(t);var e=this;return this.model.forEach(function(t){e.onAdd(t)}),this},genarateColorsAndMonths:function(e){var i=t(document.elementFromPoint(t("#event_list").position().left+.5,t("#EventsListView").position().top+20));if(i.hasClass("event_item")&&(e||this.topVisbleEl[0]!=i[0])){var o,a=this,r=t("#event_list").children().index(t(".Now")),l=t("#event_list").children().index(i);o=r>l?r:l;var h,d=s(i.data("date")),c=(a.isListFull()?t("#EventsListView").height():t("#event_list").height())-11,p=document.elementFromPoint(t("#event_list").position().left,t("#EventsListView").position().top+c),u=t("#event_list").children().index(p),f=[],v=u-o;this.topVisbleEl=i,this.setMonthDay(d),this.setDay(d),this.setURL(d),t(".viewing").removeClass("viewing");for(var m=l;u>=m;m++)h=this.getMarker(m),h&&(h.addClass("viewing").removeClass("hidden").find(".svgForeground").css("fill-opacity",1).css("stroke","black"),f.push(h[0]));if(this.colorEvents){for(var m=o;v+o>=m;++m)if(h=this.getMarker(m),f.push(h[0]),h){var g;g=0===v?this.colorRange:(m-o)/v*this.colorRange,this.getEventLi(m).css("background-color","hsl("+g+",100%, 50%)"),h.find(".svgForeground").css("fill","hsl("+g+",100%, 50%)"),this.setZIndex(m,10)}for(var m=l-1;m>l-this.numOfFades-1&&!(r>m);m--)if(h=this.getMarker(m)){if(!n.contains(this._eventsInView,h[0]))break;f.push(h[0]),h.find(".svgForeground").css("stroke","grey").css("fill","hsl(0,100%, 50%)").css("fill-opacity",1-(l-m)/this.numOfFades),this.setZIndex(m,-10)}var m=r>u+1?r:u+1;for(m;u+this.numOfFades+1>m;m++)if(h=this.getMarker(m)){if(!n.contains(this._eventsInView,h[0]))break;f.push(h[0]),h.find(".svgForeground").css("stroke","grey").css("fill","hsl("+this.colorRange+",100%, 50%)").css("fill-opacity",1-(m-u-1)/this.numOfFades),this.setZIndex(m,-10)}}var _=n.filter(this._eventsInView,function(t){return!n.contains(f,t)},this);_.forEach(function(e){t(e).addClass("hidden")}),this._eventsInView=f}},getEventLi:function(t){return this.$el.find("#event_list li").eq(t)},getMonthLi:function(t){var e=this.getEventLi(t),n=new Date(e.data("date")),i=n.getUTCFullYear(),s=n.getUTCMonth();return this.$el.find("#month_"+s+"_"+i)},getDayLi:function(t){var e=this.$el.find("#event_list li").eq(t),n=new Date(e.data("date")),i=n.getUTCFullYear(),s=n.getUTCMonth(),o=n.getUTCDate();return this.$el.find("#day_"+o+"_"+s+"_"+i)},getDayLiById:function(t){var e=this.model.get(t),n=e.get("start_datetime").date(),i=e.get("start_datetime").month(),s=e.get("start_datetime").year();return this.$el.find("#day_"+n+"_"+i+"_"+s)},getMonthLiById:function(t){var e=this.model.get(t),n=e.get("start_datetime").month(),i=e.get("start_datetime").year();return this.$el.find("#month_"+n+"_"+i)},getMarkerById:function(e){return t("#icon-"+e).length>0?t("#icon-"+e):!1},getMarker:function(t){var e=this.model.at(t);return e?this.getMarkerById(e.get("slug")):!1},getTopEvent:function(){return document.elementFromPoint(t("#event_list").position().left+.5,t("#EventsListView").position().top+20)},setZIndex:function(t,e){var n=this.model.at(t).get("slug");this._markers[n].setZIndexOffset(e)},setDay:function(e){var n=e.day();t(".selected_day").removeClass("selected_day"),t("#day_"+n).addClass("selected_day")},setMonthDay:function(e){var n=e.format("MMM")[0],i=e.date();t("#topMonthLetter").text(n+i),t("#topYear").text(e.year())},setURL:function(t){app.navigate(this.baseFragment+"?date="+t.format("YYYY-MM-DD"),{trigger:!1,replace:!0})},setMonthSideBarPosition:function(){var e=20,n=document.elementFromPoint(t("#event_list").position().left+.5,t("#event_list_top_date").height()),i=t(n).data("id"),s=this.model.get(i).get("start_datetime"),o=t("#month_"+s.month()+"_"+s.year()),a=o.position().top+o.height(),r=o.children().width(),l=(o.next().children().width(),o.children());if(this.current_top_month&&this.current_top_month[0]===l[0]||(t(".monthFixed").removeClass("monthFixed"),this.current_top_month&&this.current_top_month.css("top",0),this.current_top_month=l),a>t("#EventsListView").position().top+r+e)l.addClass("monthFixed").removeClass("relative").css("top",t("#EventsListView").position().top);else{var h=o.height(),d=h-r-e;0>d&&(d=0),l.addClass("relative").removeClass("monthFixed").css("top",d)}},gotoDate:function(e){var n=this.model.binarySearch(e,"start_datetime");if(0>n)return!1;var i=n*this.height;t("#EventsListView").scrollTop(i),this.setMonthSideBarPosition();var s=this.getTopEvent(),o=this.getEventLi(n);return s!=o[0]?!1:!0},scrollToId:function(e){this.scrollTo(t("#event_"+e))},scrollTo:function(e){var n=t("#EventsListView").scrollTop()-t("#EventsListView").position().top+e.position().top;t("#EventsListView").animate({scrollTop:n},700)},isListFull:function(){return t("#EventsListView").height()<t("#event_list").height()?!0:!1},month2FullNameOrLetter:function(t,e){var n=e/10;return 10>n?t.format("MMM")[0]:t.format("MMMM")}});return{EventsListView:f}}),define("hbs!views/../../templates/list_info",["hbs","handlebars"],function(t,e){var n=e.template(function(t,e,n,i,s){function o(){return'\n    <a href="#add/event" class="btn btn-large btn-block btn-primary" type="button">Add Event</a>\n    '}function a(t){var e,i,s="";return s+='\n    <a href="',i=n.icalURL,i?e=i.call(t,{hash:{}}):(e=t.icalURL,e=typeof e===d?e():e),s+=c(e)+'" target="_blank">Export<a/>\n    '}n=n||t.helpers;var r,l,h="",d="function",c=this.escapeExpression,p=this;return h+='<style>\n    #editProfile{\n        float: right;\n        padding-left: 11px;\n        background-color: rgb(245, 245, 220);\n    }\n</style>\n<div class="row-fluid top">\n    <h1>',l=n.title,l?r=l.call(e,{hash:{}}):(r=e.title,r=typeof r===d?r():r),h+=c(r)+'</h1>\n</div>\n<div id="ListOptionView" style="margin: 20px;">\n    <p><span id="description">',l=n.description,l?r=l.call(e,{hash:{}}):(r=e.description,r=typeof r===d?r():r),h+=c(r)+'</span><button id="editProfile" class="btn btn-link" style="display: none">Edit</button></p>\n    ',r=e.allow_add,r=n["if"].call(e,r,{hash:{},inverse:p.noop,fn:p.program(1,o,s)}),(r||0===r)&&(h+=r),h+='\n    </div>\n<div id="listOptionPanels">\n    ',r=e.icalURL,r=n["if"].call(e,r,{hash:{},inverse:p.noop,fn:p.program(3,a,s)}),(r||0===r)&&(h+=r),h+="\n</div>\n"});return e.registerPartial("views_.._.._templates_list_info",n),n}),define("hbs!views/../../templates/profile",["hbs","handlebars"],function(t,e){var n=e.template(function(t,e,n,i,s){function o(){return'\n<a href="#add/event" class="btn btn-large btn-block btn-primary" type="button">Add Event</a>\n'}n=n||t.helpers;var a,r,l="",h="function",d=this.escapeExpression,c=this;return l+='<p><span id="description">',r=n.description,r?a=r.call(e,{hash:{}}):(a=e.description,a=typeof a===h?a():a),l+=d(a)+'</span><button id="editProfile" class="btn btn-link" style="display: none">Edit</button></p>\n',a=e.allow_add,a=n["if"].call(e,a,{hash:{},inverse:c.noop,fn:c.program(1,o,s)}),(a||0===a)&&(l+=a),l+="\n"});return e.registerPartial("views_.._.._templates_profile",n),n}),define("hbs!views/../../templates/edit_profile",["hbs","handlebars"],function(t,e){var n=e.template(function(t,e,n,i,s){function o(){return'\n<a href="#add/event" class="btn btn-large btn-block btn-primary" type="button">Add Event</a>\n'}n=n||t.helpers;var a,r,l="",h="function",d=this.escapeExpression,c=this;return l+='<textarea id="description">',r=n.description,r?a=r.call(e,{hash:{}}):(a=e.description,a=typeof a===h?a():a),l+=d(a)+"</textarea>\n",a=e.allow_add,a=n["if"].call(e,a,{hash:{},inverse:c.noop,fn:c.program(1,o,s)}),(a||0===a)&&(l+=a),l+='\n<div id="Controls"><button id="Save" type="button" class="btn btn-primary">Save</button> <button id="Cancel" type="button" class="btn">Cancel</button></div>\n'});return e.registerPartial("views_.._.._templates_edit_profile",n),n}),define("views/list_info",["backbone","jquery","hbs!../../templates/list_info","hbs!../../templates/profile","hbs!../../templates/edit_profile"],function(t,e,n,i,s){var o=t.View.extend({tagName:"div",className:"replace span3",id:"calender",events:{"mouseenter #ListOptionView":"onMouseenter","mouseleave #ListOptionView":"onMouseleave","click #editProfile":"editProfile"},childrenEL:"#listOptionPanels",initialize:function(t){this.constructor.__super__.initialize.apply(this,[t])},render:function(){function t(){var t,i=null;e.model?e.model.get("title")==app.session.get("username")?(t="MY EVENTS",i=!0):t=e.model.get("title"):(t="ALL EVENTS",i=!0),e.$el.append(n(e.model.toJSON()))}var e=this;if(this.model.id){var i=this.model.fetch();i.error(function(){throw"event not found"}),i.success(function(){t()})}else t();return this},onMouseenter:function(){e("#editProfile").show()},onMouseleave:function(){e("#editProfile").hide()},editProfile:function(){this.oldText=e("#description").text(),e("#ListOptionView").html(s({description:this.oldText})),e("#Cancel").one("click",this,this.closeEditor),e("#Save").one("click",this,this.saveProfile)},closeEditor:function(t){e("#ListOptionView").html(i(t.data.model.toJSON()))},saveProfile:function(t){var n=t.data;n.model.set("description",e("#description").val()),n.model.save(),n.closeEditor(t)}});return o});