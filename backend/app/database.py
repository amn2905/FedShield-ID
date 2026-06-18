import os
import json
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, Float, String, Boolean, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fedshield.db")
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    bank = Column(String(50), nullable=False) # Bank A, Bank B, Bank C
    timestamp = Column(DateTime, default=datetime.utcnow)
    amount = Column(Float, nullable=False)
    merchant = Column(String(100), nullable=False)
    distance_from_home = Column(Float, nullable=False)
    device_trust_score = Column(Float, nullable=False)
    location_deviation = Column(Float, nullable=False)
    is_synthetic = Column(Boolean, default=False)
    trust_score = Column(Float, nullable=False)
    risk_score = Column(Float, nullable=False)
    prediction = Column(Integer, default=0) # 0 = Legitimate, 1 = Fraud
    is_flagged = Column(Boolean, default=False)
    xai_explanation = Column(Text, nullable=True) # JSON with SHAP and natural text explanation
    
    # 2.0 Additions: Multi-Factor Fraud & Biometrics
    fraud_type = Column(String(50), default="None") # Credit Card, Account Takeover, Money Laundering, Synthetic ID, Bot Attack
    confidence_score = Column(Float, default=95.0)
    device_id = Column(String(100), default="dev_unknown")
    ip_address = Column(String(50), default="127.0.0.1")
    pan_number = Column(String(20), default="UNKNOWN")
    customer_name = Column(String(100), default="Walk-in Client")
    typing_speed = Column(Float, default=120.0) # Keys per minute
    mouse_jitter = Column(Float, default=1.5) # standard deviation pixel offset
    click_speed = Column(Float, default=0.25) # average seconds between clicks
    failed_login_count = Column(Integer, default=0)

    # 3.0 Additions: FedShield-ID Identity Trust metrics
    identity_confidence_score = Column(Float, default=95.0)
    kyc_risk_score = Column(Float, default=5.0)
    synthetic_identity_score = Column(Float, default=5.0)
    recovery_risk_score = Column(Float, default=5.0)
    insider_risk_score = Column(Float, default=0.0)
    auth_action = Column(String(50), default="Allow") # Allow, OTP, Step-Up, Block
    auth_reason = Column(String(255), default="Optimal behavioral score.")
    phone_number = Column(String(50), default="+91 98765 43210")
    email_address = Column(String(100), default="customer@bank.com")

class UserProfile(Base):
    __tablename__ = "user_profiles"

    customer_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_name = Column(String(100), nullable=False)
    pan_number = Column(String(20), nullable=False)
    trust_score = Column(Float, default=90.0)
    risk_score = Column(Float, default=10.0)
    device_reputation = Column(Float, default=95.0)
    login_consistency = Column(Float, default=98.0)
    avg_typing_speed = Column(Float, default=110.0)
    avg_click_speed = Column(Float, default=0.3)
    avg_mouse_jitter = Column(Float, default=1.8)
    risk_category = Column(String(50), default="Trusted") # Trusted, Low Risk, Medium Risk, High Risk
    updated_at = Column(DateTime, default=datetime.utcnow)

    # 3.0 Additions for Identity Verification & Recovery
    identity_confidence_score = Column(Float, default=95.0)
    recovery_risk_score = Column(Float, default=5.0)
    insider_risk_score = Column(Float, default=0.0)
    phone_number = Column(String(50), default="+91 98765 43210")
    email_address = Column(String(100), default="customer@bank.com")
    auth_history_json = Column(Text, default="[]") # JSON list of login attempts

class EmployeeActivityLog(Base):
    __tablename__ = "employee_activity_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    employee_id = Column(String(50), nullable=False)
    employee_name = Column(String(100), nullable=False)
    action = Column(String(100), nullable=False) # Login, DB Query, Large File Download, Privilege Escalation
    resource = Column(String(100), nullable=False) # e.g. customer_database, ledger_tables
    ip_address = Column(String(50), default="10.0.12.3")
    device_id = Column(String(100), default="dev_bank_desktop")
    is_suspicious = Column(Boolean, default=False)
    risk_score = Column(Float, default=0.0)
    details = Column(Text, nullable=True)

class GraphNode(Base):
    __tablename__ = "graph_nodes"

    id = Column(String(100), primary_key=True) # e.g. "CUST_1", "DEV_A", "IP_10.0.0.1", "PAN_1234"
    label = Column(String(50), nullable=False) # Customer, Device, IP, PAN, Merchant, Phone, Email, Employee, Account
    properties_json = Column(Text, default="{}") # JSON properties

class GraphEdge(Base):
    __tablename__ = "graph_edges"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source = Column(String(100), nullable=False)
    target = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False) # OWNS, USED_BY, TRANSACTED_WITH, LINKED_TO

class FederatedRound(Base):
    __tablename__ = "federated_rounds"

    round_number = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    global_accuracy = Column(Float, nullable=False)
    global_loss = Column(Float, nullable=False)
    bank_a_accuracy = Column(Float, nullable=False)
    bank_b_accuracy = Column(Float, nullable=False)
    bank_c_accuracy = Column(Float, nullable=False)
    privacy_budget_epsilon = Column(Float, nullable=False)
    noise_added = Column(Float, nullable=False)
    encryption_mode = Column(String(50), default="PQC")
    metrics_json = Column(Text, nullable=True)

class SecurityLog(Base):
    __tablename__ = "security_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    node_name = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)
    algorithm = Column(String(100), nullable=False)
    bytes_transmitted = Column(Integer, default=0)
    execution_time_ms = Column(Float, default=0.0)
    encryption_status = Column(String(50), default="Success")
    details = Column(Text, nullable=True)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
