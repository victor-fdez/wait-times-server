from django.db import models
from django_countries.fields import CountryField
from django.conf import settings
from django.utils.translation import ugettext_lazy


# Create your models here.
class WaitLane(models.Model):
	name = models.CharField(max_length=100)
	boundaryFile = models.FileField(upload_to="WaitLanes/boundary/")
	entriesFile = models.FileField(upload_to="WaitLanes/entries/")
	modelFile = models.FileField(upload_to="WaitLanes/model/")	
	exitsFile = models.FileField(upload_to="WaitLanes/exits/")
	lastUpdated = models.DateTimeField(auto_now=True, auto_now_add=True)
	destinationCountry = CountryField(default="", countries_flag_url=settings.STATIC_URL+'flags/gif/{code}.gif')
	originCountry = CountryField(default="", countries_flag_url=settings.STATIC_URL+'flags/gif/{code}.gif')
	#get a dictionary representation of the wait lane
	def toJSON(self):
		prefix = '/WaitLanes/file/'
		return{	'id': self.id,
			'name': self.name,
			'files': {
				'model': prefix+str(self.id)+'/model.json',
				'boundary': prefix+str(self.id)+'/boundary.json',
				'entries': prefix+str(self.id)+'/entries.json',
				'exits': prefix+str(self.id)+'/exits.json'
			},
			'origin': {
				'country': { 
					'code': self.originCountry.code,
					'name': unicode(ugettext_lazy(self.originCountry.name)),
					'flag': self.originCountry.flag
				}
			},
			'destination': {
				'country': {
					'code': self.destinationCountry.code,
					'name': unicode(ugettext_lazy(self.destinationCountry.name)),
					'flag': self.destinationCountry.flag
				}
			},
			'last_updated': self.lastUpdated
		}
	

