define([
    'underscore',
    'backbone',
    'leaflet',
    'settings'
],function (_,Backbone,L,settings){
    
    var mapView = Backbone.View.extend({
        map:null,
        currentPos:null,
        initialize : function(){
            props = {};
            props.center =  new L.LatLng(settings.center[0],settings.center[1]); 
            props.topLeft = new L.LatLng(settings.bounds.tl[0],settings.bounds.tl[1]);
            props.lowerRight = new L.LatLng(settings.bounds.lr[0],settings.bounds.lr[1]);
            props.bounds = new L.LatLngBounds(props.topLeft, props.lowerRight);
            props.tilesetUrl =  settings.tilesetUrl;
            props.tilesetAttrib = settings.tilesetAttrib;
            props.api_key = settings.api_key;
            

            // create the tile layer with correct attribution
            var osm = new L.TileLayer(props.tilesetUrl, {
                minZoom: 2,
                maxZoom: 20,
                attribution: props.tilesetAttrib
            });     
            // set up the map
            this.map = new L.Map('map',{
                center:props.center,
                zoom: settings.zoom,
                layers: [osm]    
            });
            
            //creat a group
            this.group = L.layerGroup();        
            this.group.addTo(this.map);   
            this.map.on('locationfound', this.onLocationFound,this);
            this.map.on('locationerror', this.onLocationError,this);
            this.map.locate({
                watch: true,
                enableHighAccuracy:true
            });
        },

        onLocationFound:function (e) {
            var radius = e.accuracy / 2;
            locationMaker = L.marker(e.latlng).addTo(this.map).bindPopup("You are within " + radius + " meters from this point");
            if (props.bounds.contains(e.latlng)) {
                this.map.setView(e.latlng, 13);
                locationMaker.openPopup();
            }
            this.currentPos = e.latlng;
            L.circle(e.latlng, radius).addTo(this.map);
            
        },
        onLocationError:function (e) {
            alert(e.message);
        },
        geocode:function(address,callback){
            $.ajax({
               url:"http://www.mapquestapi.com/geocoding/v1/address?"+
               "key="+props.api_key+
               "&boundingBox="+props.bounds.toBBoxString()+
               "&location="+address,
               dataType:'jsonp',
            }).done(function(data){ 
                var latlng = data.results[0].locations[0].latLng;
                if(props.bounds.contains([latlng.lat,latlng.lng])){
                    var newCenter = new L.LatLng(latlng.lat,latlng.lng);           
                    this.map.setView(newCenter,13,false);
                    marker.setLatLng(newCenter);
                    if(callback.onSuccess){
                        callback.onSuccess(latlng.lat,latlng.lng);
                    }
                }else{
                    callback.onFail(data);
                }
            });
            
        },
        add_marker:function(coordinates,draggable){
            //clone so we don't reverse the actully coodinates
            latlng = coordinates ? _.clone(coordinates).reverse() : props.center;
            marker = new L.Marker(latlng,{draggable:draggable});
            this.group.addLayer(marker);
            return marker;
        }
    });

    L.LatLng.prototype.toUrlString = function(){
        return this.lat + ","+this.lng;
    };
    
    return mapView;
});
