from django.contrib.gis.db import models
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.sites.models import Site
from django.db.models import Q
from autoslug import AutoSlugField
import uuid
import feed_import.models as fi_db


def generate_uuid():
    return str(uuid.uuid4())


#http://zmsmith.com/2010/05/django-check-if-a-field-has-changed/
def has_changed(instance, field):
    if not instance.pk:
        return False
    old_value = instance.__class__._default_manager.filter(pk=instance.pk).values(field).get()[field]
    return not getattr(instance, field) == old_value


def checkattr(obj, attr):
    try:
        returnVal = getattr(obj, attr)
    except (ObjectDoesNotExist, AttributeError) as e:
        returnVal = False

    return returnVal


class emObject(models.Model):
    uid = models.CharField(
        max_length=255,
        unique=True,
        default=generate_uuid)

    def __unicode__(self):
        if hasattr(self, 'abstractgroup'):
            return "AbstractGroup: "+self.abstractgroup.__unicode__()
        elif hasattr(self, 'event'):
            return "event: "+self.event.__unicode__()
        else:
            return "unkown object"


class AbstractGroup(emObject):
    class Meta:
        permissions = (
            ("group_admin", "Can admin group"),
            ("add_event", "Can Add Events")
        )

    visibility_choices = (
        ('public', 'Public'),
        ('private', 'Private'),
        ('unlisted', 'Unlisted'),
    )
    posting_choices = (
        ('open', 'Open'),
        ('queue', 'Queue'),
        ('restricted', 'Restricted'),
    )
    description = models.TextField(
        help_text="""the name of the group""")
    visibility = models.CharField(
        max_length=32,
        choices=visibility_choices,
        default="public",
        help_text="""Whether or not user is attending protest.""")
    posting_option = models.CharField(
        max_length=32,
        choices=posting_choices,
        default="restricted",
        help_text="""How post should be processed""")
    subscriptions = models.ManyToManyField(
        'self',
        symmetrical=False,
        through='Subscription',
        help_text="""Who wants updates  on events in this group?""")
    events = models.ManyToManyField(
        'Event',
        through="SubGroupEvent")

    def __unicode__(self):
        #the following code creates recusion
        #if hasattr(self, 'group'):
        #    return "group: "+self.group.__unicode__()
        #elif hasattr(self, 'usergroup'):
        #    return "usergroup: "+self.usergroup.__unicode__()
        #elif hasattr(self, 'feedgroup'):
        #    return "feedgroup: "+self.feedgroup.__unicode__()
        #else:
        return self.description

    def __json__(self, user=None):
        """@todo: Docstring for __json__

        :arg1: @todo
        :returns: @todo

        """
        if user and Subscription.objects.filter(subscriber=user, publisher=self).count() > 0:
            subscribed = True
        else:
            subscribed = False

        subs = None
        #TODO: check viewing permission
        #permissions = get_perms(user, self)
        #if self.posting_option == "open":
        #    permissions.append("add_event")
        if self.visibility == 'public' or user and self.id == user.id:
            subscriptions = Subscription.objects.filter(subscriber=self)
            subs = [sub.__json__() for sub in subscriptions]

        return {
            "id": self.id,
            "title": self.get_title(),
            "groupType": self.get_type(),
            "description": self.description,
            "subscriptions": subs,
            "subscribed": subscribed
        }

    def get_title(self):
        if checkattr(self, 'group'):
            return self.group.title
        elif checkattr(self, 'usergroup'):
            return self.usergroup.title
        elif checkattr(self, 'feedgroup'):
            return self.feedgroup.title
        elif checkattr(self, 'title'):
            return self.title
        else:
            return None

    def get_type(self):
        if hasattr(self, 'group'):
            return 'group'
        elif hasattr(self, 'usergroup'):
            return 'user'
        elif hasattr(self, 'feedgroup'):
            return 'feed'


    def get_all_events(self):
        """returns all events in the groups and in the subcriptions"""
        return SubGroupEvent.objects.filter(group=self)

    def add_events(self, events, created=False, subscription=None):
        """takes a list of events and adds them to the group
        If the events were newly created use the created
        argument
        -arguments
        :events: a list of events to add
        :created: wether the event was just created or not
        :subscription: the subscription the events are from
        """
        if events:
            if not created:
                #if some of the events happen to be in a subscription,remove i
                #Cuz now its going to be in the group
                qset = Q()
                for event in events:
                    qset |= Q(pk=event.pk)
                if subscription:
                    #only add events not 'saved'(in the group but not in a
                    #subscription) to the group
                    old_events = set(Event.objects.filter(
                        qset,
                        subgroupevent__subscription__isnull=True,
                        subgroupevent__group=self))
                    events = set(events).difference(old_events)
                else:
                    SubGroupEvent.objects.filter(qset, group=self).delete()
            #add new events that are not already in the group
            SubGroupEvent.objects.bulk_create(
                [SubGroupEvent(
                    event=event,
                    group=self,
                    subscription=subscription) for event in events])

    def subscribe(self, events):
        pass

    def bfs_propagation(self, events, created=False):
        """Add and Propgate events from this group using BFS"""
        visited = set([self])
        frontier = [self]
        self.add_events(events, created=created)
        while frontier:
            vertext = frontier.pop()
            for subscription in vertext.publisher.all():
                if subscription.subscriber not in visited:
                    visited.add(subscription.subscriber)
                    frontier.append(subscription.subscriber)
                subscription.subscriber.add_events(
                    events,
                    subscription=subscription,
                    created=created)


class UserGroup(AbstractGroup):
    title = models.CharField(
        unique=True,
        max_length=255,
        help_text="""the name of the group""")
    user = models.OneToOneField(
        User,
        primary_key=True,
        editable=False,
        help_text="""Reference to Django auth user.""")

    def save(self, *args, **kwargs):
        self.title = self.user.username
        self.posting_option = "restricted"
        return super(UserGroup, self).save(*args, **kwargs)

    def __unicode__(self):
        return self.title

    def get_absolute_url(self):
        return "/#/user/%s/" % self.user.username


class Group(AbstractGroup):
    creator = models.ForeignKey(
        UserGroup)
    title = models.CharField(
        max_length=255,
        help_text=""" the name of the group""")
    slug = AutoSlugField(
        populate_from='title',
        unique=True)


class FeedGroup(AbstractGroup):
    class Meta:
        unique_together = ("creator", "feed")
    creator = models.ForeignKey(
        AbstractGroup,
        related_name='creator_group')
    title = models.CharField(
        max_length=255,
        help_text=""" the name of the group""")
    feed = models.ForeignKey(
        fi_db.Feed,
        related_name='feed_group')

    def __unicode__(self):
        return self.title


class Event(emObject):
    """Events!"""
    author = models.ForeignKey(
        UserGroup,
        related_name='event_author',
        help_text="""The user who wrote this article.""")
    title = models.CharField(
        max_length=255,
        help_text="""A one-line title to describe article.""")
    content = models.TextField(
        default="please add some content here",
        help_text="""The contents of the article in Markdown.""")
    slug = AutoSlugField(
        populate_from='title',
        unique=True)
    date_modified = models.DateTimeField(
        auto_now=True)
    date_created = models.DateTimeField(
        auto_now_add=True)
    start_date = models.DateTimeField(
        help_text="""What Date is this event Happening On?""")
    end_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="""When is your event ending?""")
    start_date_index = models.IntegerField(
        default=0,
        help_text="""if there are multiple events at the same time, this is an index to provide a persistant order""")
    address = models.CharField(
        blank=True,
        max_length=255,
        help_text="""the location of the event""")
    city = models.CharField(
        blank=True,
        max_length=255,
        help_text="""the location of the event""")
    venue = models.CharField(
        max_length=255,
        blank=True,
        help_text="""the name of the Vuenue. For eample "Mom's House".""")
    link = models.CharField(
        null=True,
        max_length=255,
        blank=True,
        help_text="""a link to other infomation on the event""")
    contact_info = models.CharField(
        null=True,
        max_length=255,
        blank=True,
        help_text="""Get more info by contacting this email/phone number""")
    sequence = models.IntegerField(default=0, help_text="""someday will be\
            replaced be some awsesome revsion shit. but for now this is needed for icalender importing/exporting""")
    complete = models.BooleanField(
        default=False,
        help_text="""is are all the nessicary fields full on this event? used\
                when importing events""")
    root = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        help_text="""The Event that this was cloned from""")
    location_point = models.PointField(
        null=True,
        blank=True,
        help_text="""Aproximate coordinates of where the event will happen""")

    """Allow geospataul queries"""
    objects = models.GeoManager()

    def get_absolute_url(self):
        return "/#/event/%s/" % self.slug

    def __unicode__(self):
        return self.title

    def __json__(self):
        return {
            "id": self.id,
            "title": self.title,
            "start_date": self.start_date,
            "start_date_index": self.start_date_index,
            "end_date": self.end_date,
            "content": self.content,
            "author": self.author.user.username,
            "contact_info": self.contact_info,
            "city": self.city,
            "address": self.address,
            "venue": self.venue,
            "location_point": self.location_point,
            "link": self.link,
            "slug": self.slug,
            "complete": self.complete,
        }

    def find_origins(self):
        #find where the event was orginal posted
        origins = SubGroupEvent.objects.filter(event__id=self.id, subscription__isnull=True)
        return [sge.group for sge in origins]

    def reindex_start_date(self, start_date):
        events = Event.objects.filter(start_date=start_date).order_by("end_date")
        for i, event in enumerate(events):
            event.start_date_index = i
            event.save()

    def save(self, *args, **kwargs):
        reindex = False
        if not self.pk or has_changed(self, 'start_date') or has_changed(self, 'end_date'):
            reindex = True
        if self.start_date and self.location_point and self.title and self.content:
            self.complete = True

        super(Event, self).save()
        if reindex:
            self.reindex_start_date(self.start_date)
        #publish
        if 'create_sge' in kwargs and kwargs['create_sge']:
            sge = SubGroupEvent(event=self, group=self.author)
            sge.save()


class Subscription(models.Model):
    class Meta:
        unique_together = ("subscriber", "publisher")
    subscriber = models.ForeignKey(
        AbstractGroup,
        related_name='subscriber')
    publisher = models.ForeignKey(
        AbstractGroup,
        related_name='publisher')
    uncomplete_events = models.BooleanField(
        default=False,
        help_text="""Does the subscriber want uncomplete events?""")

    def __unicode__(self):
        return str(self.publisher) + "-->" + str(self.subscriber)

    def __json__(self):
        return {
            "title": self.publisher.get_title(),
            "id": self.publisher.id,
            "type": self.publisher.get_type()
        }


class SubGroupEvent(models.Model):
    """this creates a table for managing events related to subriptions and
    groups that way we don't have two tables for group->events and
    subscription->events"""
    class Meta:
        unique_together = ('subscription', 'group', 'event')
    subscription = models.ForeignKey(Subscription, null=True, blank=True)
    group = models.ForeignKey(AbstractGroup)
    event = models.ForeignKey(Event)
    group_name = models.CharField(
        blank=True,
        max_length=255,
        help_text=""" the name of the group subdcribed to""")

    def __unicode__(self):
        if self.subscription:
            return "sub: " + str(self.subscription) + " |event:" + self.event.__unicode__()
        elif self.event:
            return "group: " + str(self.group) + " |event:" + self.event.__unicode__()
        else:
            return "group: " + str(self.group)

    def __json__(self):
        event_j = self.event.__json__()
        if self.subscription:
            #TODO: test
            event_j['subscription'] = self.subscription.__json__()
            #find where the event was orginal posted
            origins = self.event.find_origins()
            event_j["origin"] = [origin.__json__() for origin in origins]
        else:
            event_j["origin"] = [self.group.__json__()]
        return event_j


class Verbiage(models.Model):
    """Stores arbitrary website content fragments in Markdown
    See also: :py:func:`occupywallst.context_processors.verbiage`
    """
    name = models.CharField(
        max_length=255,
        unique=True,
        help_text="""Arbitrary name for content fragment.""")
    content = models.TextField(blank=True)
    use_markdown = models.BooleanField(
        default=True,
        help_text="""If checked, your content will be parsed as markdown
         with HTML allowed.""")

    class Meta:
        verbose_name_plural = "Verbiage"

    @staticmethod
    def get(name, language=None):
        verb = Verbiage.objects.get(name=name)
        res = verb.content
        return res

    def __unicode__(self):
        return self.name


class Notification(models.Model):
    content = models.CharField(
        max_length=255,
        help_text="""Arbitrary content of the notification""")
    href = models.CharField(
        max_length=255,
        help_text="""the link to whats going on""")
    to = models.ForeignKey(
        UserGroup,
        help_text="""The user this is to""")
    date_created = models.DateTimeField(
        auto_now_add=True)
    read = models.BooleanField(
        default=False,
        help_text="""Has this notification been read?""")

    def toJSON(self):
        return {
            'content': self.content,
            'href': self.href,
            'read': self.read
        }
