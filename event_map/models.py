from django.contrib.gis.db import models
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.contrib.sites.models import Site
from autoslug import AutoSlugField
import uuid
import django_push.hub
import feed_import.models as fi_db


def generate_uuid():
    return str(uuid.uuid4())


class emObject(models.Model):
    uid = models.CharField(max_length=255, unique=True, default=generate_uuid)

    def __unicode__(self):
        if hasattr(self, 'abstractgroup'):
            return "AbstractGroup: "+self.abstractgroup.__unicode__()
        elif hasattr(self, 'event'):
            return "event: "+self.event.__unicode__()
        else:
            return "unkown object"


class AbstractGroup(emObject):
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
    description = models.TextField(help_text="""the name of the group""")
    visibility = models.CharField(
        max_length=32,
        choices=visibility_choices,
        default="public",
        help_text="""Whether or not user is attending protest."""
    )
    posting_option = models.CharField(
        max_length=32,
        choices=posting_choices,
        default="restricted",
        help_text="""How post should be processed""")
    subscriptions = models.ManyToManyField(
        'self',
        symmetrical=False,
        through='Subscription',
        help_text="""How wants updates on this on events here?""")

    def __unicode__(self):
        if hasattr(self, 'group'):
            return "group: "+self.group.__unicode__()
        elif hasattr(self, 'usergroup'):
            return "usergroup: "+self.usergroup.__unicode__()
        else:
            return self.description

    def get_title(self):
        if hasattr(self, 'group'):
            return self.group.title
        elif hasattr(self, 'usergroup'):
            return self.usergroup.title
        else:
            return self.description


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
        self.visibility = "public"
        self.description = "Write something about You"
        self.posting_option = "restricted"
        return super(UserGroup, self).save(*args, **kwargs)

    def __unicode__(self):
        return self.title

    def get_absolute_url(self):
        return "/#/user/%s/" % self.user.username


class Group(AbstractGroup):
    creator = models.ForeignKey(UserGroup)
    title = models.CharField(
        unique=True,
        max_length=255,
        help_text=""" the name of the group""")

    def __unicode__(self):
        return self.title


class FeedGroup(Group):
    feed = models.OneToOneField(fi_db.Feed, related_name='feed_model')

    def __unicode__(self):
        return self.title


class Permission(models.Model):
    class Meta:
        unique_together = ("subject", "emobject")
    banned = models.BooleanField(default=False, help_text="""
        is this user banned?""")
    read = models.BooleanField(default=False, help_text="""
        can this user view the group?""")
    write = models.BooleanField(default=False, help_text="""
        can the user post to this group""")
    admin = models.BooleanField(default=False, help_text="""
        deos user have admin privilages?""")
    subject = models.ForeignKey(AbstractGroup, related_name='permissions')
    emobject = models.ForeignKey(emObject)

    def __unicode__(self):
        return str(self.subject) + " --> " + str(self.emobject)


class Event(emObject):
    """Events!"""
    author = models.ForeignKey(
        UserGroup,
        null=True,
        blank=True,
        related_name='event_author',
        help_text="""The user who wrote this article.""")
    title = models.CharField(max_length=255, help_text="""
        A one-line title to describe article.""")
    content = models.TextField(
        default="please add some content here",
        help_text="""The contents of the article in Markdown.""")
    slug = AutoSlugField(populate_from='title', unique=True)
    date_modified = models.DateTimeField(auto_now=True)
    date_created = models.DateTimeField(auto_now_add=True)
    start_date = models.DateTimeField(help_text="""
        What Date is this event Happening On?""")
    end_date = models.DateTimeField(null=True, blank=True, help_text="""
        When is your event ending?""")
    address = models.CharField(
        null=True,
        blank=True,
        max_length=255,
        help_text="""the location of the event""")
    city = models.CharField(
        null=True,
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
    complete = models.BooleanField(
        default=False,
        help_text="""is are all the nessicary fields full on this event? used\
                when importing events""")
    parent_event = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        help_text="""The Event that this was cloned from""")

    location_point = models.PointField(null=True, blank=True, help_text="""
        Aproximate coordinates of where the event will happen""")

    groups = models.ManyToManyField(AbstractGroup, blank=True)

    """Allow geospataul queries"""
    objects = models.GeoManager()

    def get_absolute_url(self):
        return "/#/event/%s/" % self.slug

    def __unicode__(self):
        return self.title

    def toJSON(self):
        return {
            "id": self.id,
            "title": self.title,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "content": self.content,
            "author": self.author.user.username,
            "contact_info": self.contact_info,
            "city": self.city,
            "address": self.address,
            "venue": self.venue,
            "location_point": self.location_point,
            "link": self.link,
            "slug": self.slug
        }

    def save(self, *args, **kwargs):
        super(Event, self).save()
        userGroup = UserGroup.objects.get(user=self.author)
        self.groups.add(userGroup.id)
        django_push.hub.publish(
            ['http://%s%s' % (Site.objects.get_current().domain,
                              reverse("subhub-hub"))],
            'http://%s%s' % (Site.objects.get_current().domain,
                             self.get_absolute_url()),
        )


class Subscription(models.Model):
    class Meta:
        unique_together = ("subscriber", "publisher")
    subscriber = models.ForeignKey(AbstractGroup, related_name='subcriber')
    publisher = models.ForeignKey(AbstractGroup, related_name='publisher')
    events = models.ManyToManyField(Event)


class Verbiage(models.Model):
    """Stores arbitrary website content fragments in Markdown

    See also: :py:func:`occupywallst.context_processors.verbiage`
    """
    name = models.CharField(max_length=255, unique=True, help_text="""
        Arbitrary name for content fragment.  If this starts with a '/'
        then it'll be mapped to that URL on the website.""")
    content = models.TextField(blank=True)
    use_markdown = models.BooleanField(default=True, help_text="""
        If checked, your content will be parsed as markdown with
        HTML allowed.""")

    class Meta:
        verbose_name_plural = "Verbiage"

    @staticmethod
    def get(name, language=None):
        verb = Verbiage.objects.get(name=name)
        if verb.use_markdown:
            from event_map.utils import markup_parser
            res = markup_parser(verb.content)
        else:
            res = verb.content
        return res

    def __unicode__(self):
        return self.name


class Notification(models.Model):
    content = models.CharField(max_length=255, help_text="""
        Arbitrary content of the notification""")
    href = models.CharField(max_length=255, help_text="""
        the link to whats going on""")
    to = models.ForeignKey(UserGroup, help_text="""
        The user this is to""")
    date_created = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False, help_text="""
        Has this notification been read?""")
