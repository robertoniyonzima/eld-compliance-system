from rest_framework import serializers
from .models import HOSViolation

class HOSViolationSerializer(serializers.ModelSerializer):
    class Meta:
        model = HOSViolation
        fields = '__all__'
        read_only_fields = ('driver', 'created_at')