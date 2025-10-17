# backend/hos/models.py
from django.db import models
from users.models import DriverProfile
from datetime import timedelta
from decimal import Decimal

class HOSViolation(models.Model):
    VIOLATION_TYPES = (
        ('14_hour', '14-Hour Rule Violation'),
        ('11_hour', '11-Hour Driving Violation'),
        ('break', '30-Minute Break Violation'),
        ('70_hour', '70-Hour/8-Day Violation'),
        ('sleeper_berth', 'Sleeper Berth Violation'),
    )
    
    driver = models.ForeignKey(DriverProfile, on_delete=models.CASCADE)
    violation_type = models.CharField(max_length=20, choices=VIOLATION_TYPES)
    violation_time = models.DateTimeField()
    description = models.TextField()
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.violation_type} - {self.driver.user.email}"

class HOSRuleEngine:
    """Moteur de règles HOS selon FMCSA"""
    
    @staticmethod
    def check_14_hour_rule(driving_segments):
        """Vérifie la règle des 14 heures consécutives"""
        total_driving_time = sum(
            (segment.end_time - segment.start_time).total_seconds() / 3600 
            for segment in driving_segments 
            if segment.end_time
        )
        return total_driving_time <= 14
    
    @staticmethod
    def check_11_hour_rule(driving_hours):
        """Vérifie la règle des 11 heures de conduite"""
        return driving_hours <= 11
    
    @staticmethod
    def check_30_min_break(driving_time):
        """Vérifie la pause de 30 minutes après 8 heures"""
        return driving_time <= 8 or True  # À implémenter complètement
    
    @staticmethod
    def check_70_hour_8day(current_cycle_used, additional_hours=0):
        """Vérifie la règle des 70 heures sur 8 jours"""
        return (current_cycle_used + additional_hours) <= 70