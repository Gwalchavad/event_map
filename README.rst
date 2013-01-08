.. http://restpreviewer.nirvake.org/

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
*   see `backbuner on trello <https://trello.com/board/event-map/500ac773cef1324c50149d2c>`_

Installation 
------------
| You can use this script if your box is debain based.
| ``wget -qO- --no-check-certificate https://raw.github.com/wanderer/event_map/master/setup.sh | sudo bash``
| source activate
| ``source ./(project name)/bin/activate``
| then go to the root (project name/event_map) folder and run
| ``./manage.py syncdb --all``
| Log into the admin  `/admin` with the username `admin` password `admin123`
| Change the admin's password in the users under auth
| Change the site url and Verbage
| 
| **If you need install it manually** 
| `Install GeoDjango <https://docs.djangoproject.com/en/dev/ref/contrib/gis/install/>`_
| `Install postGIS <https://docs.djangoproject.com/en/dev/ref/contrib/gis/install/postgis/>`_
| Then install event_map ``pip install -e event_map``

Contribute
----------
check out what needs to be done on `trello <https://trello.com/board/event-map/500ac773cef1324c50149d2c>`_

Implementation
--------------
| Backend: geodjango  
| Frontend: backbonejs   

`API <https://github.com/wanderer/event_map/wiki/API>`_
-------------------------------------------------------

