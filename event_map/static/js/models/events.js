define([
    'underscore',
    'backbone'
],function (_,Backbone,Models){
    
    var Event = Backbone.Model.extend({
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
            this.on("change:start_date",this.computeStartTimes);
            this.on("change:end_date",this.computeEndTimes);
            this.computeStartTimes();
            this.computeEndTimes();
        },
        computeStartTimes:function(){
            var _start_date = new Date(this.get("start_date"));
            this.set("_start_date", _start_date);
            this.set("start_time", _start_date.getTimeCom().replace(/\s+/g, ""));      
        },
        computeEndTimes:function(){
            var _end_date = new Date(this.get("end_date"));
            this.set("_end_date", _end_date);
            this.set("end_time", _end_date.getTimeCom().replace(/\s+/g, "")); 
        },
        computeCloseValues:function(){
            //the lenght the title is on the list when the event is closed
            var trimmedTitleLength = 42;
            if(this.get("title").length > trimmedTitleLength){
                this.set("titleClose",this.get("title").slice(0,trimmedTitleLength)+"...");
            }else{
                this.set("titleClose",this.get("title"));
            }
        },
        computeOpenValues:function(){
            //the length of the content and the title when a event on the list is open
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
        validate: function(attrs) {
            var errors = new Object();
            if (attrs.title == "" ) {
               errors['title']= "please enter a title";
            }
            if (attrs.start_date == "" ) {
               errors['start_date']= "please enter a start date";
            }
            if (attrs.end_date == "" ) {
               errors['end_date']= "please enter an end date";
            }
            if(attrs.content == ""){
                errors['content'] = "remind me agian, why should should I come?";
            }
            if(attrs.street == ""){
                errors['location'] =  "where's the party at bro?";
            }
            if(attrs.lat == "" || attrs.lng == ""  ){
                errors['latlng'] = "drag the maker somewhere";
            }
            //count keys
            if(Object.keys(errors).length > 0){
                return errors;
            }
        }
    });
    var EventCollection = Backbone.Collection.extend({
        model: Event,
        defaults:{
            futureEvents:{
                numOfEventsToFetch:10,
                more:true,
                updateOffset:10
            },
            pastEvents:{
                numOfEventsToFetch:-10,
                more:true,
                updateOffset:-10
            },
        },
        url: "/api/events",
        initialize: function (models,options) {
            this._attributes = {};
            this.lock = false;
            this._attributes.modified = new Date();
            $.extend(true,this._attributes,this.defaults);
            if(models && models.length != 0){
                //this assumes that incoming initail models are in order
                this._attributes.data = {start:models[0].attributes._start_date.toJSON()};
                this._attributes.futureEvents.updateOffset = models.length;
            }
            if(options)
                $.extend(true,this._attributes,options);
            this.on("reset",function(models){
                $.extend(true,this._attributes,this.defaults);
                this._attributes.futureEvents.updateOffset = models.length;
            });
        },
        //oder by UNIX time stamp and ID fraction
        comparator: function(event) {
          return event.get("_start_date").getTime() + 1/event.get("id");
        },
        //Setting attributes on a collection
        //http://stackoverflow.com/questions/5930656/setting-attributes-on-a-collection-backbone-js  
        attr: function(prop, value) {
            if (value === undefined) {
                return this._attributes[prop]
            } else {
                this._attributes[prop] = value;
            }
        },
        update:function(callback){
            var self = this;
            data = {
                offset:this._attributes.pastEvents.updateOffset,
                n:Math.abs(this._attributes.pastEvents.updateOffset) + this._attributes.futureEvents.updateOffset,
                modified: this._attributes.modified.toJSON()
            };
            
            this.fetch({
                data:data,
                add: true,
                success:function(evt, request){
                    if(callback){ 
                        events=request.map(function(event){
                            event = new Event(event);
                            return event;
                        });  
                        callback(events);
                    }
                    self._attributes.modified = new Date();                   
                }
            });
        },
        //forward fetch
        ffetch:function(options){
            options.forward = true;
            this._fetch(options);
        },
        //reverse fetch
        rfetch: function(options){
            options.forward = false;
            this._fetch(options);
        },
        _fetch:function(options){
            var options = options ? _.clone(options) : {};
            var self = this;
            if(typeof options.forward === "undefined" || options.forward){
                var eventSettings = this._attributes.futureEvents;
            }else{
                var eventSettings = this._attributes.pastEvents;
            }
            var successCallback = function(evt, request) {
                if(request.length != 0){
                    events=request.map(function(event){
                        event = new Event(event);
                        return event;
                    });      
                    eventSettings.updateOffset += eventSettings.numOfEventsToFetch;  
                    if(options.successCallback)
                        options.successCallback(events);
                }
                if (request.length < Math.abs(eventSettings.numOfEventsToFetch)){
                    eventSettings.more = false;
                }
                self.lock  = false;
            };
            if(eventSettings.more && !this.lock){
                data = {
                    n: Math.abs(eventSettings.numOfEventsToFetch),
                    offset: eventSettings.updateOffset,
                };
                if(this._attributes.data)
                    _.extend(data, this._attributes.data);              
                
                if(options.data)
                    _.extend(data, options.data);
                
                this.lock  =true;
                this.fetch({
                    data:data,
                    add: true,
                    success: successCallback
                });
            }        
        }
    });

    return {
        Event:Event,
        EventCollection:EventCollection
    }
});
