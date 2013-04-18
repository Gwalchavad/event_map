define(["jquery","backbone","utils","jade!../../templates/ical_upload"],function(e,t,i,s){function n(e,t){var s=new XMLHttpRequest;s.upload.addEventListener("loadstart",r,!1),s.upload.addEventListener("progress",a,!1),s.addEventListener("readystatechange",o,!1),s.open("POST",t,!0),s.setRequestHeader("x-csrftoken",i.getCookie("csrftoken")),s.send(e)}function r(){e("#upload-status").html("Upload started!")}function a(t){var i=100*(t.loaded/t.total);e("#progress").html("Progress: "+i+"%")}function o(t){var i=null;try{i=t.target.status}catch(s){return}if(4===t.currentTarget.readyState)if("200"==i&&t.target.responseText){var n=JSON.parse(t.target.responseText);n.length>0?(app.eventList.add(n),1===n.length?app.navigate("event/"+n[0].slug+"/edit",{trigger:!0}):(app.recentEvents=n,app.navigate("added",{trigger:!0}))):alert("no events added!")}else e("#upload_event_error").displayError(t.target.responseText)}var l=t.View.extend({tagName:"div",className:"replace span7 overflow setheight",id:"event_view",initialize:function(){var e=this;app.session.on("change",function(){e.render()})},events:{"click #upload_event":"upload_event","click #import_url":"import_url"},onDOMadd:function(){i.supportAjaxUploadWithProgress()&&(this.useAjax=!0)},render:function(){return this.$el.html(s()),this},upload_event:function(e){if(this.useAjax){e.preventDefault();for(var t=new FormData,i="/upload",s=document.getElementById("file-id"),r=s.files,a=0;r.length>a;a++)t.append("file"+a,r[a]);n(t,i)}},import_url:function(e){if(this.useAjax){e.preventDefault();var t=document.getElementById("form-import"),i=new FormData(t),s="/import";n(i,s)}}});return l});