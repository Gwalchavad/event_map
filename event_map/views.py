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
from feed_import import importers


@ensure_csrf_cookie
def index(request):
    """
    Generates the index. Loads the page with an initial list of event
    and get the initail session status for the user
    """
    begin = datetime.now()
    init_events = db.Event.objects.filter(start_date__gte=begin, complete=True).order_by('start_date')[:20]
    response = [event.to_JSON() for event in init_events]
    jsonevents = json.dumps(response, default=utils.clean_data)
    init_events = {
        'authenticated': request.user.is_authenticated(),
        'username': request.user.username,
        'id': request.user.id
    }
    jsonsession = json.dumps(init_events, default=utils.clean_data)
    return render_to_response(
        'base.html',
        {'events': jsonevents, 'session': jsonsession},
        context_instance=RequestContext(request))


def upload_file(request):
    """
    icalendar file uploader
    """
    #if request.FILES['our-file'].size < 1000:
    if 'our-file' in request.FILES and request.FILES['our-file'].content_type == 'text/calendar':
        ical_file = request.FILES['our-file'].read()
        created_events, old_events = importers.import_feed(ical_file, request.user.usergroup)
        if created_events:
            request.user.usergroup.bfs_propagation(created_events, created=True)
        if old_events:
            request.user.usergroup.bfs_propagation(old_events)
    else:
        raise ApiException("invalid file type", 415)
    all_events = created_events + old_events
    return utils.json_response([event.to_JSON() for event in all_events])


class Session(View):
    """
    Log In, Log out and check the session
    """
    @method_decorator(json_api_errors)
    def dispatch(self, *args, **kwargs):
        return super(Session, self).dispatch(*args, **kwargs)

    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        """
        check the users status, and we need to send the csrf cookie.
        """
        return utils.json_response({
            'authenticated': request.user.is_authenticated(),
            'username': request.user.username,
            'id': request.user.id})

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
                    'id': user.id})
            else:
                # Return a 'disabled account' error message
                raise ApiException("You have been banned. FOADUMF!", 401)
        else:
            # Return an 'invalid login' error message.
            raise ApiException("Invalid Username Or Password", 401)

    def delete(self, request):
        """Logout"""
        logout(request)
        return utils.json_response({
            'authenticated': False,
            'username': ""
        })


class EventUser(View):
    """API for user manpulation"""
    @method_decorator(json_api_errors)
    def dispatch(self, *args, **kwargs):
        return super(EventUser, self).dispatch(*args, **kwargs)

    def post(self, request):
        """Create a new user"""
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
            raise ApiException(utils.form_errors_to_json(form), 401)


class EventTimeLine(View):
    """
    get events
    offset is the strating index
    """
    @method_decorator(json_api_errors)
    def dispatch(self, *args, **kwargs):
        return super(EventTimeLine, self).dispatch(*args, **kwargs)

    def get(self, request):
        """
        Gets a list of events.
        GET[n] specifies the number of events
        GET[start] Where to start getting the events from
        GET[offset] How many events to skip
        GET[Author] selects events by the an authors username
        GET[group] gets all the events in a particular group
        GET[me] get all of the events in the usergroup of the current user
        """
        events = db.Event.objects.order_by('start_date')

        if request.GET.get('complete') and request.GET.get('complete').lower() == 'false':
            events = events.filter(complete=False)
        else:
            events = events.filter(complete=True)

        if request.GET.get('start'):
            #change to use actully date
            try:
                begin = dateutil.parser.parse(request.GET.get('start').replace("Z", ""))
            except (ValueError, OverflowError):
                raise ApiException("Invalid ISO date", 400, "start")
        else:
            begin = datetime.now()

        if request.GET.get('modified'):
            try:
                mod_date = dateutil.parser.parse(request.GET.get('modified').replace("Z", ""))
            except (ValueError, OverflowError):
                raise ApiException("Invalid ISO date", 400, "start")
            events = events.filter(date_modified__gte=mod_date)

        if request.GET.get('author'):
            #gets events by the author's username
            events = events.filter(
                author__user__username=request.GET.get('author'))

        if request.GET.get('me'):
            events = events.filter(subgroupevent__group_id=request.user.usergroup.id)

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
                    events = events.\
                        filter(start_date__gte=begin)[offset: offset + end]
                #3 -2 works
                elif offset + end >= 0:
                    events = events.\
                        filter(start_date__gte=begin).\
                        order_by('start_date')[offset + end: offset]
                    events = list(events)
                    events.reverse()
                #3 - 5 works
                else:
                    before_events = events.\
                        filter(start_date__lte=begin).\
                        order_by('-start_date')[:abs(offset + end)]
                    events = events.\
                        filter(start_date__gte=begin).\
                        order_by('start_date')[:offset]
                    events = list(events)
                    events.reverse()
                    events.extend(before_events)
            #-1,
            else:
                #-1 -5
                if end <= 0:
                    events = events.\
                        filter(start_date__lte=begin).\
                        order_by('-start_date')[abs(offset): abs(offset + end)]
                #-1, 4
                elif end + offset >= 0:
                    after_events = events.\
                        filter(start_date__gte=begin).\
                        order_by('start_date')[:abs(end + offset)]
                    events = events.\
                        filter(start_date__lte=begin).\
                        order_by('-start_date')[:abs(offset)]
                    events = list(events)
                    events.reverse()
                    events.extend(after_events)
                #-10 6
                else:
                    events = events.\
                        filter(start_date__lte=begin).\
                        order_by('-start_date')[abs(offset + end): abs(offset)]
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
        return utils.json_response([event.to_JSON() for event in events])


class Event(View):
    """
    API for get, setting and deleting events
    """
    @method_decorator(json_api_errors)
    def dispatch(self, *args, **kwargs):
        return super(Event, self).dispatch(*args, **kwargs)

    def get(self, request, **kwargs):
        """
        Get An Events Details given its ID
        OR slug
        """
        try:
            if 'id' in kwargs:
                event = db.Event.objects.get(id=kwargs['id'])
            else:
                event = db.Event.objects.get(slug=kwargs['slug'])
        except ObjectDoesNotExist:
            raise ApiException("Event Not Found", 404)
        return utils.json_response(event.to_JSON())

    def put(self, request, **kwargs):
        """Modify an Event via a post based on it id"""
        json_post = json.loads(request.raw_post_data)
        try:
            if 'id' in kwargs:
                event = db.Event.objects.get(id=kwargs['id'])
            else:
                event = db.Event.objects.get(slug=kwargs['slug'])
        except ObjectDoesNotExist:
            raise ApiException("Event Not Found", 404)
        if event.author.user == request.user:
            form = forms.EventForm(request.user, json_post, instance=event)
            if form.is_valid():
                event = form.save()
                return utils.json_response({
                    'success': True,
                })
            else:
                raise ApiException(utils.form_errors_to_json(form), 401)
        else:
            raise ApiException("Permission Denied", 401)

    def post(self, request):
        """create an event"""
        if not request.user.is_authenticated():
            raise ApiException("User Is not Logged In", 401)
        json_post = json.loads(request.raw_post_data)
        form = forms.EventForm(request.user, json_post)
        if form.is_valid():
            event = form.save()
            return utils.json_response(event.to_JSON())
        else:
            raise ApiException(utils.form_errors_to_json(form), 401)

    def delete(self, request, **kwargs):
        """Deletes An Event"""
        try:
            event = db.Event.objects.get(slug=kwargs['slug'])
            if event.author.user == request.user:
                event.delete()
                return utils.json_response({
                    'success': True,
                })
            else:
                raise ApiException("You don not have permission to delete this event", 401)
        except ObjectDoesNotExist:
            raise ApiException("Event Not Found", 404)


class Group(View):
    """API For groups"""
    @method_decorator(json_api_errors)
    def dispatch(self, *args, **kwargs):
        return super(Group, self).dispatch(*args, **kwargs)

    def get(self, request, **kwargs):
        """Get info about a group"""
        group = db.Group.objects.get(id=kwargs['id'])
        permission = group.permission_set.all().get(user=request.user)
        permission_json = {
            "admin": permission.admin,
            "read": permission.read,
            "write": permission.write,
            "banned": permission.banned,
        }
        response = {
            "id": group.id,
            "title": group.title,
            "description": group.description,
            "permissions": permission_json
        }
        return utils.json_response(response)

    def put(self, request, **kwargs):
        """modifiey a group"""
        raise ApiException("NOT Implemented", 401)

    def post(self, request):
        """create an a group"""
        json_post = json.loads(request.raw_post_data)
        form = forms.GroupForm(json_post)
        if form.is_valid():
            group = form.save()
            db.Permission.objects.create(admin=True, user=request.user, group=group)
            response = {
                "id": group.id,
                "title": group.title,
                "description": group.description
            }
            return utils.json_response(response)
        else:
            raise ApiException(utils.form_errors_to_json(form), 401)

    def delete(self, request):
        """delete a group"""
        raise ApiException("NOT Implemented", 401)


class FeedView(View):
    """API For groups"""
    #@method_decorator(json_api_errors)
    def dispatch(self, *args, **kwargs):
        return super(FeedView, self).dispatch(*args, **kwargs)

    def get(self, request, **kwargs):
        """Get info about a feed"""
        group = db.Group.objects.get(id=kwargs['id'])
        permission = group.permission_set.all().get(user=request.user)
        permission_json = {
            "admin": permission.admin,
            "read": permission.read,
            "write": permission.write,
            "banned": permission.banned,
        }
        response = {
            "id": group.id,
            "title": group.title,
            "description": group.description,
            "permissions": permission_json
        }
        return utils.json_response(response)

    def put(self, request, **kwargs):
        """modifiey a feed"""
        raise ApiException("NOT Implemented", 401)

    def post(self, request):
        """create an a feed"""
        from feed_import import importers
        json_post = json.loads(request.raw_post_data)
        imported_feed = importers.add_feed(json_post['url'], request.user)
        if imported_feed:
            return utils.json_response({'message': 'feed imported'})

    def delete(self, request):
        """delete a group"""
        raise ApiException("NOT Implemented", 401)


class Subscription(View):

    @method_decorator(json_api_errors)
    def dispatch(self, *args, **kwargs):
        return super(Subscription, self).dispatch(*args, **kwargs)

    """Manage subscriptions to groups"""
    def get(self, request):
        """get a list of subscriptions"""

    def post(self, request):
        """create a new subscription"""

    def delete(self, request):
        """delete a subscription"""


class Notifications(View):

    @method_decorator(json_api_errors)
    def dispatch(self, *args, **kwargs):
        return super(Notifications, self).dispatch(*args, **kwargs)

    """Recieve and mark read Notifications"""
    def get(self, request):
        """get Notifications"""
        notes = db.Notification.objects.filter(to=request.user)
        return utils.json_response([note.to_JSON() for note in notes])

    def put(self, request):
        """Mark read Notifications"""
