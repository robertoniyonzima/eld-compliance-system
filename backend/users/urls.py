from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('users/', views.get_all_users, name='get-all-users'),
    path('users/<int:user_id>/approve/', views.approve_user, name='approve-user'),
    path('users/<int:user_id>/toggle-status/', views.toggle_user_status, name='toggle-user-status'),
    path('users/<int:user_id>/delete/', views.delete_user, name='delete-user'),
]