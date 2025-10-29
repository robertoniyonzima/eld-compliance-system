from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('me/', views.get_current_user, name='get-current-user'),
    
    # User Management
    path('users/', views.get_all_users, name='get-all-users'),
    path('users/<int:user_id>/approve/', views.approve_user, name='approve-user'),
    path('users/<int:user_id>/toggle-status/', views.toggle_user_status, name='toggle-user-status'),
    path('users/<int:user_id>/delete/', views.delete_user, name='delete-user'),
    path('upload-photo/', views.upload_profile_photo, name='upload-profile-photo'),
    
    # Email Verification
    path('send-verification-code/', views.send_verification_code, name='send-verification-code'),
    path('verify-email-code/', views.verify_email_code, name='verify-email-code'),
    path('register-verified/', views.register_user_with_verification, name='register-verified'),
    
    # Password Reset
    path('request-password-reset/', views.request_password_reset, name='request-password-reset'),
    path('verify-reset-code/', views.verify_reset_code, name='verify-reset-code'),
    path('reset-password/', views.reset_password, name='reset-password'),
]