/*global define alert*/
define(['jquery','underscore', 'backbone', 'leaflet', 'settings'], function($, _, Backbone, L, settings) {
    "use strict";
    L.Icon.Default.imagePath = "/static/components/leaflet/dist/images";
    var mapView = {
        map: null,
        currentPos: null,
        props: {},
        marker: null,
        initialize: function() {
            this.props.center = new L.LatLng(settings.center[0], settings.center[1]);
            this.props.topLeft = new L.LatLng(settings.bounds.tl[0], settings.bounds.tl[1]);
            this.props.lowerRight = new L.LatLng(settings.bounds.lr[0], settings.bounds.lr[1]);
            this.props.bounds = new L.LatLngBounds(this.props.topLeft, this.props.lowerRight);
            this.props.tilesetUrl = settings.tilesetUrl;
            this.props.tilesetAttrib = settings.tilesetAttrib;
            this.props.api_key = settings.api_key;

            // create the tile layer with correct attribution
            var osm = new L.TileLayer(this.props.tilesetUrl, {
                minZoom: 2,
                maxZoom: 20,
                attribution: this.props.tilesetAttrib
            });
            // set up the map
            this.map = new L.Map('map', {
                center: this.props.center,
                zoom: settings.zoom,
                layers: [osm]
            });
            //creat a group
            this.group = L.layerGroup();
            this.group.addTo(this.map);
            this.map.on('locationfound', this.onLocationFound, this);
            this.map.on('locationerror', this.onLocationError, this);
            this.map.locate({
                watch: true,
                enableHighAccuracy: true
            });
        },

        onLocationFound: function(e) {
            var radius = e.accuracy / 2;
            var locationMaker = L.marker(e.latlng).addTo(this.map).
            bindPopup("You are within " + radius + " meters from this point");
            if (this.props.bounds.contains(e.latlng)) {
                this.map.setView(e.latlng, 13);
                locationMaker.openPopup();
            }
            this.currentPos = e.latlng;
            L.circle(e.latlng, radius).addTo(this.map);
        },
        onLocationError: function(e) {
            alert(e.message);
        },
        geocode: function(address, callback) {
            var self = this;
            $.ajax({
                url: "http://www.mapquestapi.com/geocoding/v1/address?" + "key=" +
                this.props.api_key +
                "&boundingBox=" + this.props.bounds.toBBoxString() +
                "&location=" + address,
                dataType: 'jsonp'
            }).done(function(data) {
                var latlng = data.results[0].locations[0].latLng;
                if (this.props.bounds.contains([latlng.lat, latlng.lng])) {
                    var newCenter = new L.LatLng(latlng.lat, latlng.lng);
                    self.map.setView(newCenter, 13, false);
                    this.marker.setLatLng(newCenter);
                    if (callback.onSuccess) {
                        callback.onSuccess(latlng.lat, latlng.lng);
                    }
                } else {
                    callback.onFail(data);
                }
            });

        },
        add_marker: function(coordinates, draggable) {
            //clone so we don't reverse the actully coodinates
            var latlng = coordinates ? _.clone(coordinates).reverse() : this.props.center;
            this.marker = new L.Marker(latlng, {
                draggable: draggable
            });
            this.group.addLayer(this.marker);
            return this.marker;
        }
    };

    L.LatLng.prototype.toUrlString = function() {
        return this.lat + "," + this.lng;
    };

    return mapView;
});
