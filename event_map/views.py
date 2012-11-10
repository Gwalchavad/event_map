from django.template import RequestContext
from django.shortcuts import render_to_response, get_object_or_404
from django.http import Http404, HttpResponse, HttpResponseRedirect, QueryDict
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
from django.core.urlresolvers import reverse
from django.views.generic.base import View
from django.contrib.auth import authenticate, logout, login as auth_login
#cuz we need it for ajax login
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from datetime import datetime, timedelta, date
import dateutil.parser
import itertools
import json
import calendar
from event_map import utils, forms, models as db
from event_map.utils import json_api_errors, ApiException

@ensure_csrf_cookie
def index(request):
    begin = datetime.now()
    events = db.Event.objects.filter(start_date__gte=begin).order_by('start_date')[:10]
    response = [{
                'id':event.id,
                "title":event.title,
                "start_date":event.start_date,
                "end_date":event.end_date,
                "organization":event.organization,
                "content":event.content,
                "author":event.author,
                "contact_info":event.contact_info,
                "published":event.published,
                "city":event.city,
                "location":event.location,
                "venue":event.venue,
                "location_point":event.location_point,
                "link":event.link
                } for event in events]
    jsonevents = json.dumps(response, default=utils.clean_data)
    session = {
        'authenticated':request.user.is_authenticated(),
        'username':request.user.username,
        'id':request.user.id
    }
    jsonsession = json.dumps(session, default=utils.clean_data)
    
    return render_to_response('base.html',
                              {'events': jsonevents,
                              'session': jsonsession},
                              context_instance=RequestContext(request))

class session(View):
    """
    check the users status
    """
    #and we need to send the csrf cookie.
    @method_decorator(ensure_csrf_cookie)
    def get(self, request, *args, **kwargs):
        return utils.json_response({
            'authenticated':request.user.is_authenticated(),
            'username':request.user.username,
            'id':request.user.id
        }) 

    """
    Login - create a new session
    """
    def post(self, request, *args, **kwargs):
        jsonPost = json.loads(request.raw_post_data)
        username = jsonPost['username']
        password = jsonPost['password']
        #login    
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                #log user in
                auth_login(request, user)
                return utils.json_response({
                    'authenticated':True,
                    'username':username,
                    'id':user.id
                }) 
            else:
                # Return a 'disabled account' error message
                return utils.json_response({

                    'errors':{'message':"You have been banned"}
                }, status = 401)
        else:
            # Return an 'invalid login' error message.      
            return utils.json_response({
                 'errors':{
                    'message':"Invalid Username Or Password",
                    }
            },status = 401)
            
    def delete(self, request, *args, **kwargs):
        logout(request)
        return utils.json_response({
            'authenticated':False,
            'username':""
        })

class cal_user(View):
    def post(self, request, *args, **kwargs):
        jsonPOST =  json.loads(request.raw_post_data)
        form = forms.SignUpForm(jsonPOST)
        if form.is_valid():
            #key = 'signup_' + request.META['REMOTE_ADDR']
            #if cache.get(key):
            #    return HttpResponse('please wait before signing up again')
            #cache.set(key, True, settings.OWS_LIMIT_SIGNUP)
            form.save()
            user = authenticate(username=form.cleaned_data.get('username'), 
                        password=form.cleaned_data.get('password'))
            auth_login(request,user);

            return utils.json_response({
                    'authenticated':True,
                    'username':user.username,
                    'id':user.id
                })  
        else:
            return utils.json_response({
                'errors': dict(form.errors.items()),
            },status = 401)

class events(View):
    """
    get events
    offset is the strating index
    
    """
    @method_decorator(json_api_errors)
    def get(self, request, *args, **kwargs):        
        events = db.Event.objects.order_by('start_date')
        if request.GET.get('start'):
            #change to use actully date 
            try:
                begin = dateutil.parser.parse(request.GET.get('start'))
            except ValueError:
                raise ApiException("Invalid ISO date","start",401)
                 
        else:
            begin = datetime.now()
         
        if request.GET.get('modified'):
            try:
                mod_date = dateutil.parser.parse(request.GET.get('modified'))
            except ValueError:
                raise ApiException("Invalid ISO date","modified",401)
                
            events = events.filter(date_modified__gte=mod_date)
        
        if request.GET.get('user'):
            events = events.select_related("author").filter(author__username=request.GET.get('user'))
            
        if request.GET.get('offset'):
            offset = int(request.GET.get('offset'))
        else: 
            offset = 0

        if request.GET.get('n'):
            end =  int(request.GET.get('n'))
            #1 , 
            if offset >= 0:
                #3, 4 works
                if end >= 0:
                    events = events.filter(start_date__gte=begin)[offset:offset+end] 
                #3 -2 works
                elif offset + end >= 0:
                    events = events.filter(start_date__gte=begin).order_by('start_date')[offset+end:offset] 
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
                    events = events.filter(start_date__lte=begin).order_by('-start_date')[abs(offset):abs(offset+end)]   
                #-1, 4
                elif end + offset >= 0:
                    after_events = events.filter(start_date__gte=begin).order_by('start_date')[:abs(end + offset)]
                    events = events.filter(start_date__lte=begin).order_by('-start_date')[:abs(offset)]
                    events = list(events)
                    events.reverse()
                    events.extend(after_events)                      
                #-10 6
                else:
                    events = events.filter(start_date__lte=begin).order_by('-start_date')[abs(offset+end):abs(offset)]
                    events = list(events)
                    events.reverse()
        else:
            #todo specify defaults
            if offset < 0:
                before_events = events.filter(start_date__lte=begin).order_by('-start_date')[:abs(offset)]
                after_events = events.filter(start_date__gte=begin).order_by('start_date')
                events = list(itertools.chain(before_events.reverse(),after_events))
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
                        "published":event.published,
                        "city":event.city,
                        "location":event.location,
                        "venue":event.venue,
                        "location_point":event.location_point,
                        "link":event.link
                    } for event in events]
                    
        return utils.json_response(response)

class event(View):
    #get - 
    def get(self, request, *args, **kwargs):    
        event = db.Event.objects.get(id=kwargs['id'])
        response = {
                        "id":event.id,
                        "title":event.title,
                        "start_date":event.start_date,
                        "end_date":event.end_date,
                        "organization":event.organization,
                        "content":event.content,
                        "author":event.author,
                        "contact_info":event.contact_info,
                        "published":event.published,
                        "city":event.city,
                        "location":event.location,
                        "venue":event.venue,
                        "location_point":event.location_point,
                        "link":event.link
                    }
        return utils.json_response(response)    
    #modify
    def put(self, request, *args, **kwargs):
        
        jsonPOST =  json.loads(request.raw_post_data)
        event = db.Event.objects.get(id=kwargs['id'])
        if event.author == request.user:
            form = forms.EventForm(request.user,jsonPOST,instance=event)
            if form.is_valid():
                event = form.save(request.user)
                return utils.json_response({
                    'success': True,
                })
            else:
                return utils.json_response({
                    'errors': dict(form.errors.items()),
                })
        else:
            return utils.json_response({
                'errors':{
                    'message':"Permission Denied",
                }
            },status = 401)
    #create
    def post(self, request, *args, **kwargs):
        jsonPOST =  json.loads(request.raw_post_data)
        form = forms.EventForm(request.user,jsonPOST)
        if form.is_valid():
            event = form.save(request.user)
            response = {
                        "id":event.id,
                        "title":event.title,
                        "start_date":event.start_date,
                        "end_date":event.end_date,
                        "organization":event.organization,
                        "content":event.content,
                        "author":event.author,
                        "contact_info":event.contact_info,
                        "published":event.published,
                        "city":event.city,
                        "location":event.location,
                        "venue":event.venue,
                        "location_point":event.location_point,
                        "link":event.link
                    }
            return utils.json_response(response)
        else:
            return utils.json_response({
                'errors': dict(form.errors.items()),
            })
    #delete
    def delete(self, request, *args, **kwargs):
        try:
            event = db.Event.objects.get(id=kwargs['id'])
            if event.author == request.user:
                event.delete()
                return utils.json_response({
                        'success': True,
                })
            else:
                return utils.json_response({
                    'errors':{
                        'message':"You don not have permission to delete this event",
                    }
                },status = 401)    
        except ObjectDoesNotExist:
            return utils.json_response({
                'errors':{
                    'message':"Event Not Found",
                    }
            },status = 404)
            
