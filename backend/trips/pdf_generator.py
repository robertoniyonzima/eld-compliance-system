from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, black, white
from datetime import datetime
import io


class TripPDFGenerator:
    """Generate professional trip planning PDF"""
    
    # Color palette professionnel
    PRIMARY_COLOR = HexColor('#1e3a8a')      # Bleu foncé
    SECONDARY_COLOR = HexColor('#3b82f6')    # Bleu clair
    ACCENT_COLOR = HexColor('#10b981')       # Vert
    WARNING_COLOR = HexColor('#f59e0b')      # Orange
    DANGER_COLOR = HexColor('#ef4444')       # Rouge
    LIGHT_GRAY = HexColor('#f3f4f6')         # Gris clair
    DARK_GRAY = HexColor('#6b7280')          # Gris foncé
    
    def generate_trip_pdf(self, trip):
        """Generate professional trip planning PDF"""
        buffer = io.BytesIO()
        
        try:
            pdf = canvas.Canvas(buffer, pagesize=letter)
            width, height = letter
            
            # ===== HEADER SECTION =====
            self._draw_header(pdf, width, height)
            
            # ===== TRIP ID BADGE =====
            self._draw_trip_badge(pdf, trip, width, height)
            
            # ===== TRIP INFORMATION CARD =====
            y_position = self._draw_trip_info_card(pdf, trip, width, height - 2*inch)
            
            # ===== HOS COMPLIANCE CARD =====
            y_position = self._draw_hos_compliance_card(pdf, trip, width, y_position - 0.5*inch)
            
            # ===== WAYPOINTS SECTION =====
            waypoints = getattr(trip, 'waypoints', None)
            if waypoints and len(waypoints) > 0:
                y_position = self._draw_waypoints_section(pdf, trip, width, y_position - 0.5*inch)
            
            # ===== FOOTER =====
            self._draw_footer(pdf, width, height)
            
            pdf.save()
            buffer.seek(0)
            return buffer
            
        except Exception as e:
            print(f"Trip PDF Error: {e}")
            import traceback
            traceback.print_exc()
            return self._generate_error_pdf(str(e))
    
    def _draw_header(self, pdf, width, height):
        """Draw professional header with blue banner"""
        # Header banner
        pdf.setFillColor(self.PRIMARY_COLOR)
        pdf.rect(0, height - 1.2*inch, width, 1.2*inch, fill=1, stroke=0)
        
        # Company/App name
        pdf.setFillColor(white)
        pdf.setFont("Helvetica-Bold", 24)
        pdf.drawString(0.75*inch, height - 0.7*inch, "TRIP PLANNING")
        
        pdf.setFont("Helvetica", 12)
        pdf.drawString(0.75*inch, height - 0.95*inch, "Compliance & Route Management System")
        
        # Decorative line
        pdf.setStrokeColor(self.ACCENT_COLOR)
        pdf.setLineWidth(3)
        pdf.line(0.75*inch, height - 1.05*inch, 3.5*inch, height - 1.05*inch)
    
    def _draw_trip_badge(self, pdf, trip, width, height):
        """Draw trip ID badge"""
        badge_x = width - 2.5*inch
        badge_y = height - 0.9*inch
        
        # Badge background
        pdf.setFillColor(self.SECONDARY_COLOR)
        pdf.roundRect(badge_x, badge_y, 1.75*inch, 0.6*inch, 5, fill=1, stroke=0)
        
        # Trip ID
        pdf.setFillColor(white)
        pdf.setFont("Helvetica", 9)
        pdf.drawCentredString(badge_x + 0.875*inch, badge_y + 0.38*inch, "TRIP ID")
        
        pdf.setFont("Helvetica-Bold", 16)
        pdf.drawCentredString(badge_x + 0.875*inch, badge_y + 0.12*inch, f"#{getattr(trip, 'id', 'N/A')}")
    
    def _draw_trip_info_card(self, pdf, trip, width, y_start):
        """Draw trip information card with modern styling"""
        card_x = 0.75*inch
        card_width = width - 1.5*inch
        card_height = 3.2*inch
        
        # Card shadow
        pdf.setFillColor(HexColor('#e5e7eb'))
        pdf.roundRect(card_x + 3, y_start - card_height - 3, card_width, card_height, 8, fill=1, stroke=0)
        
        # Card background
        pdf.setFillColor(white)
        pdf.setStrokeColor(self.LIGHT_GRAY)
        pdf.setLineWidth(1)
        pdf.roundRect(card_x, y_start - card_height, card_width, card_height, 8, fill=1, stroke=1)
        
        # Section title
        pdf.setFillColor(self.PRIMARY_COLOR)
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(card_x + 0.3*inch, y_start - 0.35*inch, "Trip Information")
        
        # Decorative line under title
        pdf.setStrokeColor(self.ACCENT_COLOR)
        pdf.setLineWidth(2)
        pdf.line(card_x + 0.3*inch, y_start - 0.45*inch, card_x + 2*inch, y_start - 0.45*inch)
        
        # Get data safely
        try:
            driver_name = trip.driver.get_full_name() if trip.driver else 'N/A'
        except:
            driver_name = 'N/A'
        
        # Status badge color
        status = getattr(trip, 'status', 'unknown')
        if status == 'completed':
            status_color = self.ACCENT_COLOR
        elif status == 'in_progress':
            status_color = self.WARNING_COLOR
        else:
            status_color = self.SECONDARY_COLOR
        
        # Info items (2 columns)
        y_pos = y_start - 0.75*inch
        left_col = card_x + 0.3*inch
        right_col = card_x + card_width/2 + 0.2*inch
        
        info_items = [
            ("Driver:", driver_name, left_col),
            ("Status:", status.upper(), right_col),
            ("Current Location:", str(getattr(trip, 'current_location', 'N/A'))[:35], left_col),
            ("Distance:", f"{getattr(trip, 'total_distance', 0)} miles", right_col),
            ("Pickup:", str(getattr(trip, 'pickup_location', 'N/A'))[:35], left_col),
            ("Duration:", str(getattr(trip, 'estimated_duration', 'N/A')), right_col),
            ("Dropoff:", str(getattr(trip, 'dropoff_location', 'N/A'))[:35], left_col),
            ("Cycle Used:", f"{getattr(trip, 'current_cycle_used', 0)} hrs", right_col),
        ]
        
        row = 0
        for i, (label, value, x_pos) in enumerate(info_items):
            # Label
            pdf.setFillColor(self.DARK_GRAY)
            pdf.setFont("Helvetica-Bold", 9)
            pdf.drawString(x_pos, y_pos, label)
            
            # Value
            pdf.setFillColor(black)
            pdf.setFont("Helvetica", 9)
            
            # Special styling for status
            if label == "Status:":
                pdf.setFillColor(status_color)
                pdf.roundRect(x_pos + 0.6*inch, y_pos - 0.08*inch, 1*inch, 0.18*inch, 3, fill=1, stroke=0)
                pdf.setFillColor(white)
                pdf.setFont("Helvetica-Bold", 8)
                pdf.drawString(x_pos + 0.65*inch, y_pos + 0.02*inch, value)
            else:
                pdf.drawString(x_pos + 0.6*inch, y_pos, value)
            
            # Move to next row
            if i % 2 == 1:
                y_pos -= 0.3*inch
        
        return y_start - card_height
    
    def _draw_hos_compliance_card(self, pdf, trip, width, y_start):
        """Draw HOS compliance card"""
        card_x = 0.75*inch
        card_width = width - 1.5*inch
        card_height = 1.8*inch
        
        # Card shadow
        pdf.setFillColor(HexColor('#e5e7eb'))
        pdf.roundRect(card_x + 3, y_start - card_height - 3, card_width, card_height, 8, fill=1, stroke=0)
        
        # Card background
        pdf.setFillColor(white)
        pdf.setStrokeColor(self.LIGHT_GRAY)
        pdf.setLineWidth(1)
        pdf.roundRect(card_x, y_start - card_height, card_width, card_height, 8, fill=1, stroke=1)
        
        # Section title with icon
        pdf.setFillColor(self.PRIMARY_COLOR)
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(card_x + 0.3*inch, y_start - 0.35*inch, "HOS Compliance Status")
        
        # Decorative line
        pdf.setStrokeColor(self.ACCENT_COLOR)
        pdf.setLineWidth(2)
        pdf.line(card_x + 0.3*inch, y_start - 0.45*inch, card_x + 2.5*inch, y_start - 0.45*inch)
        
        # Cycle usage bar
        try:
            current_cycle = float(getattr(trip, 'current_cycle_used', 0))
            cycle_remaining = 70 - current_cycle
            percentage = (current_cycle / 70) * 100
        except:
            current_cycle = 0
            cycle_remaining = 70
            percentage = 0
        
        # Progress bar
        bar_x = card_x + 0.3*inch
        bar_y = y_start - 0.8*inch
        bar_width = card_width - 0.6*inch
        bar_height = 0.3*inch
        
        # Bar background
        pdf.setFillColor(self.LIGHT_GRAY)
        pdf.roundRect(bar_x, bar_y, bar_width, bar_height, 4, fill=1, stroke=0)
        
        # Bar fill (color changes based on percentage)
        if percentage < 60:
            bar_color = self.ACCENT_COLOR
        elif percentage < 85:
            bar_color = self.WARNING_COLOR
        else:
            bar_color = self.DANGER_COLOR
        
        pdf.setFillColor(bar_color)
        fill_width = (bar_width * percentage / 100)
        if fill_width > 0:
            pdf.roundRect(bar_x, bar_y, fill_width, bar_height, 4, fill=1, stroke=0)
        
        # Percentage text on bar
        pdf.setFillColor(white if percentage > 20 else black)
        pdf.setFont("Helvetica-Bold", 10)
        pdf.drawCentredString(bar_x + bar_width/2, bar_y + 0.09*inch, f"{percentage:.1f}% Used")
        
        # Compliance details (2 columns)
        y_pos = y_start - 1.25*inch
        
        pdf.setFillColor(self.DARK_GRAY)
        pdf.setFont("Helvetica-Bold", 9)
        pdf.drawString(card_x + 0.3*inch, y_pos, "Cycle Used:")
        pdf.drawString(card_x + 0.3*inch, y_pos - 0.2*inch, "Requires Breaks:")
        
        pdf.drawString(card_x + card_width/2, y_pos, "Cycle Remaining:")
        pdf.drawString(card_x + card_width/2, y_pos - 0.2*inch, "Violations Predicted:")
        
        # Values
        pdf.setFillColor(black)
        pdf.setFont("Helvetica", 9)
        pdf.drawString(card_x + 1.1*inch, y_pos, f"{current_cycle}/70 hours")
        
        requires_breaks = getattr(trip, 'requires_breaks', False)
        pdf.setFillColor(self.WARNING_COLOR if requires_breaks else self.ACCENT_COLOR)
        pdf.drawString(card_x + 1.3*inch, y_pos - 0.2*inch, "Yes" if requires_breaks else "No")
        
        pdf.setFillColor(black)
        pdf.drawString(card_x + card_width/2 + 1.3*inch, y_pos, f"{cycle_remaining} hours")
        
        violations = getattr(trip, 'hos_violations_predicted', False)
        pdf.setFillColor(self.DANGER_COLOR if violations else self.ACCENT_COLOR)
        pdf.drawString(card_x + card_width/2 + 1.6*inch, y_pos - 0.2*inch, "Yes" if violations else "No")
        
        return y_start - card_height
    
    def _draw_waypoints_section(self, pdf, trip, width, y_start):
        """Draw waypoints section"""
        card_x = 0.75*inch
        card_width = width - 1.5*inch
        
        waypoints = getattr(trip, 'waypoints', [])
        waypoint_list = waypoints if isinstance(waypoints, list) else []
        num_waypoints = min(len(waypoint_list), 5)
        card_height = 0.8*inch + (num_waypoints * 0.35*inch)
        
        # Card shadow
        pdf.setFillColor(HexColor('#e5e7eb'))
        pdf.roundRect(card_x + 3, y_start - card_height - 3, card_width, card_height, 8, fill=1, stroke=0)
        
        # Card background
        pdf.setFillColor(white)
        pdf.setStrokeColor(self.LIGHT_GRAY)
        pdf.setLineWidth(1)
        pdf.roundRect(card_x, y_start - card_height, card_width, card_height, 8, fill=1, stroke=1)
        
        # Section title
        pdf.setFillColor(self.PRIMARY_COLOR)
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(card_x + 0.3*inch, y_start - 0.35*inch, "Planned Stops")
        
        # Decorative line
        pdf.setStrokeColor(self.ACCENT_COLOR)
        pdf.setLineWidth(2)
        pdf.line(card_x + 0.3*inch, y_start - 0.45*inch, card_x + 1.8*inch, y_start - 0.45*inch)
        
        # Waypoints
        y_pos = y_start - 0.75*inch
        for i, waypoint in enumerate(waypoint_list[:5]):
            try:
                if isinstance(waypoint, dict):
                    waypoint_type = waypoint.get('type', 'Stop').title()
                    waypoint_reason = waypoint.get('reason', 'N/A')
                else:
                    waypoint_type = "Stop"
                    waypoint_reason = str(waypoint)
            except:
                waypoint_type = "Stop"
                waypoint_reason = "Invalid data"
            
            # Stop number badge
            pdf.setFillColor(self.SECONDARY_COLOR)
            pdf.circle(card_x + 0.4*inch, y_pos + 0.05*inch, 0.12*inch, fill=1, stroke=0)
            pdf.setFillColor(white)
            pdf.setFont("Helvetica-Bold", 9)
            pdf.drawCentredString(card_x + 0.4*inch, y_pos + 0.01*inch, str(i+1))
            
            # Waypoint info
            pdf.setFillColor(self.DARK_GRAY)
            pdf.setFont("Helvetica-Bold", 9)
            pdf.drawString(card_x + 0.65*inch, y_pos + 0.08*inch, waypoint_type)
            
            pdf.setFillColor(black)
            pdf.setFont("Helvetica", 8)
            pdf.drawString(card_x + 0.65*inch, y_pos - 0.08*inch, waypoint_reason[:60])
            
            y_pos -= 0.35*inch
        
        return y_start - card_height
    
    def _draw_footer(self, pdf, width, height):
        """Draw professional footer"""
        # Footer line
        pdf.setStrokeColor(self.LIGHT_GRAY)
        pdf.setLineWidth(1)
        pdf.line(0.75*inch, 0.7*inch, width - 0.75*inch, 0.7*inch)
        
        # Footer text
        pdf.setFillColor(self.DARK_GRAY)
        pdf.setFont("Helvetica-Oblique", 8)
        pdf.drawString(0.75*inch, 0.5*inch, f"Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}")
        
        pdf.setFont("Helvetica", 8)
        pdf.drawRightString(width - 0.75*inch, 0.5*inch, "Trip Planning & HOS Compliance System")
    
    def _generate_error_pdf(self, error_message):
        """Generate professional error PDF"""
        buffer = io.BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        
        # Error banner
        pdf.setFillColor(self.DANGER_COLOR)
        pdf.rect(0, height - 1.5*inch, width, 1.5*inch, fill=1, stroke=0)
        
        # Error icon (X)
        pdf.setStrokeColor(white)
        pdf.setLineWidth(4)
        center_x = width/2
        center_y = height - 0.75*inch
        pdf.line(center_x - 0.2*inch, center_y - 0.2*inch, center_x + 0.2*inch, center_y + 0.2*inch)
        pdf.line(center_x - 0.2*inch, center_y + 0.2*inch, center_x + 0.2*inch, center_y - 0.2*inch)
        
        # Error title
        pdf.setFillColor(white)
        pdf.setFont("Helvetica-Bold", 20)
        pdf.drawCentredString(width/2, height - 1.2*inch, "PDF Generation Error")
        
        # Error message box
        pdf.setFillColor(HexColor('#fee2e2'))
        pdf.roundRect(1*inch, height - 3*inch, width - 2*inch, 1*inch, 8, fill=1, stroke=0)
        
        pdf.setFillColor(self.DANGER_COLOR)
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawCentredString(width/2, height - 2.3*inch, "Error Details:")
        
        pdf.setFillColor(black)
        pdf.setFont("Helvetica", 10)
        pdf.drawCentredString(width/2, height - 2.6*inch, error_message[:80])
        
        # Help text
        pdf.setFillColor(self.DARK_GRAY)
        pdf.setFont("Helvetica", 9)
        pdf.drawCentredString(width/2, height - 3.5*inch, "Please verify the trip data and try again.")
        pdf.drawCentredString(width/2, height - 3.75*inch, "Contact support if the problem persists.")
        
        pdf.save()
        buffer.seek(0)
        return buffer
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from datetime import datetime
import io


class TripPDFGenerator:
    """Generate working trip planning PDF"""
    
    def generate_trip_pdf(self, trip):
        """Generate trip planning PDF"""
        buffer = io.BytesIO()
        
        try:
            pdf = canvas.Canvas(buffer, pagesize=letter)
            width, height = letter
            
            # Title
            pdf.setFont("Helvetica-Bold", 16)
            pdf.drawString(1*inch, height-1*inch, "TRIP PLANNING REPORT")
            
            # Trip Information
            pdf.setFont("Helvetica-Bold", 12)
            pdf.drawString(1*inch, height-1.5*inch, "Trip Information:")
            pdf.setFont("Helvetica", 10)
            
            # Safely get driver name
            try:
                driver_name = trip.driver.get_full_name() if trip.driver else 'N/A'
            except:
                driver_name = 'N/A'
            
            info_lines = [
                f"Trip ID: {getattr(trip, 'id', 'N/A')}",
                f"Driver: {driver_name}",
                f"Status: {getattr(trip, 'status', 'N/A')}",
                f"Current Location: {getattr(trip, 'current_location', 'N/A')}",
                f"Pickup Location: {getattr(trip, 'pickup_location', 'N/A')}",
                f"Dropoff Location: {getattr(trip, 'dropoff_location', 'N/A')}",
                f"Total Distance: {getattr(trip, 'total_distance', 0)} miles",
                f"Estimated Duration: {getattr(trip, 'estimated_duration', 'N/A')}",
                f"Current Cycle Used: {getattr(trip, 'current_cycle_used', 0)} hours",
                f"HOS Violations Predicted: {getattr(trip, 'hos_violations_predicted', False)}"
            ]
            
            for i, line in enumerate(info_lines):
                pdf.drawString(1.2*inch, height-1.8*inch - (i*0.2*inch), line)
            
            # HOS Compliance Section
            pdf.setFont("Helvetica-Bold", 12)
            pdf.drawString(1*inch, height-3.8*inch, "HOS Compliance:")
            pdf.setFont("Helvetica", 10)
            
            try:
                current_cycle = float(getattr(trip, 'current_cycle_used', 0))
                cycle_remaining = 70 - current_cycle
            except:
                current_cycle = 0
                cycle_remaining = 70
            
            compliance_lines = [
                f"Cycle Used: {current_cycle}/70 hours",
                f"Cycle Remaining: {cycle_remaining} hours",
                f"Requires Breaks: {'Yes' if getattr(trip, 'requires_breaks', False) else 'No'}",
                f"Violations Predicted: {'Yes' if getattr(trip, 'hos_violations_predicted', False) else 'No'}"
            ]
            
            for i, line in enumerate(compliance_lines):
                pdf.drawString(1.2*inch, height-4.1*inch - (i*0.2*inch), line)
            
            # Waypoints if available
            waypoints = getattr(trip, 'waypoints', None)
            if waypoints and len(waypoints) > 0:
                pdf.setFont("Helvetica-Bold", 12)
                pdf.drawString(1*inch, height-5*inch, "Planned Stops:")
                pdf.setFont("Helvetica", 10)
                
                waypoint_list = waypoints if isinstance(waypoints, list) else []
                for i, waypoint in enumerate(waypoint_list[:5]):  # Show first 5 waypoints
                    try:
                        if isinstance(waypoint, dict):
                            waypoint_type = waypoint.get('type', 'Stop').title()
                            waypoint_reason = waypoint.get('reason', 'N/A')
                            waypoint_text = f"{waypoint_type}: {waypoint_reason}"
                        else:
                            waypoint_text = str(waypoint)
                    except:
                        waypoint_text = "Invalid waypoint data"
                    
                    pdf.drawString(1.2*inch, height-5.3*inch - (i*0.2*inch), waypoint_text)
            
            # Footer
            pdf.setFont("Helvetica-Oblique", 8)
            pdf.drawString(1*inch, 0.5*inch, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            
            pdf.save()
            buffer.seek(0)
            return buffer
            
        except Exception as e:
            print(f"Trip PDF Error: {e}")
            import traceback
            traceback.print_exc()
            
            # Return simple error PDF
            buffer = io.BytesIO()
            pdf = canvas.Canvas(buffer, pagesize=letter)
            width, height = letter
            
            pdf.setFont("Helvetica-Bold", 16)
            pdf.drawString(1*inch, height-1*inch, "ERROR GENERATING TRIP PDF")
            
            pdf.setFont("Helvetica", 12)
            pdf.drawString(1*inch, height-1.5*inch, f"Error: {str(e)}")
            
            pdf.setFont("Helvetica", 10)
            pdf.drawString(1*inch, height-2*inch, "Please verify the trip data and try again.")
            
            pdf.save()
            buffer.seek(0)
            return buffer