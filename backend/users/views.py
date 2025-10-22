# backend/users/views.py
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser, DriverProfile
from .serializers import UserSerializer
from django.shortcuts import get_object_or_404

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
            if not user.is_approved and user.user_type == 'driver':
                return Response({
                    'error': 'Account pending admin approval'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Générer le token JWT directement
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
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
    """Récupérer tous les utilisateurs (admin seulement)"""
    # Vérifier que l'utilisateur est admin
    if request.user.user_type != 'admin':
        return Response(
            {'error': 'Admin access required'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    users = CustomUser.objects.all().order_by('-date_joined')
    
    # Serializer manuel pour rapidité
    user_data = []
    for user in users:
        user_data.append({
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'user_type': user.user_type,
            'company_name': user.company.name if user.company else None,
            'is_approved': user.is_approved,
            'is_active': user.is_active,
            'date_joined': user.date_joined,
            'last_login': user.last_login,
            'phone_number': user.phone_number,
            'license_number': user.license_number,
            'license_state': user.license_state,
            'status': 'pending' if not user.is_approved and user.user_type == 'driver' else 
                     'suspended' if not user.is_active else 'active'
        })
    
    return Response(user_data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def approve_user(request, user_id):
    """Approuver un utilisateur (admin seulement)"""
    if request.user.user_type != 'admin':
        return Response(
            {'error': 'Admin access required'}, 
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
    """Activer/désactiver un utilisateur"""
    if request.user.user_type != 'admin':
        return Response(
            {'error': 'Admin access required'}, 
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