from django.db import models
from django.contrib.auth.models import User


def generate_unique_username(base):
    if base:
        count = User.objects.filter(username=base).count()
        if count:
            return base
        username_count = 1
        while username_count:
            name = base + str(count)
            username_count = User.objects.filter(username=name).count()
            count += 1
        return name


class Feed(models.Model):
    feed_url = models.URLField(unique=True)
    content = models.TextField()
    last_import = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User)
    cal_name = models.CharField(
        max_length=255,
        blank=True,
        help_text="""The calenders name populated from X-WR-CALNAME""")
    timezone = models.CharField(
        max_length=255,
        blank=True,
        help_text="""The time zone of the calender""")
    cal_scale = models.CharField(
        max_length=255,
        blank=True)
    desciption = models.TextField(
        blank=True)
    prod_id = models.CharField(
        max_length=255,
        blank=True,
        help_text="""icalenar product id (PRODID)""")

    def save(self, *args, **kwargs):
        if not self.pk:
            name = generate_unique_username("feed")
            new_user = User.objects.create_user(username=name)
            new_user.set_unusable_password()
            self.user = new_user
        super(Feed, self).save(*args, **kwargs)
