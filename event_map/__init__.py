from django.db.models.signals import post_save
from django.contrib.auth.models import User
from guardian.shortcuts import assign_perm
import event_map.models as db


def create_user_callback(sender, **kwargs):
    user = kwargs["instance"]
    if kwargs["created"]:
        userGroup = db.UserGroup(user=user, title=user.username)
        userGroup.save()
        assign_perm("group_admin", user, userGroup.abstractgroup_ptr)

post_save.connect(create_user_callback, sender=User)
