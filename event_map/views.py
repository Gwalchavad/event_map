"""
API Views for Event Map
Extecpt for index all of the classes are for the API.
"""
from django.template import RequestContext
from django.core.exceptions import ObjectDoesNotExist
from django.views.generic.base import View
from django.contrib.auth import authenticate, logout, login as auth_login
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.shortcuts import render_to_response
from datetime import datetime
import dateutil.parser
import itertools
import json
from event_map import utils, forms, models as db
from event_map.utils import json_api_errors, ApiException


@ensure_csrf_cookie
def index(request):
    """
    Generates the index. Loads the page with an initial list of event
    and get the initail session status for the user
    """
    begin = datetime.now()
    init_events = db.Event.objects.filter(start_date__gte=begin).order_by('start_date')[:10]
    response = [{
                'id':event.id,
                "title":event.title,
                "start_date":event.start_date,
                "end_date":event.end_date,
                "organization":event.organization,
                "content":event.content,
                "author":event.author,
                "contact_info":event.contact_info,
                "city":event.city,
                "location":event.location,
                "venue":event.venue,
                "location_point":event.location_point,
                "link":event.link
                } for event in init_events]
    jsonevents = json.dumps(response, default=utils.clean_data)
    init_events = {
        'authenticated': request.user.is_authenticated(),
        'username': request.user.username,
        'id': request.user.id
    }
    jsonsession = json.dumps(init_events, default=utils.clean_data)
    return render_to_response('base.html',
                              {'events': jsonevents,
                              'session': jsonsession},
                              context_instance=RequestContext(request))


class Session(View):
    """
    Log In, Log out and check the session
    """
    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        """
        check the users status, and we need to send the csrf cookie.
        """
        return utils.json_response({
            'authenticated': request.user.is_authenticated(),
            'username': request.user.username,
            'id': request.user.id
        })

    def post(self, request):
        """
        Login - create a new session
        """
        json_post = json.loads(request.raw_post_data)
        username = json_post['username']
        password = json_post['password']
        #login
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                #log user in
                auth_login(request, user)
                return utils.json_response({
                    'authenticated': True,
                    'username': username,
                    'id': user.id
                })
            else:
                # Return a 'disabled account' error message
                return utils.json_response({
                    'errors': {'message': "You have been banned"}
                }, status=401)
        else:
            # Return an 'invalid login' error message.
            return utils.json_response({
                'errors': {
                    'message': "Invalid Username Or Password",
                }
            }, status=401)

    def delete(self, request):
        """Logout"""
        logout(request)
        return utils.json_response({
            'authenticated': False,
            'username': ""
        })


class EventUser(View):
    """API for user manpulation"""
    def post(self, request):
        """Logs user in"""
        json_post = json.loads(request.raw_post_data)
        form = forms.SignUpForm(json_post)
        if form.is_valid():
            #key = 'signup_' + request.META['REMOTE_ADDR']
            #if cache.get(key):
            #    return HttpResponse('please wait before signing up again')
            #cache.set(key, True, settings.OWS_LIMIT_SIGNUP)
            form.save()
            user = authenticate(
                username=form.cleaned_data.get('username'),
                password=form.cleaned_data.get('password')
            )
            auth_login(request, user)
            return utils.json_response({
                'authenticated': True,
                'username': user.username,
                'id': user.id
            })
        else:
            return utils.json_response({
                'errors': dict(form.errors.items()),
            }, status=401)


class EventTimeLine(View):
    """
    get events
    offset is the strating index
    """
    @method_decorator(json_api_errors)
    def get(self, request):
        """
        Gets a list of events.
        GET[n] specifies the number of events
        GET[start] Where to start getting the events from
        GET[offset] How many events to skip
        GET[User] specifies a user, or all events will be searched
        """
        events = db.Event.objects.order_by('start_date')

        if request.GET.get('start'):
            #change to use actully date
            try:
                begin = dateutil.parser.parse(request.GET.get('start'))
            except ValueError:
                raise ApiException("Invalid ISO date", "start", 401)
        else:
            begin = datetime.now()

        if request.GET.get('modified'):
            try:
                mod_date = dateutil.parser.parse(request.GET.get('modified'))
            except ValueError:
                raise ApiException("Invalid ISO date", "modified", 401)
            events = events.filter(date_modified__gte=mod_date)

        if request.GET.get('user'):
            events = events.select_related("author").filter(author__username=request.GET.get('user'))

        if request.GET.get('offset'):
            offset = int(request.GET.get('offset'))
        else:
            offset = 0

        if request.GET.get('n'):
            end = int(request.GET.get('n'))
            #example end=1
            if offset >= 0:
                #3, 4 works
                if end >= 0:
                    events = events.filter(start_date__gte=begin)[offset: offset + end]
                #3 -2 works
                elif offset + end >= 0:
                    events = events.filter(start_date__gte=begin).order_by('start_date')[offset + end: offset]
                    events = list(events)
                    events.reverse()
                #3 - 5 works
                else:
                    before_events = events.filter(start_date__lte=begin).order_by('-start_date')[:abs(offset + end)]
                    events = events.filter(start_date__gte=begin).order_by('start_date')[:offset]
                    events = list(events)
                    events.reverse()
                    events.extend(before_events)
            #-1,
            else:
                #-1 -5
                if  end <= 0:
                    events = events.filter(start_date__lte=begin).order_by('-start_date')[abs(offset): abs(offset + end)]
                #-1, 4
                elif end + offset >= 0:
                    after_events = events.filter(start_date__gte=begin).order_by('start_date')[:abs(end + offset)]
                    events = events.filter(start_date__lte=begin).order_by('-start_date')[:abs(offset)]
                    events = list(events)
                    events.reverse()
                    events.extend(after_events)
                #-10 6
                else:
                    events = events.filter(start_date__lte=begin).order_by('-start_date')[abs(offset + end): abs(offset)]
                    events = list(events)
                    events.reverse()
        else:
            #todo specify defaults
            if offset < 0:
                before_events = events.filter(start_date__lte=begin).order_by('-start_date')[:abs(offset)]
                after_events = events.filter(start_date__gte=begin).order_by('start_date')
                events = list(itertools.chain(before_events.reverse(), after_events))
            else:
                events = events.filter(start_date__gte=begin)[offset:]

        response = [{
            "id":event.id,
            "title":event.title,
            "start_date":event.start_date,
            "end_date":event.end_date,
            "organization":event.organization,
            "content":event.content,
            "author":event.author,
            "contact_info":event.contact_info,
            "city":event.city,
            "location":event.location,
            "venue":event.venue,
            "location_point":event.location_point,
            "link":event.link
        } for event in events]
        return utils.json_response(response)


class Event(View):
    """
    API for get, setting and deleting events
    """
    def get(self,request, **kwargs):
        """
        Get An Events Details given its ID
        """
        event = db.Event.objects.get(id=kwargs['id'])
        response = {
            "id": event.id,
            "title": event.title,
            "start_date": event.start_date,
            "end_date": event.end_date,
            "organization": event.organization,
            "content": event.content,
            "author": event.author,
            "contact_info": event.contact_info,
            "city": event.city,
            "location": event.location,
            "venue": event.venue,
            "location_point": event.location_point,
            "link": event.link
        }
        return utils.json_response(response)

    def put(self, request, **kwargs):
        """Modify an Event via a post based on it id"""
        json_post = json.loads(request.raw_post_data)
        event = db.Event.objects.get(id=kwargs['id'])
        if event.author == request.user:
            form = forms.EventForm(request.user, json_post, instance=event)
            if form.is_valid():
                event = form.save()
                return utils.json_response({
                    'success': True,
                })
            else:
                return utils.json_response({
                    'errors': dict(form.errors.items()),
                })
        else:
            return utils.json_response({
                'errors': {
                    'message': "Permission Denied",
                }
            }, status=401)

    def post(self, request):
        """create an event"""
        json_post = json.loads(request.raw_post_data)
        form = forms.EventForm(request.user, json_post)
        if form.is_valid():
            event = form.save()
            response = {
                "id": event.id,
                "title": event.title,
                "start_date": event.start_date,
                "end_date": event.end_date,
                "organization": event.organization,
                "content": event.content,
                "author": event.author,
                "contact_info": event.contact_info,
                "published": event.published,
                "city": event.city,
                "location": event.location,
                "venue": event.venue,
                "location_point": event.location_point,
                "link": event.link
            }
            return utils.json_response(response)
        else:
            return utils.json_response({
                'errors': dict(form.errors.items()),
            }, status=401)

    def delete(self, request, **kwargs):
        """Deletes An Event"""
        try:
            event = db.Event.objects.get(id=kwargs['id'])
            if event.author == request.user:
                event.delete()
                return utils.json_response({
                    'success': True,
                })
            else:
                return utils.json_response({
                    'errors': {
                        'message': "You don not have permission to delete this event",
                    }
                }, status=401)
        except ObjectDoesNotExist:
            return utils.json_response({
                'errors': {
                    'message': "Event Not Found",
                }
            }, status=404)


class Group(View):
    """API For groups"""
    @method_decorator(json_api_errors)
    def get(self, request, **kwargs):
        """Get info about a group"""
        group = db.Group.objects.get(id=kwargs['id'])
        permission = group.permission_set.all().get(user=request.user)
        permission_json = {
            "admin":permission.admin,
            "read":permission.read,
            "write":permission.write,
            "banned":permission.banned,
        }
        response = {
            "id": group.id,
            "title": group.title,
            "description": group.description,
            "permissions":permission_json
        }
        return utils.json_response(response)
        
    def put(self, request, **kwargs):
        """modifiey a group"""
        return utils.json_response({
            'errors': {
                'message': "NOT Implemented",
            }
        }, status=401)
        
    def post(self, request):
        """create an a group"""
        json_post = json.loads(request.raw_post_data)
        form = forms.GroupForm(json_post)
        if form.is_valid():
            group = form.save()
            db.Permission.objects.create(admin=True,user=request.user,group=group)
            response = {
                "id": group.id,
                "title": group.title,
                "description": group.description
            }
            return utils.json_response(response)
        else:
            return utils.json_response({
                'errors': dict(form.errors.items()),
            }, status=401)
        
    def delete(self, request):
        """delete a group"""
        return utils.json_response({
            'errors': {
                'message': "NOT Implemented",
            }
        }, status=401)


class Subscription(View):
    """Manage subscriptions to groups"""
    def get(self,request):
        """get a list of subscriptions"""
        
    def post(self,request):
        """create a new subscription"""

    def delete(self,request):
        """delete a subscription"""
