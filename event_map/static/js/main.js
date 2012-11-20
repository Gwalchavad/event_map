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
        leaflet: 'lib/leaflet/leaflet',
        backbone: 'lib/backbone',
        handlebars: 'lib/handlebars',
        hbs: 'lib/hbs',
        i18nprecompile : "lib/hbs/i18nprecompile",
        json2 : "lib/hbs/json2",
        timeDatePicker: 'lib/jquery-ui-sliderAccess',
        jqueryui:'lib/jquery-ui-1.8.21.custom.min',
        timepicker:'lib/jquery-ui-timepicker-addon',
        bootstrap:'lib/bootstrap'
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
        'bootstrap':['jquery'],
        'jqueryui': ['jquery'],
        'timepicker':['jqueryui'],
        'timeDatePicker':['timepicker'],
        'leaflet':{
            exports:'L'
        }
        
    },

});

require([
  // Load our app module and pass it to our definition function
  'jquery',
  'app',
], function($,App){
    // The "app" dependency is passed in as "App"
    $(function(){
        App.initialize();
    });
});


