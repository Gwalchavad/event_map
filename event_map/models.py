from django.contrib.gis.db import models
from django.db.models import Q
from uuidfield import UUIDField
from django.contrib.auth.models import User

class Group(models.Model):
    visibility_choices = (
        ('public', 'Public'),
        ('private', 'Private'),
        ('unlisted', 'Unlisted'),
    )    
    name =  models.CharField(max_length=255, help_text="""
        the name of the group""")
    description =  models.CharField(max_length=255, help_text="""
        the name of the group""")
    visibility = models.CharField(max_length=32, choices=visibility_choices, default="maybe", help_text="""
        Whether or not user is attending protest.""")
    members = models.ManyToManyField(User, through='Subscription')
    def __unicode__(self):
        return self.name

class Feed(Group):
    source = models.URLField()
    source_type =  models.CharField(null=True, blank=True, max_length=255)

class Subscription(models.Model):
    user = models.ForeignKey(User)
    group = models.ForeignKey(Group)
    def __unicode__(self):
        return  self.user.username + " --> "+ self.group.name

class Event(models.Model):
    """Events!"""
    author = models.ForeignKey(User, null=True, blank=True, help_text="""
        The user who wrote this article.""")
    title = models.CharField(max_length=255, help_text="""
        A one-line title to describe article.""")
    content = models.TextField(help_text="""
        The contents of the article in Markdown.""")
    #convert to hide how many events?   
    uuid = UUIDField(auto=True)

    date_modified = models.DateTimeField(auto_now=True)

    date_created = models.DateTimeField(auto_now_add=True)

    start_date = models.DateTimeField( help_text="""
        What Date is this event Happening On?""")
    end_date = models.DateTimeField(null=True, help_text="""
        When is your event ending?""")
    location = models.CharField(null=True, blank=True, max_length=255, help_text="""
        the location of the event""")
    city = models.CharField(null=True, blank=True, max_length=255, help_text="""
        the location of the event""")
    venue = models.CharField(max_length=255,  blank=True, help_text="""
        the name of the Vuenue. For eample "Mom's House".""")
    link = models.CharField(null=True, max_length=255, blank=True,  help_text="""
        a link to other infomation on the event""")
    organization = models.CharField(null=True, max_length=255, blank=True,  help_text="""
        The name Of the organization or group that is putting on the event""")
    contact_info = models.CharField(null=True, max_length=255, blank=True,  help_text="""
        Get more info by contacting this email/phone number""")

    location_point = models.PointField(null=True, blank=True, help_text="""
        Aproximate coordinates of where the event will happen""")
    groups = models.ManyToManyField(Group)
    
    """Allow geospataul queries"""
    objects = models.GeoManager()

    def __unicode__(self):
        return self.title

    def save(self, *args, **kwargs):
        self.is_event = True
        return super(Event, self).save(*args, **kwargs)
