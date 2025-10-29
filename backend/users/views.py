# backend/users/views.py
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser, DriverProfile
from .serializers import UserSerializer, UserListSerializer
from django.shortcuts import get_object_or_404
from .email_service import EmailVerificationService

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    """Inscription utilisateur"""
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Si c'est un driver, créer le profil driver
        if user.user_type == 'driver':
            DriverProfile.objects.create(
                user=user,
                home_terminal_address=request.data.get('home_terminal_address', '')
            )
        
        return Response({
            'message': 'User created successfully. Awaiting admin approval.',
            'user_id': user.id
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_user(request):
    """Connexion utilisateur - Version directe"""
    email = request.data.get('email')
    password = request.data.get('password')
    
    try:
        user = CustomUser.objects.get(email=email)
        
        # Vérification directe du mot de passe
        if user.check_password(password):
            # ✅ Check approval status for ALL user types
            if not user.is_approved:
                return Response({
                    'error': 'Account pending admin approval'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # verification of status
            if not user.is_active:
                return Response({
                    'error': 'Account suspended. Please contact administrator.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Générer le token JWT directement
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user, context={'request': request}).data
            })
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except CustomUser.DoesNotExist:
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def test_auth(request):
    """Endpoint de test d'authentification"""
    email = request.data.get('email')
    password = request.data.get('password')
    
    try:
        user = CustomUser.objects.get(email=email)
        auth_user = authenticate(username=user.username, password=password)
        
        return Response({
            'user_found': True,
            'user_email': user.email,
            'user_username': user.username,
            'is_active': user.is_active,
            'is_approved': user.is_approved,
            'auth_success': auth_user is not None,
            'auth_user': auth_user.email if auth_user else None
        })
    except CustomUser.DoesNotExist:
        return Response({
            'user_found': False
        })

    
# AJOUTEZ CES FONCTIONS À VOTRE views.py EXISTANT

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_all_users(request):
    """Get all users (admin and manager only)"""
    # ✅ Allow both admin and manager
    if request.user.user_type not in ['admin', 'manager']:
        return Response(
            {'error': 'Admin or Manager access required'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    users = CustomUser.objects.all().order_by('-date_joined')
    
    # Use serializer with context for profile_photo_url
    serializer = UserListSerializer(users, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def approve_user(request, user_id):
    """Approve user (admin and manager can approve drivers)"""
    # ✅ Allow both admin and manager
    if request.user.user_type not in ['admin', 'manager']:
        return Response(
            {'error': 'Admin or Manager access required'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user = CustomUser.objects.get(id=user_id)
        user.is_approved = True
        user.is_active = True
        user.save()
        
        return Response({
            'message': f'User {user.email} approved successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'status': 'active'
            }
        })
        
    except CustomUser.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_user_status(request, user_id):
    """Activate/Deactivate user (admin and manager can manage drivers)"""
    # ✅ Allow both admin and manager
    if request.user.user_type not in ['admin', 'manager']:
        return Response(
            {'error': 'Admin or Manager access required'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user = CustomUser.objects.get(id=user_id)
        user.is_active = not user.is_active
        user.save()
        
        status_text = 'activated' if user.is_active else 'deactivated'
        return Response({
            'message': f'User {user.email} {status_text} successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'is_active': user.is_active,
                'status': 'active' if user.is_active else 'suspended'
            }
        })
        
    except CustomUser.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_user(request, user_id):
    """Supprimer un utilisateur"""
    if request.user.user_type != 'admin':
        return Response(
            {'error': 'Admin access required'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user = CustomUser.objects.get(id=user_id)
        user_email = user.email
        user.delete()
        
        return Response({
            'message': f'User {user_email} deleted successfully'
        })
        
    except CustomUser.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_current_user(request):
    """Get current authenticated user details"""
    try:
        user = request.user
        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': f'Failed to get user: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_profile_photo(request):
    """Upload profile photo for current user"""
    try:
        user = request.user
        
        if 'profile_photo' not in request.FILES:
            return Response(
                {'error': 'No photo file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        photo = request.FILES['profile_photo']
        
        # Delete old photo if exists
        if user.profile_photo:
            user.profile_photo.delete()
        
        # Save new photo
        user.profile_photo = photo
        user.save()
        
        return Response({
            'message': 'Profile photo uploaded successfully',
            'photo_url': user.profile_photo.url if user.profile_photo else None
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to upload photo: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# ============================================
# EMAIL VERIFICATION ENDPOINTS
# ============================================

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def send_verification_code(request):
    """Send verification code to email during registration"""
    email = request.data.get('email')
    user_name = request.data.get('name', '')
    
    if not email:
        return Response(
            {'error': 'Email is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if email already exists
    if CustomUser.objects.filter(email=email).exists():
        return Response(
            {'error': 'This email is already registered'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Generate and send code
    code = EmailVerificationService.generate_code()
    EmailVerificationService.store_code(email, code, purpose='registration')
    
    success = EmailVerificationService.send_verification_email(email, code, user_name)
    
    if success:
        return Response({
            'message': 'Verification code sent successfully',
            'email': email
        })
    else:
        return Response(
            {'error': 'Failed to send verification email'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_email_code(request):
    """Verify the 6-digit code sent to email"""
    email = request.data.get('email')
    code = request.data.get('code')
    
    if not email or not code:
        return Response(
            {'error': 'Email and code are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    is_valid = EmailVerificationService.verify_code(email, code, purpose='registration')
    
    if is_valid:
        return Response({
            'message': 'Email verified successfully',
            'verified': True
        })
    else:
        return Response(
            {'error': 'Invalid or expired verification code'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user_with_verification(request):
    """Register user after email verification"""
    email = request.data.get('email')
    
    # This endpoint should only be called after email is verified
    # You can add additional verification check here if needed
    
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # If driver, create profile
        if user.user_type == 'driver':
            DriverProfile.objects.create(
                user=user,
                home_terminal_address=request.data.get('home_terminal_address', '')
            )
        
        return Response({
            'message': 'Registration successful! Your account is pending approval.',
            'user_id': user.id,
            'email': user.email
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ============================================
# PASSWORD RESET ENDPOINTS
# ============================================

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def request_password_reset(request):
    """Request password reset - sends code to email"""
    email = request.data.get('email')
    
    if not email:
        return Response(
            {'error': 'Email is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = CustomUser.objects.get(email=email)
        
        # Generate and send reset code
        code = EmailVerificationService.generate_code()
        EmailVerificationService.store_code(email, code, purpose='password_reset')
        
        success = EmailVerificationService.send_password_reset_email(
            email, 
            code, 
            user.get_full_name() or user.username
        )
        
        if success:
            return Response({
                'message': 'Password reset code sent to your email',
                'email': email
            })
        else:
            return Response(
                {'error': 'Failed to send reset email'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except CustomUser.DoesNotExist:
        # Don't reveal if email exists or not for security
        return Response({
            'message': 'If this email exists, a reset code has been sent'
        })

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_reset_code(request):
    """Verify password reset code"""
    email = request.data.get('email')
    code = request.data.get('code')
    
    if not email or not code:
        return Response(
            {'error': 'Email and code are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    is_valid = EmailVerificationService.verify_code(email, code, purpose='password_reset')
    
    if is_valid:
        return Response({
            'message': 'Code verified successfully',
            'verified': True
        })
    else:
        return Response(
            {'error': 'Invalid or expired reset code'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    """Reset password after code verification"""
    email = request.data.get('email')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')
    
    if not email or not new_password or not confirm_password:
        return Response(
            {'error': 'All fields are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if new_password != confirm_password:
        return Response(
            {'error': 'Passwords do not match'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(new_password) < 8:
        return Response(
            {'error': 'Password must be at least 8 characters long'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = CustomUser.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        
        return Response({
            'message': 'Password reset successfully. You can now login with your new password.'
        })
        
    except CustomUser.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )