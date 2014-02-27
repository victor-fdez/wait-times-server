from WaitLanes.models import WaitLane
from django.forms import ModelForm

class WaitLaneForm(ModelForm):
	class Meta:
		model = WaitLane
		#fields = [field for field in dir(WaitLane) if not callable(field) and not field.startswith("__")]
		fields = ['name', 'boundaryFile', 'startBoundaryFile', 'modelFile']

