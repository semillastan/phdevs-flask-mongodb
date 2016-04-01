from flask import flash
from myapp import app, login_manager, mail 
from mongoengine.errors import NotUniqueError, DoesNotExist
from accounts.models import User
from strgen import StringGenerator
from flask_mail import Message
from urllib import urlencode
import urllib, urllib2, json, urlparse

@login_manager.user_loader
def load_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except DoesNotExist:
        return None

def flash_errors(form):
    print "Flashing errors ..."
    for field, errors in form.errors.items():
        for error in errors:
            print u"Error in the %s field - %s" % (getattr(form, field).label.text, error)
            flash(u"Error in the %s field - %s" % (
                getattr(form, field).label.text,
                error
            ))

def generate_random_string(length):
    template = "[\d\w]{" + str(length) + "}"
    return StringGenerator(template).render()

def is_json(myjson):
    try:
        json_object = json.loads(myjson)
    except ValueError, e:
        return False
    return True
