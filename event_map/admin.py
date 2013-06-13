from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from guardian.admin import GuardedModelAdmin
from django.contrib.gis.admin import OSMGeoAdmin
from event_map import models as db


class EventAdmin(OSMGeoAdmin):
    readonly_fields = ('slug', 'date_modified', 'date_created')
    list_display = ('title', 'author', 'start_date', 'end_date', 'start_date_index', 'date_modified', 'date_created')
    search_fields = ('title', 'author__username')
    default_lat = 39.95
    default_lon = -75.16
    default_zoom = 2
    map_width = 750
    map_height = 500


# Define an inline admin descriptor for UserGroup model
# which acts a bit like a singleton
class UserGroupInline(admin.StackedInline):
    model = db.UserGroup
    can_delete = False
    verbose_name_plural = 'User Group'


# Define a new User admin
class UserAdmin(UserAdmin):
    inlines = (UserGroupInline, )

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

admin.site.register(db.Event, EventAdmin)
admin.site.register(db.AbstractGroup, GuardedModelAdmin)
admin.site.register(db.Group)
admin.site.register(db.UserGroup)
admin.site.register(db.FeedGroup)
admin.site.register(db.Verbiage)
admin.site.register(db.Subscription)
admin.site.register(db.emObject)
admin.site.register(db.SubGroupEvent)
