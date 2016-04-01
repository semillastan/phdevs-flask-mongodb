from flask import Flask
from flask.ext.mongoengine import MongoEngine, MongoEngineSessionInterface
from flask_debugtoolbar import DebugToolbarExtension
from flask.ext.login import LoginManager
from flask_mail import Mail
from flask_sslify import SSLify
from flask.ext.assets import Environment, Bundle
from flask_errormail import mail_on_500

from flask.ext.track_usage import TrackUsage
from flask.ext.track_usage.storage.printer import PrintStorage
from flask.ext.track_usage.storage.mongo import MongoStorage

app = Flask(__name__)
app.config["MONGODB_SETTINGS"] = {'db': ""} # Place MongoDB settings
app.config["SECRET_KEY"] = ""

# Flask-Security
app.config["SECURITY_CONFIRMABLE"] = True
app.config["SECURITY_TRACKABLE"] = True
app.config["SECURITY_REGISTERABLE"] = True
app.config["SECURITY_RECOVERABLE"] = True
app.config["SECURITY_CHANGEABLE"] = True
app.config["SECURITY_REGISTER_USER_TEMPLATE"] = 'accounts/register.html'
app.config["SECURITY_LOGIN_USER_TEMPLATE"] = 'accounts/login.html'
app.config["SECURITY_FORGOT_PASSWORD_TEMPLATE"] = 'accounts/forgot-password.html'
app.config["SECURITY_CHANGE_PASSWORD_TEMPLATE"] = 'accounts/change-password.html'
app.config["SECURITY_SEND_REGISTER_EMAIL"] = False
app.config["SECURITY_SEND_PASSWORD_CHANGE_EMAIL"] = False
app.config["SECURITY_SEND_PASSWORD_RESET_NOTICE_EMAIL"] = False
app.config["SECURITY_PASSWORD_HASH"] = 'sha512_crypt'
app.config["SECURITY_PASSWORD_SALT"] = '' # Set password salt

# Flask-Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = '' # Place email address
app.config['MAIL_PASSWORD'] = '' # Place password
mail = Mail(app)

# Flask-ErrorMail
ADMINISTRATORS = [""] # Set administrators emails
mail_on_500(app, ADMINISTRATORS, sender='') # Add sender email

# Flask-DebugToolBar
app.config['DEBUG_TB_PANELS'] = ['flask.ext.mongoengine.panels.MongoDebugPanel']
app.config['DEBUG_TB_ENABLED'] = True

# Flask-MongoEngine
db = MongoEngine(app)
app.session_interface = MongoEngineSessionInterface(db)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.session_protection = "strong"

assets = Environment(app)
js = Bundle('js/jquery.min.js', 'js/bootstrap.js', 'js/tooltip.js', 'js/notify.min.js', 'js/moment.min.js', 'js/application.js', 'js/app.js', filters="jsmin", output="lib/application.js")
assets.register('js_all', js)
css = Bundle('css/application.css', filters="cssmin", output="lib/application.css")
assets.register('css_all', css)

# Flask-Track-Usage
app.config['TRACK_USAGE_USE_FREEGEOIP'] = False
app.config['TRACK_USAGE_INCLUDE_OR_EXCLUDE_VIEWS'] = 'include'
t = TrackUsage(app, MongoStorage('', 'track_usage')) # Place MongoDB name

# Add URLs
def register_blueprints(app):
    # Prevents circular imports
    from pages.views import pages
    app.register_blueprint(pages)

    from accounts.urls import accounts
    app.register_blueprint(accounts)
    
    # Track all blueprints
    t.include_blueprint(pages)
    t.include_blueprint(accounts)
    
register_blueprints(app)

# sslify = SSLify(app) # Uncomment if using SSL
app.debug = False

if __name__ == '__main__':
    app.run()
