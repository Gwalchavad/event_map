from django.conf.urls import patterns, include, url
from django.contrib import admin
from event_map import views
# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'event_map.views.index',  name='event'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/user$', views.EventUser.as_view()),
    url(r'^api/session$', views.Session.as_view()),    
    url(r'^api/events$', views.EventTimeLine.as_view()),   
    url(r'^api/event$', views.Event.as_view()),
    url(r'^api/event/id/(?P<id>\d+)$', views.Event.as_view()),
    url(r'^api/event/(?P<slug>[-_\d\w]+)$', views.Event.as_view()),
    url(r'^api/group$', views.Group.as_view()), 
    url(r'^api/group/(?P<id>\d+)$', views.Group.as_view()),

    
)
