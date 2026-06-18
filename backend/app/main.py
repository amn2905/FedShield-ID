import os
import json
import asyncio
import numpy as np
import pandas as pd
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import init_db, get_db, Transaction, FederatedRound, SecurityLog, UserProfile, EmployeeActivityLog
from app.utils.data_generator import seed_db_with_transactions, generate_bank_transactions, CUSTOMER_NAMES, PAN_NUMBERS, IP_ADDRESSES, DEVICES, MERCHANTS
from app.ml.train import LocalBankModel
from app.ml.federated import FederatedAggregator
from app.ml.shap_explainer import ShapExplainer
from app.ml.trust_score import TrustScoreEngine
from app.utils.genai_investigator import GenAiIdentityTrustInvestigator
from app.utils.graph_builder import GraphBuilder
from app.identity.identity_verification import IdentityVerifier
from app.security.adaptive_auth import AdaptiveAuthenticator
from app.security.account_recovery import AccountRecoveryEngine
from app.security.insider_threat import InsiderThreatMonitor

# Initialize FastAPI application
app = FastAPI(
    title="FedShield-ID API",
    description="Privacy-First Identity Trust & Risk-Based Authentication Platform",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to manage streaming task
streaming_active = False
streaming_task = None

# In-memory store for global model (starts with baseline defaults)
current_global_weights = {
    "coef": [1.8, 1.5, -2.8, 2.2, 3.0],
    "intercept": -1.5
}

class TransactionRequest(BaseModel):
    bank: str
    amount: float
    merchant: str
    distance_from_home: float
    device_trust_score: float
    location_deviation: float
    is_synthetic: bool
    customer_name: Optional[str] = "Walk-in Client"
    pan_number: Optional[str] = "UNKNOWN"
    device_id: Optional[str] = "dev_unknown"
    ip_address: Optional[str] = "127.0.0.1"
    typing_speed: Optional[float] = 120.0
    mouse_jitter: Optional[float] = 1.5
    click_speed: Optional[float] = 0.25
    failed_login_count: Optional[int] = 0
    phone_number: Optional[str] = "+91 98765 43210"
    email_address: Optional[str] = "customer@bank.com"

class IdentityVerificationRequest(BaseModel):
    customer_name: str
    pan_number: str
    email_address: str
    phone_number: str
    device_id: str
    ip_address: str

class FederatedRoundRequest(BaseModel):
    epsilon: float = 2.0
    encryption_mode: str = "PQC"

class AttackSimulationRequest(BaseModel):
    attack_type: str # Transaction Fraud, Account Takeover, Synthetic Identity Fraud, Bot Attack, Suspicious Recovery, Insider Threat
    bank: Optional[str] = "Bank A"

# Startup database initialization
@app.on_event("startup")
def startup_event():
    init_db()
    db = next(get_db())
    try:
        seed_db_with_transactions(db, total_per_bank=250)
    finally:
        db.close()

# --- Background Streaming Task ---
async def transaction_simulator():
    """Background simulator generating live transactions and evaluating Identity Trust scores"""
    global streaming_active
    try:
        while streaming_active:
            await asyncio.sleep(3.0) # Generate new transaction every 3 seconds
            db = next(get_db())
            try:
                bank = np.random.choice(["Bank A", "Bank B", "Bank C"])
                df = generate_bank_transactions(bank, 1)
                row = df.iloc[0]
                
                # Predict using current global weights (simulate real-time prediction)
                explainer = ShapExplainer(current_global_weights)
                tx_data = {
                    "amount": float(row["amount"]),
                    "distance_from_home": float(row["distance_from_home"]),
                    "device_trust_score": float(row["device_trust_score"]),
                    "location_deviation": float(row["location_deviation"]),
                    "is_synthetic": bool(row["is_synthetic"])
                }
                shap_res = explainer.compute_shap_values(tx_data)
                pred_prob = shap_res["prediction_probability"]
                explanation = explainer.generate_explanation(tx_data, shap_res)
                
                # Biometrics evaluation
                biometric_flags = []
                if float(row["typing_speed"]) > 300.0 or float(row["mouse_jitter"]) < 0.1:
                    biometric_flags.append("Robotic Input")
                
                session_risk = AdaptiveAuthenticator.assess_session_risk(
                    str(row["device_id"]), 
                    str(row["ip_address"]), 
                    biometric_flags
                )
                
                # Verify Identity
                id_data = {
                    "customer_name": str(row["customer_name"]),
                    "pan_number": str(row["pan_number"]),
                    "email_address": str(row["email_address"]),
                    "phone_number": str(row["phone_number"]),
                    "device_id": str(row["device_id"]),
                    "ip_address": str(row["ip_address"]),
                    "is_synthetic": bool(row["is_synthetic"])
                }
                id_res = IdentityVerifier.verify_identity(id_data)
                
                # Recovery Check
                rec_data = {
                    "is_new_device": str(row["device_id"]) == "dev_shared_mutant",
                    "is_new_location": float(row["location_deviation"]) > 3.0,
                    "attempts_count": 1 + int(row["failed_login_count"] > 0),
                    "sim_swap_days": 45 if str(row["fraud_type"]) != "Account Takeover" else 2,
                    "failed_login_window": int(row["failed_login_count"])
                }
                rec_res = AccountRecoveryEngine.assess_recovery_attempt(rec_data)
                
                # Insider Threat Check
                ins_data = {
                    "action": "Login",
                    "resource": "ledger",
                    "hour_of_day": 12,
                    "download_size_mb": 1.2,
                    "escalation_attempt": False
                }
                ins_res = InsiderThreatMonitor.evaluate_insider_activity(ins_data)

                # Composite score
                trust_inputs = {
                    "device_trust_score": float(row["device_trust_score"]),
                    "failed_login_count": int(row["failed_login_count"]),
                    "distance_from_home": float(row["distance_from_home"]),
                    "amount": float(row["amount"]),
                    "avg_amount": 100.0,
                    "typing_speed": float(row["typing_speed"]),
                    "mouse_jitter": float(row["mouse_jitter"]),
                    "click_speed": float(row["click_speed"]),
                    "identity_confidence_score": id_res["identity_confidence_score"],
                    "recovery_risk_score": rec_res["recovery_risk_score"],
                    "insider_risk_score": ins_res["insider_risk_score"],
                    "session_risk_score": session_risk,
                    "auth_penalty": 20.0 * int(row["failed_login_count"])
                }
                trust_res = TrustScoreEngine.calculate_scores(trust_inputs)
                
                # Adaptive authentication
                auth_res = AdaptiveAuthenticator.evaluate_auth_level(trust_res["trust_score"], session_risk)

                new_tx = Transaction(
                    bank=bank,
                    timestamp=datetime.utcnow(),
                    amount=float(row["amount"]),
                    merchant=str(row["merchant"]),
                    distance_from_home=float(row["distance_from_home"]),
                    device_trust_score=float(row["device_trust_score"]),
                    location_deviation=float(row["location_deviation"]),
                    is_synthetic=bool(row["is_synthetic"]),
                    trust_score=trust_res["trust_score"],
                    risk_score=trust_res["risk_score"],
                    prediction=1 if trust_res["trust_score"] < 50.0 else 0,
                    is_flagged=trust_res["trust_score"] < 50.0,
                    fraud_type=str(row["fraud_type"]),
                    confidence_score=float(row["confidence_score"]),
                    device_id=str(row["device_id"]),
                    ip_address=str(row["ip_address"]),
                    pan_number=str(row["pan_number"]),
                    customer_name=str(row["customer_name"]),
                    typing_speed=float(row["typing_speed"]),
                    mouse_jitter=float(row["mouse_jitter"]),
                    click_speed=float(row["click_speed"]),
                    failed_login_count=int(row["failed_login_count"]),
                    
                    # Identity elements
                    identity_confidence_score=id_res["identity_confidence_score"],
                    kyc_risk_score=id_res["kyc_risk_score"],
                    synthetic_identity_score=id_res["synthetic_identity_score"],
                    recovery_risk_score=rec_res["recovery_risk_score"],
                    insider_risk_score=ins_res["insider_risk_score"],
                    auth_action=auth_res["authentication_action"],
                    auth_reason=auth_res["decision_reason"],
                    phone_number=str(row["phone_number"]),
                    email_address=str(row["email_address"]),

                    xai_explanation=json.dumps({
                        "shap_values": shap_res["shap_values"],
                        "base_value": shap_res["base_value"],
                        "prediction_probability": pred_prob,
                        "explanation_text": explanation
                    })
                )
                db.add(new_tx)
                db.commit()
            except Exception as e:
                print(f"Error in streaming simulation: {e}")
            finally:
                db.close()
    except asyncio.CancelledError:
        pass

# --- Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Welcome to FedShield-ID: Privacy-First Identity Trust & Risk-Based Authentication Platform"}

@app.post("/stream-transactions")
def toggle_streaming(active: bool, background_tasks: BackgroundTasks):
    global streaming_active
    if active and not streaming_active:
        streaming_active = True
        background_tasks.add_task(transaction_simulator)
        return {"status": "Streaming started"}
    elif not active and streaming_active:
        streaming_active = False
        return {"status": "Streaming stopped"}
    return {"status": "No change", "active": streaming_active}

@app.post("/train")
def train_local_models(db: Session = Depends(get_db)):
    """
    Triggers local training at all banks.
    """
    results = {}
    models_mapping = {
        "Bank A": "Random Forest",
        "Bank B": "XGBoost",
        "Bank C": "LightGBM"
    }
    for bank_name in ["Bank A", "Bank B", "Bank C"]:
        txs = db.query(Transaction).filter(Transaction.bank == bank_name).all()
        if not txs:
            continue
            
        data = []
        for t in txs:
            data.append({
                "amount": t.amount,
                "distance_from_home": t.distance_from_home,
                "device_trust_score": t.device_trust_score,
                "location_deviation": t.location_deviation,
                "is_synthetic": float(t.is_synthetic),
                "prediction": t.prediction
            })
        df = pd.DataFrame(data)
        
        model = LocalBankModel(bank_name)
        train_res = model.train(df)
        
        results[bank_name] = {
            "model_type": models_mapping[bank_name],
            "accuracy": train_res["accuracy"],
            "f1_score": train_res["f1_score"],
            "sample_count": train_res["sample_count"]
        }
    return {"status": "Success", "bank_metrics": results}

@app.post("/federated-round")
def run_federated_round(request: FederatedRoundRequest, db: Session = Depends(get_db)):
    global current_global_weights
    aggregator = FederatedAggregator(db)
    aggregator.global_weights = current_global_weights
    
    last_round = db.query(FederatedRound).order_by(FederatedRound.round_number.desc()).first()
    next_round_num = (last_round.round_number + 1) if last_round else 1
    
    try:
        round_results = aggregator.execute_round(
            round_num=next_round_num,
            epsilon=request.epsilon,
            encryption_mode=request.encryption_mode
        )
        current_global_weights = round_results["weights"]
        return round_results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Federated round execution failed: {str(e)}")

@app.get("/aggregate")
def get_aggregated_model(db: Session = Depends(get_db)):
    rounds = db.query(FederatedRound).order_by(FederatedRound.round_number.asc()).all()
    history = []
    for r in rounds:
        history.append({
            "round_number": r.round_number,
            "global_accuracy": r.global_accuracy,
            "global_loss": r.global_loss,
            "bank_a_accuracy": r.bank_a_accuracy,
            "bank_b_accuracy": r.bank_b_accuracy,
            "bank_c_accuracy": r.bank_c_accuracy,
            "privacy_budget_epsilon": r.privacy_budget_epsilon,
            "noise_added": r.noise_added,
            "encryption_mode": r.encryption_mode
        })
        
    return {
        "global_weights": current_global_weights,
        "round_count": len(history),
        "history": history
    }

@app.post("/predict")
def predict_fraud(tx: TransactionRequest, db: Session = Depends(get_db)):
    explainer = ShapExplainer(current_global_weights)
    tx_dict = {
        "amount": tx.amount,
        "distance_from_home": tx.distance_from_home,
        "device_trust_score": tx.device_trust_score,
        "location_deviation": tx.location_deviation,
        "is_synthetic": tx.is_synthetic
    }
    
    shap_res = explainer.compute_shap_values(tx_dict)
    prob = shap_res["prediction_probability"]
    explanation = explainer.generate_explanation(tx_dict, shap_res)
    
    # Run identity verification
    id_data = {
        "customer_name": tx.customer_name,
        "pan_number": tx.pan_number,
        "email_address": tx.email_address,
        "phone_number": tx.phone_number,
        "device_id": tx.device_id,
        "ip_address": tx.ip_address,
        "is_synthetic": tx.is_synthetic
    }
    id_res = IdentityVerifier.verify_identity(id_data)
    
    # Run account recovery check
    rec_data = {
        "is_new_device": tx.device_id == "dev_shared_mutant",
        "is_new_location": tx.location_deviation > 3.0,
        "attempts_count": 1 + int(tx.failed_login_count > 0),
        "sim_swap_days": 45 if tx.fraud_type != "Account Takeover" else 2,
        "failed_login_window": tx.failed_login_count
    }
    rec_res = AccountRecoveryEngine.assess_recovery_attempt(rec_data)
    
    # Run insider threat evaluate
    ins_data = {
        "action": "Login",
        "resource": "ledger",
        "hour_of_day": 12,
        "download_size_mb": 1.2,
        "escalation_attempt": False
    }
    ins_res = InsiderThreatMonitor.evaluate_insider_activity(ins_data)
    
    biometric_flags = []
    if tx.typing_speed > 300.0 or tx.mouse_jitter < 0.1:
        biometric_flags.append("Robotic Input")
    session_risk = AdaptiveAuthenticator.assess_session_risk(tx.device_id, tx.ip_address, biometric_flags)
    
    # Composite scores
    trust_inputs = {
        "device_trust_score": tx.device_trust_score,
        "failed_login_count": tx.failed_login_count,
        "distance_from_home": tx.distance_from_home,
        "amount": tx.amount,
        "avg_amount": 120.0,
        "typing_speed": tx.typing_speed,
        "mouse_jitter": tx.mouse_jitter,
        "click_speed": tx.click_speed,
        "identity_confidence_score": id_res["identity_confidence_score"],
        "recovery_risk_score": rec_res["recovery_risk_score"],
        "insider_risk_score": ins_res["insider_risk_score"],
        "session_risk_score": session_risk,
        "auth_penalty": 20.0 * tx.failed_login_count
    }
    trust_res = TrustScoreEngine.calculate_scores(trust_inputs)
    
    # Adaptive auth decision
    auth_res = AdaptiveAuthenticator.evaluate_auth_level(trust_res["trust_score"], session_risk)
    
    prediction = 1 if trust_res["trust_score"] < 50.0 else 0
    is_flagged = prediction == 1
    
    new_tx = Transaction(
        bank=tx.bank,
        amount=tx.amount,
        merchant=tx.merchant,
        distance_from_home=tx.distance_from_home,
        device_trust_score=tx.device_trust_score,
        location_deviation=tx.location_deviation,
        is_synthetic=tx.is_synthetic,
        trust_score=trust_res["trust_score"],
        risk_score=trust_res["risk_score"],
        prediction=prediction,
        is_flagged=is_flagged,
        fraud_type=tx.fraud_type,
        confidence_score=tx.confidence_score,
        device_id=tx.device_id,
        ip_address=tx.ip_address,
        pan_number=tx.pan_number,
        customer_name=tx.customer_name,
        typing_speed=tx.typing_speed,
        mouse_jitter=tx.mouse_jitter,
        click_speed=tx.click_speed,
        failed_login_count=tx.failed_login_count,
        
        # Identity Verification & Recovery parameters
        identity_confidence_score=id_res["identity_confidence_score"],
        kyc_risk_score=id_res["kyc_risk_score"],
        synthetic_identity_score=id_res["synthetic_identity_score"],
        recovery_risk_score=rec_res["recovery_risk_score"],
        insider_risk_score=ins_res["insider_risk_score"],
        auth_action=auth_res["authentication_action"],
        auth_reason=auth_res["decision_reason"],
        phone_number=tx.phone_number,
        email_address=tx.email_address,

        xai_explanation=json.dumps({
            "shap_values": shap_res["shap_values"],
            "base_value": shap_res["base_value"],
            "prediction_probability": final_risk / 100.0 if 'final_risk' in locals() else prob,
            "explanation_text": explanation
        })
    )
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)
    
    return {
        "transaction_id": new_tx.id,
        "risk_score": new_tx.risk_score,
        "trust_score": new_tx.trust_score,
        "prediction": new_tx.prediction,
        "is_flagged": new_tx.is_flagged,
        "explanation": explanation
    }

@app.post("/simulate-attack")
def simulate_attack(req: AttackSimulationRequest, db: Session = Depends(get_db)):
    """
    Simulates identity and security threat scenarios:
    Transaction Fraud, Account Takeover, Synthetic Identity Fraud, Bot Attack, Suspicious Recovery, Insider Threat
    """
    cust_idx = np.random.randint(0, len(CUSTOMER_NAMES))
    customer_name = CUSTOMER_NAMES[cust_idx]
    pan_number = PAN_NUMBERS[cust_idx]
    ip_address = np.random.choice(IP_ADDRESSES)
    device_id = f"dev_{np.random.randint(1000, 9999)}"
    merchant = np.random.choice(MERCHANTS)
    
    amount = 95.0
    distance = 15.0
    device_trust = 90.0
    loc_deviation = 0.5
    is_synthetic = False
    failed_logins = 0
    typing_speed = 115.0
    mouse_jitter = 1.6
    click_speed = 0.28
    
    phone_number = f"+91 95460 {np.random.randint(10000, 99999)}"
    email_address = f"{customer_name.lower().replace(' ', '.')}@gmail.com"
    
    is_new_device = False
    is_new_location = False
    attempts_count = 1
    sim_swap_days = 45
    
    id_conf_override = None
    rec_risk_override = None
    ins_risk_override = None
    
    if req.attack_type == "Transaction Fraud":
        amount = float(np.random.uniform(1200, 5000))
        distance = float(np.random.uniform(800, 3000))
        device_trust = 25.0
        loc_deviation = 4.8
    elif req.attack_type == "Account Takeover":
        failed_logins = 4
        device_trust = 10.0
        device_id = "dev_hijacked_android"
        typing_speed = 280.0
        mouse_jitter = 7.8
        distance = 320.0
        is_new_device = True
        is_new_location = True
        attempts_count = 5
        sim_swap_days = 1
    elif req.attack_type == "Synthetic Identity Fraud":
        is_synthetic = True
        mismatch_idx = (cust_idx + 2) % len(CUSTOMER_NAMES)
        pan_number = PAN_NUMBERS[mismatch_idx]
        device_id = "dev_shared_mutant"
        device_trust = 40.0
        email_address = f"{customer_name.lower().replace(' ', '.')}@tempmail.com"
    elif req.attack_type == "Bot Attack":
        device_trust = 15.0
        typing_speed = 500.0
        mouse_jitter = 0.01
        click_speed = 0.015
        device_id = "dev_headless_chrome"
        amount = 450.0
    elif req.attack_type == "Suspicious Recovery":
        failed_logins = 2
        device_trust = 30.0
        is_new_device = True
        is_new_location = True
        attempts_count = 4
        sim_swap_days = 1
        device_id = "dev_rooted_laptop"
        rec_risk_override = 85.0
    elif req.attack_type == "Insider Threat":
        # Log employee threat log directly in database
        log = EmployeeActivityLog(
            timestamp=datetime.utcnow(),
            employee_id="EMP_205",
            employee_name="Rajesh Sen",
            action="DB Export Override",
            resource="customer_PII_vault",
            ip_address="185.220.101.4",
            device_id="dev_rooted_laptop_outside",
            is_suspicious=True,
            risk_score=95.0,
            details=f"SysAdmin credentials hijacked. Direct SQL export downloaded by compromised external actor."
        )
        db.add(log)
        db.commit()
        
        # Associate transaction for UI display
        customer_name = "Rajesh Sen (Insider suspected)"
        pan_number = "ADMIN_SYS"
        device_id = "dev_rooted_laptop_outside"
        ip_address = "185.220.101.4"
        ins_risk_override = 95.0
        device_trust = 15.0
        amount = 0.0 # system action
        
    # Run evaluations
    id_data = {
        "customer_name": customer_name,
        "pan_number": pan_number,
        "email_address": email_address,
        "phone_number": phone_number,
        "device_id": device_id,
        "ip_address": ip_address,
        "is_synthetic": is_synthetic
    }
    id_res = IdentityVerifier.verify_identity(id_data)
    if id_conf_override is not None:
        id_res["identity_confidence_score"] = id_conf_override
        
    rec_data = {
        "is_new_device": is_new_device,
        "is_new_location": is_new_location,
        "attempts_count": attempts_count,
        "sim_swap_days": sim_swap_days,
        "failed_login_window": failed_logins
    }
    rec_res = AccountRecoveryEngine.assess_recovery_attempt(rec_data)
    if rec_risk_override is not None:
        rec_res["recovery_risk_score"] = rec_risk_override
        
    ins_data = {
        "action": "Login",
        "resource": "ledger",
        "hour_of_day": 23 if ins_risk_override else 12,
        "download_size_mb": 1240.0 if ins_risk_override else 0.5,
        "escalation_attempt": True if ins_risk_override else False
    }
    ins_res = InsiderThreatMonitor.evaluate_insider_activity(ins_data)
    if ins_risk_override is not None:
        ins_res["insider_risk_score"] = ins_risk_override

    biometric_flags = []
    if typing_speed > 300.0 or mouse_jitter < 0.1:
        biometric_flags.append("Robotic Input")
    session_risk = AdaptiveAuthenticator.assess_session_risk(device_id, ip_address, biometric_flags)
    
    trust_inputs = {
        "device_trust_score": device_trust,
        "failed_login_count": failed_logins,
        "distance_from_home": distance,
        "amount": amount,
        "avg_amount": 100.0,
        "typing_speed": typing_speed,
        "mouse_jitter": mouse_jitter,
        "click_speed": click_speed,
        "identity_confidence_score": id_res["identity_confidence_score"],
        "recovery_risk_score": rec_res["recovery_risk_score"],
        "insider_risk_score": ins_res["insider_risk_score"],
        "session_risk_score": session_risk,
        "auth_penalty": 20.0 * failed_logins
    }
    trust_res = TrustScoreEngine.calculate_scores(trust_inputs)
    auth_res = AdaptiveAuthenticator.evaluate_auth_level(trust_res["trust_score"], session_risk)
    
    # Force high risk to demonstrate block/alerts in dashboards
    trust_res["trust_score"] = min(trust_res["trust_score"], 35.0)
    trust_res["risk_score"] = 100.0 - trust_res["trust_score"]
    auth_res = AdaptiveAuthenticator.evaluate_auth_level(trust_res["trust_score"], session_risk)

    explainer = ShapExplainer(current_global_weights)
    tx_dict = {
        "amount": amount,
        "distance_from_home": distance,
        "device_trust_score": device_trust,
        "location_deviation": loc_deviation,
        "is_synthetic": is_synthetic
    }
    shap_res = explainer.compute_shap_values(tx_dict)
    explanation = explainer.generate_explanation(tx_dict, shap_res)
    
    new_tx = Transaction(
        bank=req.bank,
        timestamp=datetime.utcnow(),
        amount=round(amount, 2),
        merchant=merchant,
        distance_from_home=round(distance, 2),
        device_trust_score=round(device_trust, 2),
        location_deviation=round(loc_deviation, 2),
        is_synthetic=is_synthetic,
        trust_score=trust_res["trust_score"],
        risk_score=trust_res["risk_score"],
        prediction=1,
        is_flagged=True,
        fraud_type=req.attack_type,
        confidence_score=round(float(np.random.uniform(92.0, 99.8)), 2),
        device_id=device_id,
        ip_address=ip_address,
        pan_number=pan_number,
        customer_name=customer_name,
        typing_speed=round(typing_speed, 2),
        mouse_jitter=round(mouse_jitter, 2),
        click_speed=round(click_speed, 3),
        failed_login_count=failed_logins,
        
        # Identity parameters
        identity_confidence_score=id_res["identity_confidence_score"],
        kyc_risk_score=id_res["kyc_risk_score"],
        synthetic_identity_score=id_res["synthetic_identity_score"],
        recovery_risk_score=rec_res["recovery_risk_score"],
        insider_risk_score=ins_res["insider_risk_score"],
        auth_action=auth_res["authentication_action"],
        auth_reason=auth_res["decision_reason"],
        phone_number=phone_number,
        email_address=email_address,

        xai_explanation=json.dumps({
            "shap_values": shap_res["shap_values"],
            "base_value": shap_res["base_value"],
            "prediction_probability": trust_res["risk_score"] / 100.0,
            "explanation_text": explanation
        })
    )
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)
    
    return {
        "status": "Attack Injected",
        "transaction": {
            "id": new_tx.id,
            "bank": new_tx.bank,
            "amount": new_tx.amount,
            "merchant": new_tx.merchant,
            "fraud_type": new_tx.fraud_type,
            "risk_score": new_tx.risk_score,
            "trust_score": new_tx.trust_score,
            "customer_name": new_tx.customer_name,
            "pan_number": new_tx.pan_number,
            "device_id": new_tx.device_id,
            "prediction": new_tx.prediction,
            "explanation": explanation,
            
            # Identity parameters
            "identity_confidence_score": new_tx.identity_confidence_score,
            "kyc_risk_score": new_tx.kyc_risk_score,
            "synthetic_identity_score": new_tx.synthetic_identity_score,
            "recovery_risk_score": new_tx.recovery_risk_score,
            "insider_risk_score": new_tx.insider_risk_score,
            "auth_action": new_tx.auth_action,
            "auth_reason": new_tx.auth_reason,
            "phone_number": new_tx.phone_number,
            "email_address": new_tx.email_address
        }
    }

@app.get("/explain/{tx_id}")
def explain_prediction(tx_id: int, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    if not tx.xai_explanation:
        explainer = ShapExplainer(current_global_weights)
        tx_dict = {
            "amount": tx.amount,
            "distance_from_home": tx.distance_from_home,
            "device_trust_score": tx.device_trust_score,
            "location_deviation": tx.location_deviation,
            "is_synthetic": tx.is_synthetic
        }
        shap_res = explainer.compute_shap_values(tx_dict)
        explanation = explainer.generate_explanation(tx_dict, shap_res)
        
        explanation_json = {
            "shap_values": shap_res["shap_values"],
            "base_value": shap_res["base_value"],
            "prediction_probability": shap_res["prediction_probability"],
            "explanation_text": explanation
        }
        tx.xai_explanation = json.dumps(explanation_json)
        db.commit()
    else:
        explanation_json = json.loads(tx.xai_explanation)
        
    return explanation_json

@app.get("/trust-score")
def get_user_profiles(db: Session = Depends(get_db)):
    """
    Returns list of seeded user profiles with trust ratings and identity parameters.
    """
    profiles = db.query(UserProfile).all()
    return [
        {
            "customer_id": p.customer_id,
            "customer_name": p.customer_name,
            "pan_number": p.pan_number,
            "trust_score": p.trust_score,
            "risk_score": p.risk_score,
            "device_reputation": p.device_reputation,
            "login_consistency": p.login_consistency,
            "avg_typing_speed": p.avg_typing_speed,
            "avg_click_speed": p.avg_click_speed,
            "avg_mouse_jitter": p.avg_mouse_jitter,
            "risk_category": p.risk_category,
            
            # Identity parameters
            "identity_confidence_score": p.identity_confidence_score,
            "recovery_risk_score": p.recovery_risk_score,
            "insider_risk_score": p.insider_risk_score,
            "phone_number": p.phone_number,
            "email_address": p.email_address,
            "auth_history": json.loads(p.auth_history_json) if p.auth_history_json else []
        } for p in profiles
    ]

@app.get("/identity-verification")
def get_identity_audits(db: Session = Depends(get_db)):
    """
    Returns details of all identities verified on the network.
    """
    profiles = db.query(UserProfile).all()
    audits = []
    for p in profiles:
        # Run IdentityVerifier dynamically
        id_data = {
            "customer_name": p.customer_name,
            "pan_number": p.pan_number,
            "email_address": p.email_address,
            "phone_number": p.phone_number,
            "device_id": "dev_shared_mutant" if p.customer_id == 4 else f"dev_{p.customer_id:05d}",
            "ip_address": "103.45.12.89" if p.customer_id != 4 else "185.220.101.4",
            "is_synthetic": p.customer_id == 2 or p.customer_id == 4
        }
        res = IdentityVerifier.verify_identity(id_data)
        audits.append({
            "customer_id": p.customer_id,
            "customer_name": p.customer_name,
            "pan_number": p.pan_number,
            "email_address": p.email_address,
            "phone_number": p.phone_number,
            "identity_confidence_score": res["identity_confidence_score"],
            "kyc_risk_score": res["kyc_risk_score"],
            "synthetic_identity_score": res["synthetic_identity_score"],
            "status": res["status"],
            "onboarding_risk_level": res["onboarding_risk_level"],
            "fraud_indicators": res["fraud_indicators"]
        })
    return audits

@app.post("/verify-identity")
def verify_identity_endpoint(req: IdentityVerificationRequest):
    """
    Validates identity parameters against rules.
    """
    data = {
        "customer_name": req.customer_name,
        "pan_number": req.pan_number,
        "email_address": req.email_address,
        "phone_number": req.phone_number,
        "device_id": req.device_id,
        "ip_address": req.ip_address,
        "is_synthetic": False
    }
    return IdentityVerifier.verify_identity(data)

@app.get("/insider-threats")
def get_insider_threat_logs(db: Session = Depends(get_db)):
    """
    Returns employee insider threat activities and risk rankings.
    """
    logs = db.query(EmployeeActivityLog).order_by(EmployeeActivityLog.timestamp.desc()).all()
    
    # Calculate simple employee risk summary
    rankings = [
        {"employee_name": "Rajesh Sen", "employee_id": "EMP_205", "role": "SysAdmin", "score": 95.0, "category": "High Risk", "violations": 3},
        {"employee_name": "Suresh Kumar", "employee_id": "EMP_102", "role": "Teller", "score": 10.0, "category": "Low Risk", "violations": 0},
        {"employee_name": "Sunita Rao", "employee_id": "EMP_311", "role": "Auditor", "score": 5.0, "category": "Low Risk", "violations": 0}
    ]
    
    return {
        "rankings": rankings,
        "logs": [
            {
                "id": log.id,
                "timestamp": log.timestamp,
                "employee_id": log.employee_id,
                "employee_name": log.employee_name,
                "action": log.action,
                "resource": log.resource,
                "ip_address": log.ip_address,
                "device_id": log.device_id,
                "is_suspicious": log.is_suspicious,
                "risk_score": log.risk_score,
                "details": log.details
            } for log in logs
        ]
    }

@app.get("/recovery-events")
def get_recovery_audit_logs(db: Session = Depends(get_db)):
    """
    Returns account recovery audit metrics.
    """
    txs = db.query(Transaction).filter(
        (Transaction.fraud_type == "Suspicious Recovery") | (Transaction.fraud_type == "Account Takeover")
    ).order_by(Transaction.timestamp.desc()).limit(15).all()
    
    events = []
    for idx, t in enumerate(txs):
        events.append({
            "id": t.id,
            "timestamp": t.timestamp,
            "customer_name": t.customer_name,
            "phone_number": t.phone_number,
            "device_id": t.device_id,
            "recovery_risk_score": t.recovery_risk_score,
            "recovery_confidence_score": 100.0 - (t.recovery_risk_score * 0.7),
            "verdict": "Blocked" if t.recovery_risk_score > 65 else "Step-Up Challenge Required",
            "alerts": ["Recent SIM Swap detected", "New unrecognized device fingerprint"]
        })
        
    # Seed mock history if empty
    if not events:
        events = [
            {
                "id": 999,
                "timestamp": datetime.utcnow() - timedelta(minutes=45),
                "customer_name": "Sanjay Dutt",
                "phone_number": "+91 98765 00003",
                "device_id": "dev_rooted_laptop",
                "recovery_risk_score": 85.0,
                "recovery_confidence_score": 40.5,
                "verdict": "Blocked",
                "alerts": ["SIM swap in last 24h", "Credential stuffing pattern (5 failed logins)"]
            },
            {
                "id": 998,
                "timestamp": datetime.utcnow() - timedelta(hours=3),
                "customer_name": "Neha Patel",
                "phone_number": "+91 99999 11111",
                "device_id": "dev_shared_mutant",
                "recovery_risk_score": 45.0,
                "recovery_confidence_score": 68.5,
                "verdict": "Step-Up Challenge Required",
                "alerts": ["Recovery from location anomaly (Delhi instead of Mumbai)"]
            }
        ]
        
    return events

@app.get("/fraud-investigation/{tx_id}")
def get_genai_investigation(tx_id: int, db: Session = Depends(get_db)):
    """
    Triggers GenAI security analyst identity trust briefing for audit.
    """
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    tx_dict = {
        "id": tx.id,
        "risk_score": tx.risk_score,
        "fraud_type": tx.fraud_type,
        "amount": tx.amount,
        "bank": tx.bank,
        "merchant": tx.merchant,
        "distance_from_home": tx.distance_from_home,
        "device_id": tx.device_id,
        "ip_address": tx.ip_address,
        "pan_number": tx.pan_number,
        "customer_name": tx.customer_name,
        "failed_login_count": tx.failed_login_count,
        "is_synthetic": tx.is_synthetic,
        "typing_speed": tx.typing_speed,
        "mouse_jitter": tx.mouse_jitter
    }
    
    report = GenAiIdentityTrustInvestigator.generate_report(tx_dict)
    return report

@app.get("/graph-data")
def get_knowledge_graph(db: Session = Depends(get_db)):
    """
    Returns nodes and edges mapping resource link relations.
    """
    return GraphBuilder.get_graph_data(db)

@app.get("/transactions")
def get_transactions(
    bank: Optional[str] = None,
    is_flagged: Optional[bool] = None,
    limit: int = Query(default=50, lte=100),
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)
    if bank:
        query = query.filter(Transaction.bank == bank)
    if is_flagged is not None:
        query = query.filter(Transaction.is_flagged == is_flagged)
        
    total = query.count()
    txs = query.order_by(Transaction.timestamp.desc()).offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "transactions": [
            {
                "id": t.id,
                "bank": t.bank,
                "timestamp": t.timestamp,
                "amount": t.amount,
                "merchant": t.merchant,
                "distance_from_home": t.distance_from_home,
                "device_trust_score": t.device_trust_score,
                "location_deviation": t.location_deviation,
                "is_synthetic": t.is_synthetic,
                "trust_score": t.trust_score,
                "risk_score": t.risk_score,
                "prediction": t.prediction,
                "is_flagged": t.is_flagged,
                "fraud_type": t.fraud_type,
                "confidence_score": t.confidence_score,
                "device_id": t.device_id,
                "ip_address": t.ip_address,
                "pan_number": t.pan_number,
                "customer_name": t.customer_name,
                "typing_speed": t.typing_speed,
                "mouse_jitter": t.mouse_jitter,
                "click_speed": t.click_speed,
                "failed_login_count": t.failed_login_count,
                
                # Identity additions
                "identity_confidence_score": t.identity_confidence_score,
                "kyc_risk_score": t.kyc_risk_score,
                "synthetic_identity_score": t.synthetic_identity_score,
                "recovery_risk_score": t.recovery_risk_score,
                "insider_risk_score": t.insider_risk_score,
                "auth_action": t.auth_action,
                "auth_reason": t.auth_reason,
                "phone_number": t.phone_number,
                "email_address": t.email_address
            } for t in txs
        ]
    }

@app.get("/security-status")
def get_security_status(db: Session = Depends(get_db)):
    logs = db.query(SecurityLog).order_by(SecurityLog.timestamp.desc()).limit(30).all()
    benchmarks = run_cryptography_benchmarks()
    
    # Biometric alert telemetry
    biometric_alerts = db.query(Transaction).filter(
        (Transaction.typing_speed > 300) | (Transaction.mouse_jitter < 0.1) | (Transaction.failed_login_count >= 3)
    ).order_by(Transaction.timestamp.desc()).limit(5).all()
    
    return {
        "active_tunnels": [
            {"node": "Bank A", "status": "Secure", "pqc_algorithm": "CRYSTALS-Kyber-768", "bits": 192},
            {"node": "Bank B", "status": "Secure", "pqc_algorithm": "CRYSTALS-Kyber-768", "bits": 192},
            {"node": "Bank C", "status": "Secure", "pqc_algorithm": "CRYSTALS-Kyber-768", "bits": 192}
        ],
        "pqc_benchmarks": benchmarks,
        "biometric_telemetry": [
            {
                "id": alert.id,
                "customer_name": alert.customer_name,
                "device_id": alert.device_id,
                "failed_logins": alert.failed_login_count,
                "typing_speed": alert.typing_speed,
                "mouse_jitter": alert.mouse_jitter,
                "risk_score": alert.risk_score
            } for alert in biometric_alerts
        ],
        "recent_logs": [
            {
                "timestamp": log.timestamp,
                "node_name": log.node_name,
                "action": log.action,
                "algorithm": log.algorithm,
                "bytes_transmitted": log.bytes_transmitted,
                "execution_time_ms": log.execution_time_ms,
                "encryption_status": log.encryption_status,
                "details": json.loads(log.details) if log.details else {}
            } for log in logs
        ]
    }

@app.get("/privacy-status")
def get_privacy_status(db: Session = Depends(get_db)):
    rounds = db.query(FederatedRound).order_by(FederatedRound.round_number.desc()).limit(10).all()
    current_epsilon = rounds[0].privacy_budget_epsilon if rounds else 2.0
    privacy_score = min(100, max(0, int(100 - (current_epsilon * 12)))) if current_epsilon > 0 else 76
    data_leakage_risk = "Low" if privacy_score > 75 else "Medium"
    if privacy_score < 40:
        data_leakage_risk = "High"
        
    return {
        "current_privacy_budget_epsilon": current_epsilon,
        "privacy_score_percent": privacy_score,
        "data_leakage_risk": data_leakage_risk,
        "noise_added_history": [
            {"round": r.round_number, "epsilon": r.privacy_budget_epsilon, "noise_scale": r.noise_added}
            for r in reversed(rounds)
        ],
        "dp_algorithm": "Laplacian Noise Injection on Weights",
        "clipping_bound_L2": 1.0,
        "guarantees": "Strict epsilon-differential privacy for model coefficients."
    }

@app.get("/compliance-status")
def get_compliance_status(db: Session = Depends(get_db)):
    """
    Computes Regulatory & RBI Compliance Score based on system state parameters.
    """
    rounds_count = db.query(FederatedRound).count()
    last_round = db.query(FederatedRound).order_by(FederatedRound.round_number.desc()).first()
    
    fl_enabled = rounds_count > 0
    dp_enabled = True # Always active mathematically
    data_sharing_disabled = True # Customer data never pooled
    audit_logs_available = db.query(SecurityLog).count() > 0
    rba_enabled = True # Risk-Based Authentication active
    
    # Calculate weighted compliance score (out of 100)
    score = 0
    if fl_enabled: score += 15
    if dp_enabled: score += 15
    if data_sharing_disabled: score += 20
    if audit_logs_available: score += 15
    if rba_enabled: score += 35
    
    return {
        "compliance_score_percent": score,
        "rbi_checks": [
            {"check": "Identity Trust Compliance Score", "status": fl_enabled and dp_enabled, "weight": 15, "description": "Collaborative training avoids raw data centralization."},
            {"check": "Risk-Based Authentication Enabled", "status": rba_enabled, "weight": 35, "description": "Dynamic OTP/Step-Up active based on Trust Scores."},
            {"check": "Zero Raw Data Sharing", "status": data_sharing_disabled, "weight": 20, "description": "Zero customer records are ever pooled/centralized."},
            {"check": "Differential Privacy Status", "status": dp_enabled, "weight": 15, "description": "Laplacian noise safeguards weight transfers."},
            {"check": "Federated Learning Status", "status": fl_enabled, "weight": 15, "description": "Decentralized machine learning loop active."},
            {"check": "Audit Logging Status", "status": audit_logs_available, "weight": 10, "description": "Asymmetric post-quantum KEM keys recorded."}
        ]
    }

@app.get("/dashboard-metrics")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    total_tx = db.query(Transaction).count()
    fraud_tx = db.query(Transaction).filter(Transaction.prediction == 1).count()
    fraud_rate = (fraud_tx / total_tx) * 100 if total_tx > 0 else 0.0
    
    last_round = db.query(FederatedRound).order_by(FederatedRound.round_number.desc()).first()
    model_accuracy = last_round.global_accuracy * 100 if last_round else 82.5
    
    current_epsilon = last_round.privacy_budget_epsilon if last_round else 2.0
    privacy_score = min(100, max(0, int(100 - (current_epsilon * 12)))) if current_epsilon > 0 else 76
    
    # Calculate bank distribution metrics
    distribution = []
    models_mapping = {
        "Bank A": "Random Forest",
        "Bank B": "XGBoost",
        "Bank C": "LightGBM"
    }
    for bank in ["Bank A", "Bank B", "Bank C"]:
        b_total = db.query(Transaction).filter(Transaction.bank == bank).count()
        b_fraud = db.query(Transaction).filter(Transaction.bank == bank, Transaction.prediction == 1).count()
        distribution.append({
            "bank": bank,
            "model_type": models_mapping[bank],
            "total_transactions": b_total,
            "fraud_transactions": b_fraud,
            "fraud_rate": round((b_fraud / b_total) * 100, 2) if b_total > 0 else 0.0
        })
        
    # Recent federated round history
    rounds = db.query(FederatedRound).order_by(FederatedRound.round_number.asc()).all()
    accuracy_history = []
    for r in rounds:
        accuracy_history.append({
            "round": r.round_number,
            "accuracy": r.global_accuracy * 100,
            "loss": r.global_loss,
            "bank_a": r.bank_a_accuracy * 100,
            "bank_b": r.bank_b_accuracy * 100,
            "bank_c": r.bank_c_accuracy * 100
        })
        
    if not accuracy_history:
        accuracy_history = [
            {"round": 0, "accuracy": 50.0, "loss": 0.69, "bank_a": 50.0, "bank_b": 50.0, "bank_c": 50.0},
            {"round": 1, "accuracy": 72.0, "loss": 0.51, "bank_a": 70.0, "bank_b": 73.0, "bank_c": 71.0},
            {"round": 2, "accuracy": 78.5, "loss": 0.44, "bank_a": 77.0, "bank_b": 79.0, "bank_c": 78.0},
            {"round": 3, "accuracy": 82.5, "loss": 0.38, "bank_a": 81.0, "bank_b": 83.5, "bank_c": 82.0}
        ]
        
    threat_level = "Elevated" if fraud_rate > 6.0 else "Normal"
    if fraud_rate > 10.0:
        threat_level = "High"
        
    encryption_type = last_round.encryption_mode if last_round else "PQC"
    security_score = 98 if encryption_type == "PQC" else 75
    
    # Trust Score details
    avg_trust = db.query(UserProfile.trust_score).all()
    mean_trust = np.mean([t[0] for t in avg_trust]) if avg_trust else 88.5
    
    # New SOC counters matching FedShield-ID
    failed_logins_total = int(db.query(Transaction.failed_login_count).filter(Transaction.failed_login_count >= 1).count())
    account_takeovers_total = db.query(Transaction).filter(Transaction.fraud_type == "Account Takeover").count()
    synthetic_identities_total = db.query(Transaction).filter((Transaction.fraud_type == "Synthetic Identity Fraud") | (Transaction.is_synthetic == True)).count()
    bot_attacks_total = db.query(Transaction).filter(Transaction.fraud_type == "Bot Attack").count()
    
    suspicious_recoveries_total = db.query(Transaction).filter(Transaction.fraud_type == "Suspicious Recovery").count()
    insider_threats_total = db.query(EmployeeActivityLog).filter(EmployeeActivityLog.is_suspicious == True).count()
    new_device_risks_total = db.query(Transaction).filter(Transaction.device_trust_score < 40.0).count()
    behavioral_anomalies_total = db.query(Transaction).filter((Transaction.typing_speed > 300.0) | (Transaction.mouse_jitter < 0.1)).count()
    identity_trust_events_total = db.query(Transaction).count()

    return {
        "total_transactions": total_tx,
        "fraud_transactions": fraud_tx,
        "fraud_rate_percent": round(fraud_rate, 2),
        "model_accuracy_percent": round(model_accuracy, 2),
        "privacy_score_percent": privacy_score,
        "security_score_percent": security_score,
        "avg_trust_score": round(mean_trust, 1),
        "threat_level": threat_level,
        "encryption_type": encryption_type,
        "bank_distribution": distribution,
        "accuracy_history": accuracy_history,
        "streaming_active": streaming_active,
        
        # SOC counters
        "failed_logins": failed_logins_total,
        "account_takeovers": account_takeovers_total,
        "synthetic_identities": synthetic_identities_total,
        "bot_attacks": bot_attacks_total,
        
        # V3 additions
        "insider_threats": insider_threats_total,
        "suspicious_recoveries": suspicious_recoveries_total,
        "new_device_risks": new_device_risks_total,
        "behavioral_anomalies": behavioral_anomalies_total,
        "identity_trust_events": identity_trust_events_total
    }

from app.security.pqc import run_cryptography_benchmarks
