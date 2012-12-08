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
                        
#not in use
def jstime(dt):
    """Convert datetime object to javascript timestamp

    In javascript, timestamps are represented as milliseconds since
    the UNIX epoch in UTC.
    """
   
    ts = int(time.mktime(dt.timetuple())) * 1000
    if hasattr(dt, 'microsecond'):
        ts += dt.microsecond / 1000
    return ts

class JSONResponseMixin(object):
    """
    A mixin that can be used to render a JSON response.
    """
    response_class = HttpResponse

    def render_to_response(self, context, **response_kwargs):
        """
        Returns a JSON response, transforming 'context' to make the payload.
        """
        response_kwargs['content_type'] = 'application/json'
        return self.response_class(
            self.convert_context_to_json(context),
            **response_kwargs
        )

    def convert_context_to_json(self, context):
        "Convert the context dictionary into a JSON object"
        return json.dumps(context,default=self._clean_data)
        
    def _clean_data(obj):
        if hasattr(obj,'geojson'):
            #convert the goejson into a dict so we can convert it back to json :/
            return json.loads(obj.geojson)
        elif hasattr(obj, 'timetuple'):
            return jstime(obj)
        elif hasattr(obj, 'username'):
            return obj.username
        return obj  

class ApiException(Exception):
       def __init__(self, errors, status):
           self.errors = errors
           self.status = status
       def __str__(self):
           return repr(self.massage)

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
           
            return json_response(e.errors,status = e.status)
    return wrapped
    
def _markup(text, convert):
    """
    Justine Tunney -  occupywallst.templatetags.ows
    - Turn markdown text into HTML with additional hacks

    - HTML comments are removed.

    - Angle brackets are added around hyperlinks to make them
      clickable because otherwise no one would know to do this.

    - Any images that start with ``/media/`` will be rewritten to use
      ``settings.MEDIA_URL``.  This is so we don't have to specify the
      CDN address when writing articles.

    """
    text = pat_url.sub(r'<\1>', text)
    text = pat_url_www.sub(r'[\1](http://\1)', text)
    text = pat_comment.sub('', text)
    html = convert(text)
    html = html.replace('src="/media/', 'src="' + settings.MEDIA_URL)
    return mark_safe(html)   
     
def markup_parser(text):
    """Runs text through markdown, no html allowed"""
    markdown_safe = markdown.Markdown(safe_mode='escape')
    return _markup(text, markdown_safe.convert)
