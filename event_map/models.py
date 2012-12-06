from django.contrib.gis.db import models
from django.db.models import Q
from django.contrib.auth.models import User
from autoslug import AutoSlugField

class AbstractGroup(models.Model):
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
    description =  models.TextField(help_text="""
        the name of the group""")
    visibility = models.CharField(max_length=32, choices=visibility_choices, default="public", help_text="""
        Whether or not user is attending protest.""")
    posting_option = models.CharField(max_length=32, choices=posting_choices, default="restricted", help_text="""
        How post should be processed""")
    permissions = models.ManyToManyField(User, through='Permission', blank=True)
    subscription = models.ManyToManyField('self', blank=True, help_text="""
        What other groups are aggergated?""")
    def __unicode__(self):
        if hasattr(self, 'group'):
            return "group: "+self.group.__unicode__();  
        elif hasattr(self, 'usergroup'):
            return "usergroup: "+self.usergroup.__unicode__();
        else:
            return self.description

class Group(AbstractGroup):
    title =  models.CharField(unique=True,max_length=255, help_text="""        the name of the group""")
    def __unicode__(self):
        return self.title

class Feed(AbstractGroup):
    title =  models.CharField(unique=True,max_length=255, help_text="""
        the name of the group""")
    source = models.URLField()
    source_type =  models.CharField(null=True, blank=True, max_length=255)
    def __unicode__(self):
        return self.title

class UserGroup(AbstractGroup):
    title =  models.CharField(unique=True,max_length=255, help_text="""
        the name of the group""")
    user = models.ForeignKey(User)
    def save(self, *args, **kwargs):
        self.title = self.user.username
        self.visibility = "public"
        self.description = "Write something about You"
        self.posting_option = "restricted"
        return super(UserGroup, self).save(*args, **kwargs)
    def __unicode__(self):
        return self.title

class Permission(models.Model): 
    banned = models.BooleanField(default=False, help_text="""
        is this user banned?""")
    read  = models.BooleanField(default=False, help_text="""
        can this user view the group?""")
    write = models.BooleanField(default=False, help_text="""
        can the user post to this group""")
    admin = models.BooleanField(default=False, help_text="""
        deos user have admin privilages?""")
    user = models.ForeignKey(User)
    group = models.ForeignKey(AbstractGroup)
    def __unicode__(self):
        return  self.user.username + " --> "+ self.group

class Event(models.Model):
    """Events!"""
    author = models.ForeignKey(User, null=True, blank=True, help_text="""
        The user who wrote this article.""")
    title = models.CharField(max_length=255, help_text="""
        A one-line title to describe article.""")
    content = models.TextField(help_text="""
        The contents of the article in Markdown.""")
    slug = AutoSlugField(populate_from='title', unique=True)

    date_modified = models.DateTimeField(auto_now=True)

    date_created = models.DateTimeField(auto_now_add=True)

    start_date = models.DateTimeField( help_text="""
        What Date is this event Happening On?""")
    end_date = models.DateTimeField(null=True, blank=True, help_text="""
        When is your event ending?""")
    location = models.CharField(null=True, blank=True, max_length=255, help_text="""
        the location of the event""")
    city = models.CharField(null=True, blank=True, max_length=255, help_text="""
        the location of the event""")
    venue = models.CharField(max_length=255,  blank=True, help_text="""
        the name of the Vuenue. For eample "Mom's House".""")
    link = models.CharField(null=True, max_length=255, blank=True,  help_text="""
        a link to other infomation on the event""")
    organization = models.CharField(null=True, max_length=255, blank=True,  help_text="""
        The name Of the organization or group that is putting on the event""")
    contact_info = models.CharField(null=True, max_length=255, blank=True,  help_text="""
        Get more info by contacting this email/phone number""")

    location_point = models.PointField(null=True, blank=True, help_text="""
        Aproximate coordinates of where the event will happen""")
    groups = models.ManyToManyField(AbstractGroup, blank=True)
    
    """Allow geospataul queries"""
    objects = models.GeoManager()
    
    def __unicode__(self):
        return self.title
    
    def toJSON(self):
        rsp = {
            "id":self.id,
            "title":self.title,
            "start_date":self.start_date,
            "end_date":self.end_date,
            "organization":self.organization,
            "content":self.content,
            "author":self.author,
            "contact_info":self.contact_info,
            "city":self.city,
            "location":self.location,
            "venue":self.venue,
            "location_point":self.location_point,
            "link":self.link,
            "slug":self.slug
        }
        return rsp

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
