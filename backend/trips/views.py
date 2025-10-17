from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Trip, Location
from .serializers import TripSerializer, TripCreateSerializer, LocationSerializer

class TripViewSet(viewsets.ModelViewSet):
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'driver':
            return Trip.objects.filter(driver=user)
        elif user.user_type in ['manager', 'admin']:
            return Trip.objects.filter(driver__company=user.company)
        return Trip.objects.none()
    
    def create(self, request):
        """Create a new trip with route calculation"""
        serializer = TripCreateSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            try:
                # Create or get locations
                current_loc = self.get_or_create_location(data['current_location'])
                pickup_loc = self.get_or_create_location(data['pickup_location'])
                dropoff_loc = self.get_or_create_location(data['dropoff_location'])
                
                # Create trip
                trip = Trip.objects.create(
                    driver=request.user,
                    current_location=current_loc,
                    pickup_location=pickup_loc,
                    dropoff_location=dropoff_loc,
                    current_cycle_used=data['current_cycle_used'],
                    start_time=data.get('start_time', timezone.now())
                )
                
                # Calculate route
                trip.calculate_route()
                
                # Return trip data
                response_serializer = TripSerializer(trip)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                return Response(
                    {'error': f'Trip creation failed: {str(e)}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get_or_create_location(self, location_data):
        """Get or create location from JSON data"""
        address = location_data.get('address', '')
        city = location_data.get('city', '')
        state = location_data.get('state', '')
        zip_code = location_data.get('zip_code', '')
        
        if not all([address, city, state]):
            raise ValueError("Location data incomplete")
        
        location, created = Location.objects.get_or_create(
            address=address,
            city=city,
            state=state,
            zip_code=zip_code,
            defaults={
                'address': address,
                'city': city,
                'state': state,
                'zip_code': zip_code
            }
        )
        
        # Try to get coordinates
        location.get_coordinates()
        
        return location
    
    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        """Get trip summary"""
        trip = self.get_object()
        summary = trip.get_trip_summary()
        return Response(summary)
    
    @action(detail=True, methods=['get'])
    def eld_logs(self, request, pk=None):
        """Get predicted ELD logs for the trip"""
        trip = self.get_object()
        logs = trip.generate_eld_logs()
        return Response(logs or [])
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start the trip"""
        trip = self.get_object()
        if trip.status != 'planned':
            return Response(
                {'error': 'Trip can only be started from planned status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        trip.status = 'in_progress'
        trip.start_time = timezone.now()
        trip.save()
        
        return Response({'message': 'Trip started successfully'})
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete the trip"""
        trip = self.get_object()
        if trip.status != 'in_progress':
            return Response(
                {'error': 'Only trips in progress can be completed'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        trip.status = 'completed'
        trip.save()
        
        return Response({'message': 'Trip completed successfully'})

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]
