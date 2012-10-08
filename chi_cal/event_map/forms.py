from datetime import datetime
from django import forms
from django.forms.models import modelformset_factory
from event_map import models as db
from django.contrib.gis.geos import Point
from django.contrib.auth.models import User

class EventForm(forms.ModelForm):
    class Meta:
        model = db.Event
        fields = ( 'title','start_date','end_date','organization','link','contact_info','location','venue', 'content','city')
    lat = forms.FloatField(required=False,widget=forms.HiddenInput)
    lng = forms.FloatField(required=False,widget=forms.HiddenInput)
    
    def __init__(self, user, *args, **kwargs):
        self.user = user
        super(EventForm, self).__init__(*args, **kwargs)    
    
    def clean_title(self):
        title = self.data.get('title')
        return title

    def save(self, *args, **kwargs):
        model = super(EventForm, self).save(commit=False)
        
        if self.cleaned_data['lng'] and self.cleaned_data['lat']:
            model.location_point = Point(self.cleaned_data['lng'],self.cleaned_data['lat'])
        model.author = self.user           
        model.published = datetime.now()
        model.is_event = True
        model.save()
        return model
        
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
        email = self.cleaned_data.get('password')        
        user = User.objects.create_user(username, email, password)
        return user
