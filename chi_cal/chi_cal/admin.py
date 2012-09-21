from django.contrib import admin
from django.contrib.gis.admin import OSMGeoAdmin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin, GroupAdmin
from chi_cal import models as db

class GeoAdmin(OSMGeoAdmin):
    default_lat = 39.95  # philadelphia
    default_lon = -75.16
    default_zoom = 2
    map_width = 750
    map_height = 500

admin.site.register(db.Event, GeoAdmin)

