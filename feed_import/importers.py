"""
importers.py - imports feed and updates the feed model
"""
import requests
from icalendar import Calendar, prop
from urlparse import urlparse
from event_map import models as em_db
from feed_import import models as db
from event_map.utils import ApiException
from django.contrib.sites.models import Site
from django.contrib.gis.geos import Point
from django.utils import timezone
import datetime
import pytz
#task adds events to db


def fetch_feed(feed_url):
    feed = db.Feed.objects.get(feed_url=feed_url)
    r = requests.get(feed_url)
    if r .status_code == 200:
        feed.content = r.content
        feed.save()
        #return callback
        return import_feed(feed)
    return False


def add_feed(feed_url, user):
    url = urlparse(feed_url)
    if url.netloc == Site.objects.get_current().domain:
        raise ApiException({'message': 'Feed is from current domain'}, 406)
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
            raise ApiException({"message": "invalid content type"}, 406)

    ug = em_db.UserGroup.objects.get(user=user)
    feed, feed_created = db.Feed.objects.get_or_create(feed_url=feed_url)
    feed_group, fg_created = em_db.FeedGroup.objects.get_or_create(title=feed_url, feed=feed, creator=ug)
    #create a subscription to the feed
    if feed_created:
        new_ug = em_db.UserGroup(user=feed.user, title=feed.user.username)
        new_ug.save()
        events = import_feed_2(r.content, new_ug, feed)
    if fg_created:
        #create subscription from the feed group to the user
        user_sub = em_db.Subscription(subscriber=ug, publisher=feed_group)
        user_sub.save()
        #create the subscription from the feed group to the feed
        fg_sub = em_db.Subscription(subscriber=feed_group, publisher=feed.user.usergroup)
        fg_sub.save()
    if feed_created:
        #propgation should happen on creation of subscriptions
        if events:
            feed.user.usergroup.bfs_propagation(events, created=True)
    return True


def import_feed(feed):
    #map of ical fields to event_map fields
    name_map = {
        'SUMMARY': 'title',
        'DTSTART': 'start_date',
        'DTEND': 'end_date',
        'CREATED': 'date_created',
        'DESCRIPTION': 'content',
        'LOCATION': 'address',
        'URL': 'link',
        'LAST-MODIFIED': 'date_modified',
        'GEO': 'location_point',
        'SEQUENCE': 'sequence'
    }
    #parse the icalender
    cal = Calendar.from_ical(feed.content)
    feed.cal_name = unicode(cal['X-WR-CALNAME'])
    feed.timezone = unicode(cal['X-WR-TIMEZONE'])
    feed.cal_scale = unicode(cal['CALSCALE'])
    feed.desciption = unicode(cal['X-WR-CALDESC'])
    feed.prod_id = unicode(cal['PRODID'])
    feed.save()
    return_events = []
    for vevent in cal.walk("VEVENT"):
        event = {'author': feed.user.usergroup}
        #remap the event keys
        for key, val in vevent.iteritems():
            if key in name_map:
                if isinstance(val, unicode):
                    event[name_map[key]] = unicode(val)
                elif isinstance(val, prop.vDDDTypes):
                    if type(val.dt) == datetime.date:
                        #if a date convert it to a date time and localize it
                        print("convet")
                        dt = datetime.datetime.combine(val.dt, datetime.time())
                        tz = pytz.timezone(feed.timezone)
                        event[name_map[key]] = tz.localize(dt)
                    else:
                        event[name_map[key]] = val.dt
        if 'UID' in vevent and 'SUMMARY' in vevent:
            if 'location_point' in event:
                points = event['location_point'].split(";")
                event['location_point'] = Point(points[0], points[1])
            if 'start_date' in event and 'location_point' in event and 'content' in event:
                event['complete'] = True
            else:
                event['complete'] = False
            try:
                if event['start_date'] > timezone.now():
                    event_obj, created = em_db.Event.objects.get_or_create(uid=unicode(vevent['UID']), defaults=event)
                    if created:
                        return_events.append(event_obj)
                    else:
                        if event_obj.date_modified < event['date_modified']:
                            #untested: update events
                            event_obj.title = event.title
                            event_obj.start_date = event.start_date
                            event_obj.end_date = event.end_date
                            event_obj.content = event.content
                            event_obj.address = event.address
                            event_obj.link = event.link
                            event_obj.location_point = event.location_point
                            event_obj.save()
                        if event_obj.author != feed.user.usergroup:
                            #if the event is the same as one from a different feed
                            return_events.append(event_obj)
            except Exception, e:
                import pdb
                pdb.set_trace()
    return return_events


def import_feed_2(content, author, feed=None):
    #map of ical fields to event_map fields
    name_map = {
        'SUMMARY': 'title',
        'DTSTART': 'start_date',
        'DTEND': 'end_date',
        'CREATED': 'date_created',
        'DESCRIPTION': 'content',
        'LOCATION': 'address',
        'URL': 'link',
        'LAST-MODIFIED': 'date_modified',
        'GEO': 'location_point',
        'SEQUENCE': 'sequence'
    }
    #parse the icalender
    cal = Calendar.from_ical(content)
    ical_tz = unicode(cal['X-WR-TIMEZONE'])
    if(feed):
        feed.content = content
        feed.cal_name = unicode(cal['X-WR-CALNAME'])
        feed.timezone = ical_tz
        feed.cal_scale = unicode(cal['CALSCALE'])
        feed.desciption = unicode(cal['X-WR-CALDESC'])
        feed.prod_id = unicode(cal['PRODID'])
        feed.save()
    return_events = []
    for vevent in cal.walk("VEVENT"):
        event = {'author': author}
        #remap the event keys
        for key, val in vevent.iteritems():
            if key in name_map:
                if isinstance(val, unicode):
                    event[name_map[key]] = unicode(val)
                elif isinstance(val, prop.vDDDTypes):
                    if type(val.dt) == datetime.date:
                        #if a date convert it to a date time and localize it
                        dt = datetime.datetime.combine(val.dt, datetime.time())
                        tz = pytz.timezone(ical_tz)
                        event[name_map[key]] = tz.localize(dt)
                    else:
                        event[name_map[key]] = val.dt
        if 'UID' in vevent and 'SUMMARY' in vevent:
            if 'location_point' in event:
                points = event['location_point'].split(";")
                event['location_point'] = Point(points[0], points[1])
            if 'start_date' in event and 'location_point' in event and 'content' in event:
                event['complete'] = True
            else:
                event['complete'] = False

            #only import events happening after today
            if event['start_date'] > timezone.now():
                event_obj, created = em_db.Event.objects.get_or_create(uid=unicode(vevent['UID']), defaults=event)
                if created:
                    return_events.append(event_obj)
                else:
                    if event_obj.date_modified < event['date_modified']:
                        #untested: update events
                        event_obj.title = event.title
                        event_obj.start_date = event.start_date
                        event_obj.end_date = event.end_date
                        event_obj.content = event.content
                        event_obj.address = event.address
                        event_obj.link = event.link
                        event_obj.location_point = event.location_point
                        event_obj.save()
                    if event_obj.author != feed.user.usergroup:
                        #if the event is the same as one from a different feed
                        return_events.append(event_obj)
    return return_events
