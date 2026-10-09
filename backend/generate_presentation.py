import os
import sys
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

class PresentationCanvas(canvas.Canvas):
    """Custom Canvas for post-processing page count and drawing slide counter on top"""
    def __init__(self, *args, **kwargs):
        super(PresentationCanvas, self).__init__(*args, **kwargs)
        self.pages = []

    def showPage(self):
        self.pages.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        page_count = len(self.pages)
        for page in self.pages:
            self.__dict__.update(page)
            if self._pageNumber > 1:
                self.saveState()
                w, h = self._pagesize
                self.setFont("Helvetica-Bold", 8)
                self.setFillColor(colors.HexColor("#64748B"))
                self.drawRightString(w - 40, 30, f"Slide {self._pageNumber - 1} of {page_count - 1}")
                self.restoreState()
            super(PresentationCanvas, self).showPage()
        super(PresentationCanvas, self).save()

def draw_first_page(canvas, doc):
    """Draw solid background for title page before flowables are placed"""
    canvas.saveState()
    w, h = doc.pagesize
    canvas.setFillColor(colors.HexColor("#020617"))
    canvas.rect(0, 0, w, h, fill=True, stroke=False)
    canvas.restoreState()

def draw_later_page(canvas, doc):
    """Draw solid background and panel lines for slide pages before flowables are placed"""
    canvas.saveState()
    w, h = doc.pagesize
    
    # Solid background
    canvas.setFillColor(colors.HexColor("#020617"))
    canvas.rect(0, 0, w, h, fill=True, stroke=False)
    
    # Header horizontal separator
    canvas.setStrokeColor(colors.HexColor("#1E293B"))
    canvas.setLineWidth(1)
    canvas.line(40, h - 50, w - 40, h - 50)
    
    # Header branding title
    canvas.setFont("Helvetica-Bold", 8)
    canvas.setFillColor(colors.HexColor("#64748B"))
    canvas.drawString(40, h - 42, "FEDSHIELD-ID  //  HACKATHON PRODUCT PITCH")
    
    # Footer horizontal separator
    canvas.line(40, 45, w - 40, 45)
    
    # Footer branding label
    canvas.drawString(40, 30, "CONFIDENTIAL  |  PRIVACY-FIRST BANKING IDENTITY TRUST")
    canvas.restoreState()

def create_presentation_pdf(filename="FedShield_ID_Presentation_Slides.pdf"):
    # Target landscape size
    doc = SimpleDocTemplate(
        filename,
        pagesize=landscape(letter),
        leftMargin=40,
        rightMargin=40,
        topMargin=65,
        bottomMargin=60
    )

    styles = getSampleStyleSheet()
    
    # Custom Color Palette
    primary_color = colors.HexColor("#22D3EE")   # Cyan-400
    accent_color = colors.HexColor("#C084FC")    # Purple-400
    text_white = colors.HexColor("#F8FAFC")      # Slate-50
    text_slate = colors.HexColor("#94A3B8")      # Slate-400
    red_accent = colors.HexColor("#F87171")      # Red-400
    green_accent = colors.HexColor("#34D399")    # Emerald-400
    bg_panel = colors.HexColor("#0F172A")        # Slate-900

    # Styles
    title_style = ParagraphStyle(
        'SlideTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=primary_color,
        spaceAfter=15,
        keepWithNext=True
    )

    col_header_red = ParagraphStyle(
        'ColHeaderRed',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=red_accent,
        spaceAfter=10,
        keepWithNext=True
    )

    col_header_green = ParagraphStyle(
        'ColHeaderGreen',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=green_accent,
        spaceAfter=10,
        keepWithNext=True
    )

    col_header_purple = ParagraphStyle(
        'ColHeaderPurple',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=accent_color,
        spaceAfter=10,
        keepWithNext=True
    )

    body_text = ParagraphStyle(
        'SlideBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14.5,
        textColor=text_white,
        spaceAfter=8
    )

    bullet_text = ParagraphStyle(
        'SlideBullet',
        parent=body_text,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=6
    )

    story = []

    # ================= PAGE 1: TITLE SLIDE =================
    story.append(Spacer(1, 100))
    
    cover_title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=36,
        leading=42,
        textColor=primary_color,
        spaceAfter=10,
        alignment=1 # Centered
    )
    
    cover_sub_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=text_white,
        spaceAfter=40,
        alignment=1 # Centered
    )
    
    cover_meta_style = ParagraphStyle(
        'CoverMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=14,
        textColor=text_slate,
        alignment=1 # Centered
    )

    story.append(Paragraph("FedShield-ID", cover_title_style))
    story.append(Paragraph("Privacy-First Identity Trust Platform for Banking Networks", cover_sub_style))
    story.append(Spacer(1, 20))
    story.append(Paragraph("<b>Hackathon Pitch Deck</b><br/>Topic: Cybersecurity & Privacy-Preserving AI in Financial Tech", cover_meta_style))
    
    story.append(PageBreak())

    # ================= SLIDE 1: PROBLEM & SOLUTION =================
    story.append(Paragraph("Slide 1: Problem & Solution", title_style))
    
    left_flow = []
    left_flow.append(Paragraph("The Challenge in Banking Systems", col_header_red))
    left_flow.append(Paragraph("• <b>Identity Silos & Centralization</b>: Legacy architectures pool raw customer PII. This violates banking regulations and creates massive data breach liabilities.", bullet_text))
    left_flow.append(Paragraph("• <b>Synthetic ID & Account Takeovers</b>: Fraudsters bypass static onboarding checks and hijack account recovery channels (e.g. SIM swaps) before transactions occur.", bullet_text))
    left_flow.append(Paragraph("• <b>Robotic Sweeps</b>: Credential stuffing attacks utilize automated bot scripts, mimicking standard logins but clicking in sub-millisecond rates.", bullet_text))

    right_flow = []
    right_flow.append(Paragraph("The FedShield-ID Approach", col_header_green))
    right_flow.append(Paragraph("• <b>Decentralized Machine Learning</b>: Models are trained locally at individual banking nodes without data pooling. Global models are merged via secure FedAvg federated rounds.", bullet_text))
    right_flow.append(Paragraph("• <b>Continuous Multi-Dimension Scoring</b>: Aggregates 10 scoring parameters (reputation, location, biometrics, insider activity) into an active trust score (0-100).", bullet_text))
    right_flow.append(Paragraph("• <b>Risk-Based Step-Up Challenges</b>: Triggers dynamic security checks (like Biometric Face ID) only when scoring parameters indicate risk anomalies.", bullet_text))

    # Grid layout Table
    table_data_1 = [[left_flow, right_flow]]
    t1 = Table(table_data_1, colWidths=[346, 346])
    t1.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,0), (0,0), bg_panel),
        ('BACKGROUND', (1,0), (1,0), bg_panel),
        ('PADDING', (0,0), (-1,-1), 15),
        ('BOX', (0,0), (0,0), 1, colors.HexColor("#334155")),
        ('BOX', (1,0), (1,0), 1, colors.HexColor("#334155")),
        ('BOTTOMPADDING', (0,0), (-1,-1), 25),
    ]))
    
    story.append(t1)
    story.append(PageBreak())

    # ================= SLIDE 2: TECHNOLOGY & INNOVATION =================
    story.append(Paragraph("Slide 2: Technology & Innovation", title_style))
    
    left_flow_2 = []
    left_flow_2.append(Paragraph("System Architecture & Tech Stack", col_header_purple))
    left_flow_2.append(Paragraph("• <b>Backend Framework</b>: FastAPI microservices coupled with SQLAlchemy ORM running on SQLite/PostgreSQL databases.", bullet_text))
    left_flow_2.append(Paragraph("• <b>Machine Learning Core</b>: Scikit-Learn (SGD & Random Forest) for local classification, coupled with linear SHAP explainer code for XAI.", bullet_text))
    left_flow_2.append(Paragraph("• <b>Interactive SOC Interface</b>: React 18 frontend built with Tailwind CSS, SVG linkage charts (Knowledge Graph), and live streaming transaction ledgers.", bullet_text))

    right_flow_2 = []
    right_flow_2.append(Paragraph("Core Cryptography & Telemetry", col_header_purple))
    right_flow_2.append(Paragraph("• <b>Post-Quantum KEM Tunnels</b>: CRYSTALS-Kyber-768 key encapsulation matrix polynomial equations to secure node-to-node communications.", bullet_text))
    right_flow_2.append(Paragraph("• <b>Differential Privacy (DP)</b>: Laplacian noise addition to local model parameters controlled by a privacy budget (epsilon, \\e) to prevent database leaking.", bullet_text))
    right_flow_2.append(Paragraph("• <b>Behavioral Biometrics</b>: Live tracking of keystrokes/minute and mouse jitter standard deviation to stop headless browsers.", bullet_text))

    table_data_2 = [[left_flow_2, right_flow_2]]
    t2 = Table(table_data_2, colWidths=[346, 346])
    t2.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,0), (0,0), bg_panel),
        ('BACKGROUND', (1,0), (1,0), bg_panel),
        ('PADDING', (0,0), (-1,-1), 15),
        ('BOX', (0,0), (0,0), 1, colors.HexColor("#334155")),
        ('BOX', (1,0), (1,0), 1, colors.HexColor("#334155")),
        ('BOTTOMPADDING', (0,0), (-1,-1), 25),
    ]))
    
    story.append(t2)
    story.append(PageBreak())

    # ================= SLIDE 3: SCALABILITY & DEPLOYMENT =================
    story.append(Paragraph("Slide 3: Scalability & Deployment", title_style))
    
    left_flow_3 = []
    left_flow_3.append(Paragraph("Ecosystem Integration & Feasibility", col_header_purple))
    left_flow_3.append(Paragraph("• <b>Asynchronous Telemetry Ingestion</b>: Feeds telemetry data in background threads without interfering with main database queries.", bullet_text))
    left_flow_3.append(Paragraph("• <b>Sub-Millisecond Overhead</b>: Crystals-Kyber simulated KEM and local SHAP mathematical computations run in microsecond scales, preserving transaction velocity.", bullet_text))
    left_flow_3.append(Paragraph("• <b>Containerized Orchestration</b>: Docker-compose setup makes local deployment reproducible across test nodes and cloud platforms.", bullet_text))

    right_flow_3 = []
    right_flow_3.append(Paragraph("Platform Impact & Scale", col_header_purple))
    right_flow_3.append(Paragraph("• <b>Privacy compliance</b>: Meets strict international privacy regulations (GDPR, RBI banking privacy criteria) by removing the centralized data lake.", bullet_text))
    right_flow_3.append(Paragraph("• <b>Mitigation Playbooks</b>: Incident response times are reduced using automated GenAI security briefings for SOC operators.", bullet_text))
    right_flow_3.append(Paragraph("• <b>Money Laundering Prevention</b>: SVG Knowledge Graph identifies account clusters linked to shared compromised devices or VPN nodes.", bullet_text))

    table_data_3 = [[left_flow_3, right_flow_3]]
    t3 = Table(table_data_3, colWidths=[346, 346])
    t3.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,0), (0,0), bg_panel),
        ('BACKGROUND', (1,0), (1,0), bg_panel),
        ('PADDING', (0,0), (-1,-1), 15),
        ('BOX', (0,0), (0,0), 1, colors.HexColor("#334155")),
        ('BOX', (1,0), (1,0), 1, colors.HexColor("#334155")),
        ('BOTTOMPADDING', (0,0), (-1,-1), 25),
    ]))
    
    story.append(t3)
    story.append(PageBreak())

    # ================= SLIDE 4: TEAM & EXECUTION PLAN =================
    story.append(Paragraph("Slide 4: Team & Execution Plan", title_style))
    
    left_flow_4 = []
    left_flow_4.append(Paragraph("Team Roles & Structure", col_header_purple))
    left_flow_4.append(Paragraph("• <b>AI/ML Architect (Mohd. Amaan Hamid)</b>: Handles federated averages, differential privacy, local ML training models, and SHAP explainability variables.", bullet_text))
    left_flow_4.append(Paragraph("• <b>Security Engineering</b>: Configures simulated crystals-kyber KEM, benchmark evaluations, and insider threat audit parameters.", bullet_text))
    left_flow_4.append(Paragraph("• <b>Web Dashboard Engineer</b>: Designs React frontend panels, responsive Tailwind styling, and live-streaming ledgers.", bullet_text))

    right_flow_4 = []
    right_flow_4.append(Paragraph("Development Roadmap & Milestones", col_header_purple))
    right_flow_4.append(Paragraph("• <b>Milestone 1 (Current)</b>: Completed local prototype running 3 banks with live simulator, SVG knowledge graph, and inline XAI drawer.", bullet_text))
    right_flow_4.append(Paragraph("• <b>Milestone 2 (Q3)</b>: Deploy independent containerized bank nodes in clouds and configure multi-channel secure gRPC threads.", bullet_text))
    right_flow_4.append(Paragraph("• <b>Milestone 3 (Q4)</b>: Integrate production liboqs library files and package browser-level keyboard/mouse biometrics SDK.", bullet_text))

    table_data_4 = [[left_flow_4, right_flow_4]]
    t4 = Table(table_data_4, colWidths=[346, 346])
    t4.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,0), (0,0), bg_panel),
        ('BACKGROUND', (1,0), (1,0), bg_panel),
        ('PADDING', (0,0), (-1,-1), 15),
        ('BOX', (0,0), (0,0), 1, colors.HexColor("#334155")),
        ('BOX', (1,0), (1,0), 1, colors.HexColor("#334155")),
        ('BOTTOMPADDING', (0,0), (-1,-1), 25),
    ]))
    
    story.append(t4)

    # Build Document
    doc.build(
        story, 
        onFirstPage=draw_first_page, 
        onLaterPages=draw_later_page, 
        canvasmaker=PresentationCanvas
    )

if __name__ == "__main__":
    create_presentation_pdf()
    print("Presentation PDF Generated successfully.")
