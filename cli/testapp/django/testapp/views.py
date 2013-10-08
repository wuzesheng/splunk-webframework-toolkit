from django.contrib.auth.decorators import login_required
from splunkdj.decorators.render import render_to

@render_to('testapp:home.html')
@login_required
def home(request):
    return {
        # Insert custom variables for the view here
    }

@render_to()
@login_required
def template(request, name):
    """Renders the template with the specified name."""
    return {
        "TEMPLATE": "testapp:%s.html" % name
    }

# Insert additional view functions here