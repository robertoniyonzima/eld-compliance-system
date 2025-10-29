# backend/users/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator

class Company(models.Model):
    name = models.CharField(max_length=255)
    main_office_address = models.TextField()
    dot_number = models.CharField(max_length=20, unique=True)
    mc_number = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ('admin', 'System Administrator'),
        ('driver', 'Driver'),
        ('manager', 'Fleet Manager'),
    )
    
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='driver')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, null=True, blank=True)
    phone_regex = RegexValidator(regex=r'^\+?1?\d{9,15}$', message="Format: '+999999999'")
    phone_number = models.CharField(validators=[phone_regex], max_length=17, blank=True)
    is_approved = models.BooleanField(default=False)
    license_number = models.CharField(max_length=50, blank=True, null=True)
    license_state = models.CharField(max_length=2, blank=True, null=True)
    email = models.EmailField(unique=True)
    profile_photo = models.ImageField(upload_to='profile_photos/', blank=True, null=True)
    
    # ⭐️ IMPORTANT: Ajouter related_name pour éviter les conflits
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='customuser_set',
        related_query_name='user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='customuser_set',
        related_query_name='user',
    )
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def save(self, *args, **kwargs):
        # ✅ ALL new users need approval (driver, manager, admin)
        if not self.pk:  # New user
            self.is_approved = False
            self.is_active = False
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.email} ({self.user_type})"

class DriverProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    home_terminal_address = models.TextField()
    current_cycle_used = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    cycle_start_date = models.DateField(auto_now_add=True)
    is_eld_certified = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.user.get_full_name()}"