define([
    'backbone',
    'leaflet',
    'settings'
],function (Backbone,L,settings){
    var mapView = Backbone.View.extend({
        props:null,
        map:null,
        marker:null,
        
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
                
                var ChaseMarkerOptions = {
                    fillColor: "#ff7800",
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                };
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
            latlng = coordinates ? coordinates.reverse() : props.center;
            
            marker = new L.Marker(latlng,{draggable:draggable});
            this.group.addLayer(marker);
            return marker;
        }
    });
    
    return{
        mapView:mapView
    }
});
