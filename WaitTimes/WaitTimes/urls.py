from django.conf.urls import patterns, include, url
from django.conf import settings
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

if settings.DEBUG:
	urlpatterns += patterns('',
			url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {
				'document_root': settings.MEDIA_ROOT,
				}),
			url(r'^static/(?P<path>.*)$', 'django.views.static.serve', {
				'document_root': settings.STATIC_ROOT,
				}),
			)
