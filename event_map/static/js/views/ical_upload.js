/*global define app alert*/
define([
   'jquery',
   'backbone',
   'utils',
   'hbs!../../templates/ical_upload'
  // Load our app module and pass it to our definition function
], function($,Backbone,utils,temp){
    "use strict";
    var UploadView = Backbone.View.extend({
        tagName: "div",
        className: "replace span7 overflow setheight",
        id: "event_view",
        height: 0,
        initialize: function(){
            var self = this;
            app.session.on("change", function(model) {
                self.render();
            });
        },
        events: {
            "click #upload_event": "upload_event",
            "click #import_url": "import_url"
        },
        onDOMadd: function(){
            // Actually confirm support
            if (utils.supportAjaxUploadWithProgress()) {
              // Ajax uploads are supported!
              // Init the Ajax form submission
                //initFullFormAjaxUpload();
              this.useAjax = true;
            }
        },
        render: function(){
            this.$el.html(temp());
            return this;
        },
        upload_event: function(e){
            e.preventDefault();
            if(this.useAjax){
                var formData = new FormData();

                // Since this is the file only, we send it to a specific location
                var action = '/upload';

                // FormData only has the file
                var fileInput = document.getElementById('file-id');
                var file = fileInput.files[0];
                formData.append('our-file', file);

                // Code common to both variants
                sendXHRequest(formData, action);
            }
        },
        import_url: function(e){
            e.preventDefault();
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
      var div = document.getElementById('upload-status');
      div.innerHTML = 'Upload started!';
    }

    // Handle the progress
    function onprogressHandler(evt) {
      var div = document.getElementById('progress');
      var percent = evt.loaded/evt.total*100;
      div.innerHTML = 'Progress: ' + percent + '%';
    }

    // Handle the response from the server
    function onreadystatechangeHandler(evt) {
      var status = null;

      try {
        status = evt.target.status;
      }
      catch(e) {
        return;
      }

      if (status == '200' && evt.target.responseText) {
           var events = JSON.parse(evt.target.responseText);
           if(events.length > 0){
                //show newly add events
           }else{
                alert("no events added!");
           }
      }else{
        //state 4 is done
        if(evt.currentTarget.readyState === 4)
            $("#upload_event_error").displayError(evt.target.responseText);
      }
    }

    return UploadView;
});
