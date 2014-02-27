from django.db import models


# Create your models here.
class WaitLane(models.Model):
	name = models.CharField(max_length=100)
	boundaryFile = models.FileField(upload_to="WaitLanes/boundary/")
	startBoundaryFile = models.FileField(upload_to="WaitLanes/startBoundary/")
	modelFile = models.FileField(upload_to="WaitLanes/model/")	

