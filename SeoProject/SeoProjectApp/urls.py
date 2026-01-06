from django.contrib import admin
from django.urls import path

from SeoProjectApp.views import analyser_liste, analyzer




urlpatterns = [

    path ('api/analyser/', analyzer, name='analyzer'),
    path ('api/analyser_liste/', analyser_liste, name='analyser_liste'),
]