from django.conf.urls import patterns, include, url
from django.contrib import admin
from event_map import views, feeds
admin.autodiscover()
urlpatterns = patterns(
    '',
    url(r'^$', 'event_map.views.index',  name='event'),
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^admin/', include(admin.site.urls)),
    #atom feeds
    url(r'^atom/all/$', feeds.atomAllFeed(), name='atom-all'),
    url(r'^atom/(?P<groupType>[-_\d\w]+)/(?P<group_id>[-_\d\w]+)$', feeds.atomFeed(), name='atom-user'),
    #ical feeds
    url(r'^ical/all.ical$', feeds.iCalFeed(), name='ical-all'),
    url(r'^ical/all-historical.ical$', feeds.iCalFeedHistorical(), name='ical-all-historical'),
    url(r'^ical/event/(?P<slug>[-_\d\w]+)$', feeds.iCalEvent()),
    url(r'^ical/event/(?P<slug>[-_\d\w]+)\.ical$', feeds.iCalEvent(), name='ical-event'),
    url(r'^ical/(?P<groupType>[-_\d\w]+)/(?P<group_id>[-_\d\w]+)\-historical.ical$', feeds.iCalFeedHistorical(), name='ical-user-historical'),
    url(r'^ical/(?P<groupType>[-_\d\w]+)/(?P<group_id>[-_\d\w]+)\.ical$', feeds.iCalFeed(), name='ical-user'),

    #ical uploader
    url(r'^upload$', views.upload_file),
    url(r'^import$', views.import_url),
    url(r'^serverTime', views.get_time),
    #hub
    url(r'^hub/', include('django_push.hub.urls'), name="subhub-hub"),
    #callback
    url(r'^callback/', include('django_push.subscriber.urls'), name="subhub-hub"),
    #api
    url(r'^api/user$', views.EventUser.as_view()),
    url(r'^api/session$', views.Session.as_view()),
    url(r'^api/events$', views.EventTimeLine.as_view()),
    url(r'^api/event$', views.Event.as_view()),
    url(r'^api/event/id/(?P<id>\d+)$', views.Event.as_view()),
    url(r'^api/event/(?P<slug>[-_\d\w]+)$', views.Event.as_view()),
    url(r'^api/group$', views.Group.as_view()),
    url(r'^api/group/(?P<type>[-_\d\w]+)$', views.Group.as_view()),
    url(r'^api/group/(?P<type>[-_\d\w]+)/(?P<title>[-_\d\w]+)$', views.Group.as_view()),
    url(r'^api/feed$', views.FeedView.as_view()),
    url(r'^api/notifications$', views.Notifications.as_view()),
)
