from django.conf.urls.defaults import patterns, url

from django_push.hub import views

urlpatterns = patterns('',
    url(r'^$', views.hub, name='subhub-hub'),
)
