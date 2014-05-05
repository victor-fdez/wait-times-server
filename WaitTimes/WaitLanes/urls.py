
from django.conf.urls import patterns, include, url

urlpatterns = patterns('WaitLanes',
    # Examples:
    # url(r'^$', 'WaitTimes.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),
    url(r'^testing/?', 'views.testing'),
    url(r'^new/?', 'views.new'),
    url(r'^edit/(\d+)/', 'views.edit'),
    url(r'^delete/(\d+)/', 'views.delete'),
    url(r'^view/(\d+)/', 'views.view'),
    url(r'^app/geojson', 'views.get_all_geojson_map'),
    url(r'^list/', 'views.list'),
    url(r'^file/(\d+)/info.json', 'views.get_info_file'),
    url(r'^file/(\d+)/(model)\.(json|wkt)', 'views.get_file'),
    url(r'^file/(\d+)/(exits)\.(json|wkt)', 'views.get_file'),
    url(r'^file/(\d+)/(entries)\.(json|wkt)', 'views.get_file'),
    url(r'^file/(\d+)/(boundary)\.(json|wkt)', 'views.get_file'),
    #url(r'^file/(\d+)/general_info\.json', 'views.get_general_info'),
    url(r'^file/all/list\.json', 'views.get_all_list'),
)
