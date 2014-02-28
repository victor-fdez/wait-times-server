import string
import pdb
from django import template

register = template.Library()

def makeStrUserReadable(string):
	pos = [i for i,e in enumerate(string+'A') if e.isupper()]	
	words = [string[pos[i]:pos[i+1]] for i in xrange(len(pos)-1)]
	return ' '.join(words)



@register.filter
def userReadableLabel(value):
	label = value.label
	value.label = makeStrUserReadable(label)
	return ''

@register.filter
def returnUserReadableLabel(value):
	label = string.upper(value[0]) + value[1:]
	return makeStrUserReadable(label)

@register.filter
def addClass(value, arg):
	#pdb.set_trace()
	attrs = value.field.widget.attrs
	if 'class' in attrs.keys():
		attrs['class'] += ' '+arg	
	else:
		attrs['class'] = arg
	return ''


