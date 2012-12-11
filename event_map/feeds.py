r"""

    event_map.feeds
    ~~~~~~~~~~~~~~~~~~

    Tools for syndicating articles via Atom and Icalendar.

"""


from django.conf import settings
from django.utils.html import escape
from django.contrib.syndication.views import Feed
from django.utils.feedgenerator import Atom1Feed
from event_map import utils, models as db
from django.contrib.gis.geos import Polygon
from django_ical.views import ICalFeed

def _str_to_bbox(val):
    try:
        swlat, swlng, nwlat, nwlng = [float(s) for s in val.split(',')]
        return Polygon.from_bbox([swlng, swlat, nwlng, nwlat])
    except:
        return None

class geoFeed(Feed):
    def get_object(self, request, *args, **kwargs):
        self.bounds = request.GET.get("bbox")
        bbox = _str_to_bbox(self.bounds)
        if bbox:
            events = db.Event.objects.filter(location_point__contained=bbox)
        else:
            events = db.Event.objects.all()
        return events

class atomAllFeed(geoFeed):
    feed_type = Atom1Feed
    title_prefix = "event_Map's New Events"
    link = "/"
    description_template = "atom.html"
    subtitle = "All of the new events that get posted to event_map "
    #description_template = 'occupywallst/feed-article.html'

    def items(self, obj):
        return (obj.order_by('-date_created'))[:25]

    def item_title(self, event):
        return escape(event.title) + " " + str(event.start_date)

    def item_pubdate(self, event):
        return event.date_modified

    def item_author_name(self, event):
        if event.author:
            return event.author.username
        else:
            return 'anonymous'

    def item_author_link(self, event):
        if event.author:
            return event.author.get_absolute_url()
        else:
            return None
    
    def title(self, obj):
        return self.title_prefix + ((" At " +  self.bounds) if self.bounds else "")

class atomUserFeed(atomAllFeed):
    def get_object(self, request, user):
        events = super(atomUserFeed, self).get_object(request)
        user = db.User.objects.get(username=user)
        return events.filter(groups=user.usergroup.id)

class iCalAllFeed(ICalFeed,geoFeed):
    """
    A simple event calender
    """
    timezone = 'America/Chicago'
    
    def product_id(self):
        return "//event_map//all"+  ((" At " +  self.bounds) if self.bounds else "")+"//EN"
        
    def items(self, obj):
        return obj.order_by('-start_date')
    def item_title(self, item):
        return item.title
    def item_description(self, item):
        return item.content
    def item_created(self,item):
        return item.date_created
    def item_modified(self,item):
        return item.date_modified
    def item_start_datetime(self, item):
        return item.start_date
    def item_end_datetime(self, item):
        return item.start_date
    def item_location(self,item):
        return item.venue + ((" At " +  item.location) if item.location else "")
    def item_geolocation(self,item):
        return item.location_point.y,item.location_point.x
        
class iCalUserFeed(iCalAllFeed):
    def get_object(self, request, user):
        events = super(iCalUserFeed, self).get_object(request)
        user = db.User.objects.get(username=user)
        return events.filter(groups=user.usergroup.id)

class iCalEvent(iCalAllFeed):
    def get_object(self, request, slug):
        self.slug = slug
        event = db.Event.objects.filter(slug=slug)
        return event

    def product_id(self,obj):
        return "//event_map//"+self.slug+"//EN"
