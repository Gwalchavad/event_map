# http://packages.python.org/distribute/setuptools.html
# http://diveintopython3.org/packaging.html
# http://wiki.python.org/moin/CheeseShopTutorial
# http://pypi.python.org/pypi?:action=list_classifiers
import os
from setuptools import setup

def read(fname):
    return open(os.path.join(os.path.dirname(__file__), fname)).read()

setup(
    name='event_map',
    version='0.1.0',
    author='M. J. Becze',
    author_email='mjbecze@riseup.net',
    description          = "event_map",
    long_description     = read('README.rst'),
    license              = 'GNU AGPL v3 or later',
    install_requires     = ['Django>=1.4', 'south>=0.7.5', 
                            'django-celery', 'celery-with-redis','django-uuidfield'],
    zip_safe             = False,
    classifiers = [
        "Development Status :: 5 - Production/Stable",
        "License :: OSI Approved :: GNU Affero General Public License v3",
        "Programming Language :: Python",
        "Framework :: Django",
        "Topic :: Communications",
        "Topic :: Internet :: WWW/HTTP"
    ],
)
