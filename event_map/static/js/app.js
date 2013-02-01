/*global define*/
var app;
define([
  'underscore',
  'backbone',
  'router', // Request router.js
  'routefilter',
  'debug'
], function(_,Backbone, Router){
    "use strict";
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
    };
    var initialize = function(options){
        app = new Router({
            map: options
        });
        Backbone.history.start();
    };
    return {
       initialize: initialize
    };
});
