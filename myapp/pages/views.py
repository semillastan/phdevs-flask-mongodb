from flask import Blueprint, request, redirect, render_template, url_for, flash, make_response
from flask.views import View, MethodView
from flask.ext.mongoengine.wtf import model_form
from flask.ext.login import current_user

from datetime import datetime, timedelta
from myapp import app as current_app
from myapp import login_manager

from accounts.models import User
from accounts.forms import RegisterForm, LoginForm

pages = Blueprint('pages', __name__, template_folder='templates')

class RenderTemplateView(View):
    def __init__(self, template_name):
        self.template_name = template_name
    def dispatch_request(self):
        return render_template(self.template_name)

class HomeView(MethodView):

    def get_context(self):
        login_user_form = LoginForm(request.form)
        context = {
            "login_user_form": login_user_form,
        }
        return context

    def get(self):
        if current_user.is_authenticated:
            return redirect(url_for('pages.home'))
        else:
            context = self.get_context()
            return render_template('home.html', **context)

class UnauthorizedPageView(MethodView):

    @login_manager.unauthorized_handler
    def get(self):
        return render_template('401.html')

class GenerateSitemapView(MethodView):

    def get(self):
        # a route for generating sitemap.xml
        """Generate sitemap.xml. Makes a list of urls and date modified."""
        
        pages = []
        ten_days_ago = datetime.now() - timedelta(days=10)

        # static pages
        for rule in current_app.url_map.iter_rules():
            if "GET" in rule.methods and len(rule.arguments)==0:
                pages.append([rule.rule,ten_days_ago.date()])

        sitemap_xml = render_template('sitemap_template.xml', pages=pages)
        response = make_response(sitemap_xml)
        response.headers["Content-Type"] = "application/xml"    

        return response

# Register the urls
pages.add_url_rule('/', view_func=HomeView.as_view('home'))
pages.add_url_rule('/page-not-found', view_func=RenderTemplateView.as_view('404', template_name="404.html"))
pages.add_url_rule('/unauthorized-page', view_func=UnauthorizedPageView.as_view('401'))
pages.add_url_rule('/sitemap.xml', view_func=GenerateSitemapView.as_view('sitemap'))
