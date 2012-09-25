var EventsListView = Backbone.View.extend({
    tagName: "div",
    className: "replace span4 overflow setheight",
    id: "EventsListView",
    height: 40,
    scrolltop:0,
    markers:[],
    numOfEventsToFetch:10,
    updateOffset:0,
    updateOffsetPastEvents:-10,
    moreEvents:true,
    morePastEvents:true,
    events: {
        "scroll":"onScroll",
        "click .event_item": "onClick"
    },
    initialize: function() {
         Swarm.group.clearLayers(); 
        //create the list item partail
        Handlebars.registerPartial("uli","<li id=\"event_{{id}}\" class=\"event_item\"><div>{{start_time }} - {{end_time }} <a href=\"#/event/{{ id }}\">{{ this.title }}</a></div></li>" );
        self = this;
        self.updateOffset = self.model.length;
        //bind
        $(window).on('resize', this.genarateColorsAndMonths);
        self.model.on('add', function(event) {
            self.onAdd(event);
        });
        //
        
       
        
        this.model.forEach(function(model,key) { 
            self.onAdd(model);
        });
        self.fetchMoreEvents(1);
        self.fetchMoreEvents(-1);
    },
    onAdd:function(model){
        var _start_date = new Date(model.get("start_date"));
        model.set("start_date",_start_date);
        var _end_date = new Date(model.get("end_date"));
        model.set("end_date",_end_date);
        //remove the spaces in time
        model.set("start_time",_start_date.getTimeCom().replace(/\s+/g, ""));
        model.set("end_time",_end_date.getTimeCom().replace(/\s+/g, ""));   
        //set map icons       
        var myIcon = L.divIcon({ 
            className:"icon", 
            html:'<div id=\'icon-'+model.get("id")+'\', style=\'color:#0000FF\'></div>',
            iconAnchor:[9, 20]
        });
        loca_p = model.get("location_point");
        var marker = L.marker([loca_p.coordinates[1],loca_p.coordinates[0]], {icon: myIcon});
        marker.bindPopup("<span>"+
            model.get("start_time")+"-"+
            model.get("end_time")+
            " "+model.get("title")+
            "</span>");
        //marker.setZIndexOffset(100);
        Swarm.group.addLayer(marker);
        this.markers[model.get("id")] = marker;
    },
    onClick:function(event){
        if($(event.currentTarget).hasClass("open")){
            $(event.currentTarget).removeClass("open");
            
            var id = event.currentTarget.id.replace(/event_/,"");
            var model = self.model.get(id);
            var day = model.get("start_date").getDate();
            var height = $("#day_"+day).height();
            $("#day_"+day).height(height - 20);
        }else{
            $(event.currentTarget).addClass("open"); 
            
            var id = event.currentTarget.id.replace(/event_/,"");
            var model = self.model.get(id);
            var day = model.get("start_date").getDate();
            var height = $("#day_"+day).height();
            $("#day_"+day).height(height + 20);
        }
    },
    render: function() {
        //clear the map layers
        var day = false;
        var per_day = false;
        var month = false;
        var per_month = false;
        //create array to generate month names
        var months = [];
        var month_count = 1;
        var days = [];
        var day_count = 1;
        var events = [];
        this.model.forEach(function(model,key) {
            //genrates the months ul
            if(model.get("start_date").getMonth() != month ){
                per_month = month;
                month = model.get("start_date").getMonth(); 
                if(per_month){
                    var height = month_count * this.height;
                    months.push({month:this.month2letter(per_month),height:height});
                }
                month_count = 0; 
            }
            //genreates the days ul
            if( model.get("start_date").getDate() != day){
                per_day = day;
                day = model.get("start_date").getDate();
                if(per_day){    
                    var height = day_count * this.height;
                    days.push({day:per_day,height:height});
                }
                day_count = 0;
            }
            //items in the ul
            events.push(model.toJSON());
            month_count++;
            day_count++;
        }, this);
        
        var height = (day_count-1) * this.height;
        days.push({day:day,height:height});
        
        height = (month_count -1) * this.height;
        months.push({month:this.month2letter(month),height:height});
        Swarm.group.addTo(Swarm.map);
        var html = Handlebars.loadedTemps["event_list_template"]({months:months,days:days, events:events, height: this.height});
        this.$el.html(html);
        return this;
    },
    fetchMoreEvents:function(time_switch){
        if(time_switch > 0){
            this.model.fetch({
                data: {
                    n:self.numOfEventsToFetch,
                    offset: self.updateOffset
                },
                add: true,
                success: function(evt, request) {
                    self.render();
                    $(window).resize();
                    self.updateOffset += self.numOfEventsToFetch;
                    if(request.length == 0){
                        self.moreEvents = false;    
                    }
                    //self.moreEvent
                }
            });        
        }else{
            this.model.fetch({
                data: {
                    n:self.numOfEventsToFetch,
                    offset:self.updateOffsetPastEvents
                },
                add: true,
                success: function(evt, request) {
                    //self.onAdd()
                    //self.render();
                    $(window).resize();
                    self.updateOffsetPastEvents -= self.numOfEventsToFetch;
                    if(request.length == 0){
                        self.morePastEvents = false;    
                    }
                    //self.moreEvent
                }
            });   
        }
    },

    onScroll: function(e) {
        //if at the bottom get more events
        if (self.moreEvents &&  (self.el.scrollHeight - self.$el.scrollTop() < (self.$el.outerHeight() + 2))) {
            self.fetchMoreEvents(1);
        }else if(self.morePastEvents && (self.$el.scrollTop() == 0)){
            self.fetchMoreEvents(-1);
        }        
        self.genarateColorsAndMonths();
        
    },
    genarateColorsAndMonths:function(){
        var tolerence = .2;
        var offset = self.$el.scrollTop() / self.height + tolerence;
        offset = Math.floor(offset); 

            if(self.$el.height() < $("#event_list").height()){
                var visbleHeight = self.$el.height();
            }else{
                //when there not enought events to scroll
                var visbleHeight = $("#event_list").height();
            }
        var numberOfEl = Math.ceil(visbleHeight / self.height);

        //set month on side bar
        _start_date = self.model.models[offset].get("start_date");
        month = _start_date.getMonth(); 
        $("#event_list_top_month").text(self.month2letter(month));
        //set day on side bar
        day = _start_date.getDate();
        $("#event_list_top_day").text(day);
        //set colors
        for (var i = offset; i < numberOfEl + offset; ++i) {
            //bring the maker to the front if it exist
            //sometimes it doesn't becauase numberOfEl uses ceil.
            var model = self.model.models[i];
            if(model){
                var H = ((i - offset) / numberOfEl) * 360;
                $($(".event_item")[i]).css("background-color", "hsl(" + H + ",100%, 50%)"); 
                $("#icon-"+model.get("id"))
                .html($('#svg svg').clone())
                .find(".svgForeground")
                .css("fill", "hsl(" + H + ",100%, 50%)");
                self.markers[model.get("id")].setZIndexOffset(1000);
  
            }
        } 
        //scolling down
        var onepast = offset-1;
        if($(".event_item")[onepast]){
            var model = self.model.models[onepast];
            $('#icon-'+model.get("id"))
            .find(".svgForeground")
            .css("stroke","grey")  
            .css("fill-opacity",0.4)
            .css("fill","grey");
            //zIndexOffset
            self.markers[model.get("id")].setZIndexOffset(-100);  
        }
        //scolling up
        var onefuture = numberOfEl + offset;
        if($(".event_item")[onefuture]){
            var model = self.model.models[onefuture];
            $('#icon-'+model.get("id"))
            .find(".svgForeground")
            .css("stroke","none")
            .css("fill-opacity",0.4)
            .css("fill","blue");    
            self.markers[model.get("id")].setZIndexOffset(-100);       
        }
        self.scrolltop = self.$el.scrollTop();
    },
    month2letter:function(num){
        var m_names = new Array("J", "F", "M", 
        "A", "M", "J", "J", "A", "S", 
        "O", "N", "D"); 
        
        return m_names[num];
    },
    beforeClose:function(){
        $(window).off('resize', this.genarateColorsAndMonths);
    }
});
