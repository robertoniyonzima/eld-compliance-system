# backend/core/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework_simplejwt.views import TokenRefreshView

schema_view = get_schema_view(
    openapi.Info(
        title="ELD Compliance System API",
        default_version='v1',
        description="API for Electronic Logging Device Compliance System",
        contact=openapi.Contact(email="support@eldsystem.com"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # ⭐️ CORRECTION : Inclure TOUTES les URLs de l'app users
    path('api/auth/', include('users.urls')),
    
    # URLs des autres applications
    path('api/trips/', include('trips.urls')),
    path('api/eld/', include('eld.urls')),
    path('api/hos/', include('hos.urls')),
    
    # JWT endpoints
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Swagger documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)