/*global define jQuery*/
define([
   'jquery',
   'underscore',
  // Load our app module and pass it to our definition function
], function($,_){
    "use strict";
    //send the CSRFToken in the header. from django docs
    var getCookie = function(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };
    function sameOrigin(url) {
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    }
    function safeMethod(method) {
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    var form2object = function(selector){
        /*
         * Form 2 Object: takes a select of a form and returns the contents
         * of the form in an object
         */
        var result = {},
        formArray = $(selector).serializeArray();
        _.each(formArray,function(element){
                if(element.value != "csrfmiddlewaretoken")
                    result[element.name] = element.value;
            } );
        return result;
    };
    var supportAjaxUploadWithProgress = function() {
      return supportFileAPI() && supportAjaxUploadProgressEvents() && supportFormData();

      // Is the File API supported?
      function supportFileAPI() {
        var fi = document.createElement('INPUT');
        fi.type = 'file';
        return 'files' in fi;
      }

      // Are progress events supported?
      function supportAjaxUploadProgressEvents() {
        var xhr = new XMLHttpRequest();
        return !! (xhr && ('upload' in xhr) && ('onprogress' in xhr.upload));
      }

      // Is FormData supported?
      function supportFormData() {
        return !! window.FormData;
      }
    };
    var updateURLParameter = function(url, param, paramVal){
        /*
        * http://stackoverflow.com/a/10997390/11236
        */
        var newAdditionalURL = "";
        var tempArray = url.split("?");
        var baseURL = tempArray[0];
        var additionalURL = tempArray[1];
        var temp = "";
        if (additionalURL) {
            tempArray = additionalURL.split("&");
            for (var i=0; i<tempArray.length; i++){
                if(tempArray[i].split('=')[0] != param){
                    newAdditionalURL += temp + tempArray[i];
                    temp = "&";
                }
            }
        }

        var rows_txt = temp + "" + param + "=" + paramVal;
        return baseURL + "?" + newAdditionalURL + rows_txt;
    };

    return {
        getCookie: getCookie,
        form2object: form2object,
        updateURLParameter: updateURLParameter,
        safeMethod: safeMethod,
        sameOrigin: sameOrigin,
        supportAjaxUploadWithProgress: supportAjaxUploadWithProgress
    };
});
