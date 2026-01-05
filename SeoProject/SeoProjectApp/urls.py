from django.contrib import admin
from django.urls import path

from SeoProjectApp.views import analyzer




urlpatterns = [

    path ('api/analyser/', analyzer, name='analyzer'),
]