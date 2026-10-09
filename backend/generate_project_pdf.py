import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Canvas that computes total pages dynamically and prints 'Page X of Y' in footer"""
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Suppress footer on cover page
        if self._pageNumber > 1:
            # Header
            self.drawString(54, 750, "FedShield-ID — Technical Product Documentation")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 742, letter[0] - 54, 742)
            
            # Footer
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(letter[0] - 54, 36, page_text)
            self.drawString(54, 36, "CONFIDENTIAL — FOR INTERNAL USE ONLY")
            self.line(54, 48, letter[0] - 54, 48)
            
        self.restoreState()

def create_pdf(filename="FedShield_ID_Technical_Documentation.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=72,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom Styles
    primary_color = colors.HexColor("#0891B2")   # Cyan-600
    dark_slate = colors.HexColor("#0F172A")      # Slate-900
    charcoal = colors.HexColor("#334155")        # Slate-700
    grey_text = colors.HexColor("#64748B")       # Slate-500
    bg_light = colors.HexColor("#F8FAFC")        # Slate-50

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=dark_slate,
        spaceAfter=15
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=primary_color,
        spaceAfter=30
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=dark_slate,
        spaceBefore=15,
        spaceAfter=10,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=primary_color,
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=charcoal,
        spaceAfter=8
    )

    body_bold = ParagraphStyle(
        'Body_Bold_Custom',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    callout_style = ParagraphStyle(
        'Callout_Custom',
        parent=body_style,
        fontSize=9,
        leading=13,
        textColor=dark_slate,
        backColor=bg_light,
        borderColor=primary_color,
        borderWidth=1,
        borderPadding=10,
        spaceBefore=10,
        spaceAfter=10,
        borderRadius=4
    )

    story = []

    # ================= PAGE 1: COVER PAGE =================
    story.append(Spacer(1, 100))
    story.append(Paragraph("FedShield-ID", title_style))
    story.append(Paragraph("Privacy-First Identity Trust & Risk-Based Adaptive Authentication Platform for Banking Networks", subtitle_style))
    story.append(Spacer(1, 40))
    
    # Platform highlights table on Cover Page
    data_summary = [
        [Paragraph("<b>Document Version</b>", body_style), Paragraph("1.0.0 (Production Review)", body_style)],
        [Paragraph("<b>Author</b>", body_style), Paragraph("Antigravity AI Platform Architect", body_style)],
        [Paragraph("<b>Target Audience</b>", body_style), Paragraph("Banking SOC Teams, Security Officers, Compliance Auditors", body_style)],
        [Paragraph("<b>Core Concepts</b>", body_style), Paragraph("Post-Quantum Cryptography, Differential Privacy, Federated Learning, Behavioral Biometrics, Shapley Attribution (XAI)", body_style)],
    ]
    t_summary = Table(data_summary, colWidths=[120, 380])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_light),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_summary)
    
    story.append(Spacer(1, 100))
    
    notice_text = "<b>Notice:</b> This document contains confidential system architectural data and technical specifications of FedShield-ID deployment patterns for retail, premium, and savings banking nodes. Unauthorized copying or redistribution is strictly prohibited under banking security compliance regulations."
    story.append(Paragraph(notice_text, callout_style))
    
    story.append(PageBreak())

    # ================= PAGE 2: EXECUTIVE SUMMARY & ARCHITECTURE =================
    story.append(Paragraph("1. Executive Summary", h1_style))
    story.append(Paragraph(
        "Modern banking security is shifting from basic transaction-level fraud checks to <b>continuous identity trust validation</b>. "
        "Legacy architectures fail to detect sophisticated synthetic identities, hijacked sessions, and insider threat data exports. "
        "Furthermore, modern centralized machine learning systems create immense privacy liabilities, pooling raw financial data and violating strict regulatory mandates.",
        body_style
    ))
    story.append(Paragraph(
        "<b>FedShield-ID</b> solves these challenges through a decentralized, privacy-preserving identity trust framework. "
        "By integrating behavioral analytics, device reputation metrics, and post-quantum security, the platform continually computes "
        "an active <b>Identity Trust Score (0-100)</b> for every session. Instead of creating massive data warehouses, FedShield-ID trains "
        "machine learning models locally at distinct banking nodes and aggregates them securely via Privacy-Preserving Federated Learning "
        "and Differential Privacy.",
        body_style
    ))
    
    story.append(Spacer(1, 10))
    story.append(Paragraph("2. System Architecture", h1_style))
    story.append(Paragraph(
        "The FedShield-ID system operates as a distributed multi-layered pipeline across three independent simulated bank nodes "
        "(Bank A: Retail, Bank B: Premium Cards, and Bank C: Savings). The trust verification workflow follows a strict path from "
        "onboarding checks to decentralized compliance ledger indexing:",
        body_style
    ))

    arch_steps = [
        "<b>Onboarding Guardrails</b>: Format checking, disposable domain filters, and synthetic identity score calculation.",
        "<b>Continuous Telemetry Ingestion</b>: Tracking keyboard/mouse dynamics alongside device identifiers and network nodes.",
        "<b>Composite Risk Computation</b>: Trust Scoring Engine evaluating 10 distinct scoring dimensions in real-time.",
        "<b>Adaptive Response (Auth Decisions)</b>: Grading friction levels (Frictionless, OTP, Step-up, Biometric Face, or Hard Block).",
        "<b>Decentralized Aggregation</b>: Banks update the global model collaboratively via Federated Averaging (FedAvg).",
        "<b>Privacy & Encryption</b>: Laplacian noise addition (Differential Privacy) and simulated CRYSTALS-Kyber-768 key encapsulation.",
        "<b>Explainable Audit Trail</b>: Shapley values mapping exact risk attributions with GenAI natural language briefings."
    ]
    for step in arch_steps:
        story.append(Paragraph(f"• {step}", bullet_style))

    story.append(Spacer(1, 15))
    story.append(PageBreak())

    # ================= PAGE 3: DETAILED FEATURE WALKTHROUGH =================
    story.append(Paragraph("3. Detailed Feature Walkthrough", h1_style))
    
    story.append(Paragraph("3.1 Onboarding Verification & Synthetic ID Prevention", h2_style))
    story.append(Paragraph(
        "First-line checks prevent synthetic accounts at creation. The system validates standard Permanent Account Number (PAN) formats, "
        "scans email addresses against known disposable/temporary email domains, and triggers VoIP carrier detection flags. "
        "Any format mismatch or suspicious domain patterns directly reduce the initial <i>Identity Confidence Score</i>.",
        body_style
    ))

    story.append(Paragraph("3.2 Continuous Identity Trust Scoring Engine", h2_style))
    story.append(Paragraph(
        "The platform aggregates 10 distinct telemetry parameters to compute a composite Trust Score (0-100) and its counterpart Risk Score (100 - Trust):",
        body_style
    ))
    
    # Table of Scoring Dimensions
    dimensions_data = [
        [Paragraph("<b>Telemetry Category</b>", body_bold), Paragraph("<b>Weight</b>", body_bold), Paragraph("<b>Description / Penalties</b>", body_bold)],
        [Paragraph("Device Reputation", body_style), Paragraph("10%", body_style), Paragraph("Audits rooted status, emulators, and unrecognized browser signatures.", body_style)],
        [Paragraph("Login Consistency", body_style), Paragraph("10%", body_style), Paragraph("Tracks failed logins; deducts 20% score per failed login window.", body_style)],
        [Paragraph("Geolocation Consistency", body_style), Paragraph("10%", body_style), Paragraph("Logarithmic penalty based on geo-distance drift from primary home location.", body_style)],
        [Paragraph("Transaction Volume Anomaly", body_style), Paragraph("10%", body_style), Paragraph("Flags transaction spikes relative to the historical average profile.", body_style)],
        [Paragraph("Behavioral Biometrics", body_style), Paragraph("20%", body_style), Paragraph("Evaluates keys/min, mouse jitter, and click latency. Identifies bot speeds.", body_style)],
        [Paragraph("Identity Verification Score", body_style), Paragraph("15%", body_style), Paragraph("Onboarding check results (PAN mismatch, disposable email flags).", body_style)],
        [Paragraph("Account Recovery Status", body_style), Paragraph("10%", body_style), Paragraph("Penalizes score if recovery is requested immediately after SIM modifications.", body_style)],
        [Paragraph("Insider Threat Score", body_style), Paragraph("5%", body_style), Paragraph("Deducts trust if administrative activities trigger safety bounds.", body_style)],
        [Paragraph("Active Session Risk", body_style), Paragraph("5%", body_style), Paragraph("Active session duration, IP shifts, and concurrent login signals.", body_style)],
        [Paragraph("Authentication History", body_style), Paragraph("5%", body_style), Paragraph("Historical failed verification penalties and block events.", body_style)]
    ]
    t_dims = Table(dimensions_data, colWidths=[130, 60, 310])
    t_dims.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light]),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    
    # Force headers in table to use white text
    for i in range(3):
        dimensions_data[0][i].style.textColor = colors.white
        
    story.append(t_dims)
    
    story.append(Spacer(1, 10))
    story.append(Paragraph("3.3 Behavioral Biometrics & Bot Detection", h2_style))
    story.append(Paragraph(
        "FedShield-ID analyzes typing dynamics (keys per minute) and mouse movement jitter (standard deviation offsets). "
        "Bots and automated script injections move mouse cursors in perfectly straight lines with zero jitter and perform clicks "
        "with sub-millisecond intervals. If click speed is under 0.05 seconds or mouse jitter drops below 0.1, the system triggers "
        "a <b>Robotic Input</b> signature penalty, immediately slashing the trust score below the critical step-up threshold.",
        body_style
    ))
    
    story.append(PageBreak())

    # ================= PAGE 4: ADAPTIVE AUTH, PQC & FEDERATED LEARNING =================
    story.append(Paragraph("3.4 Adaptive Authentication (Risk-Based Auth)", h2_style))
    story.append(Paragraph(
        "Verdicts are dynamically mapped to trust boundaries. Scores above 90 enable frictionless access. "
        "Scores of 70-90 require a standard SMS/Email OTP. Scores of 50-70 escalate to Step-Up authentication. "
        "Scores of 20-50 prompt a Live Face Verification check to audit active biometric identity, and scores below 20 block access entirely.",
        body_style
    ))

    story.append(Paragraph("3.5 Privacy-Preserving Federated Learning & Differential Privacy", h2_style))
    story.append(Paragraph(
        "Bank nodes train local machine learning classifiers (SGD & Random Forest) on separate SQLite databases. "
        "A central aggregator triggers federated communication rounds, combining local model weights using the Federated Averaging (FedAvg) algorithm. "
        "Before weight submission, banks apply <b>Differential Privacy (DP)</b> by injecting Laplacian noise. This noise addition "
        "is mathematically controlled by a privacy budget (epsilon, $\epsilon$). This ensures that a compromised aggregator "
        "cannot reconstruct private customer data records from the aggregated model parameters.",
        body_style
    ))

    story.append(Paragraph("3.6 Post-Quantum Security (Simulated Crystals-Kyber)", h2_style))
    story.append(Paragraph(
        "During federated weight exchange rounds, weights are encrypted with symmetric AES-256-GCM. "
        "To negotiate these symmetric keys, the platform simulates the post-quantum CRYSTALS-Kyber-768 Key Encapsulation Mechanism (KEM) "
        "over polynomial matrix ring equations ($R_q = Z_q[X]/(X^{256} + 1)$ with $q = 3329$). "
        "The system benchmarks Kyber-768 execution speeds and payload overheads (1184-byte public keys, 1088-byte ciphertexts) "
        "against classical RSA-3072 and ECDH-P256, demonstrating resistance against Shor's algorithm.",
        body_style
    ))

    story.append(Paragraph("3.7 Explainable AI & GenAI Forensics", h2_style))
    story.append(Paragraph(
        "Decisions made by black-box machine learning models are explained using Shapley Additive Explanations (SHAP). "
        "The system computes linear SHAP attributions representing risk shifts (e.g., location deviation shifts risk +24.5%). "
        "These metrics are passed to an automated GenAI incident briefing agent, which compiles readable briefs outlining "
        "identity trust status, primary anomalies detected, and step-by-step mitigation playbooks.",
        body_style
    ))

    story.append(Paragraph("3.8 Identity Risk Ledger & SVG Relationship Graph", h2_style))
    story.append(Paragraph(
        "All clearances stream to a live regional ledger feed. The relationship analyzer links transaction metadata to "
        "construct a relationship knowledge graph. If multiple distinct names share a single device ID or IP address, "
        "the visual graph highlights the cluster, enabling SOC teams to detect collusive financial rings.",
        body_style
    ))
    
    story.append(Spacer(1, 15))
    story.append(PageBreak())

    # ================= PAGE 5: FUTURE ROADMAP =================
    story.append(Paragraph("4. Future Roadmap & Development Plans", h1_style))
    story.append(Paragraph(
        "To take FedShield-ID from a simulated prototype to a production banking framework, the following enhancements "
        "are planned for the future phases of development:",
        body_style
    ))

    roadmap_items = [
        ("<b>True Decentralized Node Deployment</b>",
         "Migrate from a single-machine simulator to independent Docker clusters running across secure remote channels. "
         "Integrate actual gRPC communication channels with Secure Multi-Party Computation (SMPC) layers to coordinate federated rounds between bank nodes."),
        
        ("<b>Production Quantum-Safe Integrations</b>",
         "Transition from simulated CRYSTALS-Kyber logic to native post-quantum cryptographic libraries (such as open-quantum-safe's <i>liboqs</i> "
         "or OpenSSL 3.0's <i>oqs-provider</i>). Build cryptographic fail-safes utilizing hybrid PQC-classical tunnels (e.g., Kyber-ECDH)."),
        
        ("<b>Browser-Level Biometric Telemetry SDK</b>",
         "Develop a lightweight JavaScript SDK for bank portals to capture mouse velocity vectors, scroll speed acceleration, keyboard "
         "flight times, and touch pressure dynamics. Train local deep learning models on these raw data vectors to build unique biometric identity signatures."),
        
        ("<b>Autonomous GenAI Compliance Agent</b>",
         "Connect the incident briefings to actual Large Language Models (LLMs) with Retrieval-Augmented Generation (RAG). "
         "This agent will automatically search banking compliance documents (RBI circulars, KYC guidelines, GDPR frameworks) and auto-draft "
         "Suspicious Transaction Reports (STRs) for direct regulatory submission."),
        
        ("<b>Real-time Graph Database Integration</b>",
         "Replace the SQLite-based graph schema with a production graph database (like Neo4j or Amazon Neptune). "
         "This will support sub-second query speeds for complex relationship lookups and support automated community-detection "
         "algorithms to uncover deep-rooted money laundering rings.")
    ]

    for title, desc in roadmap_items:
        story.append(Paragraph(f"• {title}: {desc}", bullet_style))
        story.append(Spacer(1, 6))

    story.append(Spacer(1, 20))
    story.append(Paragraph("5. Technical Verification & Performance Benchmarks", h1_style))
    story.append(Paragraph(
        "Verification scripts compare the processing latency of post-quantum operations against standard classical handshakes. "
        "While RSA keypairs take significant CPU processing cycles (up to 200ms in python benchmarks), simulated CRYSTALS-Kyber KEM "
        "handshakes compute in less than a millisecond. This enables banking networks to enforce quantum-safe data encapsulation "
        "without introducing latency overheads in real-time transaction processing pipelines.",
        body_style
    ))

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)

if __name__ == "__main__":
    create_pdf()
    print("PDF Generated successfully.")
