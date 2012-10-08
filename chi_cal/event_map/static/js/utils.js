(function( window ) {
	window.Utils = {};
	//other functions
	//load templates 
	//form to json.
	Utils.form2object = function(selector){
		result = {};
		formArray = $(selector).serializeArray();
		_.each(formArray,function(element){ 
				if(element.value != "csrfmiddlewaretoken") 
					result[element.name] = element.value; 
			} );
		return result;
	}
	//send the CSRFToken in the header. from django docs
	jQuery(document).ajaxSend(function(event, xhr, settings) {
		function getCookie(name) {
			var cookieValue = null;
			if (document.cookie && document.cookie != '') {
				var cookies = document.cookie.split(';');
				for (var i = 0; i < cookies.length; i++) {
					var cookie = jQuery.trim(cookies[i]);
					// Does this cookie string begin with the name we want?
					if (cookie.substring(0, name.length + 1) == (name + '=')) {
						cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
						break;
					}
				}
			}
			return cookieValue;
		}
		function sameOrigin(url) {
			// url could be relative or scheme relative or absolute
			var host = document.location.host; // host + port
			var protocol = document.location.protocol;
			var sr_origin = '//' + host;
			var origin = protocol + sr_origin;
			// Allow absolute or scheme relative URLs to same origin
			return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
				(url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
				// or any other URL that isn't scheme relative or absolute i.e relative.
				!(/^(\/\/|http:|https:).*/.test(url));
		}
		function safeMethod(method) {
			return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
		}

		if (!safeMethod(settings.type) && sameOrigin(settings.url)) {
			xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
		}
	});
})(this)

Utils.loadtemps = function(templates,callback){
		//initilze 
		Handlebars.loadedTemps = []
		var promises = [];
		_.each(templates,function(name,key, list){
			if(list.length -1 == key)
				 last = true;
			get = $.get("/static/"+"templates/" + name + ".must") ;

			get.done( function(data) {
				//ich.addTemplate(name + "_template", data);
				Handlebars.loadedTemps[name + "_template" ] =  Handlebars.compile(data);
				console.log(name);
			}, "html");
			promises.push(get);
		});
		//render stuff once the last template is loaded
		$.when.apply(this,promises).done(function(){
			console.log("Temps loaded");
			callback();
		});
	};

//common time
Date.prototype.getTimeCom = function(){
    var hours = this.getHours()
    var minutes = this.getMinutes()
    if (minutes < 10){
        minutes = "0" + minutes
    }
    var time = hours + ":" + minutes + " ";
    if(hours > 11){
        time += "PM";
    } else {
        time += "AM";
    }
    return time;
}

Handlebars.registerHelper('slice', function(context,options) {
    for (var prop in this) {
        if(typeof this[prop] === "string"){
            if(this[prop].length > context){
                this[prop] = this[prop].slice(0,context)+"...";
            }
        }
    }
  return options.fn(this);
});

