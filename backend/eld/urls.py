# backend/eld/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'daily-logs', views.DailyLogViewSet, basename='daily-log')
router.register(r'duty-status-changes', views.DutyStatusChangeViewSet, basename='duty-status-change')

urlpatterns = [
    path('', include(router.urls)),
]