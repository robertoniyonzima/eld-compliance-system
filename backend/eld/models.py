# backend/eld/models.py - Version complète
from django.db import models
from users.models import CustomUser, Company
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

class DailyLog(models.Model):
    DUTY_STATUS = (
        ('off_duty', 'Off Duty'),
        ('sleeper_berth', 'Sleeper Berth'),
        ('driving', 'Driving'),
        ('on_duty', 'On Duty (Not Driving)'),
    )
    
    driver = models.ForeignKey(CustomUser, on_delete=models.CASCADE, limit_choices_to={'user_type': 'driver'})
    date = models.DateField(default=timezone.now)
    
    # Champs du formulaire papier
    total_miles_driving_today = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(2000)], 
        default=0,
        verbose_name="Total Miles Driving Today"
    )
    total_mileage_today = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(2000)], 
        default=0,
        verbose_name="Total Mileage Today"
    )
    
    carrier = models.ForeignKey(Company, on_delete=models.CASCADE, verbose_name="Name of Carrier")
    main_office_address = models.TextField(verbose_name="Main Office Address")
    vehicle_number = models.CharField(max_length=50, verbose_name="Truck/Tractor Number")
    trailer_number = models.CharField(max_length=50, blank=True, null=True, verbose_name="Trailer Number")
    home_terminal_address = models.TextField(verbose_name="Home Terminal Address")
    
    # ✅ FROM and TO locations (captured from Trip Planner)
    from_location = models.CharField(max_length=255, blank=True, null=True, verbose_name="From Location")
    to_location = models.CharField(max_length=255, blank=True, null=True, verbose_name="To Location")
    
    # ✅ Daily log status
    is_finalized = models.BooleanField(default=False, verbose_name="Log Finalized")
    finalized_at = models.DateTimeField(null=True, blank=True, verbose_name="Finalized At")
    
    # Section Shipping Documents
    shipping_documents = models.TextField(
        blank=True, 
        null=True,
        verbose_name="Shipping Documents",
        help_text="Enter name of place you regarded and whose collected items work and where each change of duty occurred"
    )
    
    # Section Remarks
    remarks = models.TextField(
        blank=True, 
        null=True,
        verbose_name="Remarks",
        help_text="Use time standard of former terminal"
    )
    
    # Grille 24 heures
    grid_data = models.JSONField(
        default=dict,
        help_text="24-hour grid data from 00:00 to 23:00"
    )
    
    is_certified = models.BooleanField(default=False)
    certified_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Driver's Daily Log"
        verbose_name_plural = "Driver's Daily Logs"
        unique_together = ['driver', 'date']
    
    def generate_grid_data(self):
        """Génère la structure de grille exacte comme dans blank-paper-log.png"""
        grid = {}
        for hour in range(24):
            grid[str(hour).zfill(2)] = {
                'off_duty': hour >= 22 or hour < 6,  # Exemple: off-duty la nuit
                'sleeper_berth': False,
                'driving': hour >= 6 and hour < 18,  # Exemple: driving de jour
                'on_duty': hour >= 18 and hour < 22, # Exemple: on-duty le soir
                'location': '',
                'notes': ''
            }
        return grid
    
    def save(self, *args, **kwargs):
        if not self.grid_data:
            self.grid_data = self.generate_grid_data()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Daily Log - {self.driver.get_full_name()} - {self.date}"

class DutyStatusChange(models.Model):
    daily_log = models.ForeignKey(DailyLog, on_delete=models.CASCADE, related_name='status_changes')
    status = models.CharField(max_length=20, choices=DailyLog.DUTY_STATUS)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    location = models.CharField(max_length=255)
    notes = models.TextField(blank=True, null=True)
    
    def duration_hours(self):
        if self.end_time:
            return (self.end_time - self.start_time).total_seconds() / 3600
        return 0
    
    def __str__(self):
        return f"{self.get_status_display()} at {self.location}"

class LogCertification(models.Model):
    daily_log = models.OneToOneField(DailyLog, on_delete=models.CASCADE)
    driver_signature = models.TextField(verbose_name="Driver Signature")
    certification_date = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    
    def __str__(self):
        return f"Certification for {self.daily_log}"