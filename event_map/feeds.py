"""
Tools for syndicating articles via Atom and Icalendar.
"""
from django.utils.html import escape
from django.utils import timezone as tz
from django.contrib.syndication.views import Feed
from event_map import models as db
from django.contrib.gis.geos import Polygon
from django_ical.views import ICalFeed
from datetime import datetime


def _str_to_bbox(val):

    try:
        swlat, swlng, nwlat, nwlng = [float(s) for s in val.split(',')]
        return Polygon.from_bbox([swlng, swlat, nwlng, nwlat])
    except:
        return None


class geoFeed(Feed):
    """
    Filters events by a givin boundary. A bounday can only be a box
    TODO: Add more than just boxes
    """
    def get_object(self, request, *args, **kwargs):
        self.bounds = request.GET.get("bbox")
        bbox = _str_to_bbox(self.bounds)
        if bbox:
            events = db.Event.objects.filter(location_point__contained=bbox, complete=True)
        else:
            events = db.Event.objects.filter(complete=True)

        return events


class groupFeed(geoFeed):
    """
    Filters events by a given group
    """
    def get_object(self, request, groupType=None, group_id=None):
        """
        group type maybe `user`, `group` or `feed`
        """
        events = super(groupFeed, self).get_object(request)
        if groupType and group_id:
            if(groupType == "user"):
                return events.filter(author__user__username=group_id)
            elif(groupType == "group"):
                return events.filter(subgroupevent__group_id=group_id)
            elif(groupType == "feed"):
                return events.filter(author__user__username=group_id)
        else:
            return events


class atomAllFeed(groupFeed):
    title_prefix = "event_Map's New Events"
    link = "/"
    description_template = "atom.html"
    subtitle = "All of the new events that get posted to event_map "

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
        return self.title_prefix + ((" At " + self.bounds) if self.bounds else "")


class atomAllFeedHistorical(geoFeed):
    def get_object(self, request, user):
        user = db.User.objects.get(username=user)


class atomFeed(atomAllFeed):
    def get_object(self, request, user):
        events = super(atomFeed, self).get_object(request)
        user = db.User.objects.get(username=user)
        return events.filter(groups=user.usergroup.id, complete=True)


class iCalFeedHistorical(ICalFeed, groupFeed):
    """
    Generates Ical For all events
    """
    timezone = 'America/Chicago'

    def product_id(self):
        return "//event_map-v.1//EN"

    def items(self, obj):
        return obj.order_by('-start_date')

    def item_title(self, item):
        return item.title

    def item_guid(self, item):
        return item.uid

    def item_description(self, item):
        return item.content

    def item_created(self, item):
        return item.date_created

    def item_modified(self, item):
        return item.date_modified

    def item_start_datetime(self, item):
        return item.start_date

    def item_end_datetime(self, item):
        return item.end_date

    def item_location(self, item):
        return item.venue + (("(" + item.address + ")") if item.address else "")

    def item_geolocation(self, item):
        return item.location_point.y, item.location_point.x

class iCalFeed(iCalFeedHistorical):
    """Generates an Ical for all upcoming events"""
    def get_object(self, request, groupType=None, group_id=None):
        events = super(iCalFeed, self).get_object(request, groupType, group_id)
        return events.filter(start_date__gte=datetime.utcnow().replace(tzinfo=tz.utc))

class iCalEvent(iCalFeedHistorical):
    """Generates an Ical for a single event"""
    def get_object(self, request, slug):
        self.slug = slug
        event = db.Event.objects.filter(slug=slug)
        return event
