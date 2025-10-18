from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib.colors import black, white, grey
import io
from datetime import datetime

class FMCSAPDFGenerator:
    """
    Générateur PDF exact du formulaire FMCSA Driver's Daily Log
    Reproduction fidèle pixel par pixel
    """
    
    def generate_daily_log_pdf(self, daily_log):
        """Generate EXACT FMCSA form PDF"""
        buffer = io.BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        
        # Commencer du haut
        y = height - 0.4 * inch
        
        # ===== EN-TÊTE =====
        y = self._draw_header(pdf, daily_log, y)
        
        # ===== SECTION "FROM" =====
        y = self._draw_from_section(pdf, daily_log, y)
        
        # ===== TABLEAU PRINCIPAL (3 COLONNES) =====
        y = self._draw_main_info_table(pdf, daily_log, y)
        
        # ===== GRILLE 24 HEURES AVEC 4 STATUTS =====
        y = self._draw_24_hour_grid(pdf, daily_log, y)
        
        # ===== REMARKS =====
        y = self._draw_remarks_section(pdf, daily_log, y)
        
        # ===== SHIPPING DOCUMENTS =====
        y = self._draw_shipping_section(pdf, daily_log, y)
        
        # ===== INSTRUCTIONS ET CERTIFICATION =====
        y = self._draw_instructions_and_certification(pdf, daily_log, y)
        
        # ===== TABLEAU DES TOTAUX (EN BAS À DROITE) =====
        self._draw_totals_table(pdf, daily_log)
        
        pdf.save()
        buffer.seek(0)
        return buffer
    
    def _draw_header(self, pdf, daily_log, y):
        """Dessiner l'en-tête exact"""
        # Titre principal
        pdf.setFont("Helvetica-Bold", 16)
        pdf.drawString(0.5*inch, y, "Drivers Daily Log")
        
        # Date à droite avec les 3 champs
        pdf.setFont("Helvetica", 9)
        date_y = y + 5
        
        # Champs de date
        pdf.drawString(6.0*inch, date_y, "(month)")
        pdf.drawString(6.5*inch, date_y, "/")
        pdf.drawString(6.6*inch, date_y, "(day)")
        pdf.drawString(7.0*inch, date_y, "/")
        pdf.drawString(7.1*inch, date_y, "(year)")
        
        # Valeurs de date si disponibles
        if daily_log.date:
            pdf.setFont("Helvetica-Bold", 10)
            pdf.drawString(6.0*inch, date_y - 15, daily_log.date.strftime("%m"))
            pdf.drawString(6.6*inch, date_y - 15, daily_log.date.strftime("%d"))
            pdf.drawString(7.1*inch, date_y - 15, daily_log.date.strftime("%Y"))
        
        # Ligne sous le titre
        y -= 20
        pdf.line(0.5*inch, y, 8.0*inch, y)
        
        # Texte 24 hours
        y -= 15
        pdf.setFont("Helvetica", 9)
        pdf.drawString(0.5*inch, y, "(24 hours)")
        
        # Original et Duplicate
        pdf.setFont("Helvetica", 7)
        pdf.drawString(2.5*inch, y, "Original - File at home terminal")
        pdf.drawString(5.5*inch, y, "Duplicate - Driver retains for 8 days")
        
        return y - 20
    
    def _draw_from_section(self, pdf, daily_log, y):
        """Section FROM et TO sur la même ligne"""
        pdf.setFont("Helvetica-Bold", 10)

        # From
        pdf.drawString(0.5 * inch, y, "From:")
        pdf.line(1.0 * inch, y - 2, 4.0 * inch, y - 2)

        # To
        pdf.drawString(4.5 * inch, y, "To:")
        pdf.line(5.0 * inch, y - 2, 8.0 * inch, y - 2)

        # Retourner le Y ajusté pour la suite
        return y - 25

    
    def _draw_main_info_table(self, pdf, daily_log, y):
        """Tableau principal avec 3 colonnes sur 2 rangées"""
        table_x = 0.5 * inch
        table_width = 7.5 * inch
        row1_height = 0.35 * inch
        row2_height = 0.35 * inch
        
        # Bordure extérieure
        pdf.rect(table_x, y - row1_height - row2_height, table_width, row1_height + row2_height)
        
        # Ligne horizontale entre les 2 rangées
        pdf.line(table_x, y - row1_height, table_x + table_width, y - row1_height)
        
        # Lignes verticales pour 3 colonnes
        col1_width = 2.5 * inch
        col2_width = 2.5 * inch
        col3_width = 2.5 * inch
        
        pdf.line(table_x + col1_width, y, table_x + col1_width, y - row1_height - row2_height)
        pdf.line(table_x + col1_width + col2_width, y, table_x + col1_width + col2_width, y - row1_height - row2_height)
        
        # ===== RANGÉE 1 =====
        pdf.setFont("Helvetica", 7)
        
        # Col 1: Total Miles Driving Today
        pdf.drawString(table_x + 5, y - 10, "Total Miles Driving Today")
        pdf.setFont("Helvetica-Bold", 10)
        pdf.drawString(table_x + 10, y - 23, str(daily_log.total_miles_driving_today))
        
        # Col 2: Total Mileage Today
        pdf.setFont("Helvetica", 7)
        pdf.drawString(table_x + col1_width + 5, y - 10, "Total Mileage Today")
        pdf.setFont("Helvetica-Bold", 10)
        pdf.drawString(table_x + col1_width + 10, y - 23, str(daily_log.total_mileage_today))
        
        # Col 3: Name of Carrier or Carriers
        pdf.setFont("Helvetica", 7)
        pdf.drawString(table_x + col1_width + col2_width + 5, y - 10, "Name of Carrier or Carriers")
        if daily_log.carrier:
            pdf.setFont("Helvetica", 9)
            pdf.drawString(table_x + col1_width + col2_width + 10, y - 23, daily_log.carrier.name[:25])
        
        # ===== RANGÉE 2 =====
        y_row2 = y - row1_height
        
        # Col 1: Truck/Trailer Numbers
        pdf.setFont("Helvetica", 7)
        pdf.drawString(table_x + 5, y_row2 - 9, "Truck/Trailer and Trailer Numbers")
        # pdf.drawString(table_x + 5, y_row2 - 18, "License Plate/State (show each unit)")
        vehicle_text = daily_log.vehicle_number
        if daily_log.trailer_number:
            vehicle_text += f" / {daily_log.trailer_number}"
        pdf.setFont("Helvetica", 8)
        pdf.drawString(table_x + 5, y_row2 - 23, vehicle_text[:30])
        
        # Col 2: Main Office Address
        pdf.setFont("Helvetica", 7)
        pdf.drawString(table_x + col1_width + 5, y_row2 - 9, "Main Office Address")
        if daily_log.main_office_address:
            pdf.setFont("Helvetica", 8)
            pdf.drawString(table_x + col1_width + 10, y_row2 - 23, daily_log.main_office_address[:30])
        
        # Col 3: Home Terminal Address
        pdf.setFont("Helvetica", 7)
        pdf.drawString(table_x + col1_width + col2_width + 5, y_row2 - 9, "Home Terminal Address")
        if daily_log.home_terminal_address:
            pdf.setFont("Helvetica", 8)
            pdf.drawString(table_x + col1_width + col2_width + 10, y_row2 - 23, daily_log.home_terminal_address[:30])
        
        return y - row1_height - row2_height - 20
    
    def _draw_24_hour_grid(self, pdf, daily_log, y):
            """Grille 24 heures avec 4 statuts - ALIGNÉE EXACTEMENT SUR LES LIGNES D'HEURES (FMCSA)"""
            # ===== LABELS À GAUCHE =====
            label_x = 0.15 * inch
            pdf.setFont("Helvetica-Bold", 7)
            
            status_labels = [
                (y - 40, "1. Off Duty"),
                (y - 80, "2. Sleeper"),
                (y - 88, "   Berth"),
                (y - 127, "3. Driving"),
                (y - 170, "4. On Duty"),
                
            ]
            for y_pos, label in status_labels:
                pdf.drawString(label_x, y_pos, label)
            
            # ===== CONFIG GRILLE =====
            grid_x = 0.7 * inch
            grid_width = 6.6 * inch
            grid_height = 2.3 * inch
            row_height = grid_height / 4
            header_height = 20
            hour_width = grid_width / 24
            
            # ===== EN-TÊTE AVEC FOND NOIR =====
            pdf.setFillColorRGB(0, 0, 0)
            pdf.rect(grid_x, y - header_height, grid_width, header_height, fill=1, stroke=0)
            pdf.setFillColorRGB(1, 1, 1)
            pdf.setFont("Helvetica-Bold", 6)
            
            # MIDNIGHT INITIAL (sur la ligne 0)
            pdf.drawString(grid_x + 2, y - 8, "Mid-")
            pdf.drawString(grid_x + 2, y - 15, "night")
            
            # Heures 1-11 du matin → alignées sur la LIGNE de chaque heure
            for h in range(1, 12):
                x = grid_x + (h * hour_width) - 2
                pdf.drawString(x, y - 11, str(h))
            
            # NOON (12h) - aligné sur la ligne 12
            x = grid_x + (12 * hour_width) - 2
            pdf.drawString(x, y - 11, "Noon")
            
            # Heures 1-11 de l'après-midi (13h-23h)
            for h in range(1, 12):
                x = grid_x + ((12 + h) * hour_width) - 2
                pdf.drawString(x, y - 11, str(h))
            
            # MIDNIGHT FINAL - DÉCOLLÉ de 11, sur la ligne 24
            pdf.setFont("Helvetica-Bold", 5)
            x = grid_x + (24 * hour_width) - 15  # Positionné juste avant la fin
            pdf.drawString(x, y - 8, "Mid-")
            pdf.drawString(x, y - 13, "night")
            
            pdf.setFillColorRGB(0, 0, 0)
            
            # ===== GRILLE PRINCIPALE =====
            grid_top = y - header_height
            pdf.setLineWidth(1.2)
            pdf.rect(grid_x, grid_top - grid_height, grid_width, grid_height)
            
            # Lignes horizontales (4 rangées pour les 4 statuts)
            pdf.setLineWidth(0.8)
            for i in range(1, 4):
                y_line = grid_top - (i * row_height)
                pdf.line(grid_x, y_line, grid_x + grid_width, y_line)
            
            # ===== LIGNES VERTICALES AVEC SUBDIVISIONS =====
            for hour in range(25):  # 0 à 24 inclus
                x_hour = grid_x + (hour * hour_width)
                
                # Ligne principale de l'heure (épaisse, hauteur complète)
                pdf.setLineWidth(1.2)
                pdf.line(x_hour, grid_top, x_hour, grid_top - grid_height)
                
                # Subdivisions (seulement pour les 24 premières heures)
                # Les subdivisions se répètent dans CHAQUE RANGÉE (4 rangées)
                if hour < 24:
                    for row in range(4):  # Pour chaque rangée (Off Duty, Sleeper, Driving, On Duty)
                        row_top = grid_top - (row * row_height)
                        row_bottom = row_top - row_height
                        
                        # Subdivision 15 min (descend 25% dans la rangée)
                        x_15 = x_hour + (0.25 * hour_width)
                        pdf.setLineWidth(0.3)
                        pdf.line(x_15, row_top, x_15, row_top - (row_height * 0.25))
                        
                        # Subdivision 30 min (descend 50% dans la rangée)
                        x_30 = x_hour + (0.5 * hour_width)
                        pdf.setLineWidth(0.6)
                        pdf.line(x_30, row_top, x_30, row_top - (row_height * 0.5))
                        
                        # Subdivision 45 min (descend 25% dans la rangée)
                        x_45 = x_hour + (0.75 * hour_width)
                        pdf.setLineWidth(0.3)
                        pdf.line(x_45, row_top, x_45, row_top - (row_height * 0.25))
            
            # ===== COLONNE TOTAL HOURS =====
            total_col_x = grid_x + grid_width + 0.05 * inch
            total_col_width = 0.5 * inch
            
            # En-tête avec fond noir
            pdf.setFillColorRGB(0, 0, 0)
            pdf.rect(total_col_x, y - header_height, total_col_width, header_height, fill=1, stroke=0)
            pdf.setFillColorRGB(1, 1, 1)
            pdf.setFont("Helvetica-Bold", 6)
            pdf.drawString(total_col_x + 5, y - 8, "Total")
            pdf.drawString(total_col_x + 5, y - 15, "Hours")
            pdf.setFillColorRGB(0, 0, 0)
            
            # Bordure de la colonne
            pdf.setLineWidth(1.2)
            pdf.rect(total_col_x, grid_top - grid_height, total_col_width, grid_height)
            
            # Lignes horizontales dans la colonne
            pdf.setLineWidth(0.8)
            for i in range(1, 4):
                y_line = grid_top - (i * row_height)
                pdf.line(total_col_x, y_line, total_col_x + total_col_width, y_line)
            
            # ===== REMPLISSAGE =====
            self._draw_total_hours(pdf, daily_log, total_col_x + 5, grid_top, row_height)
            self._fill_grid_with_status_data(pdf, daily_log, grid_top, grid_x, hour_width, row_height)
            
            return grid_top - grid_height - 20

    
    def _draw_total_hours(self, pdf, daily_log, x, y_start, row_height):
        """Afficher les totaux d'heures pour chaque statut"""
        try:
            status_changes = daily_log.status_changes.all()
            
            totals = {
                'off_duty': 0,
                'sleeper_berth': 0,
                'driving': 0,
                'on_duty': 0
            }
            
            # Calculer les totaux
            for change in status_changes:
                if change.status in totals and change.end_time:
                    duration = (change.end_time - change.start_time).total_seconds() / 3600
                    totals[change.status] += duration
            
            # Afficher les totaux
            pdf.setFont("Helvetica-Bold", 8)
            status_order = ['off_duty', 'sleeper_berth', 'driving', 'on_duty']
            
            for i, status in enumerate(status_order):
                y_pos = y_start - (i * row_height) - (row_height / 2)
                total_hours = totals[status]
                pdf.drawString(x, y_pos, f"{total_hours:.1f}")
                
        except Exception as e:
            print(f"Erreur calcul totaux: {e}")
    
    def _fill_grid_with_status_data(self, pdf, daily_log, grid_top, grid_x, hour_width, row_height):
        """Remplir la grille avec les changements de statut réels"""
        try:
            status_changes = daily_log.status_changes.all().order_by('start_time')
            
            status_to_row = {
                'off_duty': 0,
                'sleeper_berth': 1, 
                'driving': 2,
                'on_duty': 3
            }
            
            pdf.setFillColor(black)
            
            for change in status_changes:
                if change.status in status_to_row:
                    row_idx = status_to_row[change.status]
                    start_hour = change.start_time.hour
                    start_minute = change.start_time.minute
                    
                    # Position dans la grille
                    x_offset = (start_hour + start_minute/60) * hour_width
                    x = grid_x + x_offset + 1
                    y = grid_top - (row_idx * row_height) - (row_height / 2)
                    
                    # Durée
                    duration = 1
                    if change.end_time:
                        end_hour = change.end_time.hour
                        end_minute = change.end_time.minute
                        duration = (end_hour + end_minute/60) - (start_hour + start_minute/60)
                        duration = max(0.1, duration)
                    
                    width = (duration * hour_width) - 2
                    height = 8
                    
                    # Remplir la période
                    pdf.rect(x, y - 4, width, height, fill=1, stroke=0)
                    
        except Exception as e:
            print(f"Erreur lors du remplissage de la grille: {e}")
    
    def _draw_remarks_section(self, pdf, daily_log, y):
        """Section Remarks"""
        pdf.setFont("Helvetica-Bold", 10)
        pdf.drawString(0.5*inch, y, "Remarks")
        
        # Ligne
        y -= 15
        pdf.line(0.5*inch, y, 8.0*inch, y)
        
        # Contenu des remarks
        if daily_log.remarks:
            y -= 15
            pdf.setFont("Helvetica", 9)
            pdf.drawString(0.5*inch, y, daily_log.remarks[:90])
        
        return y - 20
    
    def _draw_shipping_section(self, pdf, daily_log, y):
        """Section Shipping Documents"""
        pdf.setFont("Helvetica-Bold", 9)
        pdf.drawString(0.5*inch, y, "Shipping")
        pdf.drawString(0.5*inch, y - 12, "Documents:")
        
        # Boîte pour les documents
        y -= 25
        box_height = 0.5 * inch
        pdf.rect(0.5*inch, y - box_height, 3.5*inch, box_height)
        
        pdf.setFont("Helvetica", 7)
        pdf.drawString(0.55*inch, y - 10, "Bill of lading/Manifest No.")
        pdf.drawString(0.55*inch, y - 18, "or")
        
        if daily_log.shipping_documents:
            pdf.setFont("Helvetica", 8)
            pdf.drawString(0.55*inch, y - 30, daily_log.shipping_documents[:40])
        
        # Section Shipper & Commodity à droite
        pdf.setFont("Helvetica-Bold", 9)
        pdf.drawString(4.2*inch, y + 5, "Shipper & Commodity")
        pdf.rect(4.2*inch, y - box_height, 3.8*inch, box_height)
        
        pdf.setFont("Helvetica", 7)
        pdf.drawString(4.25*inch, y - 10, "Enter name of place you started and where each change of duty occurred.")
        pdf.drawString(4.25*inch, y - 18, "Use time standard of home terminal.")
        
        return y - box_height - 15
    
    def _draw_instructions_and_certification(self, pdf, daily_log, y):
        """Instructions et certification"""
        # Instructions
        pdf.setFont("Helvetica", 7)
        instructions = [
            "Recap:",
            "Consecutive",
            "days",
            "worked"
        ]
        
        x_col = 0.5 * inch
        for line in instructions:
            pdf.drawString(x_col, y, line)
            y -= 10
        
        # Ligne de signature
        y += 20
        pdf.setFont("Helvetica", 9)
        pdf.drawString(2.5*inch, y, "Driver's signature certifying that the above is true and correct")
        
        y -= 15
        pdf.line(2.5*inch, y, 5.5*inch, y)
        
        if daily_log.is_certified and daily_log.certified_at:
            pdf.setFont("Helvetica", 8)
            pdf.drawString(5.7*inch, y + 5, f"{daily_log.certified_at.strftime('%m/%d/%Y')}")
        
        return y - 20
    
    def _draw_totals_table(self, pdf, daily_log):
        """Tableau des totaux en bas à droite"""
        # Position
        table_x = 4.5 * inch
        table_y = 0.8 * inch
        table_width = 3.5 * inch
        table_height = 1.5 * inch
        
        # Bordure principale
        pdf.rect(table_x, table_y, table_width, table_height)
        
        # En-têtes de colonnes
        col_width = table_width / 4
        headers = ["", "70 hour / 8 day", "60 hour / 7 day", "34 hour restart"]
        
        pdf.setFont("Helvetica", 6)
        for i, header in enumerate(headers):
            x = table_x + (i * col_width) + 2
            if header:
                # Texte sur 2 lignes
                parts = header.split(" / ")
                if len(parts) == 2:
                    pdf.drawString(x, table_y + table_height - 8, parts[0])
                    pdf.drawString(x, table_y + table_height - 14, parts[1])
                else:
                    parts = header.split()
                    pdf.drawString(x, table_y + table_height - 8, " ".join(parts[:2]))
                    pdf.drawString(x, table_y + table_height - 14, " ".join(parts[2:]))
            
            # Lignes verticales
            if i > 0:
                pdf.line(table_x + (i * col_width), table_y, 
                        table_x + (i * col_width), table_y + table_height)
        
        # Rangées
        row_labels = ["To date", "Yesterday", "Today", "Total time", "14 HR Rule"]
        row_height = (table_height - 20) / 5
        
        y = table_y + table_height - 20
        for i, label in enumerate(row_labels):
            pdf.setFont("Helvetica", 6)
            pdf.drawString(table_x + 2, y - 8, label)
            
            # Lignes horizontales
            if i > 0:
                pdf.line(table_x, y, table_x + table_width, y)
            
            y -= row_height
        
        # Sous-labels pour les 3 dernières rangées
        pdf.setFont("Helvetica", 5)
        y_sublabels = table_y + (row_height * 2)
        
        sublabels = [
            ["", "", ""],
            ["", "", "", ""],
            ["", ""]
        ]
        
        for i, labels in enumerate(sublabels):
            y_current = y_sublabels - (i * row_height)
            for j, label in enumerate(labels):
                pdf.drawString(table_x + 2, y_current - (j * 6) - 18, label)
        
        # Label spécial pour 14 HR Rule
        pdf.setFont("Helvetica", 5)
        pdf.drawString(table_x + 2, table_y + 8, "")
        pdf.drawString(table_x + 2, table_y + 2, "")
        
        # Labels A, B, C dans les cellules
        pdf.setFont("Helvetica-Bold", 7)
        label_positions = [
            (1, 2, "A:"), (2, 2, "B:"), (3, 2, "C:"),
            (1, 3, "A:"), (2, 3, "B:"), (3, 3, "C:"),
            (1, 4, "A:"), (2, 4, "B:"), (3, 4, "C:")
        ]
        
        for col, row, label in label_positions:
            x = table_x + (col * col_width) + 2
            y = table_y + table_height - 20 - (row * row_height) - 8
            pdf.drawString(x, y, label)


class TripPDFGenerator:
    """Votre générateur de PDF de voyage existant"""
    def generate_trip_pdf(self, trip):
        # Votre code existant qui fonctionne
        pass