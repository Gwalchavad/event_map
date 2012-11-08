define([
    'jquery',
    'underscore',
    'backbone',
    'models',
    'utils',

    'hbs!../../templates/event_add',
    'timeDatePicker',
  // Load our app module and pass it to our definition function
], function($,_,Backbone,Models,Utils,temp_event_add){
 
    var EventAddView = Backbone.View.extend({
        tagname: "div",
        className: "span7 overflow setheight replace",
        events: {
            "click #geocode_button": "geocode",
            "click #add_event": "add_event",
            "click .cancel": "cancel",
            "click #delete_event": "delete_event"
        },
        initialize: function() {            
            this.model.on("error", function(model, errors) {
                _.each(errors, function(error, key) {
                    $("#" + key + "_error").show().html(error);
                });
            });
        },
        render: function() {
            app.map.group.clearLayers();
            var context = _.extend({
                "settings": document.Settings
            }, this.model.toJSON());
            this.$el.append(temp_event_add(context));

            var marker = app.map.add_marker(this.model.get("location_point").coordinates,true);
            marker.on('dragend', function(e) {
                $('#id_lat').val(e.target._latlng.lat);
                $('#id_lng').val(e.target._latlng.lng);
            });
            //trigger resive event            
            //set up datetime picker. destroy?
            this.$el.find("#id_start_date").datetimepicker({
                dateFormat: 'yy-mm-dd',
                onClose: function(dateText, inst) {
                    var endDateTextBox = $('#id_end_date');
                    if (endDateTextBox.val() != '') {
                        var testStartDate = new Date(dateText);
                        var testEndDate = new Date(endDateTextBox.val());
                        if (testStartDate > testEndDate) endDateTextBox.val(dateText);
                    } else {
                        endDateTextBox.val(dateText);
                    }
                },
                onSelect: function(selectedDateTime) {
                    var start = $(this).datetimepicker('getDate');
                    $('#id_end_date').datetimepicker('option', 'minDate', new Date(start.getTime()));
                }
            });
            this.$el.find("#id_end_date").datetimepicker({
                dateFormat: 'yy-mm-dd',
                onClose: function(dateText, inst) {
                    var startDateTextBox = $('#id_start_date');
                    if (startDateTextBox.val() != '') {
                        var testStartDate = new Date(startDateTextBox.val());
                        var testEndDate = new Date(dateText);
                        if (testStartDate > testEndDate) startDateTextBox.val(dateText);
                    } else {
                        startDateTextBox.val(dateText);
                    }
                },
                onSelect: function(selectedDateTime) {
                    var end = $(this).datetimepicker('getDate');
                    $('#id_start_date').datetimepicker('option', 'maxDate', new Date(end.getTime()));
                }
            });
            return this;
        },
        geocode: function() {
            app.map.geocode($("#id_street").val() + " " + $("#id_city").val(), {
                onSuccess: function(lat, lng) {
                    $('#id_lat').val(lat);
                    $('#id_lng').val(lng);
                },
                onFail: function() {
                    alert("Could not Find, Please drag the Marker to the location of the event");
                }
            });
        },
        add_event: function(e){
            var self = this;
            //override the na
            e.preventDefault();
            //hide error messages
            $(".label").hide();
            this.model.set(Utils.form2object("#event_add_form"));
            promise = this.model.save();
            if (promise) {
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
            self = this;
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
