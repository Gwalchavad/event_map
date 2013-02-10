r"""

    occupywallst.context_processors
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    Tell Django to define certain template variables by default.

"""
from event_map import models as db
from django.utils.safestring import mark_safe
from django.core.exceptions import ObjectDoesNotExist
from django.conf import settings


class VerbiageGetter(object):
    def __init__(self, request):
        self.request = request

    def __getitem__(self, key):
        try:
            return mark_safe(db.Verbiage.get(key))
        except ObjectDoesNotExist:
            return ''


def verbiage(request):
    return {'verbiage': VerbiageGetter(request)}


def goodies(request):
    return {
        'STATIC_URL': settings.STATIC_URL,
        'BUILT_JS': settings.EM_BUILT_JS,
        'DEBUG': settings.DEBUG}
