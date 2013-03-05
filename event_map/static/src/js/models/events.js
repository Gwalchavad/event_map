/*global define*/
define([
    'underscore',
    'backbone',
    'jquery',
    'moment'
],function (_,Backbone,$,moment){
    "use strict";
    var Event = Backbone.Model.extend({
        /*
         * The backbone model for an event
         */
        urlRoot: "/api/event",
        idAttribute: "slug",
        defaults: {
            title:"",
            start_date:"",
            end_date:"",
            organization:"",
            user:"",
            city:"",
            location:"",
            location_point:""
        },
        initialize: function () {
            /*
             * Backbone Init
             */
            this.on("change:start_date",this.computeStartTimes);
            this.on("change:end_date",this.computeEndTimes);
            if(this.get("start_date")){
                this.computeStartTimes();
                this.computeEndTimes();
                this.computeCloseValues();
                this.computeOpenValues();
            }
        },
        computeStartTimes:function(){
            /*
             * Turns the time into a javascipt object "start_datetime" in the original time
             * And Creates an nice looking version of time to be displayed
             */
            var start_datetime_tz = moment(this.get("start_date")),
            start_datetime = moment(this.get("start_date").substring(0,19));
            this.set("start_datetime", start_datetime);
            this.set("start_datetime_tz", start_datetime_tz);
        },
        computeEndTimes:function(){
            /*
             * does the same thing as `computeStartTimes` except for the end times
             */
            var end_datetime_tz = moment(this.get("end_date")),
            end_datetime = moment(this.get("end_date").substring(0,19));
            this.set("end_datetime", end_datetime);
            this.set("end_datetime_tz", end_datetime_tz);
        },
        computeCloseValues:function(){
            /*
             * the lenght the title is on the list when the event is closed
             */
            var trimmedTitleLength = 42;
            if(this.get("title").length > trimmedTitleLength){
                this.set("titleClose",this.get("title").slice(0,trimmedTitleLength)+"...");
            }else{
                this.set("titleClose",this.get("title"));
            }
        },
        computeOpenValues:function(){
            /*
             * the length of the content and the title when a event on the list is open
             */
            var trimmedTitleContentLength = 58;
            //for item open,
            if(this.get("title").length > trimmedTitleContentLength){
                this.set("titleOpen",this.get("title").slice(0,trimmedTitleContentLength)+"...");
            }else{
                this.set("titleOpen",this.get("title"));
                var contentLength = this.get("title").length + this.get("content").length + 3;
                if(contentLength > trimmedTitleContentLength){
                    var newLength =  trimmedTitleContentLength - this.get("title").length - 3;
                    this.set("contentOpen",this.get("content").slice(0,newLength)+"...");
                }else{
                    this.set("contentOpen",this.get("content"));
                }
            }
        },
        validate: function(attrs,options) {
            /*
             *  Backbone validation for the event model
             */
            var errors = {};
            if (!attrs.title) {
               errors.title= "please enter a title";
            }
            if (!attrs.start_date) {
               errors.start_date= "please enter a start date";
            }
            if(options.isComplete){
                if (!attrs.end_date) {
                   errors.end_date= "please enter an end date";
                }
                if(!attrs.content){
                    errors.content = "remind me agian, why should should I come?";
                }
                if(!attrs.address){
                    errors.address =  "where is this event at?";
                }
                if(!attrs.lat || !attrs.lng){
                    errors.latlng = "drag the maker somewhere";
                }
            }
            //count keys
            if(Object.keys(errors).length > 0){
                return errors;
            }
        }
    });

    var EventCollection = Backbone.Collection.extend({
        /*
         * Backbone collection for a list of events
         */
        model: Event,
        defaults:{
            futureEvents:{
                numOfEventsToFetch:20,
                more:true,
                updateOffset:0
            },
            pastEvents:{
                numOfEventsToFetch: -20,
                more:true,
                updateOffset: -20
            }
        },
        url: "/api/events",
        initialize: function (models,options) {
            this._attributes = {};
            this._attributes.modified = (new Date()).toISOString();
            $.extend(true,this._attributes,this.defaults);
            if(options){
                $.extend(true,this._attributes,options);
            }
            this.on("reset",function(){
                if(this.models && this.models.length){
                    //this assumes that incoming initail models are in order
                    this.attr("data",{start:this.models[0].attributes.start_datetime.toJSON()});
                    var fe =  this.attr("futureEvents");
                    fe.updateOffset = this.models.length;
                    this.attr("futureEvents",fe);
                    var pe = this.attr("pastEvents");
                    pe.updateOffset -= 1;
                    this.attr("pastEvents",pe);
                }
            });
            this.trigger("reset");
        },
        comparator: function(event) {
            /*
             *  backbone comparator. Sorts events by date and by 1/id to
             * garentee that events with the same date will be in the same order
             */
            return event.get("start_datetime").unix();
        },
        /*
         *A binary search, search for a needle on a given field
         *return and index if the needle is found
         *-1 if the needle is above
         *-2 if the needle is below
         */
        binarySearch:  function(needle, field) {
            var high = this.models.length - 1;
            var low = 0;
            var haystack = this.models;
            var mid;
            var element;
            while (low <= high) {
                mid = parseInt((low + high) / 2,10);
                element = haystack[mid].get(field);
                if (element > needle) {
                    high = mid - 1;
                } else if (element < needle) {
                    low = mid + 1;
                } else {
                    return mid;
                }
            }
            //if below
            if (high === -1){
                return -2;
            }else if (low >  this.models.length -1){
                return -1;
            }else if(haystack[low].get(field) > haystack[high].get(field) ){
                return low;
            }else{
                return high;
            }
        },
        attr: function(prop, value) {
            //Setting attributes on a collection
            //http://stackoverflow.com/questions/5930656/setting-attributes-on-a-collection-backbone-js
            if (value === undefined) {
                return this._attributes[prop];
            } else {
                this._attributes[prop] = value;
            }
        },
        update_modified:function(callback){
            /*
             * Ask the server to see if any new events where posted
             * since the "modified" attribute
             */
            var self = this;
            var data = {
                offset:this._attributes.pastEvents.updateOffset,
                n:Math.abs(this._attributes.pastEvents.updateOffset) + this._attributes.futureEvents.updateOffset,
                modified: this._attributes.modified
            };

            this.fetch({
                update: true,
                remove: false,
                success:function(evt, request){
                    if(callback){
                        var events=request.map(function(event){
                            event = new Event(event);
                            return event;
                        });
                        callback(events);
                    }
                    self._attributes.modified = (new Date()).toISOString();
                }
            });
        },
        ffetch:function(options){
            /*
             * Forward Fecth get events going forward in time
             */
            options.forward = true;
            this._fetch(options);
        },
        rfetch: function(options){
            /*
             *  Revese Fetch: get events going backward in time
             */
            options.forward = false;
            this._fetch(options);
        },
        _fetch:function(options){
            /*
             * Fetch get events
             * options.forward: bool, detemines with we a fecthing goin
             * forward in time or reverse
             */
            options = options ? options : {};
            var self = this,
            direction;
            if(typeof options.forward === "undefined" || options.forward){
                direction  = "futureEvents";
            }else{
                direction  = "pastEvents";
            }
            var successCallback = function(evt, request) {
                var eventSettings = self.attr(direction);
                if (request.length < Math.abs(eventSettings.numOfEventsToFetch)){
                    eventSettings.more = false;
                }
                self.attr(direction,eventSettings);
                if(request.length){
                    var events=request.map(function(event){
                        event = new Event(event);
                        return event;
                    });

                    if(options.successCallback)
                        options.successCallback(events);
                }
            };
            if(this.attr(direction).more){
                var eventSettings = this.attr(direction);
                var data = {
                    n: Math.abs(eventSettings.numOfEventsToFetch),
                    offset: eventSettings.updateOffset
                };
                eventSettings.updateOffset += eventSettings.numOfEventsToFetch;
                this.attr(direction,eventSettings);

                if(this.attr("data"))
                    _.extend(data, this.attr("data"));

                this.fetch({
                    update: true,
                    remove: false,
                    data:data,
                    add: true,
                    success: successCallback,
                    error: options.fail_callback
                });
            }
        }
    });
    return {
        Event:Event,
        EventCollection:EventCollection
    };
});
