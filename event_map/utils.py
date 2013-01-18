from django.http import Http404, HttpResponse
from django.core.exceptions import ObjectDoesNotExist
import json
import time
import sys
import markdown

def cal_time(dt):
    return dt.isoformat()
    #return time.strftime("%Y-%m-%d %H:%M",dt.timetuple())

def clean_data(obj):
    if hasattr(obj,'geojson'):
        #convert the goejson into a dict so we can convert it back to json :/
        return json.loads(obj.geojson)
    elif hasattr(obj, 'timetuple'):
        return cal_time(obj)
    elif hasattr(obj, 'username'):
        return obj.username
    elif isinstance(obj,ValueError):
        return str(obj)
    return obj

def json_response(data, status=200):
    return HttpResponse(
        json.dumps(data, default=clean_data ),
        content_type='application/json; charset=UTF-8', 
        status = status,
    )
    
class ApiException(Exception):
       def __init__(self, message,status,field=None):
           if type(message) == str:
               message = {'errors':[{"message":message,"field":field}]}
           self.message = message
           self.status = status
       def __str__(self):
           return repr(self.message)

def form_errors_to_json(form):
    errors = dict(form.errors.items())
    return [ {"message":errors[error][0],"field": error} for error in errors]

def json_api_errors(fn):
    """
        Handles errors and returns the error message in JSON
    """
    def wrapped(self, **kwargs):
        try:
            return fn(self, **kwargs)
        except ValueError,detail:
            return json_response({
                 'errors':{
                    'message':detail
                    }
            },status = 401)
        except ObjectDoesNotExist, e:
            return json_response({
                'errors':{
                    'message':"does not exist",
                }
            },status = 404)
        except ApiException, e:
            return json_response(e.message,status = e.status)
    return wrapped
