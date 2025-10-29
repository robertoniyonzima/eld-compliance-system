# backend/eld/management/commands/close_daily_logs.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from eld.models import DutyStatusChange, DailyLog
from datetime import timedelta

class Command(BaseCommand):
    help = 'Close all open status changes at midnight and create new day logs'

    def handle(self, *args, **options):
        """
        This command should be run at midnight (00:00) every day
        to close all open status changes from the previous day
        """
        now = timezone.now()
        midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
        yesterday = (now - timedelta(days=1)).date()
        
        # Find all open status changes from yesterday
        open_statuses = DutyStatusChange.objects.filter(
            end_time__isnull=True,
            daily_log__date=yesterday
        )
        
        closed_count = 0
        for status in open_statuses:
            # Close the status at midnight
            status.end_time = midnight
            status.save()
            closed_count += 1
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Closed {status.status} for driver {status.daily_log.driver.username} at midnight'
                )
            )
            
            # Create new "Off Duty" status for the new day
            new_log, created = DailyLog.objects.get_or_create(
                driver=status.daily_log.driver,
                date=now.date(),
                defaults={
                    'carrier': status.daily_log.carrier,
                    'vehicle_number': status.daily_log.vehicle_number,
                    'trailer_number': status.daily_log.trailer_number,
                    'main_office_address': status.daily_log.main_office_address,
                    'home_terminal_address': status.daily_log.home_terminal_address,
                }
            )
            
            # Start new day with Off Duty from midnight
            DutyStatusChange.objects.create(
                daily_log=new_log,
                status='off_duty',
                start_time=midnight,
                location='Automatic - New Day',
                notes='Automatically created: New day started at midnight'
            )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Created new Off Duty status for {status.daily_log.driver.username} at midnight'
                )
            )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully closed {closed_count} open status changes and created new day logs'
            )
        )
