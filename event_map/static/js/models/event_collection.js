window.EventCollection = Backbone.Collection.extend({
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
        $.extend(true,this._attributes,this.defaults);
        if(models && models.length != 0){
            //this assumes that incoming initail models are in order
            this._attributes.data = {start:models[0].attributes.start_date.toJSON()};
            this._attributes.futureEvents.updateOffset = models.length;
        }
        if(options)
            $.extend(true,this._attributes,options);
        this.on("reset",function(models){
            $.extend(true,this._attributes,this.defaults);
            this._attributes.futureEvents.updateOffset = models.length;
        });
    },
    comparator: function(event) {
      return event.get("start_date").getTime() + 1/event.get("id");
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
