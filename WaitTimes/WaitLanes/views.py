from django.shortcuts import redirect, render

# Create your views here.
def testing(request):
	return redirect('/static/templates/current_location.html')

def new(request):
	return redirect('/static/templates/current_location.html')
