from django.contrib.gis.db import models
from django.db.models import Q
from occupywallst.models import Article
from uuidfield import UUIDField


        
class Event(Article):
    """Events!"""
    #maybe should be put in article

    class Meta:
        permissions = (
            ("edit", "Can Edit the Event"),
            ("delete", "Can Delete the Event")
        )
    #convert to hide how many events?   
    uuid = UUIDField(auto=True)

    date_modified = models.DateTimeField(auto_now=True)

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

    def __unicode__(self):
        return self.title       
    
    def save(self, *args, **kwargs):
        self.is_event = True
        return super(Event, self).save(*args, **kwargs) 
