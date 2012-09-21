from django.http import Http404, HttpResponse
import json
import time



def cal_time(dt):
    #hour off?
    return jstime(dt)
    #return time.strftime("%Y-%m-%d %H:%M",dt.timetuple())
    
def clean_data(obj):
    if hasattr(obj,'geojson'):
        #convert the goejson into a dict so we can convert it back to json :/
        return json.loads(obj.geojson)
    elif hasattr(obj, 'timetuple'):
        return cal_time(obj)
    elif hasattr(obj, 'username'):
        return obj.username
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
