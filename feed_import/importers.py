"""
importers.py - imports feed and updates the feed model
"""
import requests
from icalendar import Calendar, Event
from urlparse import urlparse
from event_map import models as em_db
from feed_import import models as db
from event_map.utils import ApiException
from django.contrib.sites.models import Site
import dateutil.parser
from django.contrib.gis.geos import Point
#task adds events to db

def update_task(self,feed_url):
    pass
    #db.event("asdf","asdf")

def fetch_feed(feed_url):
    feed = db.Feed.objects.get(feed_url=feed_url)
    r = requests.get(feed_url)
    if r .status_code == 200:
        feed.content = r.content
        feed.save()
        #return callback
        return import_feed(feed)
    return False 

def add_feed(feed_url,user):
    url = urlparse(feed_url) 
    if url.netloc == Site.objects.get_current().domain:
        raise ApiException({'message':'Feed is from current domain'},406)
    #add https of https 
    if url.scheme == '':
        try:
            result = add_feed('https://'+feed_url)
        except:
            result = add_feed('http://'+feed_url)
        return result

    r = requests.get(feed_url)
    if r .status_code == 200:
        head_type = r.headers['content-type'].split(';')[0]
        if head_type != 'text/calendar':
            raise ApiException({"message":"invalid content type"},406)

    ug = em_db.UserGroup.objects.get(user=user)
    feed, feed_created = db.Feed.objects.get_or_create(feed_url=feed_url)
    feedGroup, created =  em_db.FeedGroup.objects.get_or_create(title=feed_url, feed=feed, defaults={'creator':ug})
    #create a subscription to the feed
    sub, sub_created = em_db.Subscription.objects.get_or_create(subscriber=ug, publisher=feedGroup)
    if feed_created:
        feed.content = r.content
        feed.save()   
        return import_feed(feed)    
        
    return True

def import_feed(feed):
    #map of ical fields to event_map fields 
    name_map = {
        'SUMMARY': 'title', 
        'DTSTART': 'start_date', 
        'DTEND': 'end_date',
        'CREATED':'date_created',
        'DESCRIPTION':'content',
        'LOCATION':'address',
        'URL':'link',
        'LAST-MODIFIED':'date_modified',
        'GEO':'location_point'
    }
    #parse the icalender
    cal = Calendar.from_ical(feed.content)
    return_events = []
    for vevent in cal.walk("VEVENT"):
        event = {'author':feed.feed_model.creator}
        #remap the event keys
        for key, val in vevent.iteritems():
            if key in name_map:
                event[name_map[key]] = val.to_ical()
        if 'UID' in vevent and 'SUMMARY' in vevent:
            if 'start_date' in event:
                event['start_date'] = dateutil.parser.parse(event['start_date'].replace("Z",""))
            if 'end_date' in event:
                event['end_date'] = dateutil.parser.parse(event['end_date'].replace("Z",""))
            if 'location_point' in event:
                points = event['location_point'].split(";")
                event['location_point'] = Point(points[0],points[1])
            if 'start_date' in event and 'location_point' in event and 'content' in event:
                event['complete'] = True
            else:
                event['complete'] = False

            event_obj, created = em_db.Event.objects.get_or_create(uid=vevent['UID'].to_ical(), defaults=event)
            if created:
                return_events.append(event_obj)
            elif event_obj.date_modified < (dateutil.parser.parse(event['date_modified'].replace("Z",""))):
                #update event
                pass
    return return_events
