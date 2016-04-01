from flask import Blueprint, request, redirect, render_template, url_for, flash, g, session, jsonify
from flask.ext.mongoengine.wtf import model_form
from flask.views import MethodView, View
from mongoengine.errors import NotUniqueError, DoesNotExist
from flask.ext.login import login_user, logout_user, current_user, login_required
from flask_wtf import Form
from werkzeug import secure_filename
from werkzeug.security import check_password_hash
from datetime import datetime

from myapp import app, login_manager
from utils import flash_errors
from accounts.models import User
from accounts.forms import ForgotPasswordForm, ChangePasswordForm, LoginForm

import mandrill

@app.before_request
def before_request():
    g.user = current_user

class RenderTemplateView(View):
    def __init__(self, template_name):
        self.template_name = template_name
    def dispatch_request(self):
        return render_template(self.template_name)

class ListView(MethodView):

    def get(self):
        accounts = User.objects.all()
        return render_template('accounts/list.html', accounts=accounts)

class AccountProfileView(MethodView):

    @login_required
    def get(self):
        # TODO

    @login_required
    def post(self):
        # TODO

class ChangePasswordView(MethodView):

    @login_required
    def post(self):
        # TODO

class RegisterView(MethodView):

    user_form = model_form(User, exclude=['created_at', 'last_updated', 'is_active'])

    def get_context(self):
        context = {
            "form": self.user_form(request.form)
        }
        return context

    def get(self, token):
        context = self.get_context()
        form = context.get('form')
        return render_template('accounts/register.html', register_user_form=form)

    def post(self, token):
        context = self.get_context()
        form = context.get('form')

        if form.validate():
            try:
                user = User()
                form.populate_obj(user)
                user.set_password(form.password.data)            
                user.active = True
                user.save()

                flash('User is created.')
                return redirect(url_for('pages.home'))
            
            except NotUniqueError:
                flash('User aready exists')

        else:
            flash_errors(form)

        return render_template('accounts/register.html', register_user_form=form)

class RegisterErrorView(MethodView):

    def get(self):
        return render_template('accounts/register-error.html')

class LoginView(MethodView):

    def get_context(self):
        form = LoginForm(request.form)
        context = {"login_user_form": form}
        return context

    def get(self):
        if g.user is not None and g.user.is_authenticated:
            return redirect(url_for('pages.home'))
        context = self.get_context()
        form = context.get('login_user_form')
        return render_template('home.html', login_user_form=form)

    def post(self):
        context = self.get_context()
        form = context.get('login_user_form')

        if form.validate():
            try:
                user = User.objects.get(email=form.email.data)
            except DoesNotExist:
                user = User(email=form.email.data)

            if 'X-Forwarded-For' in request.headers:
                remote_addr = request.headers.getlist("X-Forwarded-For")[0].rpartition(' ')[-1]
            else:
                remote_addr = request.remote_addr or 'untrackable'

            old_current_login, new_current_login = user.current_login_at, datetime.utcnow()
            old_current_ip, new_current_ip = user.current_login_ip, remote_addr

            user.last_login_at = old_current_login or new_current_login
            user.current_login_at = new_current_login
            user.last_login_ip = old_current_ip or new_current_ip
            user.current_login_ip = new_current_ip
            user.login_count = user.login_count + 1 if user.login_count else 1

            user.save()
            login_user(user)
            flash("Logged in user")
            return redirect(url_for('pages.home'))
            
        else:
            flash_errors(form)

        return render_template('home.html', **context)

class LoginErrorView(MethodView):

    def get(self):
        return render_template('accounts/login-error.html')

class LogoutView(MethodView):

    @login_required
    def get(self):
        logout_user()
        return redirect(url_for('pages.home'))

class ForgotPasswordView(MethodView):

    def get_context(self):
        form = ForgotPasswordForm()
        context = {"form": form}
        return context

    def get(self):
        if g.user is not None and g.user.is_authenticated():
            return redirect(url_for('accounts.home'))
        context = self.get_context()
        form = context.get('form')
        return render_template('accounts/forgot-password.html', form=form)

    def post(self):
        context = self.get_context()
        form = context.get('form')

        if form.validate():
            try:
                user = User.objects.get(email=form.email.data)
                flash('User exists')
            except DoesNotExist:
                flash('User does not exist')

        else:
            flash_errors(form)

        return render_template('home.html', **context)

class AccountSettingsView(MethodView):

    def get_context(self):
        context = {}
        return context

    @login_required
    def get(self):
        context = self.get_context()
        return render_template('accounts/settings.html', **context)
