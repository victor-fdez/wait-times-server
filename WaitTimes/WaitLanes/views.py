import pdb
import os
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_protect
from django.core.exceptions import ObjectDoesNotExist
from django.forms.models import model_to_dict
from django.core.servers.basehttp import FileWrapper
from django.http import HttpResponse
from django.http import HttpResponseNotFound
from WaitLanes.forms import WaitLaneForm
from WaitLanes.models import WaitLane

def testing(request):
	return redirect('/static/templates/current_location.html')

@csrf_protect
def new(request):
	contextVariables = {'submitName':'Create', 'submitAction':"/WaitLanes/new/", 'formType': 'new'}
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
	contextVariables = {'submitName':'save', 'submitAction':"/WaitLanes/edit/"+waitLaneStrId+"/", 'formType': 'edit'}
	try:
		waitLane = instance=WaitLane.objects.get(id=waitLaneId)
		contextVariables['WaitLane'] = waitLane
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
	waitLanes = WaitLane.objects.all()	
	return render(request, 'WaitLaneList.html', dictionary={'WaitLanes': waitLanes})

def get_file(request, waitLaneStrId, which):
	waitLaneId = str(waitLaneStrId)
	attributeName = which+'File'
	try:
		waitLane = WaitLane.objects.get(id=waitLaneId)
		fileField = getattr(waitLane, attributeName)
		wrapper = FileWrapper(fileField.file)
		response = HttpResponse(wrapper, content_type='application/json')
		response['Content-Length'] = os.path.getsize(fileField.path)
		#pdb.set_trace()
		return response
	except ObjectDoesNotExist:
		#FIXME should send json instead
		return HttpResponseNotFound()
		#return render(request, 'WaitLaneDoesNotExist.html', dictionary={'id': waitLaneId})

