from django.conf.urls import patterns, include, url
from django.contrib import admin
import occupywallst 
from event_map import views
# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'event_map.views.index',  name='event'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/user$', views.cal_user.as_view()),
    url(r'^api/session$', views.session.as_view()),    
    url(r'^api/events$', views.events.as_view()),
    url(r'^api/event$', views.event.as_view()),   
    url(r'^api/event/(?P<id>\d+)$', views.event.as_view()),

)
