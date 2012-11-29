from django.contrib import admin
from django.contrib.gis.admin import OSMGeoAdmin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin, GroupAdmin
from event_map import models as db

class GeoAdmin(OSMGeoAdmin):
    readonly_fields = ('date_modified','date_created')
    default_lat = 39.95 
    default_lon = -75.16
    default_zoom = 2
    map_width = 750
    map_height = 500    
 
admin.site.register(db.Event, GeoAdmin)
admin.site.register(db.Group)
admin.site.register(db.Feed)
admin.site.register(db.Permission)
