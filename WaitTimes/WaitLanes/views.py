from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_protect
from django.core.exceptions import ObjectDoesNotExist
from django.forms.models import model_to_dict
from WaitLanes.forms import WaitLaneForm
from WaitLanes.models import WaitLane
import pdb

# Create your views here.
def testing(request):
	return redirect('/static/templates/current_location.html')

@csrf_protect
def new(request):
	contextVariables = {'submitName':'Create', 'submitAction':"/WaitLanes/new/"}
	if request.method == 'GET':
		f = WaitLaneForm()	
		contextVariables['WaitLaneForm'] = f
	elif request.method == 'POST':
		f = WaitLaneForm(request.POST, request.FILES)
		contextVariables['WaitLaneForm'] = f
		if f.is_valid():
			waitLane = f.save()
			return redirect("/WaitLanes/edit/"+str(waitLane.id)+"/")
	return render(request, 'WaitLaneForm.html', dictionary=contextVariables)

def view(request, waitLaneStrId):
	waitLaneId = int(waitLaneStrId)	
	try:
		waitLane = model_to_dict(WaitLane.objects.get(id=waitLaneId))
		return render(request, 'WaitLaneView.html', dictionary={'WaitLane': waitLane})
	except ObjectDoesNotExist:
		return render(request, 'WaitLaneDoesNotExist.html', dictionary={'id': waitLaneId})


def edit(request, waitLaneStrId):
	#pdb.set_trace()		
	waitLaneId = int(waitLaneStrId)	
	contextVariables = {'submitName':'save', 'submitAction':"/WaitLanes/edit/"+waitLaneStrId+"/"}
	try:
		waitLane = instance=WaitLane.objects.get(id=waitLaneId)
		if request.method == 'GET':
			f = WaitLaneForm(instance=waitLane)
			contextVariables['WaitLaneForm'] = f
			return render(request, 'WaitLaneForm.html', dictionary=contextVariables)
		elif request.method == 'POST':
			f = WaitLaneForm(request.POST, request.FILES, instance=waitLane)
			contextVariables['WaitLaneForm'] = f
			if f.is_valid():
				waitLane = f.save()
				return redirect("/WaitLanes/edit/"+str(waitLane.id)+"/")
			return render(request, 'WaitLaneForm.html', dictionary=contextVariables)
	except ObjectDoesNotExist:
		return render(request, 'WaitLaneDoesNotExist.html', dictionary={'id': waitLaneId})

def list(request):
	return redirect('/static/templates/current_location.html')
