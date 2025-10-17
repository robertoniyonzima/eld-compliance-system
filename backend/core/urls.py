# backend/core/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework_simplejwt.views import TokenRefreshView

# Import des views depuis les applications
from users import views as user_views

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
    
    # URLs d'authentification directes
    path('api/auth/register/', user_views.register_user, name='register'),
    path('api/auth/login/', user_views.login_user, name='login'),
    
    # URLs des applications (nous les ajouterons plus tard)
    path('api/trips/', include('trips.urls')),
    path('api/eld/', include('eld.urls')),
    path('api/hos/', include('hos.urls')),
    
    # JWT endpoints
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Swagger documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]