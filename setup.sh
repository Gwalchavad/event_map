#!/bin/bash

[ -z $DEST ]           && DEST='.'
[ -z $PROJ ]           && PROJ='event_map'
[ -z $DB ]             && DB=$PROJ
[ -z $DOMAIN ]         && DOMAIN='dev'
[ -z $REPO ]           && REPO='git://github.com/wanderer/event_map.git'

if [[ ! -f /usr/bin/apt-get ]]; then
    echo You need a debian/ubuntu linux distro
    exit 1
fi

function doit {
    echo $@
    if ! $@; then
        echo "COMMAND FAILED"
        exit 1
    fi
}

if [[ $USER != "root" ]]; then          
    echo You need to be root to run me	  	
    exit 1	  	
fi

echo
echo '----------------------------------------------------------------------'
echo '                  INSTALLING IMPORTANT DEPENDENCIES                   '
echo '----------------------------------------------------------------------'
echo

doit apt-get install --assume-yes build-essential \
    python python-dev python-setuptools python-virtualenv git redis-server rabbitmq-server nodejs npm

echo
echo '----------------------------------------------------------------------'
echo '                  Installing Geospatial libraries                   '
echo '----------------------------------------------------------------------'
#check version of linux
doit apt-get install --assume-yes lsb-release
OS = lsb_release -si
#Installing Geospatial libraries
if ["$OS" == "Ubuntu"]; then
    # tested on ubuntu 
    doit apt-get install --assume-yes \
        postgresql postgresql-9.1-postgis postgresql-contrib \
        libpq-dev python-psycopg2 gdal-bin proj libgeos-dev \
        libgeoip-dev
else
    # tested on debian 6, 
    doit apt-get install --assume-yes \
        postgresql-8.4-postgis postgresql-contrib postgresql-contrib-8.4 \
        libpq-dev python-psycopg2 \
        gdal-bin proj libgeos-dev \
        libgeoip-dev
fi


echo
echo '----------------------------------------------------------------------'
echo '                  Setting up the database                             '
echo '----------------------------------------------------------------------'

function pg_db_exists {
    psql -Al | grep ^$1\| >/dev/null
    return $?
}

sudo -u postgres -i createuser --superuser root   # make root a pg admin
sudo -u postgres -i createuser --superuser $SUDO_USER  # make you a pg admin

GEOGRAPHY=0
POSTGIS_SQL=postgis.sql



# For Ubuntu 8.x and 9.x releases.
if [ -d "/usr/share/postgresql-8.3-postgis" ]
then
    POSTGIS_SQL_PATH=/usr/share/postgresql-8.3-postgis
    POSTGIS_SQL=lwpostgis.sql
fi

# For Ubuntu 10.04
if [ -d "/usr/share/postgresql/8.4/contrib" ]
then
    POSTGIS_SQL_PATH=/usr/share/postgresql/8.4/contrib
fi

# For Ubuntu 10.10 (with PostGIS 1.5)
if [ -d "/usr/share/postgresql/8.4/contrib/postgis-1.5" ]
then
    POSTGIS_SQL_PATH=/usr/share/postgresql/8.4/contrib/postgis-1.5
    GEOGRAPHY=1
fi

# For Ubuntu 11.10 / Linux Mint 12 (with PostGIS 1.5)
if [ -d "/usr/share/postgresql/9.1/contrib/postgis-1.5" ]
then
    POSTGIS_SQL_PATH=/usr/share/postgresql/9.1/contrib/postgis-1.5
    GEOGRAPHY=1
fi

createdb -E UTF8 template_postgis && \
( createlang -d template_postgis -l | grep plpgsql || createlang -d template_postgis plpgsql ) && \
psql -d postgres -c "UPDATE pg_database SET datistemplate='true' WHERE datname='template_postgis';" && \
psql -d template_postgis -f $POSTGIS_SQL_PATH/$POSTGIS_SQL && \
psql -d template_postgis -f $POSTGIS_SQL_PATH/spatial_ref_sys.sql && \
psql -d template_postgis -c "GRANT ALL ON geometry_columns TO PUBLIC;" && \
psql -d template_postgis -c "GRANT ALL ON spatial_ref_sys TO PUBLIC;"

if [ $GEOGRAPHY -eq 1 ]
then
    psql -d template_postgis -c "GRANT ALL ON geography_columns TO PUBLIC;"
fi



echo
echo '----------------------------------------------------------------------'
echo '                  Setting up the django Project                       '
echo '----------------------------------------------------------------------'




# ask postgres to create our new postgis database
if pg_db_exists $DB; then
    echo "database $DB already exists" >&2
else
    createdb $DB
    pg_dump template_postgis | psql -q $DB
fi

if [ $VIRTUAL_ENV ]; then
    echo "you're already inside a virtualenv" >&2
    exit 1
fi

if [ -d $DEST/$PROJ ]; then
    echo "target $DEST/$PROJ already exists" >&2
    exit 1
fi

cd $DEST                                         || exit 1
echo "creating virtualenv"
sudo -u $SUDO_USER virtualenv $PROJ              || exit 1
cd $PROJ                                         || exit 1
sudo -u $SUDO_USER git clone $REPO $PROJ         || exit 1
echo "installing pip"
source bin/activate           || exit 1
easy_install pip              || exit 1
echo "installing event_map"
pip install -e ./$PROJ        || exit 1
cd event_map                                     || exit 1


# these settings override what's in settings.py *only* for our local install
cat >event_map/settings_local.py <<EOF
SESSION_COOKIE_DOMAIN = ".$DOMAIN"
CSRF_COOKIE_DOMAIN = ".$DOMAIN"
SECRET_KEY = "$(head -c 51 /dev/urandom | base64)"
DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "NAME": "$DB",
    },
}
EOF

#change the permissions of the file that the server might need to read
chmod o+r ./$PROJ/event_map/wsgi.py
cd ..
chmod -R o+r ./$PROJ/event_map/templates/
chmod -R o+r ./$PROJ/event_map/static/
cd ..
chown -R $SUDO_USER:$SUDO_USER ./$PROJ

#todo: install npm
#npm install -g requirejs
