from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.http import HttpResponse
from datetime import datetime, timedelta
from math import radians, sin, cos, sqrt, atan2

# Import des modèles
from .models import DailyLog, DutyStatusChange, LogCertification
from .serializers import DailyLogSerializer, DutyStatusChangeSerializer
from .pdf_generator import FMCSAPDFGenerator, TripPDFGenerator

# Import Trip depuis l'app trips
from trips.models import Trip

# ✅ Helper function to get local time (not UTC)
def get_local_now():
    """Get current local time without timezone conversion"""
    return datetime.now()

def get_local_today():
    """Get today's date in local timezone"""
    return datetime.now().date()

class DailyLogPDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        """Generate EXACT FMCSA PDF - UPDATED (Manager can view all logs)"""
        try:
            # Manager can view all logs, driver can only view their own
            if request.user.user_type == 'manager' or request.user.user_type == 'admin':
                daily_log = DailyLog.objects.get(pk=pk)
            else:
                daily_log = DailyLog.objects.get(pk=pk, driver=request.user)
            
            # ✅ Use PDF generator (no timezone conversion needed)
            pdf_generator = FMCSAPDFGenerator()
            pdf_buffer = pdf_generator.generate_daily_log_pdf(daily_log)
            
            response = HttpResponse(pdf_buffer, content_type='application/pdf')
            filename = f"fmcsa_log_{daily_log.date}.pdf"
            response['Content-Disposition'] = f'inline; filename="{filename}"'
            return response
            
        except DailyLog.DoesNotExist:
            return Response({"error": "Daily log not found"}, status=status.HTTP_404_NOT_FOUND)

class TripPDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        """Generate working trip PDF"""
        try:
            trip = Trip.objects.get(pk=pk, driver=request.user)
            
            pdf_generator = TripPDFGenerator()
            pdf_buffer = pdf_generator.generate_trip_pdf(trip)
            
            response = HttpResponse(pdf_buffer, content_type='application/pdf')
            filename = f"trip_{trip.id}.pdf"
            response['Content-Disposition'] = f'inline; filename="{filename}"'
            return response
            
        except Trip.DoesNotExist:
            return Response({"error": "Trip not found"}, status=status.HTTP_404_NOT_FOUND)

# Gardez vos vues existantes pour DailyLogViewSet et DutyStatusChangeViewSet
class DailyLogViewSet(viewsets.ModelViewSet):
    serializer_class = DailyLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'driver':
            return DailyLog.objects.filter(driver=user)
        elif user.user_type == 'admin':
            # ✅ Admin sees ALL daily logs from ALL drivers
            return DailyLog.objects.all()
        elif user.user_type == 'manager':
            # Manager sees only logs from drivers in their company
            return DailyLog.objects.filter(driver__company=user.company)
        return DailyLog.objects.none()
    
    def perform_create(self, serializer):
        # ✅ Check if daily log already exists for this driver and date
        log_date = serializer.validated_data.get('date')
        existing_log = DailyLog.objects.filter(
            driver=self.request.user,
            date=log_date
        ).first()
        
        if existing_log:
            # ✅ BETTER UX: Return existing log info instead of error
            # This allows frontend to continue with existing log
            raise serializers.ValidationError({
                'error': 'Daily log already exists for this date. Use the existing log.',
                'daily_log_id': existing_log.id,
                'existing_log': True,
                'message': f'You already have a daily log for {log_date}. Continue with that log.'
            })
        
        # Get company info with fallbacks
        company = self.request.user.company
        
        # If no company, create a default one or use a fallback
        if not company:
            # Try to get or create a default company
            from users.models import Company
            company, created = Company.objects.get_or_create(
                name='Independent Driver',
                defaults={
                    'main_office_address': 'Not Specified',
                    'dot_number': '0000000'
                }
            )
            # Assign company to user
            self.request.user.company = company
            self.request.user.save()
        
        main_office = getattr(company, 'main_office_address', 'Not Specified')
        
        # Get driver profile info with fallback
        try:
            home_terminal = self.request.user.driverprofile.home_terminal_address if hasattr(self.request.user, 'driverprofile') else 'Not Specified'
        except:
            home_terminal = 'Not Specified'
        
        serializer.save(
            driver=self.request.user,
            carrier=company,
            main_office_address=main_office,
            home_terminal_address=home_terminal
        )
    
    @action(detail=True, methods=['post'])
    def certify(self, request, pk=None):
        """Certifier un journal"""
        daily_log = self.get_object()
        
        if daily_log.driver != request.user:
            return Response(
                {"error": "Not authorized to certify this log"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        certification = LogCertification.objects.create(
            daily_log=daily_log,
            driver_signature=request.data.get('signature', ''),
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        daily_log.is_certified = True
        daily_log.certified_at = get_local_now()
        daily_log.save()
        
        return Response({"message": "Log certified successfully"})
    
    @action(detail=True, methods=['post'])
    def finalize(self, request, pk=None):
        """✅ Finalize daily log - lock it and save end location/miles"""
        daily_log = self.get_object()
        
        # Only driver can finalize their own log
        if daily_log.driver != request.user:
            return Response(
                {"error": "Not authorized to finalize this log"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if daily_log.is_finalized:
            return Response(
                {"error": "Log is already finalized"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update fields
        daily_log.from_location = request.data.get('from_location')
        daily_log.to_location = request.data.get('to_location')
        daily_log.total_miles_driving_today = request.data.get('total_miles_driving_today', 0)
        daily_log.is_finalized = True
        daily_log.finalized_at = get_local_now()
        
        # Close any open status changes
        open_statuses = DutyStatusChange.objects.filter(
            daily_log=daily_log,
            end_time__isnull=True
        )
        for status in open_statuses:
            status.end_time = get_local_now()
            status.save()
        
        daily_log.save()
        
        return Response({
            "message": "Daily log finalized successfully",
            "log": DailyLogSerializer(daily_log).data
        })
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Récupérer ou créer le journal d'aujourd'hui"""
        today = get_local_today()
        
        try:
            daily_log = DailyLog.objects.get(driver=request.user, date=today)
        except DailyLog.DoesNotExist:
            # Get company info with fallbacks
            company = request.user.company
            main_office = getattr(company, 'main_office_address', '') if company else 'Not Specified'
            
            # Get driver profile info with fallback
            try:
                home_terminal = request.user.driverprofile.home_terminal_address if hasattr(request.user, 'driverprofile') else 'Not Specified'
            except:
                home_terminal = 'Not Specified'
            
            daily_log = DailyLog.objects.create(
                driver=request.user,
                date=today,
                carrier=company,
                main_office_address=main_office,
                home_terminal_address=home_terminal,
                total_miles_driving_today=0,
                total_mileage_today=0,
                vehicle_number="NOT-ASSIGNED",
                trailer_number="",
                shipping_documents="",
                remarks=""
            )
        
        serializer = self.get_serializer(daily_log)
        return Response(serializer.data)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    @action(detail=False, methods=['get'])
    def driver_stats(self, request):
        """Get driver statistics for dashboard"""
        try:
            driver = request.user
            today = get_local_today()
            
            # Get current cycle (last 7 days)
            seven_days_ago = today - timedelta(days=7)
            logs_last_7_days = DailyLog.objects.filter(
                driver=driver,
                date__gte=seven_days_ago,
                date__lte=today
            )
            
            # Calculate total hours used in cycle
            total_hours_used = 0
            total_miles = 0
            
            for log in logs_last_7_days:
                status_changes = log.status_changes.all()
                for change in status_changes:
                    if change.status in ['driving', 'on_duty'] and change.end_time:
                        duration = (change.end_time - change.start_time).total_seconds() / 3600
                        total_hours_used += duration
                
                if log.total_miles_driving_today:
                    total_miles += log.total_miles_driving_today
            
            # Get today's log
            today_log = DailyLog.objects.filter(driver=driver, date=today).first()
            today_hours = 0
            if today_log:
                status_changes = today_log.status_changes.all()
                for change in status_changes:
                    if change.status in ['driving', 'on_duty'] and change.end_time:
                        duration = (change.end_time - change.start_time).total_seconds() / 3600
                        today_hours += duration
            
            # Get active trips count
            from trips.models import Trip
            active_trips = Trip.objects.filter(
                driver=driver,
                status__in=['planned', 'in_progress']
            ).count()
            
            # Calculate compliance percentage
            violations_count = 0
            total_logs = DailyLog.objects.filter(driver=driver).count()
            compliance_percentage = 100 if total_logs > 0 else 0
            
            return Response({
                "hours_used": round(total_hours_used, 1),
                "max_hours": 70,
                "percentage_used": min(100, round((total_hours_used / 70) * 100)),
                "today_hours": round(today_hours, 1),
                "total_miles": int(total_miles),
                "compliance_percentage": compliance_percentage,
                "active_trips": active_trips
            })
            
        except Exception as e:
            return Response(
                {"error": f"Failed to get driver stats: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def calculate_miles(self, request):
        """Calculate miles between two locations using geocoding"""
        from_location = request.data.get('from_location', '')
        to_location = request.data.get('to_location', '')
        
        if not from_location or not to_location:
            return Response(
                {"error": "Both from_location and to_location are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Use geopy for geocoding (same as Trip Planner)
            from geopy.geocoders import Nominatim
            from trips.models import CityCoordinate
            
            geolocator = Nominatim(user_agent="eld_system_miles_calculator", timeout=5)
            
            # Geocode from location
            from_geo = geolocator.geocode(from_location)
            if not from_geo:
                # Try fallback with local database
                parts = from_location.split(',')
                if len(parts) >= 2:
                    city = parts[-2].strip()
                    state = parts[-1].strip()
                    from_lat, from_lng = CityCoordinate.get_coordinates(city, state)
                else:
                    return Response(
                        {"error": f"Could not geocode from location: {from_location}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                from_lat, from_lng = from_geo.latitude, from_geo.longitude
            
            # Geocode to location
            to_geo = geolocator.geocode(to_location)
            if not to_geo:
                # Try fallback with local database
                parts = to_location.split(',')
                if len(parts) >= 2:
                    city = parts[-2].strip()
                    state = parts[-1].strip()
                    to_lat, to_lng = CityCoordinate.get_coordinates(city, state)
                else:
                    return Response(
                        {"error": f"Could not geocode to location: {to_location}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                to_lat, to_lng = to_geo.latitude, to_geo.longitude
            
            # Calculate distance using Haversine formula
            def haversine(lat1, lon1, lat2, lon2):
                R = 3958.8  # Earth radius in miles
                dlat = radians(lat2 - lat1)
                dlon = radians(lon2 - lon1)
                a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
                c = 2 * atan2(sqrt(a), sqrt(1-a))
                return R * c
            
            distance = haversine(from_lat, from_lng, to_lat, to_lng)
            
            return Response({
                "miles": round(distance),
                "from_coordinates": {"lat": from_lat, "lng": from_lng},
                "to_coordinates": {"lat": to_lat, "lng": to_lng}
            })
            
        except Exception as e:
            return Response(
                {"error": f"Failed to calculate miles: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DutyStatusChangeViewSet(viewsets.ModelViewSet):
    serializer_class = DutyStatusChangeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'driver':
            return DutyStatusChange.objects.filter(daily_log__driver=user)
        elif user.user_type == 'admin':
            # ✅ Admin sees ALL status changes from ALL drivers
            return DutyStatusChange.objects.all()
        elif user.user_type == 'manager':
            # Manager sees status changes from drivers in their company
            return DutyStatusChange.objects.filter(daily_log__driver__company=user.company)
        return DutyStatusChange.objects.none()
    
    def perform_create(self, serializer):
        today = get_local_today()
        
        # Get company info with fallbacks
        company = self.request.user.company
        
        # If no company, create a default one
        if not company:
            from users.models import Company
            company, created = Company.objects.get_or_create(
                name='Independent Driver',
                defaults={
                    'main_office_address': 'Not Specified',
                    'dot_number': '0000000'
                }
            )
            self.request.user.company = company
            self.request.user.save()
        
        main_office = getattr(company, 'main_office_address', 'Not Specified')
        
        # Get driver profile info with fallback
        try:
            home_terminal = self.request.user.driverprofile.home_terminal_address if hasattr(self.request.user, 'driverprofile') else 'Not Specified'
        except:
            home_terminal = 'Not Specified'
        
        daily_log, created = DailyLog.objects.get_or_create(
            driver=self.request.user,
            date=today,
            defaults={
                'carrier': company,
                'main_office_address': main_office,
                'home_terminal_address': home_terminal,
                'total_miles_driving_today': 0,
                'total_mileage_today': 0,
                'vehicle_number': "NOT-ASSIGNED",
            }
        )
        
        # ✅ BLOCK STATUS CHANGES IF LOG IS FINALIZED
        if daily_log.is_finalized:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({
                "error": "Cannot add status changes to a finalized log",
                "detail": f"This log was finalized on {daily_log.finalized_at}. No further changes are allowed."
            })
        
        # ✅ AUTO-CLOSE PREVIOUS STATUS (Auto-fill after 15 min)
        # Find the last status change without end_time
        previous_status = DutyStatusChange.objects.filter(
            daily_log=daily_log,
            end_time__isnull=True
        ).order_by('-start_time').first()
        
        new_start_time = serializer.validated_data.get('start_time', get_local_now())
        
        # ✅ No timezone conversion needed with USE_TZ = False
        # Times are stored as-is from frontend
        
        if previous_status:
            # Set end_time to the start_time of the new status
            previous_status.end_time = new_start_time
            previous_status.save()
            print(f"✅ Auto-closed previous status: {previous_status.status} at {previous_status.end_time}")
        else:
            # ✅ FIRST STATUS OF THE DAY - Create "Off Duty" from Midnight (00:00)
            # Check if this is the first status change of the day
            status_count = DutyStatusChange.objects.filter(daily_log=daily_log).count()
            
            if status_count == 0:
                # Create automatic "Off Duty" status from midnight (00:00) to the new status start time
                # Use the date from daily_log to ensure we get midnight of the correct day
                midnight = datetime.combine(daily_log.date, datetime.min.time())
                
                # Only create if the new status doesn't start at midnight
                if new_start_time > midnight:
                    auto_off_duty = DutyStatusChange.objects.create(
                        daily_log=daily_log,
                        status='off_duty',
                        start_time=midnight,
                        end_time=new_start_time,
                        location='Automatic - Start of Day',
                        notes='Automatically created: Off Duty from Midnight (00:00)'
                    )
                    print(f"✅ Auto-created Off Duty from Midnight (00:00) to {new_start_time}")
        
        serializer.save(daily_log=daily_log)