# backend/eld/serializers.py
from rest_framework import serializers
from .models import DailyLog, DutyStatusChange, LogCertification

class DutyStatusChangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DutyStatusChange
        fields = '__all__'

class DailyLogSerializer(serializers.ModelSerializer):
    status_changes = DutyStatusChangeSerializer(many=True, read_only=True)
    driver_name = serializers.CharField(source='driver.get_full_name', read_only=True)
    carrier_name = serializers.CharField(source='carrier.name', read_only=True)
    
    class Meta:
        model = DailyLog
        fields = '__all__'
        read_only_fields = ('is_certified', 'certified_at', 'created_at', 'updated_at')

class LogCertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogCertification
        fields = '__all__'