/*global define alert confirm app L*/
define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'utils',
    'geocode',
    'settings',
    'views/map',
    'hbs!../../templates/event_add',
    'timeDatePicker'
  // Load our app module and pass it to our definition function
], function($,_,Backbone, moment, Utils, geocoder,settings,map,temp_event_add){
    "use strict";
    var EventAddView = Backbone.View.extend({
        tagname: "div",
        //$(".form-actions").height()
        className: "span7 overflow setheight replace",
        events: {
            "click #geocode_button": "geocode",
            "click #add_event": "add_event",
            "click .cancel": "cancel",
            "click #delete_event": "delete_event"
        },
        initialize: function() {
            this.constructor.__super__.initialize.apply(this);
            this.model.on("invalid", function(model, errors) {
                _.each(errors, function(error, key) {
                    if(key == "latlng"){
                        map.marker.unbindPopup();
                        map.marker
                            .bindPopup("<b>You Need To Move The Maker<br> To Where This Event Is Happening</b>")
                            .openPopup();
                    }else{
                        $("#" + key + "_error").show().html(error);
                        $("#" + key).addClass("error");
                    }
                });
            });
        },
        render: function() {
            var context = _.extend({
                "settings": settings
            }, this.model.toJSON()),
            marker;
            //untill i figure out how to accesses arrey indexes in handlebars
            if(context.location_point){
                context.location_point.lat = context.location_point.coordinates[1];
                context.location_point.lng = context.location_point.coordinates[0];
            }
            if(context.start_date)
                context.start_date = context.start_datetime.format("MM/DD/YYYY hh:mm a");
            if(context.end_date)
                context.end_date = context.end_datetime.format("MM/DD/YYYY hh:mm a");

            this.$el.html(temp_event_add(context));
            if(this.model.get("location_point")){
                marker = map.add_marker(this.model.get("location_point").coordinates,true);
            }else{
                marker = map.add_marker(null,true);
            }
            marker.on('dragend', function(e) {
                $('#lat').val(e.target._latlng.lat);
                $('#lng').val(e.target._latlng.lng);
            });
            marker.bindPopup("Move the maker to where the events will be").openPopup();
            //trigger resive event
            //set up datetime picker. destroy?
            var startDateTextBox = this.$el.find("#start_date_input"),
            endDateTextBox = this.$el.find("#end_date_input");

            startDateTextBox.datetimepicker({
                timeFormat: "hh:mm tt",
                onClose: function(dateText, inst) {
                    if (endDateTextBox.val() !== '') {
                        var testStartDate = startDateTextBox.datetimepicker('getDate');
                        var testEndDate = endDateTextBox.datetimepicker('getDate');
                        if (testStartDate > testEndDate)
                            endDateTextBox.datetimepicker('setDate', testStartDate);
                    }
                    else {
                        endDateTextBox.val(dateText);
                    }
                },
                onSelect: function (selectedDateTime){
                    endDateTextBox.datetimepicker('option', 'minDate', startDateTextBox.datetimepicker('getDate') );
                }
            });
            endDateTextBox.datetimepicker({
                timeFormat: "hh:mm tt",
                minDate: new Date(),
                onClose: function(dateText, inst) {
                    if (startDateTextBox.val() !== '') {
                        var testStartDate = startDateTextBox.datetimepicker('getDate');
                        var testEndDate = endDateTextBox.datetimepicker('getDate');
                        if (testStartDate > testEndDate)
                            startDateTextBox.datetimepicker('setDate', testEndDate);
                    }
                    else {
                        startDateTextBox.val(dateText);
                    }
                },
                onSelect: function (selectedDateTime){
                    startDateTextBox.datetimepicker('option', 'maxDate', endDateTextBox.datetimepicker('getDate') );
                }
            });
            return this;
        },
        onResize: function(e){
            if(this.originalHeight <  $(window).height()){
                $(".form-actions").height($(window).height() - this.originalHeight);
            }else{
                $(".form-actions").height(this.formActionHeight);
            }
        },
        onDOMadd: function(e){
            this.formActionHeight = $(".form-actions").height();
            this.originalHeight = $(".top").height() + $("#event_add_form").height() - this.formActionHeight;
            this.onResize();
        },
        geocode: function() {
            geocoder.mapquest($("#street_input").val() + ", " + $("#city_state_input").val(),
                function(latlng, lng) {
                    $('#lat').val(latlng.lat);
                    $('#lng').val(latlng.lng);
                    var newCenter = new L.LatLng(latlng.lat, latlng.lng);
                    map.map.setView(newCenter, 15, false);
                    map.marker.setLatLng(newCenter);
                }
            );
        },
        add_event: function(e){
            var self = this;
            //override the na
            e.preventDefault();
            //hide error messages
            $(".label").hide();
            var json = Utils.form2object("#event_add_form");
            if(json.start_date)
                json.start_date = moment($("#start_date_input").datetimepicker('getDate'));
            if(json.end_date)
                json.end_date = moment($("#end_date_input").datetimepicker('getDate'));
            var promise = this.model.save(json,{isComplete:true});
            if(promise){
                promise.error(function(response) {
                    throw new Error("Server Error:" + response);
                });
                promise.success(function(response) {
                    app.navigate('event/' + self.model.id, {
                        trigger: true
                    });
                });
            }
        },
        cancel: function(e) {
            //todo addddddd delete
            e.preventDefault();
            app.navigate('/#', {
                trigger: true
            });
        },
        delete_event: function(e) {
            e.preventDefault();
            var self = this;
            if (confirm("Do you want to Delete your event?")) {
                self.model.destroy({
                    success: function() {
                        app.navigate('/#', {
                            trigger: true
                        });
                    }
                });
            }
        }
    });

    return {
        EventAddView:EventAddView
    };
});
