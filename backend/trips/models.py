from django.db import models
from users.models import CustomUser, DriverProfile
from django.core.validators import MinValueValidator, MaxValueValidator
import requests
import json
from datetime import timedelta, datetime
from django.utils import timezone
from hos.models import HOSRuleEngine

class Location(models.Model):
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=2)
    zip_code = models.CharField(max_length=10)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    def get_coordinates(self):
        """Get coordinates using OpenStreetMap Nominatim (free)"""
        if not self.latitude or not self.longitude:
            try:
                # Use OpenStreetMap Nominatim for geocoding
                import geopy
                from geopy.geocoders import Nominatim
                from geopy.exc import GeocoderTimedOut
                
                geolocator = Nominatim(user_agent="eld_system_trips")
                location = geolocator.geocode(f"{self.address}, {self.city}, {self.state} {self.zip_code}")
                
                if location:
                    self.latitude = location.latitude
                    self.longitude = location.longitude
                    self.save()
                    return self.latitude, self.longitude
            except Exception as e:
                print(f"Geocoding error for {self.address}: {e}")
        
        return self.latitude, self.longitude
    
    def __str__(self):
        return f"{self.address}, {self.city}, {self.state}"

class Trip(models.Model):
    TRIP_STATUS = (
        ('planned', 'Planned'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    driver = models.ForeignKey(CustomUser, on_delete=models.CASCADE, limit_choices_to={'user_type': 'driver'})
    current_location = models.ForeignKey(Location, related_name='current_trips', on_delete=models.CASCADE)
    pickup_location = models.ForeignKey(Location, related_name='pickup_trips', on_delete=models.CASCADE)
    dropoff_location = models.ForeignKey(Location, related_name='dropoff_trips', on_delete=models.CASCADE)
    
    # Trip details
    start_time = models.DateTimeField(default=timezone.now)
    estimated_duration = models.DurationField(null=True, blank=True)
    total_distance = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)  # miles
    status = models.CharField(max_length=20, choices=TRIP_STATUS, default='planned')
    
    # HOS Compliance
    current_cycle_used = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    requires_breaks = models.BooleanField(default=False)
    hos_violations_predicted = models.BooleanField(default=False)
    
    # Route data
    route_data = models.JSONField(null=True, blank=True)  # Store OSRM route data
    waypoints = models.JSONField(null=True, blank=True)   # Planned stops for HOS breaks
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def calculate_route(self):
        """Calculate route using OSRM API with HOS break planning"""
        try:
            # Get coordinates for all locations
            current_lat, current_lng = self.current_location.get_coordinates()
            pickup_lat, pickup_lng = self.pickup_location.get_coordinates()
            dropoff_lat, dropoff_lng = self.dropoff_location.get_coordinates()
            
            if not all([current_lat, current_lng, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng]):
                raise ValueError("Could not get coordinates for all locations")
            
            # Use OSRM API for route calculation
            coordinates = f"{current_lng},{current_lat};{pickup_lng},{pickup_lat};{dropoff_lng},{dropoff_lat}"
            url = f"http://router.project-osrm.org/route/v1/driving/{coordinates}?overview=full&geometries=geojson"
            
            response = requests.get(url, timeout=10)
            data = response.json()
            
            if data['code'] == 'Ok':
                route = data['routes'][0]
                
                # Convert meters to miles and seconds to hours
                self.total_distance = round(route['distance'] / 1609.34, 2)  # meters to miles
                self.estimated_duration = timedelta(seconds=route['duration'])
                
                # Store complete route data
                self.route_data = {
                    'geometry': route['geometry'],
                    'distance': route['distance'],
                    'duration': route['duration'],
                    'waypoints': data['waypoints']
                }
                
                # Plan HOS breaks
                self.plan_hos_breaks()
                
                self.save()
                return data
            else:
                raise ValueError(f"OSRM API error: {data.get('message', 'Unknown error')}")
                
        except Exception as e:
            print(f"Route calculation error: {e}")
            # Fallback: estimate based on average speed
            self.estimate_route_fallback()
            return None
    
    def estimate_route_fallback(self):
        """Fallback route estimation when OSRM is unavailable"""
        # Simple estimation: 50 mph average speed
        estimated_hours = 10  # conservative default
        self.total_distance = 500  # miles default
        self.estimated_duration = timedelta(hours=estimated_hours)
        self.plan_hos_breaks()
        self.save()
    
    def plan_hos_breaks(self):
        """Plan HOS breaks based on trip duration and current cycle"""
        if not self.estimated_duration:
            return
        
        total_hours = self.estimated_duration.total_seconds() / 3600
        cycle_remaining = 70 - float(self.current_cycle_used)
        
        # Check if trip exceeds available hours
        if total_hours > cycle_remaining:
            self.hos_violations_predicted = True
        else:
            self.hos_violations_predicted = False
        
        # Plan breaks: 30-min break every 8 hours of driving
        driving_hours = total_hours
        break_count = int(driving_hours // 8)
        
        if break_count > 0:
            self.requires_breaks = True
            
            # Calculate break waypoints (simplified - in real app, use actual route points)
            waypoints = []
            for i in range(break_count):
                break_position = (i + 1) * 8 / driving_hours  # position along route
                waypoints.append({
                    'type': 'break',
                    'position': break_position,
                    'duration_minutes': 30,
                    'reason': 'HOS 30-minute break requirement'
                })
            
            # Add fuel stop every 1000 miles
            fuel_stops = int(float(self.total_distance) // 1000)
            for i in range(fuel_stops):
                fuel_position = (i + 1) * 1000 / float(self.total_distance)
                waypoints.append({
                    'type': 'fuel',
                    'position': fuel_position,
                    'duration_minutes': 60,  # 1 hour for fueling
                    'reason': 'Fuel stop required every 1000 miles'
                })
            
            self.waypoints = waypoints
        else:
            self.requires_breaks = False
            self.waypoints = []
    
    def generate_eld_logs(self):
        """Generate predicted ELD logs for the entire trip"""
        if not self.route_data or not self.estimated_duration:
            return None
        
        from eld.models import DailyLog
        
        logs = []
        trip_start = self.start_time
        trip_duration = self.estimated_duration
        trip_end = trip_start + trip_duration
        
        # Create daily logs for each day of the trip
        current_day = trip_start.date()
        end_day = trip_end.date()
        
        day_count = (end_day - current_day).days + 1
        
        for day_offset in range(day_count):
            log_date = current_day + timedelta(days=day_offset)
            day_start = datetime.combine(log_date, datetime.min.time()).replace(tzinfo=timezone.utc)
            day_end = day_start + timedelta(days=1)
            
            # Calculate driving hours for this day
            day_driving_hours = self.calculate_driving_hours_for_day(day_start, day_end, trip_start, trip_end)
            
            # Create predicted log
            log_data = {
                'date': log_date.isoformat(),
                'total_miles_driving_today': int(float(self.total_distance) / day_count),
                'total_mileage_today': int(float(self.total_distance) / day_count),
                'estimated_driving_hours': day_driving_hours,
                'hos_compliance': self.check_day_compliance(day_driving_hours),
                'breaks_required': day_driving_hours > 8
            }
            
            logs.append(log_data)
        
        return logs
    
    def calculate_driving_hours_for_day(self, day_start, day_end, trip_start, trip_end):
        """Calculate driving hours for a specific day"""
        # Simplified calculation - in real app, use actual route timing
        day_duration = min(day_end, trip_end) - max(day_start, trip_start)
        day_hours = day_duration.total_seconds() / 3600
        
        # Assume 80% of time is driving
        return max(0, min(11, day_hours * 0.8))  # Cap at 11 hours driving
    
    def check_day_compliance(self, driving_hours):
        """Check HOS compliance for a day"""
        compliance = {
            '11_hour_rule': driving_hours <= 11,
            '14_hour_rule': True,  # Simplified
            'break_rule': driving_hours <= 8,  # Would need actual break timing
            '70_hour_rule': (float(self.current_cycle_used) + driving_hours) <= 70
        }
        return compliance
    
    def get_trip_summary(self):
        """Get comprehensive trip summary"""
        return {
            'trip_id': self.id,
            'driver': self.driver.get_full_name(),
            'current_location': str(self.current_location),
            'pickup_location': str(self.pickup_location),
            'dropoff_location': str(self.dropoff_location),
            'total_distance_miles': float(self.total_distance) if self.total_distance else 0,
            'estimated_duration_hours': self.estimated_duration.total_seconds() / 3600 if self.estimated_duration else 0,
            'current_cycle_used': float(self.current_cycle_used),
            'cycle_remaining': 70 - float(self.current_cycle_used),
            'requires_breaks': self.requires_breaks,
            'hos_violations_predicted': self.hos_violations_predicted,
            'waypoints': self.waypoints if self.waypoints else [],
            'status': self.status
        }
    
    def __str__(self):
        return f"Trip {self.id} - {self.driver.email} ({self.status})"