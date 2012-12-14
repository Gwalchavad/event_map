from django.conf.urls import patterns, include, url
from django.contrib import admin
from event_map import views, feeds
# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'event_map.views.index',  name='event'),
    url(r'^admin/', include(admin.site.urls)),
    #atom feeds
    url(r'^atom/all/$', feeds.atomAllFeed(), name='atom-all'),
    url(r'^atom/user/(?P<user>[-_\d\w]+)$', feeds.atomUserFeed(), name='atom-user'),
    url(r'^atom/group/(?P<group>[-_\d\w]+)$', feeds.atomAllFeed(), name='atom-group'),
    url(r'^atom/feed/(?P<feed>[-_\d\w]+)$', feeds.atomAllFeed(), name='atom-feed'),
    #ical feeds
    url(r'^ical/all/$', feeds.iCalAllFeed(), name='atom-all'),
    url(r'^ical/user/(?P<user>[-_\d\w]+)$', feeds.iCalUserFeed(), name='atom-user'),
    url(r'^ical/group/(?P<group>[-_\d\w]+)$', feeds.atomAllFeed(), name='atom-group'),
    url(r'^ical/feed/(?P<feed>[-_\d\w]+)$', feeds.atomAllFeed(), name='atom-feed'),    
    url(r'^ical/event/(?P<slug>[-_\d\w]+)$', feeds.iCalEvent(), name='atom-event'), 
    #hub
    url(r'^hub/', include('subhub.urls'), name="subhub-hub"),
    #api
    url(r'^api/user$', views.EventUser.as_view()),
    url(r'^api/session$', views.Session.as_view()),    
    url(r'^api/events$', views.EventTimeLine.as_view()),   
    url(r'^api/event$', views.Event.as_view()),
    url(r'^api/event/id/(?P<id>\d+)$', views.Event.as_view()),
    url(r'^api/event/(?P<slug>[-_\d\w]+)$', views.Event.as_view()),
    url(r'^api/group$', views.Group.as_view()), 
    url(r'^api/group/(?P<id>\d+)$', views.Group.as_view())
)
