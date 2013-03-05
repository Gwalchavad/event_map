/*global define server_time_tz*/
define([
    'jquery',
    'leaflet',
    'underscore',
    'backbone',
    'moment',
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
        moment,
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
        numOfFades:  6, //how many events markers are shown after you scroll past then
        height: 40,
        openHeight: 38,
        nowIndex: false, //does todays date fall within the range of this list?
        colorEvents: true, //do we want to color the events?
        _markers: [], //store referance to makers SO that the zindex can be changed
        _eventsInView: [],
        _eventsViewed: [],
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
            //process events that are added by fetching
            this.model.on('add',this.onAdd, this);
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
            this.baseFragment =  Backbone.history.fragment.split("?")[0];
        },
        onMarkerClick: function(e) {
            this.eventItemOpen( e.target.options.modelID);
            //if the target event is not currently viewble in the list, then scroll to it
            if (!$(e.target._icon.children).hasClass("viewing")) {
                this.scrollToId(e.target.options.modelID);
            }
        },
        onPopupOpen: function(event) {
            $(event.popup._source._icon).find(".circleMarker").show();
            $(event.popup._source._icon).find(".layer1").attr("transform", "scale(1.2) translate(-1, -3)");
        },
        onScroll: function(e) {
            //if at the bottom get more events
            var self = e.data,
            tolerance = 60;
            self.scrollPosition = $("#EventsListView").scrollTop();
            if (self.scrollPosition <= tolerance) {
                e.data.backFetch(e.data);
            } else if(
                $("#EventsListView")[0].scrollHeight - self.scrollPosition <
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
                        if(!self.nowIndex){
                            self.renderNow();
                        }
                        if(self.searchDateBelow){
                            self.gotoDate(self.options.date);
                            self.searchDateBelow = false;
                        }else{
                            var scrollPosistion = self.scrollPosition + events.length * self.height;
                            $("#EventsListView").scrollTop(scrollPosistion);
                        }
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
                        if(!self.nowIndex){
                            self.renderNow();
                        }
                        if(self.searchDateAbove){
                            self.gotoDate(self.options.date);
                            this.searchDateAbove = false;
                        }
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
                    html: '<div class=\'icon-event\' id=\'icon-' + model.get("slug") + '\'></div>',
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
                this._markers[model.get("slug")] = marker;
                this.getMarkerById(model.get("slug"))
                    .html($('#svg svg').clone())
                    .addClass("hidden");
            }
            this.renderEvent(index,model);
        },

        onLocationFound: function(e){
            //update the makers start address for directions
            this._markers.forEach(function(marker){
                var content = $(marker._popup._content);
                var _href = content.find(".popupAddress").attr("href");
                _href = utils.updateURLParameter(_href,"saddr",e.latlng.toUrlString());
                content.find(".popupAddress").attr("href",_href);
                marker._popup._content = content.prop('outerHTML');
            });
        },

        onClick: function(event) {
            var id = event.currentTarget.id.replace(/event_/, ""),
            marker = this._markers[id];
            if ($(event.currentTarget).hasClass("open")) {
                this.eventItemClose(id);
                if(marker)
                    marker.closePopup();
            } else {
                this.eventItemOpen(id);
                if(marker)
                    marker.openPopup();
            }
        },
        onMouseenter: function(target) {
            if (!$(target.currentTarget).hasClass("open")) {
                var id = target.currentTarget.id.replace(/event_/, "");
                if(this._markers[id]){
                    this.getMarkerById(id)
                        .parent()
                        .css("margin-left", - 11)
                        .css("margin-top", - 27)
                        .find(".layer1")
                        .attr("transform", "scale(1.2) translate(-1, -3)");
                    this._markers[id].setZIndexOffset(200);
                }
            }
        },
        onMouseleave: function(target) {
            if (!$(target.currentTarget).hasClass("open")) {
                var id = target.currentTarget.id.replace(/event_/, "");
                if(this._markers[id]){
                    $("#icon-" + id)
                        .parent()
                        .css("margin-left", - 9)
                        .css("margin-top", - 23)
                        .find(".layer1")
                        .attr("transform", "scale(1)");
                    this._markers[id].setZIndexOffset(10);
                }
            }
        },
        eventItemOpen: function(id) {
            var eventEl = $("#event_" + id);
            if(!eventEl.hasClass("open")){
                var model = this.model.get(id);
                eventEl
                    .addClass("open")
                    .height(this.height + this.openHeight)
                    .find(".list_item_container")
                    .html(temp_item_open(model.toJSON()));

                var calcHeight = _.bind(function(index, height){
                    return height + this.openHeight;
                },this);
                //set month
                this.getMonthLiById(id).height(calcHeight);
                //set day height
                this.getDayLiById(id).height(calcHeight);
                if(this.getMarkerById(id))
                    this._markers[id].setZIndexOffset(100);
            }
        },
        eventItemClose: function(id){
            //close the event icon
            $("#icon-" + id)
                .parent()
                .css("margin-left", - 9)
                .css("margin-top", - 23)
                .find(".layer1")
                .attr("transform", "scale(1)")
                .find(".circleMarker")
                .hide();

            //close the event
            $("#event_" + id)
                .height(this.height)
                .removeClass("open");

            var calcHeight = _.bind(function(index, height){
               return height - this.openHeight;
            },this);
            //set date height
            this.getDayLiById(id).height(calcHeight);
            //set month height
            this.getMonthLiById(id).height(calcHeight);
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
            this.renderNow();
            this.onResize();
            this.scrollPosition = $("#EventsListView").scrollTop();
            if(!this.options.date){
                this.options.date = moment();
            }else{
                this.options.date = moment(this.options.date);
            }
            if(!this.gotoDate(this.options.date)){
                this.searchDateAbove = true;
                this.searchDateBelow = true;
            }
            this.backFetch();
            this.forwardFetch();
        },
        renderEvent: function(position, events){
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
                this.$el
                    .html(html)
                    .find("#EventsListView")
                    .on("scroll." + this.cid, this, this.onScroll);
                return this;
            }else{
                if(position < currentNumOfEl){
                    insertMethod = "before";
                }else{
                    insertMethod = "after";
                    position = currentNumOfEl-1;
                }
                var nextEvent = $EventsListEL.children().eq(position),
                nMonthLi = this.getMonthLi(position),
                nDayLi = this.getDayLi(position),
                monthLi =  this.$el.find("#month_"+month+"_"+year),
                dayLi = this.$el.find("#day_"+day+"_"+month+"_"+year);
                //insert new event li
                nextEvent[insertMethod](html_events);
                //create and expand DOM for month and day li
                //if the month doesn't exist
                if(monthLi.length === 0){
                    nMonthLi[insertMethod](html_months);
                    nDayLi[insertMethod](html_days);
                }else{
                    var calcHeight = _.bind(function(index, height){
                       return height + this.height;
                    },this);
                    //expand month
                    monthLi.height(calcHeight);
                    //recalculate the text size for the month sidebar
                    text = this.month2FullNameOrLetter(datetime, monthLi.height());
                    monthLi.children().text(text);
                    //test if the day exists
                    if(dayLi.length === 0){
                       nDayLi[insertMethod](html_days);
                    }else{
                        //expand day
                        dayLi.height(calcHeight);
                    }
                }
                return this;
            }
        },
        //creates the "now" line in the event list
        renderNow: function(){
            var time = server_time_tz.substr(0,19),
            index = this.model.binarySearch(moment(time),"start_datetime");
            if(index > 0){
                this.colorEvents = true;
                this.nowIndex = index;
                var monthLi = this.getMonthLi(index),
                dayLi = this.getDayLi(index),
                nowEl = this.$el.find("#event_list li").eq(index)
                .addClass("Now")
                .css("border-top","4px")
                .css("border-top-style","solid");
                            monthLi.height(function(index, height){
                    return height + 4;
                });
                dayLi.height(function(index, height){
                    return height + 4;
                });
            }else if(index === -2){
                this.colorEvents = false;
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
            topVisbleEl = $(document.elementFromPoint($("#event_list").position().left + 0.5,
                    $("#EventsListView").position().top+ 20)),
            startEl;
            if(moment(topVisbleEl.data("date")) < moment($(".Now").data("date"))){
                startEl = $(".Now");
            }else{
                startEl = topVisbleEl;
            }

            //have we moved enought to change colors?
            if (topVisbleEl.hasClass("event_item") && (regenrate || this.topVisbleEl[0] != topVisbleEl[0] )) {
                var top_start_date = moment(topVisbleEl.data("date")),
                bottomPos = (self.isListFull() ? $("#EventsListView").height() : $("#event_list").height()) - 11,
                bottomVisbleEl = document.elementFromPoint(
                        $("#event_list").position().left,
                        $("#EventsListView").position().top + bottomPos),
                topVisibleIndex = $("#event_list").children().index(topVisbleEl),
                topIndex = $("#event_list").children().index(startEl),
                bottomIndex = $("#event_list").children().index(bottomVisbleEl),
                nowIndex = $("#event_list").children().index($(".Now")),
                eventsViewed = [],
                numberOfEl = bottomIndex - topIndex,
                marker;

                this.topVisbleEl = topVisbleEl;
                this.setMonthDay(top_start_date);
                this.setDay(top_start_date);
                this.setURL(top_start_date);

                //mark witch markers are visible
                $(".viewing").removeClass("viewing");
                for (var i = topVisibleIndex; i <= bottomIndex; i++){
                    marker = this.getMarker(i);
                    marker.addClass("viewing")
                        .removeClass("hidden")
                        .find(".svgForeground")
                        .css("fill-opacity", 1)
                        .css("stroke", "black");
                    eventsViewed.push(marker[0]);
                }
                if(this.colorEvents){
                    //add color
                    for (var i = topIndex; i <= numberOfEl + topIndex; ++i) {
                        marker = this.getMarker(i);
                        eventsViewed.push(marker[0]);
                        if(marker){
                            var H;
                            if(numberOfEl === 0){
                                H = colorRange;
                            }else{
                                H = ((i - topIndex) / numberOfEl) * colorRange;
                            }
                            this.getEventLi(i).css("background-color", "hsl(" + H + ",100%, 50%)");
                            //add colors to icons
                            marker
                                .find(".svgForeground")
                                .css("fill", "hsl(" + H + ",100%, 50%)");
                            this.setZIndex(i, 10);
                        }
                    }

                    //fade icons before the list
                    for (var i=topVisibleIndex - 1 ; i > topVisibleIndex - this.numOfFades - 1; i--) {
                        if(i < nowIndex)
                            break;
                        marker = this.getMarker(i);
                        if(marker){
                            if(!_.contains(this._eventsInView , marker[0]))
                                break;
                            eventsViewed.push(marker[0]);
                            marker.find(".svgForeground")
                                .css("stroke", "grey")
                                .css("fill", "hsl(0,100%, 50%)")
                                .css("fill-opacity",1 -  (topVisibleIndex - i)/this.numOfFades);
                            this.setZIndex(i,-10);
                        }
                    }

                    //fade icons after the list
                    var i = bottomIndex + 1 < nowIndex ? nowIndex :  bottomIndex + 1;
                    for (i; i < bottomIndex + this.numOfFades + 1; i++) {
                        marker = this.getMarker(i);
                        if(marker){
                            if( !_.contains(this._eventsInView, marker[0]))
                                break;
                            eventsViewed.push(marker[0]);
                            marker.find(".svgForeground")
                                .css("stroke", "grey")
                                .css("fill", "hsl(" + colorRange + ",100%, 50%)")
                                .css("fill-opacity", 1 - (i - bottomIndex - 1)/this.numOfFades);
                            this.setZIndex(i,-10);
                        }
                    }
                }
                //get the differnce, _.diffefence doesn't work in $ land
                var toHide = _.filter(this._eventsInView,function(evnt,i){
                    return !_.contains(eventsViewed, evnt);
                }, this);
                toHide.forEach(function(evnt){
                    $(evnt).addClass("hidden");
                });
                this._eventsInView = eventsViewed;
            }
        },
        getEventLi: function(index){
            return this.$el.find("#event_list li").eq(index);
        },
        //give an index of an event item find the corrisponding month li
        getMonthLi: function(index){
            var eventItem = this.getEventLi(index),
            datetime = new Date(eventItem.data("date")),
            year = datetime.getUTCFullYear(),
            month = datetime.getUTCMonth();
            return this.$el.find("#month_"+month+"_"+year);
        },
        //give an index on an LI of an event find the corrisponding day li
        getDayLi: function(index){
            var eventItem = this.$el.find("#event_list li").eq(index),
            datetime = new Date(eventItem.data("date")),
            year = datetime.getUTCFullYear(),
            month = datetime.getUTCMonth(),
            day = datetime.getUTCDate();
            return this.$el.find("#day_"+day+"_"+month+"_"+year);
        },
        getDayLiById: function(id){
            var model = this.model.get(id),
            day = model.get("start_datetime").date(),
            month = model.get("start_datetime").month(),
            year = model.get("start_datetime").year();
            return this.$el.find("#day_" + day + "_" + month+"_"+year);
        },
        getMonthLiById: function(id){
            var model = this.model.get(id),
            month = model.get("start_datetime").month(),
            year = model.get("start_datetime").year();
            return this.$el.find("#month_" + month+"_"+year);
        },
        getMarkerById: function(id){
            return $("#icon-"+id).length > 0 ? $("#icon-"+id) : false;
        },
        getMarker: function(index){
            var model = this.model.at(index);
            if(model){
                return this.getMarkerById(model.get("slug"));
            }else{
                return false;
            }
        },
        setZIndex: function(index,zIndex){
            var id = this.model.at(index).get("slug");
            this._markers[id].setZIndexOffset(zIndex);
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
        setURL: function(date){
            app.navigate(this.baseFragment + "?date=" + date.format("YYYY-MM-DD"), {trigger: false, replace: true});
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
            $topMonth =$("#month_" + top_start_date.month() + "_" + top_start_date.year()),
            topElBottom = $topMonth.position().top + $topMonth.height(),
            topElwidth = $topMonth.children().width(),
            bottomElwidth = $topMonth.next().children().width(),
            current_top_month = $topMonth.children();
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
                var parentHeight = $topMonth.height();
                var new_height = parentHeight - topElwidth - tolarance;
                if (new_height < 0)
                    new_height = 0;
                current_top_month.addClass("relative").removeClass("monthFixed").css("top", new_height); //set to botto
            }
        },
        gotoDate: function(date){
            var index = this.model.binarySearch(date,"start_datetime");
            if(index < 0){
                return false;
            }else{
                var scrollPosistion = index * this.height;
                $("#EventsListView").scrollTop(scrollPosistion);
                return true;
            }
        },
        scrollToId: function(id) {
            this.scrollTo($("#event_" + id));
        },
        scrollTo: function(el) {
            var targetOffset = $("#EventsListView").scrollTop() -
                $("#EventsListView").position().top +
                el.position().top;
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
