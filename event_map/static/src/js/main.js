// Require.js allows us to configure shortcut alias
/*global require*/
require.config({
    hbs : {
        templateExtension : 'must',
        // if disableI18n is `true` it won't load locales and the i18n helper
        // won't work as well.
        disableI18n : true,
        helperDirectory : "../templates/helpers/"
    },

    paths: {
        "backbone": "../../components/backbone/backbone",
        "routefilter": "../../components/backbone.routefilter/dist/backbone.routefilter",
        "bootstrap": "../../components/bootstrap/js/bootstrap",
        "handlebars":"../../components/handlebars/handlebars",
        "hbs": "../../components/require-handlebars-plugin/hbs",
        "i18nprecompile": "../../components/require-handlebars-plugin/hbs/i18nprecompile",
        "json2": "../../components/require-handlebars-plugin/hbs/json2",
        "jquery": "../../components/jquery/jquery",
        "timeDatePicker": "../../components/jquery-timepicker-addon/jquery-ui-timepicker-addon",
        "jqueryui": "../../components/jqueryUI/js/jquery-ui-1.10.0.custom",
        "leaflet": "../../components/leaflet/dist/leaflet",
        "require": "../../components/require",
        "underscore": "../../components/underscore/underscore"
    },
    shim: {
        'underscore':{
             exports: '_'
        },
        'backbone': {
            //These script dependencies should be loaded before loading
            //backbone.js
            deps: ['underscore', 'jquery'],
            //Once loaded, use the global 'Backbone' as the
            //module value.
            exports: 'Backbone'
        },
        'routefilter': ['backbone'],
        'handlebars': {
            exports: 'Handlebars'
        },
        'bootstrap':['jquery'],
        'jqueryui': ['jquery'],
        'timeDatePicker':['jqueryui'],
        'leaflet':{
            exports:'L'
        }
    }
});
var app;
require([
  'underscore',
  'jquery',
  'backbone',
  'router', // Request router.js
  'utils',
  'routefilter',
  //>>includeStart("debug", pragmas.debug);
  'debug'
  //>>includeEnd("debug");
], function(_,$,Backbone, Router,Utils){
    "use strict";
    // add jquery plugins
    $(document).ajaxSend(function(event, xhr, settings) {
        if (!Utils.safeMethod(settings.type) && Utils.sameOrigin(settings.url)) {
            xhr.setRequestHeader("X-CSRFToken", Utils.getCookie('csrftoken'));
        }
    });
    $.fn.displayError = function(errors){
         //get the error message and display it
        var json = JSON.parse(errors),
        list = $("<ul />"),
        outer = $('<div class="span9 alert alert-error " ></div>'),
        closeB = $('<button type="button" class="close" data-dismiss="alert">&times;</button>'),
        fullHtml = list.before(closeB);
        outer.html(fullHtml);
        _.each(json.errors, function(error, key) {
            var list_item = $("<li  />", {
                text: error.message
            });
            list.append(list_item);
        });
        return this.html(outer).show('fast');
    };
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
                    calcSize(newText);
                    self.append("<br>");
                }
            } else {
                calcSize(orgText);
            }
        });
    };
    //redefine the almost useless toSting method
    Date.prototype.toString = Date.prototype.toJSON;

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
        var number = (typeof(num) != "undefined")?num:this.getMonth();
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
        var hours = this.getUTCHours(),
        minutes = this.getUTCMinutes(),
        orientation;
        if (minutes < 10){
            minutes = "0" + minutes;
        }
        if(hours > 11){
            orientation = "PM";
        } else {
            orientation = "AM";
        }
        hours = hours % 12;
        var time = hours + ":" + minutes + " "+orientation;
        return time;
    };

    Backbone.View.prototype.close = function() {
        if (this.onClose) {
            this.onClose();
        }
        this.remove();
        this.unbind();
        $(window).off('resize.'+this.cid);
    };

    app = new Router({});
    Backbone.history.start();
});
