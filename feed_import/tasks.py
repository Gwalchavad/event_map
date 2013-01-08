from celery import task
from feed_import import importers
#from djcelery.models import PeriodicTask
#PeriodicTask.objects.all()[0].delete()

@task(name='add')
def add(x, y):
    return x + y
    
@task(name='import_feed')
def import_feed(url):
    content = importers.fetch_feed(url)
    return content
