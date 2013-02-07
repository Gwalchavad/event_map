// Require.js allows us to configure shortcut alias
/*global require*/
require.config({
    deps: ["main"],
    hbs : {
        templateExtension : 'must',
        // if disableI18n is `true` it won't load locales and the i18n helper
        // won't work as well.
        disableI18n : true,
        helperDirectory : "../templates/helpers/"
    },
    paths: {
        "backbone": "../components/backbone/backbone",
        "routefilter": "../components/backbone.routefilter/dist/backbone.routefilter",
        "bootstrap": "../components/bootstrap/js/bootstrap",
        "handlebars":"../components/handlebars/handlebars",
        "hbs": "../components/require-handlebars-plugin/hbs",
        "i18nprecompile": "../components/require-handlebars-plugin/hbs/i18nprecompile",
        "json2": "../components/require-handlebars-plugin/hbs/json2",
        "jquery": "../components/jquery/jquery",
        "jquery-timepicker-addon": "../components/jquery-timepicker-addon",
        "jqueryUI": "../components/jqueryUI",
        "leaflet": "../components/leaflet/dist/leaflet",
        "require": "../components/require",
        "underscore": "../components/underscore/underscore"
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
        'routefilter': ['backbone'],
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
    }
});
