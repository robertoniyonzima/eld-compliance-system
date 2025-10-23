# trips/models.py - MODÈLE COMPLET
from django.db import models
from users.models import CustomUser
from django.core.validators import MinValueValidator, MaxValueValidator
import requests
import json
from datetime import timedelta, datetime
from django.utils import timezone
from math import radians, sin, cos, sqrt, atan2

class CityCoordinate(models.Model):
    """Table complète pour coordonnées de toutes les villes principales US"""
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=2)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    
    class Meta:
        db_table = 'city_coordinates'
        indexes = [
            models.Index(fields=['city', 'state']),
            models.Index(fields=['state']),
        ]
    

    @classmethod
    def get_coordinates(cls, city, state):
        """Trouve les coordonnées avec recherche améliorée"""
        try:
            city_clean = city.strip().lower() if city else ""
            state_clean = state.strip().upper() if state else ""
            
            # 1. Recherche exacte ville+état
            coord = cls.objects.filter(
                city__iexact=city_clean, 
                state__iexact=state_clean
            ).first()
            
            if coord:
                return float(coord.latitude), float(coord.longitude)
                
            # 2. Recherche partielle de ville (pour les noms similaires)
            if city_clean:
                coord = cls.objects.filter(
                    city__icontains=city_clean,
                    state__iexact=state_clean
                ).first()
                if coord:
                    return float(coord.latitude), float(coord.longitude)
                    
            # 3. Capitale de l'état
            coord = cls.objects.filter(
                state__iexact=state_clean
            ).first()
            if coord:
                return float(coord.latitude), float(coord.longitude)
                
        except Exception as e:
            print(f"Coordinate lookup error for {city}, {state}: {e}")
        
        # 4. Fallback vers le centre de l'état
        return cls.get_state_center(state_clean)

    @classmethod
    def get_state_center(cls, state):
        """Retourne le centre géographique de l'état"""
        state_centers = {
            'AL': [32.8065, -86.7911], 'AK': [61.3850, -152.2683], 'AZ': [33.7298, -111.4312],
            'AR': [34.9697, -92.3731], 'CA': [36.1162, -119.6816], 'CO': [39.0598, -105.3111],
            'CT': [41.5928, -72.6505], 'DE': [39.3185, -75.5071], 'FL': [27.7663, -81.6868],
            'GA': [33.0406, -83.6431], 'HI': [21.0943, -157.4983], 'ID': [44.2405, -114.4788],
            'IL': [40.3495, -88.9861], 'IN': [39.8494, -86.2583], 'IA': [42.0115, -93.2105],
            'KS': [38.5266, -96.7265], 'KY': [37.6681, -84.6701], 'LA': [31.1695, -91.8678],
            'ME': [44.6939, -69.3819], 'MD': [39.0639, -76.8021], 'MA': [42.2302, -71.5301],
            'MI': [43.3266, -84.5361], 'MN': [45.6945, -93.9002], 'MS': [32.7416, -89.6787],
            'MO': [38.4561, -92.2884], 'MT': [46.9219, -110.4544], 'NE': [41.1254, -98.2681],
            'NV': [38.4864, -117.0701], 'NH': [43.4525, -71.5639], 'NJ': [40.2989, -74.5210],
            'NM': [34.8405, -106.2485], 'NY': [42.1657, -74.9481], 'NC': [35.6301, -79.8064],
            'ND': [47.5289, -99.7840], 'OH': [40.3888, -82.7649], 'OK': [35.5653, -96.9289],
            'OR': [44.5720, -122.0709], 'PA': [40.5908, -77.2098], 'RI': [41.6809, -71.5118],
            'SC': [33.8569, -80.9450], 'SD': [44.2998, -99.4388], 'TN': [35.7478, -86.6923],
            'TX': [31.0545, -97.5635], 'UT': [40.1500, -111.8624], 'VT': [44.0459, -72.7107],
            'VA': [37.7693, -78.1700], 'WA': [47.4009, -121.4905], 'WV': [38.4912, -80.9545],
            'WI': [44.2685, -89.6165], 'WY': [42.7560, -107.3025], 'DC': [38.8974, -77.0268]
        }
        return state_centers.get(state, [39.8283, -98.5795])  # Centre USA par défaut

    def __str__(self):
        return f"{self.city}, {self.state.upper()}"

class Location(models.Model):
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=2)
    zip_code = models.CharField(max_length=10)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    def get_coordinates(self):
        """Get coordinates with robust fallback system"""
        # 1. Si on a déjà les coordonnées, les retourner
        if self.latitude and self.longitude:
            return float(self.latitude), float(self.longitude)
        
        # 2. ESSAYER le géocoding externe (timeout court)
        try:
            from geopy.geocoders import Nominatim
            geolocator = Nominatim(user_agent="eld_system_trips", timeout=3)
            location = geolocator.geocode(f"{self.city}, {self.state}, USA")
            
            if location:
                self.latitude = location.latitude
                self.longitude = location.longitude
                self.save()
                print(f"Geocoding success for {self.city}, {self.state}")
                return self.latitude, self.longitude
        except Exception as e:
            print(f"Geocoding error for {self.city}, {self.state}: {e}")
    
        # 3. FALLBACK: Base de données locale
        try:
            lat, lng = CityCoordinate.get_coordinates(self.city, self.state)
            if lat and lng:
                print(f"Using local coordinates for {self.city}, {self.state}")
                self.latitude = lat
                self.longitude = lng
                self.save()
                return lat, lng
        except Exception as e:
            print(f"Local coordinate fallback error: {e}")
    
        # 4. FALLBACK FINAL: Centre de l'état
        default_coords = self.get_state_center()
        print(f"Using state center for {self.state}: {default_coords}")
        self.latitude = default_coords[0]
        self.longitude = default_coords[1]
        self.save()
        return default_coords

    def get_state_center(self):
        """Retourne le centre géographique de l'état"""
        state_centers = {
            'AL': [32.8065, -86.7911], 'AK': [61.3850, -152.2683], 'AZ': [33.7298, -111.4312],
            'AR': [34.9697, -92.3731], 'CA': [36.1162, -119.6816], 'CO': [39.0598, -105.3111],
            'CT': [41.5928, -72.6505], 'DE': [39.3185, -75.5071], 'FL': [27.7663, -81.6868],
            'GA': [33.0406, -83.6431], 'HI': [21.0943, -157.4983], 'ID': [44.2405, -114.4788],
            'IL': [40.3495, -88.9861], 'IN': [39.8494, -86.2583], 'IA': [42.0115, -93.2105],
            'KS': [38.5266, -96.7265], 'KY': [37.6681, -84.6701], 'LA': [31.1695, -91.8678],
            'ME': [44.6939, -69.3819], 'MD': [39.0639, -76.8021], 'MA': [42.2302, -71.5301],
            'MI': [43.3266, -84.5361], 'MN': [45.6945, -93.9002], 'MS': [32.7416, -89.6787],
            'MO': [38.4561, -92.2884], 'MT': [46.9219, -110.4544], 'NE': [41.1254, -98.2681],
            'NV': [38.4864, -117.0701], 'NH': [43.4525, -71.5639], 'NJ': [40.2989, -74.5210],
            'NM': [34.8405, -106.2485], 'NY': [42.1657, -74.9481], 'NC': [35.6301, -79.8064],
            'ND': [47.5289, -99.7840], 'OH': [40.3888, -82.7649], 'OK': [35.5653, -96.9289],
            'OR': [44.5720, -122.0709], 'PA': [40.5908, -77.2098], 'RI': [41.6809, -71.5118],
            'SC': [33.8569, -80.9450], 'SD': [44.2998, -99.4388], 'TN': [35.7478, -86.6923],
            'TX': [31.0545, -97.5635], 'UT': [40.1500, -111.8624], 'VT': [44.0459, -72.7107],
            'VA': [37.7693, -78.1700], 'WA': [47.4009, -121.4905], 'WV': [38.4912, -80.9545],
            'WI': [44.2685, -89.6165], 'WY': [42.7560, -107.3025], 'DC': [38.8974, -77.0268]
        }
        return state_centers.get(self.state.upper(), [39.8283, -98.5795])  # Centre USA par défaut
    
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
        """Calculate route with robust fallback system"""
        try:
            # Get coordinates for all locations
            current_lat, current_lng = self.current_location.get_coordinates()
            pickup_lat, pickup_lng = self.pickup_location.get_coordinates()
            dropoff_lat, dropoff_lng = self.dropoff_location.get_coordinates()
            
            if not all([current_lat, current_lng, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng]):
                print("Some coordinates are missing, using fallback calculation")
                return self.calculate_route_fallback()
            
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
                    'waypoints': data['waypoints'],
                    'source': 'osrm'
                }
                
                # Plan HOS breaks
                self.plan_hos_breaks()
                
                self.save()
                return data
            else:
                print(f"OSRM API error, using fallback: {data.get('message', 'Unknown error')}")
                return self.calculate_route_fallback()
                
        except Exception as e:
            print(f"Route calculation error: {e}")
            return self.calculate_route_fallback()
    
    def calculate_route_fallback(self):
        """Fallback robuste avec calcul de distance réel"""
        try:
            # Récupérer les coordonnées (même approximatives)
            current_lat, current_lng = self.current_location.get_coordinates()
            pickup_lat, pickup_lng = self.pickup_location.get_coordinates()
            dropoff_lat, dropoff_lng = self.dropoff_location.get_coordinates()
            
            # Calculer distance avec Haversine
            def haversine(lat1, lon1, lat2, lon2):
                R = 3958.8  # Earth radius in miles
                dlat = radians(lat2 - lat1)
                dlon = radians(lon2 - lon1)
                a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
                c = 2 * atan2(sqrt(a), sqrt(1-a))
                return R * c
            
            # Distances réelles
            dist1 = haversine(current_lat, current_lng, pickup_lat, pickup_lng)
            dist2 = haversine(pickup_lat, pickup_lng, dropoff_lat, dropoff_lng)
            total_distance = dist1 + dist2
            
            # Durée estimée (55 mph moyenne)
            total_duration = total_distance / 55  # en heures
            
            self.total_distance = round(total_distance, 1)
            self.estimated_duration = timedelta(hours=total_duration)
            
            # Stocker les données de route simplifiées
            self.route_data = {
                'fallback': True,
                'distance': total_distance,
                'duration': total_duration,
                'coordinates': {
                    'current': [current_lat, current_lng],
                    'pickup': [pickup_lat, pickup_lng],
                    'dropoff': [dropoff_lat, dropoff_lng]
                },
                'source': 'haversine_fallback'
            }
            
            # Plan HOS breaks
            self.plan_hos_breaks()
            
            self.save()
            return self.route_data
            
        except Exception as e:
            print(f"Fallback route calculation error: {e}")
            # Dernier fallback ultra-basique
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
        if not self.estimated_duration:
            return []
        
        try:
            logs = []
            trip_start = self.start_time
            trip_duration = self.estimated_duration
            trip_end = trip_start + trip_duration
            
            # Create daily logs for each day of the trip
            current_day = trip_start.date()
            end_day = trip_end.date()
            
            day_count = max(1, (end_day - current_day).days + 1)  # Ensure at least 1 day
            
            total_distance = float(self.total_distance) if self.total_distance else 0
            
            for day_offset in range(day_count):
                log_date = current_day + timedelta(days=day_offset)
                
                # Calculate driving hours for this day (simplified)
                if day_count == 1:
                    day_driving_hours = self.estimated_duration.total_seconds() / 3600
                else:
                    # Distribute driving hours across days
                    day_driving_hours = min(11, (self.estimated_duration.total_seconds() / 3600) / day_count)
                
                # Calculate miles for this day (distribute total distance)
                day_miles = int(total_distance / day_count)
                
                # Check compliance for this day
                compliance = self.check_day_compliance(day_driving_hours)
                
                # Create predicted log
                log_data = {
                    'date': log_date.isoformat(),
                    'total_miles_driving_today': day_miles,
                    'total_mileage_today': day_miles,
                    'estimated_driving_hours': round(day_driving_hours, 2),
                    'hos_compliance': compliance,
                    'breaks_required': day_driving_hours > 8,
                    'day_number': day_offset + 1,
                    'total_days': day_count,
                    'status': 'predicted'
                }
                
                logs.append(log_data)
            
            return logs
            
        except Exception as e:
            print(f"Error generating ELD logs: {e}")
            return []

    def check_day_compliance(self, driving_hours):
        """Check HOS compliance for a day"""
        try:
            total_hours_used = float(self.current_cycle_used) + driving_hours
            
            compliance = {
                '11_hour_rule': driving_hours <= 11,
                '14_hour_rule': True,  # Simplified - would need actual timing
                'break_rule': driving_hours <= 8,  # Would need actual break timing
                '70_hour_rule': total_hours_used <= 70,
                'total_hours_used': round(total_hours_used, 2),
                'hours_remaining': round(70 - total_hours_used, 2)
            }
            return compliance
        except Exception as e:
            print(f"Error in compliance check: {e}")
            return {
                '11_hour_rule': False,
                '14_hour_rule': False,
                'break_rule': False,
                '70_hour_rule': False,
                'total_hours_used': 0,
                'hours_remaining': 70
            }

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