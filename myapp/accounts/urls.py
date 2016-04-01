from flask import Blueprint
from accounts.views import *

accounts = Blueprint('accounts', __name__, template_folder='templates')

accounts.add_url_rule('/register', view_func=RegisterView.as_view('register'))
accounts.add_url_rule('/login', view_func=LoginView.as_view('login'))
accounts.add_url_rule('/login/error', view_func=LoginErrorView.as_view('login-error'))
accounts.add_url_rule('/logout', view_func=LogoutView.as_view('logout'))
accounts.add_url_rule('/forgot-password', view_func=ForgotPasswordView.as_view('forgot_password'))

accounts.add_url_rule('/settings', view_func=AccountSettingsView.as_view('settings'))
accounts.add_url_rule('/profile', view_func=AccountProfileView.as_view('profile'))
accounts.add_url_rule('/profile/edit', view_func=AccountProfileView.as_view('edit-profile'))
accounts.add_url_rule('/profile/change-password', view_func=ChangePasswordView.as_view('change-password'))
