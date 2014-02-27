from django.shortcuts import redirect, render
from WaitLanes.forms import WaitLaneForm

# Create your views here.
def testing(request):
	return redirect('/static/templates/current_location.html')

def new(request):
	if request.method == 'GET':
		f = WaitLaneForm()	
		return render(request, '__WaitLaneForm__.html', dictionary={'WaitLaneForm': f})
	elif request.method == 'POST':
		return redirect('/static/templates/current_location.html')
