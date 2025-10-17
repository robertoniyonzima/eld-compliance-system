# backend/eld/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import DailyLog, DutyStatusChange, LogCertification
from .serializers import DailyLogSerializer, DutyStatusChangeSerializer
from django.utils import timezone

class DailyLogViewSet(viewsets.ModelViewSet):
    serializer_class = DailyLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'driver':
            return DailyLog.objects.filter(driver__user=user)
        elif user.user_type == 'manager':
            return DailyLog.objects.filter(driver__user__company=user.company)
        elif user.user_type == 'admin':
            return DailyLog.objects.all()
        return DailyLog.objects.none()
    
    @action(detail=True, methods=['post'])
    def certify_log(self, request, pk=None):
        """Certification du journal par le driver"""
        daily_log = self.get_object()
        
        if daily_log.driver.user != request.user:
            return Response({
                'error': 'Not authorized to certify this log'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Créer la certification
        certification = LogCertification.objects.create(
            daily_log=daily_log,
            driver_signature=request.data.get('signature'),
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        daily_log.is_certified = True
        daily_log.certified_at = timezone.now()
        daily_log.save()
        
        return Response({
            'message': 'Log certified successfully'
        })
    
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
    
    def get_queryset(self):
        return DutyStatusChange.objects.filter(
            daily_log__driver__user=self.request.user
        )
    
    def perform_create(self, serializer):
        daily_log, created = DailyLog.objects.get_or_create(
            driver=self.request.user.driverprofile,
            date=timezone.now().date()
        )
        serializer.save(daily_log=daily_log)