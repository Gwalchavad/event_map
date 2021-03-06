from datetime import datetime
from django import forms
from event_map import models as db
from django.contrib.gis.geos import Point
from django.contrib.auth.models import User
from django.utils.dateparse import parse_datetime
from django.utils import timezone


class EventForm(forms.ModelForm):
    class Meta:
        model = db.Event
        fields = ('title', 'link', 'contact_info', 'address', 'venue', 'content', 'city')
    start_date = forms.CharField(required=True)
    end_date = forms.CharField(required=True)
    groups = forms.CharField(required=False)
    lat = forms.FloatField(required=False, widget=forms.HiddenInput)
    lng = forms.FloatField(required=False, widget=forms.HiddenInput)

    def clean_start_date(self):
        try:
            start_date = parse_datetime(self.data.get('start_date').replace("Z", ""))
            tz = timezone.get_current_timezone()
            return tz.localize(start_date)
        except ValueError:
            raise forms.ValidationError("Invalid ISO date for start_date")

    def clean_end_date(self):
        try:
            end_date = parse_datetime(self.data.get('end_date').replace("Z", ""))
            tz = timezone.get_current_timezone()
            return tz.localize(end_date)
        except ValueError:
            raise forms.ValidationError("Invalid ISO date for end_date")

    def __init__(self, user, *args, **kwargs):
        self.user = user
        super(EventForm, self).__init__(*args, **kwargs)

    def save(self, *args, **kwargs):
        model = super(EventForm, self).save(commit=False)
        if self.cleaned_data['lng'] and self.cleaned_data['lat']:
            model.location_point = Point(self.cleaned_data['lng'], self.cleaned_data['lat'])
        model.start_date = self.cleaned_data['start_date']
        model.end_date = self.cleaned_data['end_date']
        model.author = self.user.usergroup
        model.published = datetime.now()
        model.save(create_sge=True)

        group_id = self.cleaned_data['groups']
        if group_id != "False":
            group = db.Group.objects.get(pk=group_id)
            group.bfs_propagation(model, created=True)
        return model


class GroupForm(forms.ModelForm):
    class Meta:
        model = db.Group
        fields = ('title', 'description', 'visibility', 'posting_option')

    def __init__(self, user, *args, **kwargs):
        self.usergroup = user.usergroup
        super(GroupForm, self).__init__(*args, **kwargs)

    def save(self, *args, **kwargs):
        model = super(GroupForm, self).save(commit=False)
        model.creator = self.usergroup
        model.save()

        #create subscription from the feed group to the user
        user_sub = db.Subscription(subscriber=model.creator, publisher=model)
        user_sub.save()
        return model


class UserGroupForm(forms.ModelForm):
    class Meta:
        model = db.AbstractGroup
        fields = ['description']


class SignUpForm(forms.Form):
    username = forms.RegexField(
        label="Username", max_length=30, regex=r'^[a-zA-Z0-9]{3,30}$',
        help_text="Required. Letters and digits only and 3-30 characters.",
        error_messages={'invalid': ("Please enter letters and digits only.  "
                                    "Minimum 3 characters and max 30.")})
    password = forms.CharField(label="Password", widget=forms.PasswordInput,
                               min_length=6, max_length=128,
                               help_text="At least 6 characters")
    email = forms.EmailField()

    def clean_username(self):
        username = self.data.get('username')
        if User.objects.filter(username__iexact=username).count():
            raise forms.ValidationError("Username is taken")
        return username

    def save(self):
        username = self.cleaned_data.get('username')
        password = self.cleaned_data.get('password')
        email = self.cleaned_data.get('email')
        user = User.objects.create_user(username, email, password)
        return user
