/*global define alert*/
define(['jquery','leaflet', 'settings'], function($, L, settings) {
        "use strict";
        var bounds = new L.LatLngBounds(settings.bounds.ul, settings.bounds.lr);

        function mapquest (address, callback) {
            var boundString = settings.bounds.ul[0] +
                "," + settings.bounds.ul[1] +
                "," + settings.bounds.lr[0] +
                "," + settings.bounds.lr[1],
            url = "http://www.mapquestapi.com/geocoding/v1/address?" +
            "key=" + settings.api_key +
            "&boundingBox=" + boundString +
            "&location=" + address;

            queryGeoCoder(url, callback, function(data){
                return data.results[0].locations[0].latLng;
            });
        }

        //won't work JSONP not supported by google
        function google (address, callback) {
            var ne = bounds.getNorthEast(),
            sw = bounds.getSouthWest(),
            boundStr = sw.lat + "," + sw.lng + "|" + ne.lat + "," + ne.lng,
            url = "https://maps.googleapis.com/maps/api/geocode/json?address="+ address +
                "&bounds=" + boundStr +
                "&components=country:" + settings.region +
                "&sensor=false";

            queryGeoCoder(url, callback, function(data){
                return data.results[0].geometry.location;
            });
        }


        function queryGeoCoder(url, callback, locationFilter) {
            return $.ajax({
                url: url,
                dataType: 'jsonp'
            }).then(function(data) {
                var latlng = locationFilter(data);
                callback(latlng,data);
            });

        }

        return {
            mapquest: mapquest,
            google: google
        };
});
