define([
   'underscore',
   'handlebars' 
  // Load our app module and pass it to our definition function
], function(_,handlebars){

    handlebars.registerHelper('slice', function(context,options) {
        for (var prop in this) {
            if(typeof this[prop] === "string"){
                if(this[prop].length > context){
                    this[prop] = this[prop].slice(0,context)+"...";
                }
            }
        }
      return options.fn(this);
    });    
    //other functions
    //load templates 
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
    //form to json.
    var form2object = function(selector){
        result = {};
        formArray = $(selector).serializeArray();
        _.each(formArray,function(element){ 
                if(element.value != "csrfmiddlewaretoken") 
                    result[element.name] = element.value; 
            } );
        return result;
    };
    //common time
    Date.prototype.getTimeCom = function(){
        var hours = this.getHours()
        var minutes = this.getMinutes()
        if (minutes < 10){
            minutes = "0" + minutes
        }
        if(hours > 11){
            var orientation = "PM";
        } else {
            var orientation = "AM";
        }
        hours = hours % 12; 
        var time = hours + ":" + minutes + " "+orientation;
        return time;
    };
    Date.prototype.getWeekdayName = function(){
        var weekday=new Array(7);
        weekday[0]="Sun";
        weekday[1]="Mon";
        weekday[2]="Tue";
        weekday[3]="Wed";
        weekday[4]="Thu";
        weekday[5]="Fri";
        weekday[6]="Sat";
        return weekday[this.getDay()];    
    };
    Date.prototype.month2letter = function(num) {
        var number = num?num:this.getMonth()
        var m_names = new Array("J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D");
        return m_names[number];
    };
    Date.prototype.getDateWithSlash = function(){
        return  this.getMonth()+"/"+this.getDate()+"/"+this.getFullYear();
    }
    Date.prototype.getDateShort = function(){
        return  this.getMonth()+"/"+this.getDate();
    }   
    return {
        form2object:form2object
    };
});


