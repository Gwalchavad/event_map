/*global define*/
define([
    'jquery',
    'leaflet',
    'underscore',
    'backbone',
    'utils',
    'views/map',
    'hbs!../../templates/event_list',
    'hbs!../../templates/event_list_empty',
    'hbs!../../templates/item_open',
    'hbs!../../templates/EventClosedPartial',
    'hbs!../../templates/liMonths',
    'hbs!../../templates/liDays',
    'hbs!../../templates/popup'], function(
        $,
        L,
        _,
        Backbone,
        utils,
        map,
        temp_event_list,
        temp_event_list_empty,
        temp_item_open,
        temp_item_closed,
        temp_li_months,
        temp_li_days, temp_popup){
        "use strict";

    var EventsListView = Backbone.View.extend({
        tagName: "div",
        className: "span4",
        id: "",
        height: 40,
        openHeight: 38,
        markers: [],
        //anything before Wed Dec 31 1969 19:00:00 GMT-0500 (EST) will fuck up the system
        //book keeping to render varibles
        render_var: {
            pre_current_date: {
                date: new Date()
            },
            current_date: {
                date: new Date()
            }
        },
        forward_lock: false,
        backward_lock: false,
        events: {
            "click .event_item": "onClick",
            "mouseenter .event_item": "onMouseenter",
            "mouseleave .event_item": "onMouseleave"
        },
        initialize: function(options) {
            this.constructor.__super__.initialize.apply(this, [options]);
            var self = this;
            //process events that are added by fetching
            this.model.on('add',self.onAdd, this);
            /*
            this.model.update(function(events){
                if(events.length){
                    self.render();
                    self.onResize();
                    $("#EventsListView").on("scroll." + self.cid,self, self.onScroll);
                }
            });
            */
            map.map.on("popupopen", this.onPopupOpen);
            map.map.on('locationfound', this.onLocationFound,this);

        },
        onMarkerClick: function(e) {
            this.eventItemOpen( e.target.options.modelID);
            //if the target event is not currently viewble in the list, then scroll to it
            if (!$(e.target._icon.children).hasClass("viewing")) {
                this.scrollTo(e.target.options.modelID);
            }
        },
        onPopupOpen: function(event) {
            $(event.popup._source._icon).find(".circleMarker").show();
            $(event.popup._source._icon).find(".layer1").attr("transform", "scale(1.2) translate(-1, -3)");
        },
        onScroll: function(e) {
            //if at the bottom get more events
            var self = e.data;
            var tolerance = 60;
            if ($("#EventsListView").scrollTop() <= tolerance) {
                e.data.backFetch(e.data);
            } else if(
                $("#EventsListView")[0].scrollHeight - $("#EventsListView").scrollTop() <
                ($("#EventsListView").outerHeight() + tolerance)){
                self.forwardFetch(self);
            }
            e.data.genarateColorsAndMonths();
            e.data.setMonthSideBarPosition();
        },
        //debounced proxy for onScroll
        deScroll: _.debounce(function(e){
            var self = e.data;
            self.onScroll(e);
        },5),
        backFetch: function(context) {
            var self = context ? context : this;
            if(!self.backward_lock){
                self.backward_lock = true;
                self.model.rfetch({
                    successCallback: function(events) {
                        //bind event incase it wasn't bond in onDOM
                        var scrollPosistion = events.length * self.height;
                        $("#EventsListView").scrollTop(scrollPosistion);
                        self.genarateColorsAndMonths(true);
                        self.backward_lock = false;
                    }
                });
            }
        },
        forwardFetch: function(context) {
            var self = context ? context : this;
            if(!self.forward_lock){
                self.forward_lock = true;
                self.model.ffetch({
                    successCallback: function(events) {
                        //bind event incase it wasn't bond in onDOM
                        self.genarateColorsAndMonths(true);
                        self.forward_lock = false;
                    }
                });
            }
        },
        onAdd: function(model, collect, options) {
            //compute the vaules for open and close
            //this is also compute on render becuase model appended are not
            //a refence to models in the collection
            var location_point = model.get("location_point"),
            index = this.model.indexOf(model),
            start_time = model.get("start_datetime").format("h:mm A"),
            end_time = model.get("end_datetime").format("h:mm A");

            model.set("start_time", start_time);
            model.set("end_time",end_time);

            if(location_point){
                //for the handlebars temp
                //set coordinates for google maps directions
                model.set("coordx",location_point.coordinates[0]);
                model.set("coordy",location_point.coordinates[1]);
                if(map.currentPos){
                    model.set("scoordx",map.currentPos.lng);
                    model.set("scoordy",map.currentPos.lat);
                }

                //set map icons
                var myIcon = L.divIcon({
                    className: "icon",
                    html: '<div id=\'icon-' + model.get("slug") + '\'></div>',
                    iconAnchor: [9, 23],
                    iconSize: [24, 30],
                    popupAnchor: [4, - 10]
                });
                var loca_p = model.get("location_point");
                var marker = L.marker(
                    [loca_p.coordinates[1], loca_p.coordinates[0]], {
                        icon: myIcon,
                        modelID: model.get("slug")
                });
                marker.bindPopup(temp_popup(model.toJSON()));
                map.group.addLayer(marker);
                marker.on("click", this.onMarkerClick, this);
                this.markers[model.get("slug")] = marker;
                $("#icon-" + model.get("slug")).html($('#svg svg').clone());
            }
            this.renderEvent(index,model);
        },

        onLocationFound: function(e){
            //update the makers start address for directions
            this.markers.forEach(function(marker){
                var content = $(marker._popup._content);
                var _href = content.find(".popupAddress").attr("href");
                _href = utils.updateURLParameter(_href,"saddr",e.latlng.toUrlString());
                content.find(".popupAddress").attr("href",_href);
                marker._popup._content = content.prop('outerHTML');
            });
        },

        onClick: function(event) {
            var id = event.currentTarget.id.replace(/event_/, "");
                if ($(event.currentTarget).hasClass("open")) {
                    this.eventItemClose(id);
                    if(this.markers[id])
                        this.markers[id].closePopup();
                } else {
                    this.eventItemOpen(id);
                    if(this.markers[id])
                        this.markers[id].openPopup();
                }
        },
        onMouseenter: function(target) {
            if (!$(target.currentTarget).hasClass("open")) {
                var id = target.currentTarget.id.replace(/event_/, "");
                if(this.markers[id]){
                    $("#icon-" + id)
                        .parent()
                        .css("margin-left", - 11)
                        .css("margin-top", - 27)
                        .find(".layer1")
                        .attr("transform", "scale(1.2) translate(-1, -3)");
                    this.markers[id].setZIndexOffset(200);
                }
            }
        },
        onMouseleave: function(target) {
            if (!$(target.currentTarget).hasClass("open")) {
                var id = target.currentTarget.id.replace(/event_/, "");
                if(this.markers[id]){
                    $("#icon-" + id)
                        .parent()
                        .css("margin-left", - 9)
                        .css("margin-top", - 23)
                        .find(".layer1")
                        .attr("transform", "scale(1)");
                    this.markers[id].setZIndexOffset(10);
                }
            }
        },
        eventItemOpen: function(id) {
            if(!$("#event_" + id).hasClass("open")){
                var model = this.model.get(id);
                $("#event_" + id).addClass("open");
                $("#event_" + id).height(this.height + this.openHeight);
                $("#event_" + id).find(".list_item_container").html(temp_item_open(model.toJSON()));
                //set month
                var day = model.get("start_datetime").date();
                var month = model.get("start_datetime").month();
                var year = model.get("start_datetime").year();
                var height = $("#month_" + month+"_"+year).height();
                $("#month_" + month + "_" + year).height(height + this.openHeight);
                //set day height

                height = $("#day_" + day + "_" + month+"_"+year).height();
                $("#day_" + day + "_" + month+"_"+year).height(height +  this.openHeight);
                if(this.markers[id])
                    this.markers[id].setZIndexOffset(100);
            }
        },
        eventItemClose: function(id){
            //close the event icon
            $("#icon-" + id).find(".circleMarker").hide();
            $("#icon-" + id)
                .parent()
                .css("margin-left", - 9)
                .css("margin-top", - 23)
                .find(".layer1")
                .attr("transform", "scale(1)");
            //close the event
            $("#event_" + id).removeClass("open");
            $("#event_" + id).height(this.height);
            //get model of item thata was clicked
            var model = this.model.get(id);
            var day = model.get("start_datetime").date();
            var month = model.get("start_datetime").month();
            var year = model.get("start_datetime").year();
            //set day height

            var height = $("#day_" + day + "_" + month + "_" + year).height();
            $("#day_" + day + "_" + month+"_"+year).height(height -  this.openHeight);
            //set month
            height = $("#month_" + month+"_"+year).height();
            $("#month_" + month+"_"+year).height(height -  this.openHeight);
            var color = $("#event_" + id).css("background-color");
            $("#event_" + id).replaceWith(
                temp_item_closed({
                    events: [model.toJSON()]}));
            $("#event_" + id).css("background-color", color);
            this.setMonthSideBarPosition();
        },
        onResize: function(e) {
            if ($("#event_list").length !== 0) {
                this.genarateColorsAndMonths(true);
            }
        },
        onClose: function() {
            $("#EventsListView").off("scroll." + this.cid);
        },
        onDOMadd: function() {
            this.onResize();
            this.backFetch();
            this.forwardFetch();

        },
        renderEvent: function(position, events){
            console.log(position, events);
            var html,
            datetime = events.get("start_datetime"),
            text = this.month2FullNameOrLetter(datetime, 0),
            day = datetime.date(),
            month = datetime.month(),
            year = datetime.year(),
            month_data = {
                month: month,
                year: year,
                height: this.height,
                letter: text
            },
            day_data = {
                day: day,
                month: month,
                year: year,
                height: this.height
            },
            html_months = temp_li_months({
                months: [month_data]
            }),
            html_days = temp_li_days({
                days: [day_data]
            }),
            html_events = temp_item_closed({
                events: [events.toJSON()]
            }),
            insertMethod,
            $EventsListEL = this.$el.find("#event_list"),
            currentNumOfEl = $EventsListEL.children().length;
            //create and insert the DOM for the event li
            if(currentNumOfEl === 0){
                html = temp_event_list({
                    days: [day_data],
                    height: this.height
                });
                html = $(html);
                html.find("#event_list_month").html(html_months);
                html.find("#event_list_day").html(html_days);
                html.find("#event_list").html(html_events);
                this.$el.html(html);
                this.$el.find("#EventsListView").on("scroll." + this.cid, this, this.onScroll);
                return this;
            }else{
                if(position < currentNumOfEl){
                    insertMethod = "before";
                }else{
                    insertMethod = "after";
                    position = currentNumOfEl-1;
                }
                var nextEvent = $($EventsListEL.children()[position]),
                ndatetime = new Date(nextEvent.data("date")),
                nDay = ndatetime.getUTCDate(),
                nMonth = ndatetime.getUTCMonth(),
                nYear = ndatetime.getUTCFullYear();
                //insert new event li
                nextEvent[insertMethod](html_events);
                //create and expand DOM for month and day li
                //if the month doesn't exist
                if(this.$el.find("#month_"+month+"_"+year).length === 0){
                    console.log("inserting month");
                    this.$el.find("#month_"+nMonth+"_"+nYear)[insertMethod](html_months);
                    this.$el.find("#day_"+nDay+"_"+nMonth+"_"+nYear)[insertMethod](html_days);
                }else{
                    var calcHeight = _.bind(function(index, height){
                       return height + this.height;
                    },this);
                    //expand month
                    this.$el.find("#month_"+month+"_"+year).height(calcHeight);
                    //recalculate the text size for the month sidebar
                    text = this.month2FullNameOrLetter(datetime, this.$el.find("#month_"+month+"_"+year).height());
                    this.$el.find("#month_"+month+"_"+year).children().text(text);
                    //test if the day exists
                    if(this.$el.find("#day_"+day+"_"+month+"_"+year).length === 0){
                        console.log("inserting day", insertMethod, day,this.$el.find("#day_"+nDay+"_"+nMonth+"_"+nYear),html_days);
                        this.$el.find("#day_"+nDay+"_"+nMonth+"_"+nYear)[insertMethod](html_days);
                    }else{
                        //expand day
                        this.$el.find("#day_"+day+"_"+month+"_"+year).height(calcHeight);
                    }
                }
                return this;
            }
        },
        render: function(){
            var html = temp_event_list_empty();
            this.$el.html(html);
            var self = this;
            this.model.forEach(function(model, key) {
                self.onAdd(model);
            });
            return this;
        },
        /*
         * Generate the Colors for the events in the list
         * And the Colors for the Icons
         * And Generate the the Date Display at the top of the list
         */
        genarateColorsAndMonths: function(regenrate) {
            var self = this,
            //the range of colors (Hue) to use
            colorRange = 240,
            //find the top elemetns
            topVisbleEl = document.elementFromPoint($("#event_list").position().left + 0.5,
                    $("#EventsListView").position().top+ 20);
            //have we moved enought to change colors?
            if ($(topVisbleEl).attr("class") &&
                    $(topVisbleEl).attr("class").split(" ")[0] ==
                    "event_item" &&
                    (this.topVisbleEl != topVisbleEl || regenrate)) {
                this.topVisbleEl = topVisbleEl;
                var topModelId = topVisbleEl.id.replace(/event_/, "");
                var top_start_date = self.model.get(topModelId).get("start_datetime");
                this.setMonthDay(top_start_date);
                this.setDay(top_start_date);
                //set map icons that are not in the current view
                var bottomPos = self.isListFull() ? $("#EventsListView").height() : $("#event_list").height();
                //add tolerance
                bottomPos = bottomPos - 11;
                var bottomVisbleEl = document.elementFromPoint(
                        $("#event_list").position().left,
                        $("#EventsListView").position().top + bottomPos);

                var topIndex = $("#event_list").children().index(topVisbleEl);
                var bottomIndex = $("#event_list").children().index(bottomVisbleEl);

                //set the color to white for all over elements
                //$(".event_item").css("background-color", "white");
                //set up event icons. Clears the prevouse colour
                $(".viewed").removeClass("viewing");
                $(".viewed").each(function(index, el) {
                    var id = el.id.replace(/icon-/, "");
                    var model = self.model.get(id);
                    if (model.get("start_datetime") < top_start_date) {
                        H = 0;
                    } else {
                        H = colorRange;
                    }
                    $(el).find(".svgForeground")
                        .css("stroke", "grey")
                        .css("fill-opacity", 0.4)
                        .css("fill", "hsl(" + H + ",100%, 50%)");
                    self.markers[id].setZIndexOffset(-10);
                });
                //add color event items
                var numberOfEl = bottomIndex - topIndex;
                for (var i = 0; i <= numberOfEl; ++i) {
                    var id = $(".event_item")[i + topIndex].id.replace(/event_/, "");
                    if(this.markers[id]){
                        var H = (i / numberOfEl) * colorRange;
                        $("#event_" + id).css("background-color", "hsl(" + H + ",100%, 50%)");
                        //add colors to icons
                        $("#icon-" + id)
                            .addClass("viewed")
                            .addClass("viewing")
                            .find(".svgForeground")
                            .css("fill", "hsl(" + H + ",100%, 50%)")
                            .css("fill-opacity", 1)
                            .css("stroke", "black");
                        this.markers[id].setZIndexOffset(10);
                    }
                }
            }
        },
        setDay: function(date) {
            var day = date.day();
            $(".selected_day").removeClass("selected_day");
            $("#day_" + day).addClass("selected_day");
        },
        /*
         *Set the Month Letter, Day Number and Year at the top of the list
         */
        setMonthDay: function(date) {
            var self = this;
            //set month on side bar
            var month = date.format("MMM")[0];
            var day = date.date();
            $("#topMonthLetter").text(month + day);
            //set day on side bar
            $("#topYear").text(date.year());

        },
        /*
         * Positions the Month vertical on the side of the list as the
         * user scolls
         */
        setMonthSideBarPosition: function() {
            var tolarance = 20,
            topVisbleEl = document.elementFromPoint(
                    $("#event_list").position().left + 0.5,
                    $("#event_list_top_date").height()),
            topModelId = $(topVisbleEl).data("id"),
            top_start_date = this.model.get(topModelId).get("start_datetime"),
            topMonthId = top_start_date.month() + "_" + top_start_date.year(),
            topElBottom = $("#month_" + topMonthId).position().top + $("#month_" + topMonthId).height(),
            topElwidth = $("#month_" + topMonthId).children().width(),
            bottomElwidth = $("#month_" + topMonthId).next().children().width(),
            current_top_month = $("#month_" + topMonthId).children();
            if(!this.current_top_month || (this.current_top_month[0] !== current_top_month[0])){
                $(".monthFixed").removeClass("monthFixed");
                //this fixes an edge condition of collapsing the top event
                if(this.current_top_month)
                    this.current_top_month.css("top", 0);
                this.current_top_month = current_top_month;
            }
            //set the top month tobe fixed
            if (topElBottom > $("#EventsListView").position().top + topElwidth + tolarance) {
                current_top_month
                    .addClass("monthFixed")
                    .removeClass("relative")
                    .css("top", $("#EventsListView").position().top);
            } else {
                //set the top month to be at the bottom of the li
                var parentHeight = $("#month_" + topMonthId).height();
                var new_height = parentHeight - topElwidth - tolarance;
                if (new_height < 0)
                    new_height = 0;
                current_top_month.addClass("relative").removeClass("monthFixed").css("top", new_height); //set to botto
            }
        },
        scrollTo: function(id) {
            var targetOffset = $("#EventsListView").scrollTop() -
                $("#EventsListView").position().top +
                $("#event_" + id).position().top;
            //$("#EventsListView").scrollTop(scrollTop);
            $("#EventsListView").animate({
                scrollTop: targetOffset
            }, 700);
        },
        //test to see if the list of events is full
        isListFull: function() {
            return ($("#EventsListView").height() < $("#event_list").height()) ? true : false;
        },
        month2FullNameOrLetter: function(date, elHeight) {
            var number0fChar = elHeight / 10;
            if (number0fChar < 10) {
                return date.format("MMM")[0];
            } else {
               return date.format("MMMM");
            }
        }
    });

    return {
        EventsListView: EventsListView
    };
});
