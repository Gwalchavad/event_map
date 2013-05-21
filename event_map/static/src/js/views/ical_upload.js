/*global define app alert*/
define(['jquery', 'backbone', 'utils', 'jade!../../templates/ical_upload'
// Load our app module and pass it to our definition function
], function($, Backbone, utils, temp) {
    "use strict";
    var UploadView = Backbone.View.extend({
        tagName: "div",
        className: "replace span7 overflow setheight",
        id: "event_view",
        initialize: function() {
            var self = this;
            console.log("test");
            app.session.on("change", function(model) {
                self.render();
            });
        },
        events: {
            "click #upload_event": "upload_event",
            "click #import_url": "import_url"
        },
        onDOMadd: function() {
            // Actually confirm support
            if (utils.supportAjaxUploadWithProgress()) {
                // Ajax uploads are supported!
                // Init the Ajax form submission
                //initFullFormAjaxUpload();
                this.useAjax = true;
            }
        },
        render: function() {
            this.$el.html(temp());
            return this;
        },
        upload_event: function(e) {
            if (this.useAjax) {
                e.preventDefault();
                var formData = new FormData(),
                action = '/upload',
                fileInput = document.getElementById('file-id'),
                files = fileInput.files;
                for (var i = 0; i < files.length; i++) {
                    formData.append("file" + i, files[i]);
                }
                sendXHRequest(formData, action);
            }
        },
        import_url: function(e) {
            if (this.useAjax) {
                e.preventDefault();
                var form = document.getElementById('form-import');
                var formData = new FormData(form);
                // Since this is the file only, we send it to a specific location
                var action = '/import';
                // Code common to both variants
                sendXHRequest(formData, action);
            }
        }
    });
    // Once the FormData instance is ready and we know
    // where to send the data, the code is the same
    // for both variants of this technique
    //http://blog.new-bamboo.co.uk/2012/01/10/ridiculously-simple-ajax-uploads-with-formdata
    function sendXHRequest(formData, uri) {
        // Get an XMLHttpRequest instance
        var xhr = new XMLHttpRequest();

        // Set up events
        xhr.upload.addEventListener('loadstart', onloadstartHandler, false);
        xhr.upload.addEventListener('progress', onprogressHandler, false);
        xhr.addEventListener('readystatechange', onreadystatechangeHandler, false);
        // Set up request
        xhr.open('POST', uri, true);
        xhr.setRequestHeader("x-csrftoken", utils.getCookie('csrftoken'));
        // Fire!
        xhr.send(formData);
    }

    // Handle the start of the transmission
    function onloadstartHandler(evt) {
        $('#upload-status').html('Upload started!');
    }

    // Handle the progress
    function onprogressHandler(evt) {
        var percent = evt.loaded / evt.total * 100;
        $('#progress').html('Progress: ' + percent + '%');
    }

    // Handle the response from the server
    function onreadystatechangeHandler(evt) {
        var status = null;
        try {
            status = evt.target.status;
        } catch (e) {
            return;
        }
        //readyState == DONE == 4
        if (evt.currentTarget.readyState === 4) {
            if (status == '200' && evt.target.responseText) {
                var events = JSON.parse(evt.target.responseText);
                //show newly add events
                if (events.length > 0) {
                    app.eventList.add(events);
                    if (events.length === 1){
                        app.navigate('event/'+events[0].slug + "/edit", {
                            trigger: true
                        });
                    }else{
                        app.recentEvents = events;
                        app.navigate('added', {
                            trigger: true
                        });
                    }
                } else {
                    alert("no events added!");
                }
            } else {
                $("#upload_event_error").displayError(evt.target.responseText);
            }
        }
    }
    return UploadView;
});
