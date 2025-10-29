# backend/eld/management/commands/fix_midnight_off_duty.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from eld.models import DailyLog, DutyStatusChange
from datetime import datetime

class Command(BaseCommand):
    help = 'Fix existing logs to start Off Duty from midnight (00:00) instead of first status time'

    def add_arguments(self, parser):
        parser.add_argument(
            '--date',
            type=str,
            help='Specific date to fix (YYYY-MM-DD format). If not provided, fixes today\'s logs.',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Fix all logs in the database',
        )

    def handle(self, *args, **options):
        """
        This command fixes existing logs to have Off Duty starting from midnight (00:00)
        instead of starting from the time of the first status change
        """
        
        # Determine which logs to fix
        if options['all']:
            daily_logs = DailyLog.objects.all()
            self.stdout.write(self.style.WARNING('Fixing ALL logs in database...'))
        elif options['date']:
            try:
                target_date = datetime.strptime(options['date'], '%Y-%m-%d').date()
                daily_logs = DailyLog.objects.filter(date=target_date)
                self.stdout.write(self.style.WARNING(f'Fixing logs for date: {target_date}'))
            except ValueError:
                self.stdout.write(self.style.ERROR('Invalid date format. Use YYYY-MM-DD'))
                return
        else:
            today = timezone.now().date()
            daily_logs = DailyLog.objects.filter(date=today)
            self.stdout.write(self.style.WARNING(f'Fixing today\'s logs: {today}'))
        
        fixed_count = 0
        skipped_count = 0
        
        for daily_log in daily_logs:
            # Get all status changes for this log, ordered by start time
            status_changes = DutyStatusChange.objects.filter(
                daily_log=daily_log
            ).order_by('start_time')
            
            if not status_changes.exists():
                self.stdout.write(f'  ⏭️  Skipped log {daily_log.id} - No status changes')
                skipped_count += 1
                continue
            
            first_status = status_changes.first()
            
            # Calculate midnight for this log's date
            midnight = timezone.make_aware(
                timezone.datetime.combine(daily_log.date, timezone.datetime.min.time())
            )
            
            # Check if first status is already at midnight or is already off_duty from midnight
            if first_status.start_time <= midnight or (
                first_status.status == 'off_duty' and 
                first_status.start_time == midnight
            ):
                self.stdout.write(f'  ⏭️  Skipped log {daily_log.id} - Already starts at midnight')
                skipped_count += 1
                continue
            
            # Check if there's already an automatic off_duty from midnight
            existing_midnight_off_duty = status_changes.filter(
                status='off_duty',
                start_time=midnight,
                location='Automatic - Start of Day'
            ).first()
            
            if existing_midnight_off_duty:
                self.stdout.write(f'  ⏭️  Skipped log {daily_log.id} - Already has midnight off_duty')
                skipped_count += 1
                continue
            
            # Create the automatic off_duty from midnight to first status
            auto_off_duty = DutyStatusChange.objects.create(
                daily_log=daily_log,
                status='off_duty',
                start_time=midnight,
                end_time=first_status.start_time,
                location='Automatic - Start of Day',
                notes='Automatically created: Off Duty from Midnight (00:00) - FIXED'
            )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'  ✅ Fixed log {daily_log.id} for driver {daily_log.driver.username} '
                    f'- Added Off Duty from {midnight.strftime("%H:%M")} to {first_status.start_time.strftime("%H:%M")}'
                )
            )
            fixed_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n📊 Summary: Fixed {fixed_count} logs, Skipped {skipped_count} logs'
            )
        )
