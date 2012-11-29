define(['jquery', 'underscore', 'backbone', 'utils', 'hbs!../../templates/event_list', 'hbs!../../templates/event_list_empty',

'hbs!../../templates/item_open', 'hbs!../../templates/item_closed',

'hbs!../../templates/li_months', 'hbs!../../templates/li_days', 'hbs!../../templates/popup'
// Load our app module and pass it to our definition function
], function($, _, Backbone,utils, temp_event_list, temp_event_list_empty, temp_item_open, temp_item_closed, temp_li_months, temp_li_days, temp_popup) {

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
            },
        },
        events: {
            "click .event_item": "onClick",
            "mouseenter .event_item": "onMouseenter",
            "mouseleave .event_item": "onMouseleave",
        },
        initialize: function() {
            var self = this;
            app.map.group.clearLayers();
           
            //bind
            $(window).on('resize.' + this.cid, this, this.onResize);
            //process events that are added by fetching
            this.model.on('add', function(event) {
                self.onAdd(event);
            });
            //process events that already exist
            this.model.forEach(function(model, key) {
                self.onAdd(model);
            });
            //fecth events that might have been added since the last time we viewed this list
            self.model.update(function(events){
                if(events.length){
                    self.render();
                    self.onResize();
                    $("#EventsListView").on("scroll." + this.cid,self, self.onScroll);
                }
            });
            app.map.map.on("popupclose", this.onPopupClose);
            app.map.map.on("popupopen", this.onPopupOpen);
            app.map.map.on('locationfound', this.onLocationFound,this);
           
    
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
        onPopupClose: function(event) {

        },

        onScroll: function(e) {
            //if at the bottom get more events
            var tolerance = 60;
            if ($("#EventsListView").scrollTop() <= tolerance) {
                e.data.backFetch(e.data);
            } else if ($("#EventsListView")[0].scrollHeight - $("#EventsListView").scrollTop() < ($("#EventsListView").outerHeight() + tolerance)) {
                e.data.forwardFetch(e.data);
            }
            e.data.genarateColorsAndMonths();
            e.data.setMonthSideBarPosition();
        },
        backFetch: function(context) {
            self = context ? context : this;
            self.model.rfetch({
                successCallback: function(events) {
                    self.render(events, true);
                    scrollPosistion = events.length * self.height;
                    $("#EventsListView").scrollTop(scrollPosistion);
                    self.genarateColorsAndMonths(true);
                }
            });
        },
        forwardFetch: function(context) {
            self = context ? context : this;
            self.model.ffetch({
                successCallback: function(events) {
                    self.render(events);
                    self.genarateColorsAndMonths(true);
                }
            });
        },
        onAdd: function(model) {
            var self = this;
            //compute the vaules for open and close 
            //this is also compute on render becuase model appended are not
            //a refence to models in the collection
            model.computeCloseValues();
            model.computeOpenValues();
            //for the handlebars temp
            var location_point = model.get("location_point");
            model.set("coordx",location_point.coordinates[0]);
            model.set("coordy",location_point.coordinates[1]);
            if(app.map.currentPos){
                model.set("scoordx",app.map.currentPos.lng);
                model.set("scoordy",app.map.currentPos.lat);
            }
                
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
            marker.bindPopup(temp_popup(model.toJSON()));
            app.map.group.addLayer(marker);
            marker.on("click", self.onMarkerClick, this);
            this.markers[model.get("id")] = marker;
            
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
                $("#icon-" + id).parent().css("margin-left", - 11).css("margin-top", - 27).find(".layer1").attr("transform", "scale(1.2) translate(-1, -3)");
                self.markers[id].setZIndexOffset(200);
            }
        },
        onMouseleave: function(target) {
            var self = this;
            if (!$(target.currentTarget).hasClass("open")) {
                var id = target.currentTarget.id.replace(/event_/, "");
                $("#icon-" + id).parent().css("margin-left", - 9).css("margin-top", - 23).find(".layer1").attr("transform", "scale(1)");
                self.markers[id].setZIndexOffset(10);
            }
        },
        eventItemOpen: function(id) {
            var self = this;
            if(!$("#event_" + id).hasClass("open")){
                var model = self.model.get(id);
                $("#event_" + id).addClass("open");
                $("#event_" + id).height(self.height + self.openHeight);
                $("#event_" + id).find(".list_item_container").html(temp_item_open(model.toJSON()));
                //set month
                var day = model.get("start_date").getUTCDate();
                var month = model.get("start_date").getUTCMonth();
                var year = model.get("start_date").getUTCFullYear();
                var height = $("#month_" + month+"_"+year).height();
                $("#month_" + month + "_" + year).height(height + self.openHeight);
                //set day height

                height = $("#day_" + day + "_" + month+"_"+year).height();
                $("#day_" + day + "_" + month+"_"+year).height(height +  self.openHeight);

                self.markers[id].setZIndexOffset(100);
            }
        },
        eventItemClose: function(id) {
            //close the event icon
            $("#icon-" + id).find(".circleMarker").hide();
            $("#icon-" + id).parent().css("margin-left", - 9).css("margin-top", - 23).find(".layer1").attr("transform", "scale(1)");
            //$("#icon-" + id).removeClass("open");            
            //close the event           
            $("#event_" + id).removeClass("open");
            $("#event_" + id).height(self.height);
            //get model of item thata was clicked 
            var model = self.model.get(id);
            var day = model.get("start_date").getUTCDate();
            var month = model.get("start_date").getUTCMonth();
            var year = model.get("start_date").getUTCFullYear();
            //set day height

            var height = $("#day_" + day + "_" + month + "_" + year).height();
            $("#day_" + day + "_" + month+"_"+year).height(height -  self.openHeight);
            //set month
            height = $("#month_" + month+"_"+year).height();
            $("#month_" + month+"_"+year).height(height -  self.openHeight);
            var color = $("#event_" + id).css("background-color");
            $("#event_" + id).replaceWith(
            temp_item_closed({
                events: [model.toJSON()]
            }));
            $("#event_" + id).css("background-color", color);
            this.setMonthSideBarPosition()
        },
        onResize: function(e) {
            var self = e ? e.data : this;
            if ($("#event_list").length != 0) {
                self.genarateColorsAndMonths(true);
            }

        },
        onClose: function() {
            $(window).off('resize.' + this.cid, this.onResize);
            $("#EventsListView").off("scroll." + this.cid, self, self.onScroll).scroll();
            app.map.off("popupclose", this.onPopupClose);
            app.map.off("popupopen", this.onPopupOpen);
        },
        onDOMadd: function() {
            var self = this;
            self.onResize();
            //bind the scroll event
            //then trigger a scroll to load more events
            this.backFetch();
            this.forwardFetch();
            $("#EventsListView").on("scroll." + this.cid,self, self.onScroll);
        },
        /*
         * Renders a Given list of events
         * If No events are given it will rerender all of the events in the collection
         * If prepend is true it will perpends the events, else it will append them
         * It assumes that all events are in order
         */ 
        render: function(eventModels, prepend){
            var self = this;
            var adjustHeightOnMonthDays = function(oldEdgeDate, newEdgeDate) {
                //check to see if the month il is already rendered
                if (oldEdgeDate.getUTCFullYear() == newEdgeDate.getUTCFullYear() && oldEdgeDate.getUTCMonth() == newEdgeDate.getUTCMonth()) {
                    if (prepend) {
                        var firstMonth = months.pop();
                    } else {
                        var firstMonth = months.shift();
                    }
                    //update the last months height
                    var newHeight = $("#month_" + firstMonth.month).height() + firstMonth.height;
                    $("#month_" + firstMonth.month).height(newHeight);
                    var monthText = self.month2FullNameOrLetter(firstMonth.month, newHeight);
                    $("#month_" + firstMonth.month).children().text(monthText);
                    //check day
                    if (oldEdgeDate.getUTCDate() == newEdgeDate.getUTCDate()) {
                        if (prepend) {
                            var firstDay = days.pop();
                        } else {
                            var firstDay = days.shift();
                        }
                        var firstDayEl = "#day_" + firstDay.day + "_" + firstDay.month;
                        $(firstDayEl).height($(firstDayEl).height() + firstDay.height);
                    }
                }
            }
            //if no events assume we are rerending Or we are started with no events
            if (!eventModels || $("#NoEvent").length) {
                //if there are no events in the list
                if (this.model.length == 0) {
                    var html = temp_event_list_empty();
                    self.$el.html(html);
                    return this;
                }
                eventModels = this.model.models;
                self.render_var.pre_current_date.date = _.first(eventModels).get("start_date");
                self.render_var.current_date.date = _.last(eventModels).get("start_date");
                var renderEl = function() {
                    var html = temp_event_list({
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
                        var html = temp_item_closed({
                            events: events
                        });

                        //adds height to the allready present month and day li
                        adjustHeightOnMonthDays(oldLastDate, firstDate);
                        $("#event_list").prepend(html);
                        $("#event_list_day").prepend(temp_li_days({
                            days: days
                        }));
                        $("#event_list_month").prepend(temp_li_months({
                            months: months
                        }));
                    }
                } else {
                    //append event
                    var oldLastDate = self.render_var.current_date.date;
                    self.render_var.current_date.date = _.last(eventModels).get("start_date");
                    var firstDate = eventModels[0].get("start_date");
                    var renderEl = function() {
                        var html = temp_item_closed({
                            events: events
                        });
                        //adds height to the allready present month and day li
                        adjustHeightOnMonthDays(oldLastDate, firstDate);
                        $("#event_list").append(html);
                        $("#event_list_day").append(temp_li_days({
                            days: days
                        }));
                        $("#event_list_month").append(temp_li_months({
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
                if (event.get("start_date").getUTCFullYear() != current_date.getUTCFullYear() || event.get("start_date").getUTCMonth() != current_date.getUTCMonth()) {
                    current_date = event.get("start_date");
                    //check to see if there is a first el
                    if (days.length > 0) {
                        days[days.length - 1].height = day_counter * self.height;
                        if (months.length > 0) {
                            monthHeight = month_counter * self.height;
                            var monthArray = self.month2FullNameOrLetter(months[months.length - 1].month, monthHeight);
                            months[months.length - 1].height = monthHeight;
                            months[months.length - 1].letter = monthArray;
                        }
                    }
                    months.push({
                        month: current_date.getUTCMonth(),
                        year: current_date.getUTCFullYear()
                    });
                    days.push({
                        day: current_date.getUTCDate(),
                        month: current_date.getUTCMonth(),
                        year: current_date.getUTCFullYear()
                    });
                    month_counter = 0;
                    day_counter = 0;
                } else if (event.get("start_date").getUTCDate() != current_date.getUTCDate()) {
                    //checks to see if days are different
                    //genreates the days ul
                    current_date = event.get("start_date");
                    if (days.length > 0) {
                        days[days.length - 1].height = day_counter * self.height;
                    }
                    days.push({
                        day: current_date.getUTCDate(),
                        month: current_date.getUTCMonth(),
                        year: current_date.getUTCFullYear()
                    });
                    day_counter = 0;
                }
                events.push(event.toJSON());
                day_counter++;
                month_counter++;
            }, this);
            //set final heights
            if (days.length > 0) 
                days[days.length - 1].height = day_counter * self.height;
            if (months.length > 0) {
                monthHeight = month_counter * self.height;
                var month_letter = self.month2FullNameOrLetter(months[months.length - 1].month, monthHeight);
                months[months.length - 1].height = monthHeight;
                months[months.length - 1].letter = month_letter;
            }
            renderEl();
            return this;
        },
        /*
         * Generate the Colors for the events in the list
         * And the Colors for the Icons
         * And Generate the the Date Display at the top of the list
         */
        genarateColorsAndMonths: function(regenrate) {
            var self = this;
            //the range of colors (Hue) to use
            var colorRange = 240;
            //find the top elemetns
            var topVisbleEl = document.elementFromPoint($("#event_list").position().left + .5, $("#EventsListView").position().top+ 20);
            //have we moved enought to change colors?
            if ($(topVisbleEl).attr("class") && $(topVisbleEl).attr("class").split(" ")[0] == "event_item" && (self.topVisbleEl != topVisbleEl || regenrate)) {
                self.topVisbleEl = topVisbleEl;
                var topModelId = topVisbleEl.id.replace(/event_/, "");
                var top_start_date = self.model.get(topModelId).get("start_date");
                self.setMonthDay(top_start_date);
                self.setDay(top_start_date);
                //set map icons that are not in the current view
                var bottomPos = self.isListFull() ? $("#EventsListView").height() : $("#event_list").height();
                //add tolerance
                bottomPos = bottomPos - 11;
                var bottomVisbleEl = document.elementFromPoint($("#event_list").position().left, $("#EventsListView").position().top + bottomPos);

                var topIndex = $("#event_list").children().index(topVisbleEl);
                var bottomIndex = $("#event_list").children().index(bottomVisbleEl);

                //set the color to white for all over elements
                $(".event_item").css("background-color", "white");
                //set up event icons. Clears the prevouse colour 
                $(".viewed").removeClass("viewing");
                $(".viewed").each(function(index, el) {
                    var id = el.id.replace(/icon-/, "");
                    var model = self.model.get(id);
                    if (model.get("start_date") < top_start_date) {
                        H = 0;
                    } else {
                        H = colorRange;
                    }
                    $(el).find(".svgForeground").css("stroke", "grey").css("fill-opacity", 0.4).css("fill", "hsl(" + H + ",100%, 50%)");
                    self.markers[id].setZIndexOffset(-10);
                });
                //add color event items
                var numberOfEl = bottomIndex - topIndex;
                for (var i = 0; i <= numberOfEl; ++i) {
                    //var model = self.model.models[i];
                    var id = $(".event_item")[i + topIndex].id.replace(/event_/, "");
                    var H = (i / numberOfEl) * colorRange;
                    $("#event_" + id).css("background-color", "hsl(" + H + ",100%, 50%)");
                    //add colors to icons
                    if (!$("#icon-" + id).hasClass("viewed")) {
                        $("#icon-" + id).html($('#svg svg').clone());
                    }
                    $("#icon-" + id).addClass("viewed").addClass("viewing").find(".svgForeground").css("fill", "hsl(" + H + ",100%, 50%)").css("fill-opacity", 1).css("stroke", "black");
                    self.markers[id].setZIndexOffset(10);
                }
            }
        },
        setDay: function(date) {
            var day = date.getDay();
            $(".selected_day").removeClass("selected_day");
            $("#day_" + day).addClass("selected_day");
        },
        
        /*
         *Set the Month Letter, Day Number and Year at the top of the list
         */
        setMonthDay: function(date) {
            var self = this;
            //set month on side bar
            month = date.month2letter();
            day = date.getDate();
            $("#topMonthLetter").text(month + day);
            //set day on side bar
            $("#topYear").text(date.getFullYear());

        },
        /*
         * Positions the Month vertical on the side of the list as the 
         * user scolls
         */
        setMonthSideBarPosition: function() {
			var tolarance = 20;
            var topVisbleEl = document.elementFromPoint($("#event_list").position().left + .5, $("#EventsListView").position().top);
            var topModelId = topVisbleEl.id.replace(/event_/, "");
            var top_start_date = self.model.get(topModelId).get("start_date");
            var topMonthId = top_start_date.getUTCMonth() + "_" + top_start_date.getUTCFullYear();

            var halfHeight = $("#EventsListView").position().top + $("#EventsListView").height() / 2;
            var topElBottom = $("#month_" + topMonthId).position().top + $("#month_" + topMonthId).height();
            var topElwidth = $("#month_" + topMonthId).children().width();
            var bottomElwidth = $("#month_" + topMonthId).next().children().width();

  
            var current_top_month = $("#month_" + topMonthId).children();
            if(!this.current_top_month || (this.current_top_month.selector != current_top_month.selector)){
                $(".monthFixed").removeClass("monthFixed");
                //this fixes an edge condition of collapsing the top event
                if(this.current_top_month)
                    this.current_top_month.css("top", 0);
                this.current_top_month = current_top_month;
            }
            //set the top month tobe fixed  
            if (topElBottom > $("#EventsListView").position().top + topElwidth + tolarance) {
                current_top_month.addClass("monthFixed").removeClass("relative").css("top", $("#EventsListView").position().top);
            } else {
                //set the top monthe to be at the bottom of the li
                var parentHeight = $("#month_" + topMonthId).height();
                current_top_month.addClass("relative").removeClass("monthFixed").css("top", parentHeight - topElwidth - tolarance); //set to botto
            }
        },
        scrollTo: function(id) {
            var targetOffset = $("#EventsListView").scrollTop() - $("#EventsListView").position().top + $("#event_" + id).position().top;
            //$("#EventsListView").scrollTop(scrollTop);
            $("#EventsListView").animate({
                scrollTop: targetOffset
            }, 700);
        },
        //test to see if the list of events is full
        isListFull: function() {
            return ($("#EventsListView").height() < $("#event_list").height()) ? true : false;
        },
        month2FullNameOrLetter: function(monthNum, elHeight) {
            var self = this;
            var number0fChar = elHeight / 10;
            if (number0fChar < 10) {
                return Date.prototype.month2letter(monthNum);
            } else {
                var m_names = new Array(["January", 7], ["Febuary", 7], ["March", 5], ["April", 5], ["May", 3], ["June", 4], ["July", 4], ["August", 6], ["September", 9], ["October", 7], ["November", 8], ["December", 8]);
                month = m_names[monthNum];

                //month[0] = month[0].slice(0,number0fChar);
                return month[0];
            }
        }
    });

    return {
        EventsListView: EventsListView
    };
});
