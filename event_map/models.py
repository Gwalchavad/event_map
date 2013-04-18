from django.contrib.gis.db import models
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.contrib.sites.models import Site
from django.db.models import Q
from autoslug import AutoSlugField
import uuid
import django_push.hub
import feed_import.models as fi_db
from guardian.shortcuts import get_perms


def generate_uuid():
    return str(uuid.uuid4())


#http://zmsmith.com/2010/05/django-check-if-a-field-has-changed/
def has_changed(instance, field):
    if not instance.pk:
        return False
    old_value = instance.__class__._default_manager.filter(pk=instance.pk).values(field).get()[field]
    return not getattr(instance, field) == old_value


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
        if hasattr(self, 'group'):
            return "group: "+self.group.__unicode__()
        elif hasattr(self, 'usergroup'):
            return "usergroup: "+self.usergroup.__unicode__()
        elif hasattr(self, 'feedgroup'):
            return "feedgroup: "+self.feedgroup.__unicode__()
        else:
            return self.description

    def get_title(self):
        if hasattr(self, 'group'):
            return self.group.title
        elif hasattr(self, 'usergroup'):
            return self.usergroup.title
        elif hasattr(self, 'feedgroup'):
            return self.feedgroup.title
        else:
            return self.description

    def get_type(self):
        if hasattr(self, 'group'):
            return 'group'
        elif hasattr(self, 'usergroup'):
            return 'user'
        elif hasattr(self, 'feedgroup'):
            return 'feed'

    def to_JSON(self, user):
        """@todo: Docstring for to_JSON

        :arg1: @todo
        :returns: @todo

        """
        if user.is_authenticated():
            usergroup = user.usergroup
        else:
            usergroup = None

        subs = None
        #TODO: check viewing permission
        permissions = get_perms(user, self.abstractgroup_ptr)
        if self.posting_option == "open":
            permissions.append("add_event")
        if self.visibility == 'public' or self == usergroup:
            subscriptions = Subscription.objects.filter(subscriber=self)
            subs = [{"title": sub.publisher.get_title(), "id": sub.publisher.id, "type": sub.publisher.get_type()} for sub in subscriptions]

        return {
            "id": self.id,
            "title": self.title,
            "groupType": self.get_type,
            "description": self.description,
            "subscriptions": subs,
            "permissions": permissions
        }

    def get_all_events(self):
        """returns all events in the groups and in the subcriptions"""
        return SubGroupEvent.objects.filter(group=self)

    def add_events(self, events, created=False, subscription=None):
        """takes a list of events and adds them to the group
        If the events were newly created use the created
        argument"""
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
        """Propgate events from this group using BFS"""
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
        unique=True,
        max_length=255,
        help_text=""" the name of the group""")


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

    def to_JSON(self):
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
            "complete": self.complete
        }

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
        django_push.hub.publish(
            ['http://%s%s' % (Site.objects.get_current().domain,
                              reverse("subhub-hub"))],
            'http://%s%s' % (Site.objects.get_current().domain,
                             self.get_absolute_url()),
        )


class Permission(models.Model):
    class Meta:
        unique_together = ("subject", "emobject")
    read = models.BooleanField(
        default=False,
        help_text="""can this user view the group?""")
    write = models.BooleanField(
        default=False,
        help_text="""can the user post to this group""")
    admin = models.BooleanField(
        default=False, help_text="""does user have admin privilages?""")
    subject = models.ForeignKey(
        AbstractGroup,
        related_name='permissions')
    emobject = models.ForeignKey(emObject)

    def __unicode__(self):
        return str(self.subject) + " --> " + str(self.emobject)


class Subscription(models.Model):
    class Meta:
        unique_together = ("subscriber", "publisher")
    subscriber = models.ForeignKey(
        AbstractGroup,
        related_name='subscriber')
    publisher = models.ForeignKey(
        AbstractGroup,
        related_name='publisher')
    sub_events = models.ManyToManyField(Event, through='SubGroupEvent')
    uncomplete_events = models.BooleanField(
        default=False,
        help_text="""Does the subscriber want uncomplete events?""")

    def __unicode__(self):
        return str(self.publisher) + "-->" + str(self.subscriber)

    def to_JSON(self):
        j_events = []
        #add subrciption info to the events in the subscription
        for event in self.events:
            j_event = event.to_JSON()
            j_event['subscipition'] = {
                'type': 'feed',
                'title': self.subscriber.title,
                'id': self.subscriber.id,
                'url': self.subscriber.to_absolute_url()}
            j_events.push(j_event)
        return j_events


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
            return str(self.subscription)  # + " (" + str(self.event) + ")"
        else:
            return str(self.group)  # + " (" + str(self.event) + ")"


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
