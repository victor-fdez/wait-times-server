from django import template

register = template.Library()

@register.filter
def getWidgetClass(value):
	return value.field.widget.__class__.__name__

@register.filter
def checkIsClass(value, arg):
	return value.field.widget.__class__.__name__ == arg

@register.filter
def debug(value):
	return dir(value)
