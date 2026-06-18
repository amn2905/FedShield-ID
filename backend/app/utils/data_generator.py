import random
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import Transaction, UserProfile, EmployeeActivityLog
from app.utils.graph_builder import GraphBuilder
from app.identity.identity_verification import IdentityVerifier
from app.security.adaptive_auth import AdaptiveAuthenticator
from app.security.account_recovery import AccountRecoveryEngine
from app.security.insider_threat import InsiderThreatMonitor
from app.ml.trust_score import TrustScoreEngine

# Set seed for reproducibility
np.random.seed(42)
random.seed(42)

MERCHANTS = [
    "Amazon Tech", "Walmart Supercenter", "Starbucks Coffee", "Apple Store", 
    "Target Retail", "Shell Gasoline", "McDonalds", "Steam Games", 
    "Uber Ride", "Netflix Subscription", "Gucci Luxury", "BestBuy Electronics",
    "Nordstrom", "Delta Airlines", "Hilton Hotels", "Chevron Fuel"
]

CUSTOMER_NAMES = [
    "Amaan Sharma", "Neha Patel", "Vikram Singh", "Sanjay Dutt", "Anita Desai",
    "Rohan Gupta", "Priya Nair", "Karan Johar", "Deepika Padukone", "Amit Shah",
    "Suresh Raina", "Meera Sen", "Vijay Mallya", "Kiran Mazumdar", "Aditya Birla"
]

PAN_NUMBERS = [
    "APXPS1234F", "BPXPS5678G", "CPXPS9012H", "DPXPS3456I", "EPXPS7890J",
    "FPXPS1357K", "GPXPS2468L", "HPXPS9753M", "IPXPS8642N", "JPXPS7531O",
    "KPXPS2345P", "LPXPS6789Q", "MPXPS4567R", "NPXPS8901S", "OPXPS9012T"
]

IP_ADDRESSES = [
    "103.45.12.89", "185.220.101.4", "192.168.1.105", "103.45.12.90", "157.45.18.23",
    "24.12.89.102", "185.45.2.14", "102.15.19.88", "192.168.1.106", "103.45.12.91"
]

DEVICES = [
    "iPhone 15 Pro", "Samsung S20 Rooted", "MacBook Pro M3", "Windows 11 PC", 
    "Pixel 8 Pro", "OnePlus 12", "iPad Pro", "Lenovo ThinkPad"
]

CARRIERS = ["Airtel", "Jio", "Vodafone", "BSNL"]

def generate_bank_transactions(bank_name: str, count: int) -> pd.DataFrame:
    """
    Generates realistic synthetic transactions with behavioral biometrics,
    adaptive authentication evaluations, and identity checks.
    """
    data = []
    
    # Establish baseline characteristics based on the bank
    if bank_name == "Bank A":
        avg_amount = 80.0
        std_amount = 50.0
        fraud_rate = 0.05
    elif bank_name == "Bank B":
        avg_amount = 350.0
        std_amount = 250.0
        fraud_rate = 0.08
    else: # Bank C
        avg_amount = 25.0
        std_amount = 15.0
        fraud_rate = 0.04

    base_time = datetime.utcnow() - timedelta(days=3)

    for i in range(count):
        time_offset = random.uniform(0, 3 * 24 * 60) # 3 days in minutes
        tx_time = base_time + timedelta(minutes=time_offset)
        
        is_fraud = np.random.choice([0, 1], p=[1 - fraud_rate, fraud_rate])
        
        cust_idx = random.randint(0, len(CUSTOMER_NAMES) - 1)
        customer_name = CUSTOMER_NAMES[cust_idx]
        pan_number = PAN_NUMBERS[cust_idx]
        ip_address = random.choice(IP_ADDRESSES)
        device_id = f"dev_{hash(random.choice(DEVICES)) % 100000:05d}"
        
        # Identity parameters
        name_part = customer_name.lower().replace(" ", ".")
        email_address = f"{name_part}@gmail.com"
        phone_number = f"+91 9{random.randint(70000, 99999)} {random.randint(10000, 99999)}"
        
        # Biometric defaults
        typing_speed = float(np.random.normal(loc=120.0, scale=15.0))
        mouse_jitter = float(np.random.uniform(1.2, 2.5))
        click_speed = float(np.random.uniform(0.2, 0.45))
        failed_login_count = 0
        fraud_type = "None"
        
        is_synthetic = False
        is_new_device = False
        is_new_location = False
        attempts_count = 1
        sim_swap_days = 45
        hour_of_day = random.randint(8, 18)
        download_size_mb = random.uniform(0.1, 5.0)
        escalation_attempt = False
        
        if is_fraud == 1:
            amount = float(np.random.exponential(scale=avg_amount * 3.5) + (avg_amount * 1.5))
            distance_from_home = float(np.random.uniform(50, 1500))
            device_trust_score = float(np.random.uniform(0, 45))
            location_deviation = float(np.random.uniform(2.5, 5.0))
            
            fraud_type = np.random.choice([
                "Credit Card Fraud", 
                "Account Takeover", 
                "Synthetic Identity Fraud", 
                "Bot Attack", 
                "Money Laundering"
            ])
            
            if fraud_type == "Account Takeover":
                failed_login_count = random.randint(3, 5)
                typing_speed = float(np.random.normal(loc=210.0, scale=30.0))
                mouse_jitter = float(np.random.uniform(4.5, 7.5))
                is_new_device = True
                is_new_location = True
                attempts_count = random.randint(3, 6)
                sim_swap_days = random.randint(0, 2)
            elif fraud_type == "Bot Attack":
                typing_speed = 450.0
                mouse_jitter = 0.01
                click_speed = 0.02
                device_id = "dev_headless_chrome"
            elif fraud_type == "Synthetic Identity Fraud":
                is_synthetic = True
                mismatch_idx = (cust_idx + 3) % len(CUSTOMER_NAMES)
                pan_number = PAN_NUMBERS[mismatch_idx]
                device_id = "dev_shared_mutant"
                email_address = f"{name_part}@tempmail.com"
                phone_number = f"+91 91000 {random.randint(10000, 99999)}"
            
            is_synthetic = (fraud_type == "Synthetic Identity Fraud")
        else:
            amount = max(5.0, float(np.random.normal(loc=avg_amount, scale=std_amount)))
            distance_from_home = float(np.random.exponential(scale=12.0))
            device_trust_score = float(np.random.uniform(75, 100))
            location_deviation = float(np.random.uniform(0.0, 1.1))
            is_synthetic = False

        # --- Evaluate Identity Verification ---
        id_verify_data = {
            "customer_name": customer_name,
            "pan_number": pan_number,
            "email_address": email_address,
            "phone_number": phone_number,
            "device_id": device_id,
            "ip_address": ip_address,
            "is_synthetic": is_synthetic
        }
        id_results = IdentityVerifier.verify_identity(id_verify_data)
        
        # --- Evaluate Account Recovery ---
        recovery_data = {
            "is_new_device": is_new_device,
            "is_new_location": is_new_location,
            "attempts_count": attempts_count,
            "sim_swap_days": sim_swap_days,
            "failed_login_window": failed_login_count
        }
        rec_results = AccountRecoveryEngine.assess_recovery_attempt(recovery_data)
        
        # --- Evaluate Insider Risk ---
        insider_data = {
            "action": "Login" if not is_synthetic else "DB Query",
            "resource": "ledger" if not is_synthetic else "customer_PII_vault",
            "hour_of_day": hour_of_day,
            "download_size_mb": download_size_mb,
            "escalation_attempt": escalation_attempt
        }
        insider_results = InsiderThreatMonitor.evaluate_insider_activity(insider_data)
        
        # --- Session Risk Calculation ---
        biometric_flags = []
        if typing_speed > 300.0 or mouse_jitter < 0.1:
            biometric_flags.append("Robotic Input")
        session_risk = AdaptiveAuthenticator.assess_session_risk(device_id, ip_address, biometric_flags)
        
        # --- Identity Trust Score Calculation ---
        trust_inputs = {
            "device_trust_score": device_trust_score,
            "failed_login_count": failed_login_count,
            "distance_from_home": distance_from_home,
            "amount": amount,
            "avg_amount": avg_amount,
            "typing_speed": typing_speed,
            "mouse_jitter": mouse_jitter,
            "click_speed": click_speed,
            "identity_confidence_score": id_results["identity_confidence_score"],
            "recovery_risk_score": rec_results["recovery_risk_score"],
            "insider_risk_score": insider_results["insider_risk_score"],
            "session_risk_score": session_risk,
            "auth_penalty": 20.0 * failed_login_count
        }
        trust_results = TrustScoreEngine.calculate_scores(trust_inputs)
        
        # --- Adaptive Authentication Decision ---
        auth_results = AdaptiveAuthenticator.evaluate_auth_level(trust_results["trust_score"], session_risk)
        
        prediction = 1 if trust_results["trust_score"] < 50.0 else 0
        is_flagged = prediction == 1
        confidence_score = float(np.random.uniform(82.0, 99.5))
        
        data.append({
            "bank": bank_name,
            "timestamp": tx_time,
            "amount": round(amount, 2),
            "merchant": random.choice(MERCHANTS),
            "distance_from_home": round(distance_from_home, 2),
            "device_trust_score": round(device_trust_score, 2),
            "location_deviation": round(location_deviation, 2),
            "is_synthetic": is_synthetic,
            "trust_score": trust_results["trust_score"],
            "risk_score": trust_results["risk_score"],
            "prediction": prediction,
            "is_flagged": is_flagged,
            "fraud_type": fraud_type,
            "confidence_score": round(confidence_score, 2),
            "device_id": device_id,
            "ip_address": ip_address,
            "pan_number": pan_number,
            "customer_name": customer_name,
            "typing_speed": round(typing_speed, 2),
            "mouse_jitter": round(mouse_jitter, 2),
            "click_speed": round(click_speed, 3),
            "failed_login_count": failed_login_count,
            
            # FedShield-ID Identity Columns
            "identity_confidence_score": id_results["identity_confidence_score"],
            "kyc_risk_score": id_results["kyc_risk_score"],
            "synthetic_identity_score": id_results["synthetic_identity_score"],
            "recovery_risk_score": rec_results["recovery_risk_score"],
            "insider_risk_score": insider_results["insider_risk_score"],
            "auth_action": auth_results["authentication_action"],
            "auth_reason": auth_results["decision_reason"],
            "phone_number": phone_number,
            "email_address": email_address
        })
        
    return pd.DataFrame(data)

def seed_db_with_transactions(db: Session, total_per_bank: int = 1000):
    """
    Seeds transactions, user profiles, employee threat logs, and the relation graph.
    """
    existing_count = db.query(Transaction).count()
    if existing_count > 0:
        return
    
    print("Database empty. Seeding identity trust data...")
    for bank_name in ["Bank A", "Bank B", "Bank C"]:
        df = generate_bank_transactions(bank_name, total_per_bank)
        
        transactions_to_insert = []
        for _, row in df.iterrows():
            tx = Transaction(
                bank=row["bank"],
                timestamp=row["timestamp"],
                amount=row["amount"],
                merchant=row["merchant"],
                distance_from_home=row["distance_from_home"],
                device_trust_score=row["device_trust_score"],
                location_deviation=row["location_deviation"],
                is_synthetic=bool(row["is_synthetic"]),
                trust_score=row["trust_score"],
                risk_score=row["risk_score"],
                prediction=int(row["prediction"]),
                is_flagged=bool(row["is_flagged"]),
                fraud_type=row["fraud_type"],
                confidence_score=row["confidence_score"],
                device_id=row["device_id"],
                ip_address=row["ip_address"],
                pan_number=row["pan_number"],
                customer_name=row["customer_name"],
                typing_speed=row["typing_speed"],
                mouse_jitter=row["mouse_jitter"],
                click_speed=row["click_speed"],
                failed_login_count=row["failed_login_count"],
                xai_explanation=None,
                
                # New identity columns
                identity_confidence_score=row["identity_confidence_score"],
                kyc_risk_score=row["kyc_risk_score"],
                synthetic_identity_score=row["synthetic_identity_score"],
                recovery_risk_score=row["recovery_risk_score"],
                insider_risk_score=row["insider_risk_score"],
                auth_action=row["auth_action"],
                auth_reason=row["auth_reason"],
                phone_number=row["phone_number"],
                email_address=row["email_address"]
            )
            transactions_to_insert.append(tx)
            
        db.bulk_save_objects(transactions_to_insert)
        db.commit()
        
    # Seed User Profiles
    print("Seeding customer identity profiles...")
    for idx, name in enumerate(CUSTOMER_NAMES):
        t_score = float(np.random.uniform(75.0, 98.0)) if idx != 3 else 22.0 # Sanjay Dutt is high risk
        r_score = 100.0 - t_score
        
        id_conf = float(np.random.uniform(85.0, 99.0)) if idx != 3 else 35.0
        rec_risk = float(np.random.uniform(0.0, 15.0)) if idx != 3 else 75.0
        ins_risk = 0.0 if idx != 3 else 45.0
        
        category = "Trusted"
        if t_score < 50.0:
            category = "High Risk"
        elif t_score < 70.0:
            category = "Medium Risk"
        elif t_score < 90.0:
            category = "Low Risk"
            
        name_part = name.lower().replace(" ", ".")
        
        profile = UserProfile(
            customer_name=name,
            pan_number=PAN_NUMBERS[idx],
            trust_score=round(t_score, 2),
            risk_score=round(r_score, 2),
            device_reputation=round(float(np.random.uniform(80.0, 100.0)), 2),
            login_consistency=round(float(np.random.uniform(85.0, 100.0)), 2),
            avg_typing_speed=120.0,
            avg_click_speed=0.25,
            avg_mouse_jitter=1.5,
            risk_category=category,
            
            # Identity Verification parameters
            identity_confidence_score=round(id_conf, 2),
            recovery_risk_score=round(rec_risk, 2),
            insider_risk_score=round(ins_risk, 2),
            phone_number=f"+91 98765 {idx:05d}",
            email_address=f"{name_part}@gmail.com",
            auth_history_json=json.dumps([
                {"timestamp": str(datetime.utcnow() - timedelta(hours=i*6)), "action": "Allow", "reason": "Trusted telemetry validated."}
                for i in range(5)
            ])
        )
        db.add(profile)
    db.commit()
    
    # Seed Employee activity logs (Insider Threat logs)
    print("Seeding employee privileged audit trails...")
    employees = [
        ("EMP_102", "Suresh Kumar", "Teller", "Login", "internal_dashboard", False, 0.0, 10, "Normal portal auth"),
        ("EMP_102", "Suresh Kumar", "Teller", "Access Record", "customer_file_#18", False, 0.0, 11, "Cleared cardholder query"),
        ("EMP_205", "Rajesh Sen", "SysAdmin", "Login", "database_console", True, 20.0, 2, "Late night console auth outside shift"),
        ("EMP_205", "Rajesh Sen", "SysAdmin", "DB Export", "customer_PII_vault", True, 85.0, 3, "Bulk SQLite copy download (1,240 MB)"),
        ("EMP_205", "Rajesh Sen", "SysAdmin", "Access Override", "security_keys_db", True, 90.0, 4, "Root access escalation attempt failed"),
        ("EMP_311", "Sunita Rao", "Auditor", "Login", "compliance_portal", False, 5.0, 9, "Standard weekly compliance assessment"),
    ]
    for emp_id, name, role, action, resource, susp, risk, hr, det in employees:
        log = EmployeeActivityLog(
            timestamp=datetime.utcnow() - timedelta(hours=random.randint(1, 48)),
            employee_id=emp_id,
            employee_name=name,
            action=action,
            resource=resource,
            ip_address="10.0.12.3" if not susp else "185.220.101.4",
            device_id="dev_bank_desktop" if not susp else "dev_rooted_laptop_outside",
            is_suspicious=susp,
            risk_score=risk,
            details=f"Role: {role}. Details: {det}"
        )
        db.add(log)
    db.commit()
    
    # Seed Knowledge Graph
    print("Seeding identity knowledge graph...")
    GraphBuilder.seed_graph(db)
    
    print("Database seeding completed.")
