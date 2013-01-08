def import_ical(ical):
    events = ical.walk("VEVENT")
    
