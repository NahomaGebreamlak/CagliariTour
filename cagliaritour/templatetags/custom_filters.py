# myapp/templatetags/custom_filters.py
from django import template

register = template.Library()

@register.filter
def zip(value, arg):
    """
    A custom filter to zip two lists together.
    Usage: {{ list1|zip:list2 }}
    """
    return zip(value, arg)
