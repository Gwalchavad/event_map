// Filename: main.js

// Require.js allows us to configure shortcut alias
// There usage will become more apparent further along in the tutorial.
require.config({
     hbs : {
        templateExtension : 'must',
        // if disableI18n is `true` it won't load locales and the i18n helper
        // won't work as well.
        disableI18n : true
    },
  
    paths: {
        jquery: 'lib/jquery',
        underscore: 'lib/underscore',
        backbone: 'lib/backbone',
        handlebars: 'lib/handlebars',
        hbs: 'lib/hbs',
        i18nprecompile : "lib/hbs/i18nprecompile",
        json2 : "lib/hbs/json2",
        timeDatePicker: 'lib/jquery-ui-sliderAccess',
        jqueryui:'lib/jquery-ui-1.8.21.custom.min',
        timepicker:'lib/jquery-ui-timepicker-addon'
    },
    shim: {
        'underscore':{
             exports: '_'
        },
        'backbone': {
            //These script dependencies should be loaded before loading
            //backbone.js
            deps: ['underscore', 'jquery'],
            //Once loaded, use the global 'Backbone' as the
            //module value.
            exports: 'Backbone'
        },
        'handlebars': {
            exports: 'Handlebars'
        },
        'jqueryui': ['jquery'],
        'timepicker':['jqueryui'],
        'timeDatePicker':['timepicker']
        
    },

});

require([
  // Load our app module and pass it to our definition function
  'jquery',
  'app',
  'utils',
], function($,App,Utils){
    //get site settings
    $.ajax({
        url: "/static/site_settings.json",
        dataType: 'json',
        error: function(jqXHR, textStatus) {
            throw new Error("Invalid Settings Syntax! Check " + this.url);
        }
    }).done(function(settings) {
        document.Settings = settings;
    });
    // The "app" dependency is passed in as "App"
    $(function(){
        //load map
        $.ajax({
            url: "/static/map_settings.json",
            dataType: 'json',
            error: function(jqXHR, textStatus) {
                throw new Error("Invalid Maps Settings Syntax! Check " + this.url);
            }
        }).done(function(settings) {
            App.initialize({map: settings});
        });
    });
});


