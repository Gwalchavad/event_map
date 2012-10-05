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
    position:{left:0,top:0},
    //anything before Wed Dec 31 1969 19:00:00 GMT-0500 (EST) will fuck up the system
    //book keeping to render varibles
    render_var:{ 
        per_current_date:{
            date:new Date(0),
            day_counter:0,
            month_counter:0
        },
        current_date:{
            date:new Date(0),
            day_counter:0,
            month_counter:0
        },
        
        day:new Date(0),
        per_day: false,
        month:false,
        per_month:false,
        year:false,
        //create array to generate month names
        month_count:1,
        day_count:1,
    },
    events: {
        "scroll":"onScroll",
        "click .event_item": "onClick",
        "mouseenter .event_item": "onMouseenter",
        "mouseleave .event_item": "onMouseleave"
    },
    initialize: function() {
        Swarm.group.clearLayers();
        self = this;
        self.updateOffset = self.model.length;
        //bind
        $(window).on('resize', this.onResize);
        self.model.on('add', function(event) {
            self.onAdd(event);
        });
        this.model.forEach(function(model,key) { 
            self.onAdd(model);
        });
        Swarm.map.on("popupclose",function(event){
            
            if(self.lastClickedMarkerEvent == event.popup._source.options.modelID ){
                self.eventItemClose(self.lastClickedMarkerEvent);
                self.lastClickedMarkerEvent = false;
            }
        })
        Swarm.group.addTo(Swarm.map);
        self.fetchMoreEvents(1);
        self.fetchMoreEvents(-1);
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
            iconAnchor:[9, 23],
            iconSize:[24, 30],
            popupAnchor:[4,-10]
        });
        loca_p = model.get("location_point");
        var marker = L.marker(
            [loca_p.coordinates[1],loca_p.coordinates[0]], 
            {icon: myIcon, modelID:model.get("id")}
        );
        marker.bindPopup("<span>"+
            "<h3>"+ model.get("title")+"</h3>"+
            model.get("start_time")+"-"+
            model.get("end_time")+
            "</span>");
        //marker.setZIndexOffset(100);
        Swarm.group.addLayer(marker);
        
        marker.on("click",self.onMarkerClick);
        this.markers[model.get("id")] = marker;
    },
    onMarkerClick:function(e){
        if(self.lastClickedMarkerEvent ){
            self.eventItemClose(self.lastClickedMarkerEvent);
        }
        self.lastClickedMarkerEvent = e.target.options.modelID;
        //come after the closing the last event
        if(!$(event.currentTarget).hasClass("open")){
            if(!$(event.currentTarget).hasClass("viewing")){
                //$("#event_53").position().top()
                scrollTop(value);
            }
            self.eventItemOpen(self.lastClickedMarkerEvent);
        }
    },
    onClick:function(event){
        var id = event.currentTarget.id.replace(/event_/,"");
        
        if($(event.currentTarget).hasClass("open")){
            self.eventItemClose(id);
            $(self.markers[id]._icon).find(".circleMarker").hide();
            $(self.markers[id]._icon)
            .find(".layer1")
            .attr("transform","scale(1)");
           
            self.markers[id].closePopup();
        }else{
            
            self.eventItemOpen(id);
            //open maker
            self.markers[id].openPopup();
            $(self.markers[id]._icon).find(".circleMarker").show();
            $(self.markers[id]._icon)
            .find(".layer1")
            .attr("transform","scale(1.2) translate(-1, -3)");
           
        }
    },
    onMouseenter:function(target){
        //test = $("#layer1")
        //test.attr("transform","scale(1.4)")
        if(!$(target.currentTarget).hasClass("open")){
            var id = target.currentTarget.id.replace(/event_/,"");
            var g = $("#icon-"+id).find(".layer1");
            g.attr("transform","scale(1.2) translate(-1, -3)");
        }
        
    },
    onMouseleave:function(target){
        if(!$(target.currentTarget).hasClass("open")){
            var id = target.currentTarget.id.replace(/event_/,"");
            var g = $("#icon-"+id).find(".layer1");
            g.attr("transform","scale(1)");
        }
    },
    eventItemOpen:function(id){
        var model = self.model.get(id);
        $("#event_"+id).addClass("open"); 
        $("#event_"+id).height(self.height+26);
        $("#event_"+id).find(".list_item_container").html(
            Handlebars.loadedTemps["item_open_template"](model.toJSON())
        );  
            //set day height
        var day = model.get("start_date").getDate();
        var height = $("#day_"+day).height();
        $("#day_"+day).height(height + 26);
        //set month
        var month = model.get("start_date").getMonth();
        month = this.month2letter(month);
        height = $("#month_"+month).height();
        $("#month_"+month).height(height+26);        
    },
    eventItemClose:function(id){        
        $("#event_"+id).removeClass("open");
        $("#event_"+id).height(self.height);
        //get model of item thata was clicked 
        var model = self.model.get(id);
        //set day height
        var day = model.get("start_date").getDate();
        var height = $("#day_"+day+"_").height();
        $("#day_"+day).height(height - 26);
        //set month
        var month = model.get("start_date").getMonth();
        month = this.month2letter(month);
        height = $("#month_"+month).height();
         $("#month_"+month).height(height-26);
        
        $("#event_"+id).find(".list_item_container").html(
            Handlebars.loadedTemps["item_closed_template"](model.toJSON())
        );         
    },
    onResize: function(){
        self.position.left = $("#event_list").position().left; 
        self.position.top = $("#EventsListView").position().top; 
        self.genarateColorsAndMonths(true);
    },
    onDOMadd:function(){
        self.onResize();
    },
    onClose:function(){
        $(window).off('resize', this.onResize);
    },
    render: function(){
        //anything before Wed Dec 31 1969 19:00:00 GMT-0500 (EST) will fuck up the system

        self.render_var.day = new Date(0);
        self.render_var.per_day  =  false;
        self.render_var.month= false;
        self.render_var.per_month =false;
        //create array to generate month names
        self.render_var.month_count = 1;
        self.render_var.day_count= 1;
        //create array to generate month names
        var months = [];
        var days = [];
        var events = [];
        this.model.forEach(function(model,key) {
            //genrates the months ul
            if(model.get("start_date").getMonth() != self.render_var.month ){
                self.render_var.per_month = self.render_var.month;
                self.render_var.month = model.get("start_date").getMonth(); 
                if(self.render_var.per_month){
                    var height = self.render_var.month_count * self.height;
                    months.push({month:this.month2letter(self.render_var.per_month),height:height});
                }
                self.render_var.month_count = 0; 
            }
            //genreates the days ul
            if(model.get("start_date").getDate() != self.render_var.day.getDate()){
                self.render_var.per_day = self.render_var.day;
                self.render_var.day = model.get("start_date");
                if(self.render_var.per_day.toISOString()  != (new Date(0)).toISOString()){    
                    var height = self.render_var.day_count * this.height;
                    days.push({
                        day:self.render_var.per_day.getDate(), 
                        month:self.render_var.per_day.getMonth(), 
                        height:height});
                }
                self.render_var.day_count = 0;
            }
            
            //items in the ul
            events.push(model.toJSON());
            self.render_var.month_count++;
            self.render_var.day_count++;
        }, this);
        
        var height = (self.render_var.day_count) * this.height;
        days.push({day:self.render_var.day.getDate(),month:self.render_var.day.getMonth(),height:height});
        height = (self.render_var.month_count) * this.height;
        months.push({month:this.month2letter(self.render_var.month),height:height});
        Swarm.group.addTo(Swarm.map);
        var html = Handlebars.loadedTemps["event_list_template"]({months:months,days:days, events:events, height: this.height});
        this.$el.html(html);
        return this;
    },
    render2:function(eventModels, prepend){
        //if no events are past assume we are rerending
        if(!eventModels){
           eventModels = this.model; 
        }
        
        if(prepend){
            var current_date = self.render_var.per_current_date;
        }else{
            var current_date = self.render_var.current_date;
        }
        var months = [];
        var days = [];
        
        eventModels.forEach(function(event,key) {
            //check year
            if(event.get("start_date").getFullYear() != current_date.date.getFullYear() ||
               event.get("start_date").getMonth() != current_date.date.getMonth()
            ){
                current_date.date =  event.get("start_date");
                //check to see if there is a first el
                if(_.last(days)){
                     _.last(days).height = self.render_var.month_count * self.height;
                    if(_.last(months)){
                        _.last(months).height = self.render_var.month_count * self.height;
                    }
                }
                months.push({
                    month:this.month2letter(current_date.date.get("start_date").getMonth())
                });
                days.push({
                        day:current_date.date .getDate(), 
                        month:current_date.date.getMonth(), 
                });
                current_date.month_count = 0; 
                current_date.day_count = 0;
            }else if(event.get("start_date").getDate() != current_date.date.getDate()){
                //genreates the days ul
                current_date.date = event.get("start_date");
                if(_.last(days)){
                     _.last(days).height = self.render_var.month_count * self.height;
                }
                days.push({
                        day:current_date.date.getDate(), 
                        month:current_date.date.getMonth(), 
                });
                current_date.day_count = 0;
            }
            
            //items in the ul
            events.push(event.toJSON());
            current_date.day_count++;
            current_date.month_count++;
        }, this);
        
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
                    self.genarateColorsAndMonths(true);
                    self.updateOffset += self.numOfEventsToFetch;
                    if(request.length == 0){
                        self.moreEvents = false;    
                    }
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
                    self.render();
                    //remove later
                    self.genarateColorsAndMonths(true);
                    self.updateOffsetPastEvents -= self.numOfEventsToFetch;
                    if(request.length == 0){
                        self.morePastEvents = false;    
                    }
                }
            });   
        }
    },
    genarateColorsAndMonths:function(regenrate){
        var topVisbleEl = document.elementFromPoint(  self.position.left,  self.position.top+10);
        //have we moved enought to change colors?
        if(self.topVisbleEl !=topVisbleEl || regenrate){
            self.topVisbleEl = topVisbleEl;
            //set map icons that are not in the current view
            var bottomVisbleEl = document.elementFromPoint( 
                self.position.left, 
                self.position.top+$("#EventsListView").height()-20
            );
            var topIndex = $("#event_list").children().index(topVisbleEl);            
            var bottomIndex = $("#event_list").children().index(bottomVisbleEl);
            var numberOfEl = bottomIndex - topIndex+1;
            //set month on side bar
            _start_date = self.model.models[topIndex].get("start_date");
            month = _start_date.getMonth(); 
            $("#event_list_top_month").text(self.month2letter(month));
            //set day on side bar
            day = _start_date.getDate();
            $("#event_list_top_day").text(day);
            
            //zIndexOffset 
            $(".viewed").removeClass("viewing");           
            $(".viewed").each(function(index,el){
                var id = el.id.replace(/icon-/,"");
                var model = self.model.get(id);
                if(model.get("start_date") < _start_date ){
                    H = 0;
                }else{
                    H = (numberOfEl-1 / numberOfEl) * 360; 
                }
                
                $(el).find(".svgForeground")
                .css("stroke","grey")  
                .css("fill-opacity",0.4)
                .css("fill", "hsl(" + H + ",100%, 50%)");
                
                self.markers[id].setZIndexOffset(-100);
            });            
            //add color
            for(var i= topIndex; i <= bottomIndex; ++i){
                var model = self.model.models[i];
                var H = ((i-topIndex) / numberOfEl) * 360;
                $($(".event_item")[i]).css("background-color", "hsl(" + H + ",100%, 50%)"); 
                
                if(!$("#icon-"+model.get("id")).hasClass("viewed")){
                    $("#icon-"+model.get("id"))
                    .html($('#svg svg').clone());
                }
                
                $("#icon-"+model.get("id"))
                    .addClass("viewed")
                    .addClass("viewing")
                    .find(".svgForeground")
                    .css("fill", "hsl(" + H + ",100%, 50%)")
                    .css("fill-opacity",1)
                    .css("stroke","black");
                self.markers[model.get("id")].setZIndexOffset(1000);
            }
        }
    },
    month2letter:function(num){
        var m_names = new Array("J", "F", "M", 
        "A", "M", "J", "J", "A", "S", 
        "O", "N", "D"); 
        
        return m_names[num];
    }
});
