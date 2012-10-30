(function( window ) {
	
	window.Swarm = {};
	
	var props;
	var map;
	var marker;
	
	Swarm.int_map = function(settings){
			props = {};
			props.center =  new L.LatLng(settings.center[0],settings.center[1]); 
			props.topLeft = new L.LatLng(settings.bounds.tl[0],settings.bounds.tl[1]);
			props.lowerRight = new L.LatLng(settings.bounds.lr[0],settings.bounds.lr[1]);
			props.bounds = new L.LatLngBounds(props.topLeft, props.lowerRight);
			props.tilesetUrl =  settings.tilesetUrl;
			props.tilesetAttrib = settings.tilesetAttrib;
			props.api_key = settings.api_key;
			
            //creat a group
            Swarm.group = L.layerGroup();
			// create the tile layer with correct attribution
			var osm = new L.TileLayer(props.tilesetUrl, {
				minZoom: 2,
				maxZoom: 20,
				attribution: props.tilesetAttrib
			});     
			// set up the map
		    Swarm.map = new L.Map('map',{
				center:props.center,
				zoom: settings.zoom,
				layers: [osm]    
			});
			
			var ChaseMarkerOptions = {
				fillColor: "#ff7800",
				color: "#000",
				weight: 1,
				opacity: 1,
				fillOpacity: 0.8
			};
	};

   Swarm.geocode = function(address,callback){
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
                Swarm.map.setView(newCenter,13,false);
                marker.setLatLng(newCenter);
                if(callback.onSuccess){
					callback.onSuccess(latlng.lat,latlng.lng);
                }
            }else{
				callback.onFail(data);
			}
        });
        
    };	

   Swarm.add_marker = function(callback){	
		marker = new L.Marker(props.center,{draggable:true});
		Swarm.map.addLayer(marker);
		return marker;
	};
	
	
	Swarm.remove_marker = function(){
		Swarm.map.removeLayer(marker);
	}
	
})(this)
