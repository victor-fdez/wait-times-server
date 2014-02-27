import string
import pdb
from django import template

register = template.Library()

@register.filter
def userReadableLabel(value):
	label = value.label
	pos = [i for i,e in enumerate(label+'A') if e.isupper()]	
	words = [label[pos[i]:pos[i+1]] for i in xrange(len(pos)-1)]
	label = ' '.join(words)
	value.label = label
	return ''

@register.filter
def addClass(value, arg):
	#pdb.set_trace()
	attrs = value.field.widget.attrs
	if 'class' in attrs.keys():
		attrs['class'] += ' '+arg	
	else:
		attrs['class'] = arg
	return ''


