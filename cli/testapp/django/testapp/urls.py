from django.conf.urls import patterns, include, url
from splunkdj.utility.views import render_template as render

urlpatterns = patterns('',
    url(r'^home/$', 'testapp.views.home', name='home'),
    # TODO: The framework already provides a template_render?template_name=FOO
    #       route that does the same thing. Perhaps it should just be copied
    #       here to be explicit?
    url(r'^(?P<name>.*)/$', 'testapp.views.template', name='template'),
)
