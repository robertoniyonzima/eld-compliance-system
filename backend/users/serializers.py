# backend/users/serializers.py
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, DriverProfile, Company

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'username', 'password', 'password_confirm', 
                 'user_type', 'company', 'phone_number', 'first_name', 
                 'last_name', 'license_number', 'license_state')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords don't match"})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = CustomUser.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des utilisateurs (moins de données sensibles)"""
    company_name = serializers.CharField(source='company.name', read_only=True)
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = (
            'id', 'email', 'first_name', 'last_name', 'user_type', 
            'company_name', 'is_approved', 'is_active', 'date_joined',
            'last_login', 'phone_number', 'license_number', 'license_state', 'status'
        )
    
    def get_status(self, obj):
        if not obj.is_approved and obj.user_type == 'driver':
            return 'pending'
        elif not obj.is_active:
            return 'suspended'
        else:
            return 'active'