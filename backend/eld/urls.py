# backend/eld/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'daily-logs', views.DailyLogViewSet, basename='daily-log')
router.register(r'duty-status-changes', views.DutyStatusChangeViewSet, basename='duty-status-change')

urlpatterns = [
    path('', include(router.urls)),
    path('daily-logs/<int:pk>/pdf/', views.DailyLogPDFView.as_view(), name='daily-log-pdf'),
]