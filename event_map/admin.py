from django.contrib import admin
from django.contrib.gis.admin import OSMGeoAdmin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin, GroupAdmin
from event_map import models as db

class EventAdmin(OSMGeoAdmin):
    readonly_fields = ('slug','date_modified','date_created')
    list_display = ('title','author','date_modified', 'date_created')
    search_fields = ('title','author__username')
    default_lat = 39.95 
    default_lon = -75.16
    default_zoom = 2
    map_width = 750
    map_height = 500    
 
admin.site.register(db.Event, EventAdmin)
admin.site.register(db.Group)
admin.site.register(db.UserGroup,)
admin.site.register(db.FeedGroup)
admin.site.register(db.Permission)
admin.site.register(db.Verbiage)
admin.site.register(db.emObject)
