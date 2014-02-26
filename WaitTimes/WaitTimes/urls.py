from django.conf.urls import patterns, include, url
import WaitLanes

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'WaitTimes.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),
    url(r'^WaitLanes/', include('WaitLanes.urls')),
    url(r'^admin/', include(admin.site.urls)),
)
