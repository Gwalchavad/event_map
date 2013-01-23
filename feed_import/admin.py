from django.contrib import admin
from feed_import import models as db

admin.site.register(db.Feed)
