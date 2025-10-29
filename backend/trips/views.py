from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from rest_framework.views import APIView
from .models import Trip, Location
from .serializers import TripSerializer, TripCreateSerializer, LocationSerializer
from .pdf_generator import TripPDFGenerator 
from django.http import HttpResponse

class TripViewSet(viewsets.ModelViewSet):
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'driver':
            # Driver voit ses trips, triés par date (plus récent en premier)
            return Trip.objects.filter(driver=user).order_by('-created_at', '-id')
        elif user.user_type == 'admin':
            # Admin voit tous les trips, triés par date (plus récent en premier)
            return Trip.objects.all().order_by('-created_at', '-id')
        elif user.user_type == 'manager':
            # ✅ Manager voit TOUS les trips (comme admin)
            # Si vous avez plusieurs compagnies, décommentez la ligne suivante:
            # return Trip.objects.filter(driver__company=user.company).order_by('-created_at', '-id')
            return Trip.objects.all().order_by('-created_at', '-id')
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

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        """Generate trip PDF - Action dans ViewSet"""
        try:
            trip = self.get_object()
            
            pdf_generator = TripPDFGenerator()
            pdf_buffer = pdf_generator.generate_trip_pdf(trip)
            
            # ✅ Utiliser .getvalue() ou .read()
            response = HttpResponse(
                pdf_buffer.getvalue() if hasattr(pdf_buffer, 'getvalue') else pdf_buffer.read(),
                content_type='application/pdf'
            )
            filename = f"trip_{trip.id}_report.pdf"
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            
            return response
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return HttpResponse(
                f"Error generating PDF: {str(e)}",
                status=500,
                content_type='text/plain'
            )


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]

class TripPDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        """Generate working trip PDF"""
        try:
            # ✅ Vérifier les permissions selon user_type
            user = request.user
            if user.user_type == 'driver':
                trip = Trip.objects.get(pk=pk, driver=user)
            elif user.user_type in ['manager', 'admin']:
                trip = Trip.objects.get(pk=pk, driver__company=user.company)
            else:
                return HttpResponse(
                    "Unauthorized",
                    status=403,
                    content_type='text/plain'
                )
            
            pdf_generator = TripPDFGenerator()
            pdf_buffer = pdf_generator.generate_trip_pdf(trip)
            
            # ✅ Utiliser .getvalue() ou .read()
            response = HttpResponse(
                pdf_buffer.getvalue() if hasattr(pdf_buffer, 'getvalue') else pdf_buffer.read(),
                content_type='application/pdf'
            )
            filename = f"trip_{trip.id}_report.pdf"
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            
            return response
            
        except Trip.DoesNotExist:
            return HttpResponse(
                "Trip not found",
                status=404,
                content_type='text/plain'
            )
        except Exception as e:
            import traceback
            traceback.print_exc()
            return HttpResponse(
                f"Error generating PDF: {str(e)}",
                status=500,
                content_type='text/plain'
            )