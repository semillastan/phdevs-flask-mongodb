import os
import sys
import site

sys.path.insert(0, '<path_to_app>')

site.addsitedir('<path_to_virtualenv>/lib/python2.7/site-packages')

sys.path.append('<path_to_app>')

activate_this = '<path_to_virtualenv>/bin/activate_this.py'
execfile(activate_this, dict(__file__=activate_this))

from myapp import app as application
