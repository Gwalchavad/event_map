event_map
=========
Aggregating and sharing events in time and space
    
Features
--------
*   View an aggregation of events on a map
*   View an aggregation by a list sorted by time

Planned Features
----------------
*   Facebook integration
*   RSS import
*   Groups
*   Embedding
*   see [backbuner on trello](https://trello.com/board/event-map/500ac773cef1324c50149d2c)

Requirements 
------------
geodjango

[redis](http://redis.io/)
pip install 'python-dateutil < 2.0'
pip install django-celery
pip install -U celery-with-redis


Implementation
--------------
Backend: geodjango
Frontend: backbonejs 

[API](https://github.com/wanderer/event_map/wiki/API)
