define([
   'jquery',
   'underscore',
   'handlebars' 
  // Load our app module and pass it to our definition function
], function($,_,handlebars){
    //other functions
    //load templates 
    //send the CSRFToken in the header. from django docs
    $(document).ajaxSend(function(event, xhr, settings) {
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

    $.fn.textfill = function(maxFontSize, maxWords) {
        /*
         * TEXT FILL
         * Resizes the font of text in an inner element so that it fills as much space as possible in the outer element.
         * By marcus ekwall http://stackoverflow.com/users/358556/marcus-ekwall
         * Fount At http://jsfiddle.net/mekwall/fNyHs/
         */
        maxFontSize = parseInt(maxFontSize, 10);
        maxWords = parseInt(maxWords, 10) || 3;
        return this.each(function(){
            var self = $(this),
                orgText = self.text(),
                fontSize = parseInt(self.css("fontSize"), 10),
                lineHeight = parseInt(self.css("lineHeight"), 10),
                maxHeight = self.height(),
                maxWidth = self.width(),
                words = self.text().split(" ");
            
            function calcSize(text) {
                var ourText = $("<span>"+text+"</span>").appendTo(self),
                    multiplier = maxWidth/ourText.width(),
                    newSize = fontSize*(multiplier-0.1);
                ourText.css(
                    "fontSize", 
                    (maxFontSize > 0 && newSize > maxFontSize) ? 
                        maxFontSize : 
                        newSize
                );
                var scrollHeight = self[0].scrollHeight;
                if (scrollHeight  > maxHeight) {
                    multiplier = maxHeight/scrollHeight;
                    newSize = (newSize*multiplier);
                    ourText.css(
                        "fontSize", 
                        (maxFontSize > 0 && newSize > maxFontSize) ? 
                            maxFontSize : 
                            newSize
                    );
                }
            }
            self.empty();
            if (words.length > maxWords) {
                while (words.length > 0) {
                    var newText = words.splice(0, maxWords).join(" ");
                    console.log
                    calcSize(newText);
                    self.append("<br>");
                }
            } else {
                calcSize(orgText);
            }
        });
    };

    var form2object = function(selector){
        /*
         * Form 2 Object: takes a select of a form and returns the contents
         * of the form in an object
         */
        result = {};
        formArray = $(selector).serializeArray();
        _.each(formArray,function(element){ 
                if(element.value != "csrfmiddlewaretoken") 
                    result[element.name] = element.value; 
            } );
        return result;
    };

    var updateURLParameter = function(url, param, paramVal){
        /*
        * http://stackoverflow.com/a/10997390/11236
        */
        var newAdditionalURL = "";
        var tempArray = url.split("?");
        var baseURL = tempArray[0];
        var additionalURL = tempArray[1];
        var temp = "";
        if (additionalURL) {
            tempArray = additionalURL.split("&");
            for (i=0; i<tempArray.length; i++){
                if(tempArray[i].split('=')[0] != param){
                    newAdditionalURL += temp + tempArray[i];
                    temp = "&";
                }
            }
        }

        var rows_txt = temp + "" + param + "=" + paramVal;
        return baseURL + "?" + newAdditionalURL + rows_txt;
    }
    
    Date.prototype.getWeekdayName = function(){
        /*
         * give a weekday num return a weekday abervation
         */
        var weekday=new Array(7);
        weekday[0]="Sun";
        weekday[1]="Mon";
        weekday[2]="Tue";
        weekday[3]="Wed";
        weekday[4]="Thu";
        weekday[5]="Fri";
        weekday[6]="Sat";
        return weekday[this.getUTCDay()];    
    };
    Date.prototype.month2letter = function(num) {
        /*
         * Given a month letter (0-11) return the month letter
         */
        var number = (typeof(num) != "undefined")?num:this.getMonth()
        var m_names = new Array("J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D");
        return m_names[number];
    };
    Date.prototype.getDateWithSlash = function(){
        /*
         *  retruns a date in the format m/d/y
         */
        return  this.getUTCMonth()+1+"/"+this.getUTCDate()+"/"+this.getUTCFullYear();
    };
    Date.prototype.getDateShort = function(){
        return  this.getUTCMonth()+"/"+this.getUTCDate();
    };

    Date.prototype.getTimeCom = function(){
        /*
         * retruns time with AM or PM attched
         */
        var hours = this.getUTCHours()
        var minutes = this.getUTCMinutes()
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
    return {
        form2object:form2object,
        updateURLParameter:updateURLParameter
    };
});


