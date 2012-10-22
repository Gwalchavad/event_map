var EventsListView = Backbone.View.extend({
    tagName: "div",
    className: "span4",
    id: "",
    height: 40,
    markers: [],
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
        var self = this;
        //bind
        $(window).on('resize.'+this.cid,this ,this.onResize);
        //process events that are added by fetching
        self.model.on('add', function(event) {
            self.onAdd(event);
        });
        //process events that already exist
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
        //fetch more events
        //self.fetchMoreEvents(true);
        //self.fetchMoreEvents();  
        
    },
    onDOMadd: function() {
        var self = this;
        self.onResize();
        //bind the scroll event
        //then trigger a scroll to load more events
        $("#EventsListView").scroll(self,self.onScroll).scroll();
    },
    onScroll: function(e) {
        //if at the bottom get more events
        var regenrate = false;
        if ($("#EventsListView").scrollTop() == 0){
            e.data.model.rfetch({successCallback:function(events){
                e.data.render(events,true);
                scrollPosistion = events.length*e.data.height;
                $("#EventsListView").scrollTop(scrollPosistion);  
                regenrate= true;
            }});
        } else if ($("#EventsListView")[0].scrollHeight - $("#EventsListView").scrollTop() < ($("#EventsListView").outerHeight() + 2)) {
            e.data.model.ffetch({successCallback:function(events){
                var options = {};
                if(e.data.options.user){
                    options.data = {
                        user:e.data.options.user
                    }
                }
                e.data.render(events);
                regenrate= true;
            }});
        }  
        e.data.setMonthSideBarPosition();
        e.data.genarateColorsAndMonths(regenrate);
    },
    onAdd: function(model) {
        var self = this;
        //compute the vaules for open and close 
        //this is also compute on render becuase model appended are not
        //a refence to models in the collection
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
        Swarm.group.addLayer(marker);

        marker.on("click", self.onMarkerClick);
        this.markers[model.get("id")] = marker;
    },
    onMarkerClick: function(e) {
        var self = this;
        if (self.lastClickedMarkerEvent) {
            self.eventItemClose(self.lastClickedMarkerEvent);
        }
        self.lastClickedMarkerEvent = e.target.options.modelID;
        //come after the closing the last event
        if (!$(this._icon.children).hasClass("open")) {
            if (!$(this._icon.children).hasClass("viewing")) {
                //$("#event_53").position().top()
                self.scrollTo(e.target.options.modelID);
            }
            self.eventItemOpen(self.lastClickedMarkerEvent);
        }
    },
    onClick: function(event) {
        var self = this;
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
        var self = this;
        //test = $("#layer1")
        //test.attr("transform","scale(1.4)")
        if (!$(target.currentTarget).hasClass("open")) {
            var id = target.currentTarget.id.replace(/event_/, "");
            $("#icon-" + id).parent()
            .css("margin-left",-11)
            .css("margin-top",-27)
            .find(".layer1")
            .attr("transform", "scale(1.2) translate(-1, -3)");
            self.markers[id].setZIndexOffset(200);
        }
    },
    onMouseleave: function(target) {
        var self = this;
        if (!$(target.currentTarget).hasClass("open")) {
            var id = target.currentTarget.id.replace(/event_/, "");
            $("#icon-" + id).parent()
            .css("margin-left", -9)
            .css("margin-top", -23)
            .find(".layer1")
            .attr("transform", "scale(1)");
            self.markers[id].setZIndexOffset(10);
        }
    },
    eventItemOpen: function(id) {
        var self = this;
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
        
        self.markers[id].setZIndexOffset(100);
    },
    eventItemClose: function(id) {
        var self = this;
        //close the event icon
        $("#icon-"+id).find(".circleMarker").hide();
         $("#icon-" + id).parent()
        .css("margin-left", -9)
        .css("margin-top", -23)
        .find(".layer1")
        .attr("transform", "scale(1)");       
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
    onResize: function(e) {
        var self = e ? e.data : this;
        if($("#event_list").length != 0){
            self.position.left = $("#event_list").position().left;
            self.position.top = $("#EventsListView").position().top;
            self.genarateColorsAndMonths(true);
        }
        
    },
    onClose: function() {
        $(window).off('resize.'+this.cid, this.onResize);
    },
    render: function(eventModels, prepend) {
        var self = this;
        var adjustHeightOnMonthDays = function(oldEdgeDate, newEdgeDate){
            //check to see if the month il is already rendered
            if (oldEdgeDate.getFullYear() == newEdgeDate.getFullYear() && oldEdgeDate.getMonth() == newEdgeDate.getMonth()) {
                if(prepend){
                    var firstMonth = months.pop();              
                }else{
                    var firstMonth = months.shift();
                }
                //update the last months height
                var newHeight = $("#month_" + firstMonth.month).height() + firstMonth.height;
                $("#month_" + firstMonth.month).height(newHeight);
                var monthText = self.month2FullNameOrLetter(firstMonth.month,newHeight);
                $("#month_" + firstMonth.month).children().text(monthText[0]);
                //check day
                if (oldEdgeDate.getDate() == newEdgeDate.getDate()) {
                    if(prepend){
                        var firstDay = days.pop(); 
                    }else{
                       var firstDay = days.shift(); 
                    }
                    var firstDayEl = "#day_" + firstDay.day + "_" + firstDay.month;
                    $(firstDayEl).height($(firstDayEl).height() + firstDay.height);
                }
            }
        }
        //if no events assume we are rerending
        if (!eventModels) {
            //if there are no events in the list
            if(this.model.length == 0){
                var html = Handlebars.loadedTemps["event_list_empty_template"]();
                self.$el.html(html);
                return this;
            }
            eventModels = this.model.models;
            self.render_var.pre_current_date.date = _.first(eventModels).get("start_date");    
            self.render_var.current_date.date =  _.last(eventModels).get("start_date");  
            var renderEl = function(){
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
            event.computeCloseValues();
            event.computeOpenValues();
            //check year and month
            if (event.get("start_date").getFullYear() != current_date.getFullYear() || event.get("start_date").getMonth() != current_date.getMonth()) {
                current_date = event.get("start_date");
                //check to see if there is a first el
                if (days.length > 0) {
                    days[days.length - 1].height = day_counter * self.height;
                    if (months.length > 0) {
                        monthHeight = month_counter * self.height;
                        var monthArray = self.month2FullNameOrLetter(months[months.length - 1].month,monthHeight);
                        months[months.length - 1].height = monthHeight;
                        months[months.length - 1].letter=  monthArray[0];
                        months[months.length - 1].vertical= monthArray[1];
                        months[months.length - 1].margin= monthArray[2];                     
                    }
                }
                months.push({
                    month: current_date.getMonth(),
                    //letter: self.month2letter(current_date.getMonth())
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
        if(months.length > 0){
            monthHeight = month_counter * self.height;
            var monthArray = self.month2FullNameOrLetter(months[months.length - 1].month,monthHeight);
            months[months.length - 1].height = monthHeight;
            months[months.length - 1].letter = monthArray[0];
            months[months.length - 1].vertical = monthArray[1];
            months[months.length - 1].margin = monthArray[2];             
        }
        renderEl(this);
        return this;
    },
    genarateColorsAndMonths: function(regenrate) {
        var self = this;
        var topVisbleEl = document.elementFromPoint(self.position.left+.5, self.position.top + 20);
        //have we moved enought to change colors?
        if (self.topVisbleEl != topVisbleEl || regenrate) {

            var topModelId = topVisbleEl.id.replace(/event_/,"");
            var top_start_date = self.model.get(topModelId).get("start_date");         
            self.topVisbleEl = topVisbleEl;
            self.setMonthDay(top_start_date);
            self.setDay(top_start_date);
            //set map icons that are not in the current view
            var bottomPos = self.isListFull() ? $("#EventsListView").height() :  $("#event_list").height();
            //add tolerance
            bottomPos = bottomPos - 11;
            var bottomVisbleEl = document.elementFromPoint(self.position.left,self.position.top + bottomPos);
            
            var topIndex = $("#event_list").children().index(topVisbleEl);   
            var bottomIndex = $("#event_list").children().index(bottomVisbleEl);

            var numberOfEl = bottomIndex - topIndex + 1;
            //set the color to white for all over elements
            $(".event_item").css("background-color","white");
            //set up event icons
            $(".viewed").removeClass("viewing");
            $(".viewed").each(function(index, el) {
                var id = el.id.replace(/icon-/, "");
                var model = self.model.get(id);
                if (model.get("start_date") < top_start_date) {
                    H = 0;
                } else {
                    H =  180;
                }
                $(el).find(".svgForeground").css("stroke", "grey").css("fill-opacity", 0.4).css("fill", "hsl(" + H + ",100%, 50%)");
                self.markers[id].setZIndexOffset(-10);
            });
            //add color event items
            for (var i = topIndex; i <= bottomIndex; ++i) {
                //var model = self.model.models[i];
                var id = $(".event_item")[i].id.replace(/event_/, "");
                var H = ((i - topIndex) / numberOfEl) * 180;
                $("#event_"+ id).css("background-color", "hsl(" + H + ",100%, 50%)");
                if (!$("#icon-" +id).hasClass("viewed")) {
                    $("#icon-" + id).html($('#svg svg').clone());
                }
                $("#icon-" + id).addClass("viewed").addClass("viewing").find(".svgForeground").css("fill", "hsl(" + H + ",100%, 50%)").css("fill-opacity", 1).css("stroke", "black");
                self.markers[id].setZIndexOffset(10);
            }
        }
    },
    setDay:function(date){
        var day = date.getDay();
        $(".selected_day").removeClass("selected_day");
        $("#day_"+day).addClass("selected_day") ;
    },
    setMonthDay:function(date){
        var self = this;
        //set month on side bar
        month = date.getMonth();
        day = date.getDate();
        $("#topMonthLetter").text(self.month2letter(month)+day);
        //set day on side bar
        $("#topYear").text(date.getFullYear());       
        
    },
    setMonthSideBarPosition:function(){
        var self = this;
        var topVisbleEl = document.elementFromPoint(self.position.left+.5, self.position.top);
        var topModelId = topVisbleEl.id.replace(/event_/,"");
        var top_start_date = self.model.get(topModelId).get("start_date");
        var topMonthId = top_start_date.getMonth();
                        
        var halfHeight = $("#EventsListView").position().top + $("#EventsListView").height()/2
        var topElBottom = $("#month_"+topMonthId).position().top + $("#month_"+topMonthId).height();
        var topElwidth = $("#month_"+topMonthId).children().width();
        var bottomElwidth = $("#month_"+topMonthId).next().children().width();
        var tolarance = 20;   
        //set the top month tobe fixed       
        $(".monthFixed").removeClass("monthFixed"); 
        if(topElBottom > $("#EventsListView").position().top + topElwidth + tolarance){
            $("#month_"+topMonthId).children()
            .addClass("monthFixed")
            .removeClass("relative")
            .css("top",$("#EventsListView").position().top);
        }else{
            //set the top monthe to be at the bottom of the li
            var parentHeight = $("#month_"+topMonthId).height(); 
            $("#month_"+topMonthId).children()
            .addClass("relative")
            .removeClass("monthFixed")
            .css("top",parentHeight - topElwidth - tolarance); //set to botto
        }
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
    },
    month2FullNameOrLetter:function(monthNum,elHeight){
        var self = this;
        var number0fChar = elHeight/10;
        if(number0fChar < 10){
            return [self.month2letter(monthNum)];
        }else{
            var m_names = new Array(["January",7],["Febuary",7],["March",5],["April",5],["May",3],["June",4],["July",4],["August",6],["September",9],["October",7],["November",8],["December",8]);
            month = m_names[monthNum];

            //month[0] = month[0].slice(0,number0fChar);
            return [month[0],true];
        }
    }
});
