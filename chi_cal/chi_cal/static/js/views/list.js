var EventsListView = Backbone.View.extend({
    tagName: "div",
    className: "replace span4 overflow setheight",
    id: "EventsListView",
    height: 40,
    scrolltop:0,
    markers:[],
    events: {
        //"croll #event_list":function(){consel.log("test");}
    },
    initialize: function() {
        //bind the scroll event
        self = this;
        this.$el.scroll([this], this.onScroll);
        
        $(window).on('resize', function(){
                self.genarateColors();
            });
        
         //this should follow the preloading pattern and use reset()
        this.model.fetch({
            data: {
                n: -30
            },
            add: true,
            success: function() {
                self.render();
                $(window).resize();
            }
        });
        
        this.model.fetch({
            data: {
                n: 50
            },
            add: true,
            success: function() {
                self.render();
                $(window).resize();
            }
        });       
    },
    render: function() {
        Swarm.group.clearLayers(); 
        
        var day = false;
        var per_day = false;
        var month = false;
        var per_month = false;
        //create array to generate month names
        var months = [];
        var month_count = 1;
        var days = [];
        var day_count = 1;
        var events = [];
        this.model.forEach(function(model,key) {
            //check to see if we need to update the day name
            var _start_date = new Date(model.get("start_date"))
            var _end_date = new Date(model.get("end_date"))
            //genrates the months ul
            if(_start_date.getMonth() != month ){
                per_month = month;
                month = _start_date.getMonth(); 
                if(per_month){
                    var height = month_count * this.height;
                    months.push({month:this.month2letter(per_month),height:height});
                }
                month_count = 0; 
            }
            //genreates the days ul
            if( _start_date.getDate() != day){
                per_day = day;
                day = _start_date.getDate();
                if(per_day){    
                    var height = day_count * this.height;
                    days.push({day:per_day,height:height});
                }
                day_count = 0;
            }
            //items in the ul
            //remove the spaces in time
            model.set("start_time",_start_date.getTimeCom().replace(/\s+/g, ""));
            model.set("end_time",_end_date.getTimeCom().replace(/\s+/g, ""));              
            events.push(model.toJSON());
            //set map icons
            var myIcon = L.divIcon({ 
                    className:"icon", 
                    html:'<div id=\'icon-'+key+'\', style=\'color:#0000FF\'></div>',
                    iconAnchor:[9, 20]
                });
            loca_p = model.get("location_point");
            var marker = L.marker([loca_p.coordinates[1],loca_p.coordinates[0]], {icon: myIcon});
            marker.bindPopup("<span>"+
                model.get("start_time")+"-"+
                model.get("end_time")+
                " "+model.get("title")+
                "</span>");
            Swarm.group.addLayer(marker);
            this.markers[key] = marker;
            month_count++;
            day_count++;
        }, this);
        
        var height = (day_count-1) * this.height;
        days.push({day:day,height:height});
        
        height = (month_count -1) * this.height;
        months.push({month:this.month2letter(month),height:height});
        Swarm.group.addTo(Swarm.map);
        var html = Handlebars.loadedTemps["event_list_template"]({months:months,days:days, events:events, height: this.height});
        this.$el.html(html);
        //genrate colors
        this.genarateColors();
        return this;
    },
    onScroll: function(e) {
        self.genarateColors();
    },
    genarateColors:function(){
        var tolerence = .2;
        
        var offset = this.$el.scrollTop() / self.height + tolerence;
        offset = Math.floor(offset); 
            if(this.$el.height() < $("#event_list").height()){
                var visbleHeight = this.$el.height();
            }else{
                var visbleHeight = $("#event_list").height();
            }
        numberOfEl = Math.ceil(visbleHeight / self.height);

        //set month
        _start_date = new Date(self.model.models[offset].get("start_date"));
        month = _start_date.getMonth(); 
        $("#event_list_top_month").text(self.month2letter(month));
        //set day
        day = _start_date.getDate();
        $("#event_list_top_day").text(day);
        for (var i = offset; i < numberOfEl + offset; ++i) {
            H = ((i - offset) / numberOfEl) * 360;
            $($(".event_item")[i]).css("background-color", "hsl(" + H + ",100%, 50%)");
            $("#icon-"+i).html($('#svg svg').clone()).find(".svgForeground").css("fill", "hsl(" + H + ",100%, 50%)");
            //$($(".event_item")[i]).animate({"background-color":"hsl("+H+",100%, 50%)"}, 'fast');
            //bring the maker to the front if it exist
            //sometimes it doesn't becauase numberOfEl uses ceil.
            if(self.markers[i]){
                self.markers[i].setZIndexOffset(100); 
            }
        } 
           
        //scolling down
        var onepast = offset-1;
        if($(".event_item")[onepast]){
            //zIndexOffset
            $('#icon-'+onepast).find(".svgForeground").css("stroke","grey");            
            $('#icon-'+onepast).find(".svgForeground").css("fill-opacity",0.4);
            $('#icon-'+onepast).find(".svgForeground").css("fill","grey");
            this.markers[onepast].setZIndexOffset(-100);  
             //this.markers[onepast].setOpacity(".1");
        }
        //scolling up
        var onefuture = numberOfEl + offset;
        if($(".event_item")[onefuture]){
            $('#icon-'+onefuture).find(".svgForeground").css("stroke","none");
            $('#icon-'+onefuture).find(".svgForeground").css("fill-opacity",0.4);
            $('#icon-'+onefuture).find(".svgForeground").css("fill","blue");    
            this.markers[onefuture].setZIndexOffset(-100);       
        }
        
        this.scrolltop = this.$el.scrollTop();
    },
    month2letter:function(num){
        var m_names = new Array("J", "F", "M", 
        "A", "M", "J", "J", "A", "S", 
        "O", "N", "D"); 
        
        return m_names[num];
    }
});
