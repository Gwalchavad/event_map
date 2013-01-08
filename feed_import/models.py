from django.db import models

class Feed(models.Model):
    feed_url = models.URLField(unique=True)
    content = models.TextField()
    last_import = models.DateTimeField(auto_now=True)
    #feed_type = ""
