# backend/eld/models.py
from django.db import models
from users.models import DriverProfile, Company
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

class DailyLog(models.Model):
    DUTY_STATUS = (
        ('off_duty', 'Off Duty'),
        ('sleeper_berth', 'Sleeper Berth'),
        ('driving', 'Driving'),
        ('on_duty', 'On Duty (Not Driving)'),
    )
    
    driver = models.ForeignKey(DriverProfile, on_delete=models.CASCADE)
    date = models.DateField(default=timezone.now)
    total_miles_driving_today = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(2000)], default=0
    )
    total_mileage_today = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(2000)], default=0
    )
    carrier = models.ForeignKey(Company, on_delete=models.CASCADE)
    vehicle_number = models.CharField(max_length=50)
    trailer_number = models.CharField(max_length=50, blank=True, null=True)
    home_terminal_address = models.TextField()
    shipping_documents = models.TextField(blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    is_certified = models.BooleanField(default=False)
    certified_at = models.DateTimeField(null=True, blank=True)
    
    # Grid data for 24-hour period - stocké en JSON
    grid_data = models.JSONField(default=dict)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def generate_grid_data(self):
        """Génère la structure de grille pour 24 heures comme dans blank-paper-log.png"""
        grid = {}
        for hour in range(24):
            grid[str(hour).zfill(2)] = {
                'off_duty': False,
                'sleeper_berth': False,
                'driving': False,
                'on_duty': False,
                'location': '',
                'notes': ''
            }
        return grid
    
    def save(self, *args, **kwargs):
        if not self.grid_data:
            self.grid_data = self.generate_grid_data()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"ELD Log - {self.driver.user.get_full_name()} - {self.date}"

class DutyStatusChange(models.Model):
    daily_log = models.ForeignKey(DailyLog, on_delete=models.CASCADE, related_name='status_changes')
    status = models.CharField(max_length=20, choices=DailyLog.DUTY_STATUS)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    location = models.CharField(max_length=255)
    notes = models.TextField(blank=True, null=True)
    
    def duration(self):
        if self.end_time:
            return self.end_time - self.start_time
        return None
    
    def __str__(self):
        return f"{self.status} at {self.location}"

class LogCertification(models.Model):
    daily_log = models.OneToOneField(DailyLog, on_delete=models.CASCADE)
    driver_signature = models.TextField()
    certification_date = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    
    def __str__(self):
        return f"Certification for {self.daily_log}"