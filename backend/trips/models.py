# backend/trips/models.py
from django.db import models
from users.models import CustomUser, DriverProfile
from django.core.validators import MinValueValidator, MaxValueValidator
import requests
from datetime import timedelta

class Location(models.Model):
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=2)
    zip_code = models.CharField(max_length=10)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    def get_coordinates(self):
        if not self.latitude or not self.longitude:
            try:
                # Utiliser OpenStreetMap Nominatim pour géocodage gratuit
                from geopy.geocoders import Nominatim
                geolocator = Nominatim(user_agent="eld_system")
                location = geolocator.geocode(f"{self.address}, {self.city}, {self.state} {self.zip_code}")
                if location:
                    self.latitude = location.latitude
                    self.longitude = location.longitude
                    self.save()
            except Exception as e:
                print(f"Geocoding error: {e}")
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
    
    driver = models.ForeignKey(DriverProfile, on_delete=models.CASCADE)
    current_location = models.ForeignKey(Location, related_name='current_trips', on_delete=models.CASCADE)
    pickup_location = models.ForeignKey(Location, related_name='pickup_trips', on_delete=models.CASCADE)
    dropoff_location = models.ForeignKey(Location, related_name='dropoff_trips', on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    estimated_duration = models.DurationField(null=True, blank=True)
    total_distance = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)  # miles
    status = models.CharField(max_length=20, choices=TRIP_STATUS, default='planned')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def calculate_route(self):
        """Calculate route using OSRM API"""
        try:
            current_lat, current_lng = self.current_location.get_coordinates()
            pickup_lat, pickup_lng = self.pickup_location.get_coordinates()
            dropoff_lat, dropoff_lng = self.dropoff_location.get_coordinates()
            
            # Use OSRM API for route calculation
            coordinates = f"{current_lng},{current_lat};{pickup_lng},{pickup_lat};{dropoff_lng},{dropoff_lat}"
            url = f"http://router.project-osrm.org/route/v1/driving/{coordinates}?overview=false"
            response = requests.get(url)
            data = response.json()
            
            if data['code'] == 'Ok':
                route = data['routes'][0]
                self.total_distance = round(route['distance'] / 1609.34, 2)  # Convert meters to miles
                self.estimated_duration = timedelta(seconds=route['duration'])
                self.save()
                
            return data
        except Exception as e:
            print(f"Route calculation error: {e}")
            return None
    
    def __str__(self):
        return f"Trip {self.id} - {self.driver.user.email}"