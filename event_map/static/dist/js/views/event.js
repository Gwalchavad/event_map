Handlebars.registerHelper("nl2br",function(e){return e=Handlebars.Utils.escapeExpression(e),e=e.replace(/\r\n|\r|\n/g,"<br/>"),new Handlebars.SafeString(e)}),define("views/../../templates/../templates/helpers/nl2br",function(){}),define("hbs!views/../../templates/event",["hbs","handlebars","../templates/helpers/nl2br"],function(e,t){var n=t.template(function(e,t,n,i,s){function o(e){var t,i,s="";return s+='\n        <a href="#/event/',i=n.slug,i?t=i.call(e,{hash:{}}):(t=e.slug,t=typeof t===u?t():t),s+=m(t)+'/edit" class="btn btn-primary">EDIT</a>\n        '}function a(e){var t,i,s="";return s+="\n            START: ",i=n.start_date,i?t=i.call(e,{hash:{}}):(t=e.start_date,t=typeof t===u?t():t),s+=m(t)+"<br>\n            END: ",i=n.end_date,i?t=i.call(e,{hash:{}}):(t=e.end_date,t=typeof t===u?t():t),s+=m(t)+"\n            "}function r(e){var t,i,s="";return s+="\n                VENUE:",i=n.venue,i?t=i.call(e,{hash:{}}):(t=e.venue,t=typeof t===u?t():t),s+=m(t)+"<br>\n                "}function l(e){var t,i,s="";return s+="\n                <span>ADDRESS: ",i=n.address,i?t=i.call(e,{hash:{}}):(t=e.address,t=typeof t===u?t():t),s+=m(t)+"</span><br>\n                "}function h(){return"\n\n"}n=n||e.helpers;var d,c,p="",u="function",m=this.escapeExpression,f=this,v=n.helperMissing;return p+="<div>\n    <h1>",c=n.title,c?d=c.call(t,{hash:{}}):(d=t.title,d=typeof d===u?d():d),p+=m(d),d=t.edit,d=n["if"].call(t,d,{hash:{},inverse:f.noop,fn:f.program(1,o,s)}),(d||0===d)&&(p+=d),p+='</h1>\n    <div class="row-fluid">\n        <div class="span10">\n            <h3>\n            ',d=t.end_date,d=n["if"].call(t,d,{hash:{},inverse:f.noop,fn:f.program(3,a,s)}),(d||0===d)&&(p+=d),p+='\n            <h3>\n        </div>\n    </div>\n    <div class="row-fluid">\n        <div class="span5">\n            <h3>\n                ',d=t.venue,d=n["if"].call(t,d,{hash:{},inverse:f.noop,fn:f.program(5,r,s)}),(d||0===d)&&(p+=d),p+="\n                ",d=t.address,d=n["if"].call(t,d,{hash:{},inverse:f.noop,fn:f.program(7,l,s)}),(d||0===d)&&(p+=d),p+='\n\n                <a href="#/author/',c=n.author,c?d=c.call(t,{hash:{}}):(d=t.author,d=typeof d===u?d():d),p+=m(d)+'">BY:',c=n.author,c?d=c.call(t,{hash:{}}):(d=t.author,d=typeof d===u?d():d),p+=m(d)+"</a>\n            </h3>\n        </div>\n    </div>\n</div>\n<div>\n",d=t.content,c=n.nl2br,d=c?c.call(t,d,{hash:{},inverse:f.noop,fn:f.program(9,h,s)}):v.call(t,"nl2br",d,{hash:{},inverse:f.noop,fn:f.program(9,h,s)}),(d||0===d)&&(p+=d),p+="\n</div>\n"});return t.registerPartial("views_.._.._templates_event",n),n}),define("views/event",["utils","backbone","hbs!../../templates/event"],function(e,t,n){var i=t.View.extend({tagName:"div",className:"replace span7 overflow setheight",id:"event_view",height:0,initialize:function(){var e=this;app.session.on("change",function(){e.render()})},render:function(){this.model.get("location_point")&&app.map.add_marker(this.model.get("location_point").coordinates),this.edit=this.model.get("author")==app.session.get("username")?!0:!1,this.model.set("edit",this.edit,{silent:!0});var e=this.model.toJSON();return e.start_date=this.model.get("start_datetime").format("dddd, MMMM Do YYYY, h:mm:ss a"),e.end_date=this.model.get("end_datetime").format("dddd, MMMM Do YYYY, h:mm:ss a"),this.$el.html(n(e)),this}});return{EventView:i}});