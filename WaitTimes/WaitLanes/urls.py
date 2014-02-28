
from django.conf.urls import patterns, include, url

urlpatterns = patterns('WaitLanes',
    # Examples:
    # url(r'^$', 'WaitTimes.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),
    url(r'^testing/?', 'views.testing'),
    url(r'^new/?', 'views.new'),
    url(r'^edit/(\d+)/', 'views.edit'),
    url(r'^view/(\d+)/', 'views.view'),
)
