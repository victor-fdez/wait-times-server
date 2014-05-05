import pdb
import os
import json
import geojson
import tempfile
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_protect
from django.core.exceptions import ObjectDoesNotExist
from django.forms.models import model_to_dict
from django.core.servers.basehttp import FileWrapper
from django.core.files import File
from django.http import HttpResponse
from django.http import HttpResponseNotFound
from django_decorators.decorators import json_response
from django.utils.translation import ugettext_lazy
from shapely.wkt import dump, loads
from shapely.geometry import mapping, shape
from shapely.geometry import asShape
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
		#pdb.set_trace()
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

def delete(request, waitLaneStrId):
	waitLaneId = int(waitLaneStrId)	
	try:
		waitLane = instance=WaitLane.objects.get(id=waitLaneId)
		waitLane.delete()
	except ObjectDoesNotExist:
		pass
	return redirect("/WaitLanes/list/")
	

def list(request):
	waitLanes = WaitLane.objects.all()	
	return render(request, 'WaitLaneList.html', dictionary={'WaitLanes': waitLanes})

def get_file(request, waitLaneStrId, which, fileType):
	waitLaneId = str(waitLaneStrId)
	attributeName = which+'File'
	try:
		waitLane = WaitLane.objects.get(id=waitLaneId)
		fileField = getattr(waitLane, attributeName)
		if fileType == "wkt":
			wrapper = None
			response = None
			with open(fileField.path, 'r') as fileObject:
				geoJsonFile = File(fileObject)
				geoJsonObject = geojson.load(geoJsonFile)
				temp = tempfile.TemporaryFile()
				for feature in geoJsonObject['features']:
					s = shape(feature['geometry'])
					wktGeometry = dump(s, temp)
				#send content of temporary file
				wrapper = FileWrapper(temp)
				response = HttpResponse(wrapper, content_type='application/wkt')
				#response['Content-Disposition'] = 'attachment; filename=something.wkt'
				response['Content-Length'] = temp.tell()
				temp.seek(0)
				#pdb.set_trace()
			return response
		else:
			wrapper = FileWrapper(fileField.file)
			response = HttpResponse(wrapper, content_type='application/json')
			response['Content-Length'] = os.path.getsize(fileField.path)
			#pdb.set_trace()
			return response
	except ObjectDoesNotExist:
		#FIXME should send json instead
		return HttpResponseNotFound()
		#return render(request, 'WaitLaneDoesNotExist.html', dictionary={'id': waitLaneId})

@json_response
def get_info_file(request, waitLaneId):
	try:
		waitLane = WaitLane.objects.get(id=waitLaneId)
		return waitLane.toJSON()
	except ObjectDoesNotExist:
		return None


def get_all_geojson_map(request):
	return render(request, 'app/WaitLaneModelView.html')


@json_response
def get_all_list(request):
	waitLanes = []
	for waitLane in WaitLane.objects.all():
		waitLanes.append(waitLane.toJSON())
	return { "waitLanes": waitLanes }


