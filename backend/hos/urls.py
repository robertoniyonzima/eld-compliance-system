from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'violations', views.HOSViolationViewSet, basename='hos-violation')

urlpatterns = [
    path('compliance/', views.HOSComplianceViewSet.as_view({'get': 'current'}), name='hos-compliance-current'),
    path('compliance/violations/', views.HOSComplianceViewSet.as_view({'get': 'violations'}), name='hos-compliance-violations'),
    path('', include(router.urls)),
]