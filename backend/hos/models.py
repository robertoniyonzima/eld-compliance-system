# backend/hos/models.py
from django.db import models
from django.utils import timezone
from datetime import timedelta, datetime
import json
from users.models import CustomUser
from eld.models import DutyStatusChange

class HOSRuleEngine:
    """
    FMCSA Hours of Service Rules Engine
    Implements all federal regulations for ELD compliance
    """
    
    @staticmethod
    def check_14_hour_rule(duty_status_changes, current_time=None):
        """
        14-Hour Rule: Maximum 14 hours of service window
        After 14 hours, driver must take 10 hours off
        """
        if not current_time:
            current_time = timezone.now()
        
        violations = []
        fourteen_hours_ago = current_time - timedelta(hours=14)
        
        # Filter periods within the 14-hour window
        recent_periods = [d for d in duty_status_changes 
                         if d.start_time >= fourteen_hours_ago]
        
        if recent_periods:
            total_driving = timedelta()
            for period in recent_periods:
                if period.status in ['driving', 'on_duty']:
                    end_time = period.end_time or current_time
                    total_driving += (end_time - period.start_time)
            
            total_driving_hours = total_driving.total_seconds() / 3600
            
            if total_driving_hours >= 14:
                violations.append({
                    'violation_type': '14_hour',
                    'violation_time': current_time,
                    'description': f'14-hour window violation: {total_driving_hours:.2f} hours worked',
                    'remaining_time': 0
                })
            else:
                remaining_time = 14 - total_driving_hours
                violations.append({
                    'violation_type': '14_hour_compliance',
                    'violation_time': current_time,
                    'description': f'14-hour compliance: {total_driving_hours:.2f}/14 hours used',
                    'remaining_time': remaining_time
                })
        
        return violations
    
    @staticmethod
    def check_11_hour_driving_limit(duty_status_changes, current_time=None):
        """
        11-Hour Rule: Maximum 11 hours of driving
        After 11 hours driving, 10 hours off required
        """
        if not current_time:
            current_time = timezone.now()
        
        violations = []
        
        # Calculate total driving in last 24 hours
        twenty_four_hours_ago = current_time - timedelta(hours=24)
        driving_periods = [d for d in duty_status_changes 
                          if d.start_time >= twenty_four_hours_ago 
                          and d.status == 'driving']
        
        total_driving = timedelta()
        for period in driving_periods:
            end_time = period.end_time or current_time
            total_driving += (end_time - period.start_time)
        
        total_driving_hours = total_driving.total_seconds() / 3600
        
        if total_driving_hours > 11:
            violations.append({
                'violation_type': '11_hour',
                'violation_time': current_time,
                'description': f'11-hour driving limit exceeded: {total_driving_hours:.2f} hours driven',
                'remaining_driving': 0
            })
        else:
            remaining_driving = 11 - total_driving_hours
            violations.append({
                'violation_type': '11_hour_compliance',
                'violation_time': current_time,
                'description': f'11-hour compliance: {total_driving_hours:.2f}/11 hours used',
                'remaining_driving': remaining_driving
            })
        
        return violations
    
    @staticmethod
    def check_30_min_break(duty_status_changes, current_time=None):
        """
        30-Minute Break Rule: After 8 hours cumulative driving,
        driver must take 30-minute break
        """
        if not current_time:
            current_time = timezone.now()
        
        violations = []
        eight_hours_ago = current_time - timedelta(hours=8)
        
        # Calculate driving in last 8 hours
        driving_periods = [d for d in duty_status_changes 
                          if d.start_time >= eight_hours_ago 
                          and d.status == 'driving']
        
        total_driving = timedelta()
        for period in driving_periods:
            end_time = period.end_time or current_time
            total_driving += (end_time - period.start_time)
        
        total_driving_hours = total_driving.total_seconds() / 3600
        
        if total_driving_hours >= 8:
            # Check if 30-minute break was taken
            has_break = False
            off_duty_periods = [d for d in duty_status_changes 
                               if d.start_time >= eight_hours_ago 
                               and d.status in ['off_duty', 'sleeper_berth']]
            
            for period in off_duty_periods:
                end_time = period.end_time or current_time
                break_duration = end_time - period.start_time
                if break_duration.total_seconds() >= 1800:  # 30 minutes
                    has_break = True
                    break
            
            if not has_break:
                violations.append({
                    'violation_type': 'break',
                    'violation_time': current_time,
                    'description': '30-minute break required after 8 hours of driving',
                    'break_required': 30
                })
            else:
                violations.append({
                    'violation_type': 'break_compliance',
                    'violation_time': current_time,
                    'description': '30-minute break requirement satisfied',
                    'break_required': 0
                })
        
        return violations
    
    @staticmethod
    def check_70_hour_8day(driver, duty_status_changes, current_time=None):
        """
        70-Hour/8-Day Rule: Maximum 70 hours over 8 consecutive days
        """
        if not current_time:
            current_time = timezone.now()
        
        violations = []
        
        # Calculate total service hours over 8 days
        eight_days_ago = current_time - timedelta(days=8)
        service_periods = [d for d in duty_status_changes 
                          if d.start_time >= eight_days_ago 
                          and d.status in ['driving', 'on_duty']]
        
        total_service = timedelta()
        for period in service_periods:
            end_time = period.end_time or current_time
            total_service += (end_time - period.start_time)
        
        total_service_hours = total_service.total_seconds() / 3600
        
        if total_service_hours > 70:
            violations.append({
                'violation_type': '70_hour',
                'violation_time': current_time,
                'description': f'70-hour/8-day limit exceeded: {total_service_hours:.2f} hours worked',
                'remaining_hours': 0
            })
        else:
            remaining_hours = 70 - total_service_hours
            # Update driver profile
            from users.models import DriverProfile
            try:
                driver_profile = DriverProfile.objects.get(user=driver)
                driver_profile.current_cycle_used = total_service_hours
                driver_profile.save()
            except DriverProfile.DoesNotExist:
                pass
            
            violations.append({
                'violation_type': '70_hour_compliance',
                'violation_time': current_time,
                'description': f'70-hour compliance: {total_service_hours:.2f}/70 hours used',
                'remaining_hours': remaining_hours
            })
        
        return violations
    
    @classmethod
    def calculate_compliance(cls, driver, current_time=None):
        """
        Main method to calculate complete HOS compliance
        Returns all compliance statuses and violations
        """
        if not current_time:
            current_time = timezone.now()
        
        # Get all recent duty status changes
        duty_status_changes = DutyStatusChange.objects.filter(
            daily_log__driver=driver,
            start_time__gte=current_time - timedelta(days=8)
        )
        
        compliance_report = {
            'driver': driver.id,
            'calculation_time': current_time,
            'is_compliant': True,
            'violations': [],
            'warnings': [],
            'compliance_status': {},
            'remaining_times': {}
        }
        
        # Execute all compliance checks
        checks = [
            cls.check_14_hour_rule(duty_status_changes, current_time),
            cls.check_11_hour_driving_limit(duty_status_changes, current_time),
            cls.check_30_min_break(duty_status_changes, current_time),
            cls.check_70_hour_8day(driver, duty_status_changes, current_time),
        ]
        
        # Compile results
        for check_result in checks:
            for result in check_result:
                if 'violation' in result['violation_type'] and 'compliance' not in result['violation_type']:
                    compliance_report['violations'].append(result)
                    compliance_report['is_compliant'] = False
                elif 'compliance' in result['violation_type']:
                    compliance_report['compliance_status'][result['violation_type']] = result
                    # Extract remaining times
                    if 'remaining_driving' in result:
                        compliance_report['remaining_times']['driving'] = result['remaining_driving']
                    if 'remaining_hours' in result:
                        compliance_report['remaining_times']['cycle'] = result['remaining_hours']
                    if 'remaining_time' in result:
                        compliance_report['remaining_times']['14_hour_window'] = result['remaining_time']
                else:
                    compliance_report['warnings'].append(result)
        
        return compliance_report

class HOSViolation(models.Model):
    VIOLATION_TYPES = (
        ('14_hour', '14-Hour Rule Violation'),
        ('11_hour', '11-Hour Driving Violation'),
        ('break', '30-Minute Break Violation'),
        ('70_hour', '70-Hour/8-Day Violation'),
        ('14_hour_compliance', '14-Hour Compliance'),
        ('11_hour_compliance', '11-Hour Compliance'),
        ('70_hour_compliance', '70-Hour Compliance'),
        ('break_compliance', 'Break Compliance'),
    )
    
    driver = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    violation_type = models.CharField(max_length=20, choices=VIOLATION_TYPES)
    violation_time = models.DateTimeField()
    description = models.TextField()
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Additional calculation data
    remaining_driving = models.FloatField(null=True, blank=True)
    remaining_hours = models.FloatField(null=True, blank=True)
    remaining_time = models.FloatField(null=True, blank=True)
    break_required = models.IntegerField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.driver.username} - {self.get_violation_type_display()} - {self.violation_time}"
    
    class Meta:
        ordering = ['-violation_time']