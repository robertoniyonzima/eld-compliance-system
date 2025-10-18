from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'trips', views.TripViewSet, basename='trip')
router.register(r'locations', views.LocationViewSet, basename='location')

urlpatterns = [
    path('', include(router.urls)),
    path('trips/<int:pk>/pdf/', views.TripPDFView.as_view(), name='trip-pdf'),
]