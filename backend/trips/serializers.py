from rest_framework import serializers
from .models import Trip, Location

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'

class TripSerializer(serializers.ModelSerializer):
    current_location_details = LocationSerializer(source='current_location', read_only=True)
    pickup_location_details = LocationSerializer(source='pickup_location', read_only=True)
    dropoff_location_details = LocationSerializer(source='dropoff_location', read_only=True)
    driver_name = serializers.CharField(source='driver.get_full_name', read_only=True)
    estimated_duration_seconds = serializers.SerializerMethodField()
    
    class Meta:
        model = Trip
        fields = '__all__'
        read_only_fields = ('estimated_duration', 'total_distance', 'route_data', 
                          'waypoints', 'requires_breaks', 'hos_violations_predicted',
                          'created_at', 'updated_at')
    
    def get_estimated_duration_seconds(self, obj):
        """Return estimated_duration in seconds for frontend"""
        if obj.estimated_duration:
            return obj.estimated_duration.total_seconds()
        return 0

class TripCreateSerializer(serializers.Serializer):
    current_location = serializers.JSONField()
    pickup_location = serializers.JSONField()
    dropoff_location = serializers.JSONField()
    current_cycle_used = serializers.DecimalField(max_digits=5, decimal_places=2, min_value=0, max_value=70)
    start_time = serializers.DateTimeField(required=False)
    
    def create(self, validated_data):
        # This will be handled in the view
        return validated_data