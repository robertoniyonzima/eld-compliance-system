from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import DailyLog, DutyStatusChange, LogCertification
from .serializers import DailyLogSerializer, DutyStatusChangeSerializer

class DailyLogViewSet(viewsets.ModelViewSet):
    serializer_class = DailyLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'driver':
            return DailyLog.objects.filter(driver=user)
        elif user.user_type in ['manager', 'admin']:
            return DailyLog.objects.filter(driver__company=user.company)
        return DailyLog.objects.none()
    
    def perform_create(self, serializer):
        # Remplir automatiquement les champs requis
        user = self.request.user
        serializer.save(
            driver=user,
            carrier=user.company,
            main_office_address=user.company.main_office_address,
            home_terminal_address=getattr(user.driverprofile, 'home_terminal_address', '')
        )
    
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
        """Récupérer ou créer le journal d'aujourd'hui"""
        today = timezone.now().date()
        
        try:
            daily_log = DailyLog.objects.get(driver=request.user, date=today)
        except DailyLog.DoesNotExist:
            # Créer un nouveau log avec tous les champs requis
            daily_log = DailyLog.objects.create(
                driver=request.user,
                date=today,
                carrier=request.user.company,
                main_office_address=request.user.company.main_office_address,
                home_terminal_address=getattr(request.user.driverprofile, 'home_terminal_address', ''),
                total_miles_driving_today=0,
                total_mileage_today=0,
                vehicle_number="NOT-ASSIGNED",
                trailer_number="",
                shipping_documents="",
                remarks=""
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
    
    def get_queryset(self):
        return DutyStatusChange.objects.filter(daily_log__driver=self.request.user)
    
    def perform_create(self, serializer):
        # Associer automatiquement au log du jour
        today = timezone.now().date()
        daily_log, created = DailyLog.objects.get_or_create(
            driver=self.request.user,
            date=today,
            defaults={
                'carrier': self.request.user.company,
                'main_office_address': self.request.user.company.main_office_address,
                'home_terminal_address': getattr(self.request.user.driverprofile, 'home_terminal_address', ''),
                'total_miles_driving_today': 0,
                'total_mileage_today': 0,
                'vehicle_number': "NOT-ASSIGNED",
            }
        )
        serializer.save(daily_log=daily_log)