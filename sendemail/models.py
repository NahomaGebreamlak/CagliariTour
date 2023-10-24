from django.db import models


class Trip(models.Model):
    number = models.CharField(max_length=50)
    start = models.CharField(max_length=100)
    end = models.CharField(max_length=100)
    hours = models.DecimalField(max_digits=5, decimal_places=2)
    link = models.URLField()

    def __str__(self):
        return self.number


class Emails(models.Model):
    subject = models.CharField(max_length=500)
    message = models.TextField(max_length=500)
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    edited_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.id
