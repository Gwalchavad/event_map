var EventsListView = Backbone.View.extend({
    tagName: "div",
    className: "span4",
    id: "",
    height: 40,
    scrolltop: 0,
    markers: [],
    numberOfIntEvents:10,
    position: {
        left: 0,
        top: 0
    },
    //anything before Wed Dec 31 1969 19:00:00 GMT-0500 (EST) will fuck up the system
    //book keeping to render varibles
    render_var: {
        pre_current_date: {
            date: new Date()
        },
        current_date: {
            date: new Date()
        },
    },
    events: {

        "click .event_item": "onClick",
        "mouseenter .event_item": "onMouseenter",
        "mouseleave .event_item": "onMouseleave",
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
        this.model.forEach(function(model, key) {
            self.onAdd(model);
        });
        Swarm.map.on("popupclose", function(event) {
            if (self.lastClickedMarkerEvent == event.popup._source.options.modelID) {
                self.eventItemClose(self.lastClickedMarkerEvent);
                self.lastClickedMarkerEvent = false;
            }
        });
        Swarm.map.on("popupopen", function(event) {
            $(event.popup._source._icon).find(".circleMarker").show();
            $(event.popup._source._icon ).find(".layer1").attr("transform", "scale(1.2) translate(-1, -3)");
        });
        Swarm.group.addTo(Swarm.map);
        self.fetchMoreEvents(true);
        self.fetchMoreEvents();  
    },
    onScroll: function(e) {
        //if at the bottom get more events
        if ($("#EventsListView")[0].scrollHeight - $("#EventsListView").scrollTop() < ($("#EventsListView").outerHeight() + 2)) {
            self.fetchMoreEvents();
        } else if ($("#EventsListView").scrollTop() == 0){
            self.fetchMoreEvents(true);
        }
        self.genarateColorsAndMonths();
    },
    onAdd: function(model) {
        model.computeCloseValues();
        model.computeOpenValues();
        //set map icons       
        var myIcon = L.divIcon({
            className: "icon",
            html: '<div id=\'icon-' + model.get("id") + '\'></div>',
            iconAnchor: [9, 23],
            iconSize: [24, 30],
            popupAnchor: [4, - 10]
        });
        loca_p = model.get("location_point");
        var marker = L.marker(
        [loca_p.coordinates[1], loca_p.coordinates[0]], {
            icon: myIcon,
            modelID: model.get("id")
        });
        marker.bindPopup("<span>" + "<h3>" + model.get("title") + "</h3>" + model.get("start_time") + "-" + model.get("end_time") + "</span>");
        //marker.setZIndexOffset(100);
        Swarm.group.addLayer(marker);

        marker.on("click", self.onMarkerClick);
        this.markers[model.get("id")] = marker;
    },
    onMarkerClick: function(e) {
        if (self.lastClickedMarkerEvent) {
            self.eventItemClose(self.lastClickedMarkerEvent);
        }
        self.lastClickedMarkerEvent = e.target.options.modelID;
        //come after the closing the last event
        if (!$(event.currentTarget).hasClass("open")) {
            if (!$(event.currentTarget.children).hasClass("viewing")) {
                //$("#event_53").position().top()
                self.scrollTo(e.target.options.modelID);
            }
            self.eventItemOpen(self.lastClickedMarkerEvent);
        }
    },
    onClick: function(event) {
        var id = event.currentTarget.id.replace(/event_/, "");

        if ($(event.currentTarget).hasClass("open")) {
            self.eventItemClose(id);
            self.markers[id].closePopup();
        } else {

            self.eventItemOpen(id);
            //open maker
            self.markers[id].openPopup();


        }
    },
    onMouseenter: function(target) {
        //test = $("#layer1")
        //test.attr("transform","scale(1.4)")
        if (!$(target.currentTarget).hasClass("open")) {
            var id = target.currentTarget.id.replace(/event_/, "");
            var g = $("#icon-" + id).find(".layer1");
            g.attr("transform", "scale(1.2) translate(-1, -3)");
        }

    },
    onMouseleave: function(target) {
        if (!$(target.currentTarget).hasClass("open")) {
            var id = target.currentTarget.id.replace(/event_/, "");
            var g = $("#icon-" + id).find(".layer1");
            g.attr("transform", "scale(1)");
        }
    },
    eventItemOpen: function(id) {
        
        var model = self.model.get(id);
        $("#event_" + id).addClass("open");
        $("#event_" + id).height(self.height + 26);
        $("#event_" + id).find(".list_item_container").html(Handlebars.loadedTemps["item_open_template"](model.toJSON()));
        //set month
        var month = model.get("start_date").getMonth();
        var height = $("#month_" + month).height();
        $("#month_" + month).height(height + 26); 
        //set day height
        var day = model.get("start_date").getDate();
        height = $("#day_" + day+"_"+month).height();
        $("#day_"+day+"_"+month).height(height + 26);

    },
    eventItemClose: function(id) {
        //close the event icon
        $("#icon-"+id).find(".circleMarker").hide();
        $("#icon-"+id).find(".layer1").attr("transform", "scale(1)");        
        
        $("#event_" + id).removeClass("open");
        $("#event_" + id).height(self.height);
        //get model of item thata was clicked 
        var model = self.model.get(id);
   
        var month = model.get("start_date").getMonth();
        //set day height
        var day = model.get("start_date").getDate();
        var height = $("#day_" + day + "_" + month).height();
        $("#day_" + day + "_" + month).height(height - 26);
        //set month
        height = $("#month_" + month).height();
        $("#month_" + month).height(height - 26);
        var color = $("#event_" + id).css("background-color");
        $("#event_" + id).replaceWith(
        Handlebars.loadedTemps["item_closed_template"]({
            events: [model.toJSON()]
        }));
        $("#event_" + id).css("background-color", color);
    },
    onResize: function() {
        self.position.left = $("#event_list").position().left;
        self.position.top = $("#EventsListView").position().top;
        self.genarateColorsAndMonths(true);
    },
    onDOMadd: function() {
        self.onResize();
        $("#EventsListView").scroll(self.onScroll);
    },
    onClose: function() {
        $(window).off('resize', this.onResize);
    },
    render: function(eventModels, prepend) {
        var adjustHeightOnMonthDays = function(oldEdgeDate, newEdgeDate){
            if (oldEdgeDate.getFullYear() == newEdgeDate.getFullYear() && oldEdgeDate.getMonth() == newEdgeDate.getMonth()) {
                if(prepend){
                    var firstMonth = months.pop();              
                }else{
                    var firstMonth = months.shift();
                }
                $("#month_" + firstMonth.month).height(
                    $("#month_" + firstMonth.month).height() + firstMonth.height);
                //check day
                if (oldEdgeDate.getDate() == newEdgeDate.getDate()) {
                    if(prepend){
                        var firstDay = days.pop(); 
                    }else{
                       var firstDay = days.shift(); 
                    }
                    var firstDayEl = "#day_" + firstDay.day + "_" + firstDay.month;
                    $(firstDayEl).height(
                    $(firstDayEl).height() + firstDay.height);
                }
            }
        }
        //if no events are past assume we are rerending
        if (!eventModels) {
            eventModels = this.model.models;
            self.render_var.pre_current_date.date = _.first(eventModels).get("start_date");    
            self.render_var.current_date.date =  _.last(eventModels).get("start_date");  
            var renderEl = function() {
                var html = Handlebars.loadedTemps["event_list_template"]({
                    months: months,
                    days: days,
                    events: events,
                    height: self.height
                });
                self.$el.html(html);
            }
        } else {
            if (prepend) {
                var oldLastDate = self.render_var.pre_current_date.date;
                self.render_var.pre_current_date.date = _.first(eventModels).get("start_date");
                var firstDate = _.last(eventModels).get("start_date");     
                var renderEl = function() {
                    var html = Handlebars.loadedTemps["item_closed_template"]({
                        events: events
                    });

                    //adds height to the allready present month and day li
                    adjustHeightOnMonthDays(oldLastDate,firstDate);
                    $("#event_list").prepend(html);
                    $("#event_list_day").prepend(Handlebars.loadedTemps["li_days_template"]({
                        days: days
                    }));
                    $("#event_list_month").prepend(Handlebars.loadedTemps["li_months_template"]({
                        months: months
                    }));
                }
            } else {
                //append event
                var oldLastDate = self.render_var.current_date.date;
                self.render_var.current_date.date =  _.last(eventModels).get("start_date");
                var firstDate = eventModels[0].get("start_date");
                var renderEl = function() {
                    var html = Handlebars.loadedTemps["item_closed_template"]({
                        events: events
                    });
                    //adds height to the allready present month and day li
                    adjustHeightOnMonthDays(oldLastDate,firstDate);
                    $("#event_list").append(html);
                    $("#event_list_day").append(Handlebars.loadedTemps["li_days_template"]({
                        days: days
                    }));
                    $("#event_list_month").append(Handlebars.loadedTemps["li_months_template"]({
                        months: months
                    }));
                }
            }
        }
        //book keeping
        var months = [];
        var days = [];
        var events = [];
        var month_counter = 1;
        var day_counter = 1;
        current_date = new Date(0);
        eventModels.forEach(function(event, key) {
            //check year and month
            if (event.get("start_date").getFullYear() != current_date.getFullYear() || event.get("start_date").getMonth() != current_date.getMonth()) {
                current_date = event.get("start_date");
                //check to see if there is a first el
                if (days.length > 0) {
                    days[days.length - 1].height = day_counter * self.height;
                    if (months.length > 0) {
                        months[months.length - 1].height = month_counter * self.height;
                    }
                }
                months.push({
                    month: current_date.getMonth(),
                    letter: self.month2letter(current_date.getMonth())
                });
                days.push({
                    day: current_date.getDate(),
                    month: current_date.getMonth(),
                });
                month_counter = 0;
                day_counter = 0;
            } else if (event.get("start_date").getDate() != current_date.getDate()) {
                //genreates the days ul
                current_date = event.get("start_date");
                if (days.length > 0) {
                    days[days.length - 1].height = day_counter * self.height;
                }
                days.push({
                    day: current_date.getDate(),
                    month: current_date.getMonth(),
                });
                day_counter = 0;
            }
            events.push(event.toJSON());
            day_counter++;
            month_counter++;
        }, this);
        //set final heights
        if(days.length > 0)
            days[days.length - 1].height = day_counter * self.height;
        if(months.length > 0)
            months[months.length - 1].height = month_counter * self.height;
            
        renderEl(this);
        return this;
        
    },
    fetchMoreEvents: function(pre) {
        if(!pre){
            var updateOffset = self.model.updateOffset;
            var moreEvents = self.model.moreEvents;
            var successCallback = function(evt, request) {
                    if(request.length != 0){
                        events=request.map(function(event){
                            event = new Event(event);
                            return event;
                        });               
                        self.render(events);
                        self.model.updateOffset += self.model.numOfEventsToFetch;  
                        self.genarateColorsAndMonths(true);
                    }

                    if (request.length < self.model.numOfEventsToFetch) {
                        self.model.moreEvents = false;
                    }else{
                        if(!self.isListFull()){
                           self.fetchMoreEvents(); 
                        } 
                    }
                };
        }else{
            var updateOffset = self.model.updateOffsetPastEvents;
            var moreEvents = self.model.morePastEvents;
            var successCallback = function(evt, request){
                //if there are any events then render them
                if(request.length != 0){
                    events=request.map(function(event){
                        event = new Event(event);
                        return event;
                    });
                    self.render(events,true);
                    //set the scroll posistion
                    scrollPosistion = request.length*self.height;
                    $("#EventsListView").scrollTop(scrollPosistion);  
                    self.model.updateOffsetPastEvents -= self.model.numOfEventsToFetch; 
                    self.genarateColorsAndMonths(true);
       
                }                        
                
                if (request.length < self.model.numOfEventsToFetch) {
                    self.model.morePastEvents = false;
                }else{
                    //keep fetching if list is not full
                    if(!self.isListFull()){
                       self.fetchMoreEvents(true); 
                    }   
                }
            };
        }
        if(moreEvents){
            this.model.fetch({
                data: {
                    n: self.model.numOfEventsToFetch,
                    offset: updateOffset
                },
                add: true,
                success: successCallback
            });
        }
    },
    genarateColorsAndMonths: function(regenrate) {
        var topVisbleEl = document.elementFromPoint(self.position.left+.5, self.position.top + 20);
        //have we moved enought to change colors?
        if (self.topVisbleEl != topVisbleEl || regenrate) {
         
            self.topVisbleEl = topVisbleEl;

            //set map icons that are not in the current view
            var bottomPos = self.isListFull() ? $("#EventsListView").height() :  $("#event_list").height();
            //add tolerance
            bottomPos = bottomPos - 11;
            var bottomVisbleEl = document.elementFromPoint(self.position.left,self.position.top + bottomPos);
            var topIndex = $("#event_list").children().index(topVisbleEl);
            var bottomIndex = $("#event_list").children().index(bottomVisbleEl);
            var _start_date = self.model.models[topIndex].get("start_date");
             self.setMonthDay(_start_date);  
            var numberOfEl = bottomIndex - topIndex + 1;
            //set the color to white for all over elements
            $(".event_item").css("background-color","white");
            //set up event icons
            $(".viewed").removeClass("viewing");
            $(".viewed").each(function(index, el) {
                var id = el.id.replace(/icon-/, "");
                var model = self.model.get(id);
                if (model.get("start_date") < _start_date) {
                    H = 0;
                } else {
                    H = (numberOfEl - 1 / numberOfEl) * 360;
                }
                $(el).find(".svgForeground").css("stroke", "grey").css("fill-opacity", 0.4).css("fill", "hsl(" + H + ",100%, 50%)");
                self.markers[id].setZIndexOffset(-100);
            });
            //add color event items
            for (var i = topIndex; i <= bottomIndex; ++i) {
                var model = self.model.models[i];
                var H = ((i - topIndex) / numberOfEl) * 360;
                $("#event_"+ model.get("id")).css("background-color", "hsl(" + H + ",100%, 50%)");

                if (!$("#icon-" + model.get("id")).hasClass("viewed")) {
                    $("#icon-" + model.get("id")).html($('#svg svg').clone());
                }

                $("#icon-" + model.get("id")).addClass("viewed").addClass("viewing").find(".svgForeground").css("fill", "hsl(" + H + ",100%, 50%)").css("fill-opacity", 1).css("stroke", "black");
                self.markers[model.get("id")].setZIndexOffset(1000);
            }
        }
    },
    setMonthDay:function(date){
        //set month on side bar

        month = date.getMonth();
        day = date.getDate();
        $("#topMonthLetter").text(self.month2letter(month)+day);
        //set day on side bar
        $("#topYear").text(date.getFullYear());       
        
    },
    scrollTo:function(id){
        var targetOffset = $("#EventsListView").scrollTop()  - $("#EventsListView").position().top + $("#event_"+id).position().top;
        //$("#EventsListView").scrollTop(scrollTop);
        $("#EventsListView").animate({scrollTop:targetOffset},700);
    },
    //test to see if the list of events is full
    isListFull:function(){
        return ($("#EventsListView").height() <  $("#event_list").height())? true:false;
    },
    month2letter: function(num) {
        var m_names = new Array("J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D");

        return m_names[num];
    }
});
