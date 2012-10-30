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
| ``./manage syncedb --all``
|
| If you need install it manually. 
| `Install GeoDjango <https://docs.djangoproject.com/en/dev/ref/contrib/gis/install/>`_
| `Install postGIS <https://docs.djangoproject.com/en/dev/ref/contrib/gis/install/postgis/>`_
| Then install event_map ``pip install -e event_map``

Implementation
--------------
| Backend: geodjango  
| Frontend: backbonejs   

`API <https://github.com/wanderer/event_map/wiki/API>`_
-------------------------------------------------------
