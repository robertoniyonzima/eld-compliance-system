#hos/views.py

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import HOSViolation, HOSRuleEngine
from .serializers import HOSViolationSerializer

class HOSComplianceViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current HOS compliance status"""
        compliance_report = HOSRuleEngine.calculate_compliance(request.user)
        return Response(compliance_report)
    
    @action(detail=False, methods=['get'])
    def violations(self, request):
        """Get HOS violations"""
        violations = HOSViolation.objects.filter(driver=request.user, is_resolved=False)
        serializer = HOSViolationSerializer(violations, many=True)
        return Response(serializer.data)

class HOSViolationViewSet(viewsets.ModelViewSet):
    serializer_class = HOSViolationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return HOSViolation.objects.filter(driver=self.request.user)
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Mark violation as resolved"""
        violation = self.get_object()
        violation.is_resolved = True
        violation.resolved_at = timezone.now()
        violation.save()
        return Response({"message": "Violation marked as resolved"})