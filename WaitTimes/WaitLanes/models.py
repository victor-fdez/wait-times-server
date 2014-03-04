from django.db import models
from django_countries.fields import CountryField


# Create your models here.
class WaitLane(models.Model):
	name = models.CharField(max_length=100)
	boundaryFile = models.FileField(upload_to="WaitLanes/boundary/")
	entriesFile = models.FileField(upload_to="WaitLanes/entries/")
	modelFile = models.FileField(upload_to="WaitLanes/model/")	
	exitsFile = models.FileField(upload_to="WaitLanes/exits/")
	destinationCountry = CountryField(default="")
	originCountry = CountryField(default="")

