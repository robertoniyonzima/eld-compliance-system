# backend/eld/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import DailyLog, DutyStatusChange, LogCertification
from .serializers import DailyLogSerializer, DutyStatusChangeSerializer

class DailyLogViewSet(viewsets.ModelViewSet):
    serializer_class = DailyLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # ⭐️ AJOUTER ce queryset par défaut
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'driver':
            return DailyLog.objects.filter(driver=user)
        elif user.user_type in ['manager', 'admin']:
            return DailyLog.objects.filter(driver__company=user.company)
        return DailyLog.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(driver=self.request.user)
    
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
        daily_log.certified_at = timezone.now()
        daily_log.save()
        
        return Response({"message": "Log certified successfully"})
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Récupérer le journal d'aujourd'hui"""
        today = timezone.now().date()
        daily_log, created = DailyLog.objects.get_or_create(
            driver=request.user,
            date=today,
            defaults={
                'carrier': request.user.company,
                'main_office_address': request.user.company.main_office_address,
                'home_terminal_address': getattr(request.user.driverprofile, 'home_terminal_address', ''),
            }
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

class DutyStatusChangeViewSet(viewsets.ModelViewSet):
    serializer_class = DutyStatusChangeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # ⭐️ AJOUTER ce queryset par défaut
    def get_queryset(self):
        return DutyStatusChange.objects.filter(daily_log__driver=self.request.user)
    
    def perform_create(self, serializer):
        daily_log, created = DailyLog.objects.get_or_create(
            driver=self.request.user,
            date=timezone.now().date()
        )
        serializer.save(daily_log=daily_log)