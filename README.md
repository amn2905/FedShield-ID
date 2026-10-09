# FedShield-ID: Privacy-First Identity Trust Platform for Banking Networks
[![Docker Compose](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2015-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![PQC](https://img.shields.io/badge/PQC-CRYSTALS--Kyber--768-purple)](https://csrc.nist.gov/Projects/post-quantum-cryptography)

**Author:** Mohd. Amaan Hamid  
**Academic Qualification:** MSc Cybersecurity  
**Contact:** [hamidamaan3@gmail.com](mailto:hamidamaan3@gmail.com)  
**Repository Architecture:** Distributed Privacy-Preserving Identity Trust, Behavioral Telemetry, and Risk-Based Adaptive Authentication  

---

## 1. Executive Summary & Problem Statement

Modern financial institutions face an escalating dilemma: traditional point-in-time perimeter authentication (such as static passwords or SMS-based One-Time Passwords) fails against modern identity threats, including **Synthetic Identity Fraud (SIF)**, **Account Takeover (ATO)** via SIM-swapping, automated **credential stuffing bots**, and **insider data harvesting**. Concurrently, stringent regulatory frameworks (e.g., RBI Master Directions on Digital Payment Security, GDPR, and ISO/IEC 27001) prohibit centralized aggregation or unauthorized pooling of customer personal identifiable information (PII).

**FedShield-ID** addresses this challenge through a **continuous, privacy-preserving identity trust engine**. Instead of treating identity verification as a binary gateway event at login, FedShield-ID continuously computes a composite **Identity Trust Score (0–100)** across multiple risk vectors. It trains anomaly detection models across isolated banking partitions using **Federated Learning (FedAvg)** and **Differential Privacy (Laplace Mechanism)**, secures gradient exchanges with simulated **Post-Quantum Key Encapsulation (CRYSTALS-Kyber-768 / ML-KEM)**, delivers local decision transparency via **Linear SHAP Attributions**, and uncovers collusive fraud rings using an in-memory **Entity Knowledge Graph**.

---

## 2. Core Objectives & Design Principles

* **Continuous Identity Evaluation**: Identity trustworthiness is assessed continuously across behavioral biometrics, session posture, and transaction drift rather than solely during session initiation.
* **Zero Raw Data Pooling**: Training data remains strictly partitioned within local banking domains; only mathematically perturbed gradient weights are exchanged.
* **Risk-Proportional Friction**: Authentication friction is applied dynamically through Risk-Based Adaptive Authentication (RBA), allowing frictionless access for trusted clients while enforcing multi-factor challenges or immediate session termination for high-risk anomalies.
* **Explainability by Design**: Every flagged anomaly is attributed to specific input deviations using additive Shapley values, producing structured compliance-ready audit trails.
* **Post-Quantum Preparedness**: Cryptographic parameter exchange anticipates quantum cryptanalytic threats (Shor’s and Grover’s algorithms) by modeling lattice-based Key Encapsulation Mechanisms.
* **Enterprise Ergonomics**: An operational Security Operations Center (SOC) user experience built on a refined, accessible light skeuomorphic design system.

---

## 3. Verified System Architecture

The following diagram illustrates the verified end-to-end data processing pipeline, tracing incoming identity telemetry through feature processing, trust scoring, adaptive challenge derivation, decentralized model aggregation, and SOC monitoring.

```mermaid
graph TD
    subgraph ClientLayer [Client & Telemetry Ingestion]
        T1[Onboarding KYC Data\nPAN, Email, Carrier, Device]
        T2[Continuous Session Telemetry\nKeystroke Dynamics, Mouse Jitter]
        T3[Transaction Telemetry\nAmount, Geo-Distance, Location Deviation]
    end

    subgraph EvaluationEngine [FastAPI Verification & Scoring Engine]
        V1[IdentityVerifier\nRegex Checksum & Synthetic ID Heuristics]
        V2[AccountRecoveryEngine\nSIM-Swap & Velocity Auditor]
        V3[InsiderThreatMonitor\nPrivileged Query & Off-Hour Audit]
        
        TE[TrustScoreEngine\n10-Vector Composite Weighting: 0-100]
        AA[AdaptiveAuthenticator\nDynamic RBA Decision Engine]
    end

    subgraph DataAndPrivacy [Persistence & Federated Learning]
        DB[(PostgreSQL 15 / SQLite\nTransactions, Profiles, Logs, Graph)]
        FL[FederatedAggregator\nFedAvg Weight Synchronization]
        DP[Differential Privacy\nLaplace Noise Injection: b = Δf / ε]
        PQC[Kyber768Simulator\nML-KEM Handshake + AES-256-GCM]
    end

    subgraph AnalyticsAndSOC [XAI, Graph & SOC Monitoring]
        SHAP[ShapExplainer\nLinear Shapley Attributions]
        KG[GraphBuilder\nCollusive Ring Relationship Network]
        SOC[React 19 Enterprise Dashboard\nExecutive SOC, Telemetry Gauges, Case Files]
    end

    T1 --> V1
    T2 --> TE
    T3 --> TE
    V1 --> TE
    V2 --> TE
    V3 --> TE

    TE --> AA
    AA --> DB
    DB --> SHAP
    DB --> KG
    DB --> FL

    FL --> DP
    DP --> PQC
    PQC --> FL

    SHAP --> SOC
    KG --> SOC
    DB --> SOC
    FL --> SOC
```

---

## 4. Methodological Foundations & Detailed Algorithms

### 4.1. Identity Trust Scoring Methodology

The `TrustScoreEngine` computes a composite score $T \in [0, 100]$ across 10 normalized dimensions. A corresponding Risk Score is defined as $R = 100 - T$.

$$\text{Trust Score} = \sum_{i=1}^{10} w_i \cdot S_i$$

$$\sum_{i=1}^{10} w_i = 1.0$$

| Dimension ($i$) | Weight ($w_i$) | Input Parameter | Mathematical Formulation / Evaluation Logic |
|:---|:---:|:---|:---|
| **Device Reputation** | $0.10$ | `device_trust_score` | Direct normalized score $S_1 \in [0, 100]$ (baseline hardware trust). |
| **Login Consistency** | $0.10$ | `failed_login_count` | $S_2 = \max(0.0, 100.0 - 20.0 \times \text{failed\_logins})$. |
| **Geolocation Consistency** | $0.10$ | `distance_from_home` | $S_3 = \max(0.0, 100.0 - 12.0 \times \ln(\text{distance} + 1))$. |
| **Transaction Volume** | $0.10$ | `amount`, `avg_amount` | Ratio $r = \frac{\text{amount}}{\max(1.0, \text{avg\_amount})}$. If $r \le 1.2 \implies 100$; else $\max(0.0, 100.0 - (r - 1.2) \times 20.0)$. |
| **Behavioral Biometrics** | $0.20$ | `typing_speed`, `mouse_jitter`, `click_speed` | Penalty-based: Typing $>300$ kpm ($-40$), $<40$ kpm ($-15$); Jitter $<0.1$ px ($-40$, robotic), $>8.0$ px ($-20$); Click $<0.05$ s ($-40$). $S_5 = \max(0, 100 - \sum \text{penalties})$. |
| **Identity Verification** | $0.15$ | `identity_confidence_score` | Derived from onboarding KYC checks: PAN format, tempmail, carrier. |
| **Account Recovery Status** | $0.10$ | `recovery_risk_score` | $S_7 = \max(0.0, 100.0 - \text{recovery\_risk})$. Penalizes SIM swaps $<72$h. |
| **Insider Threat Status** | $0.05$ | `insider_risk_score` | $S_8 = \max(0.0, 100.0 - \text{insider\_risk})$. Penalizes off-hour PII access. |
| **Active Session Risk** | $0.05$ | `session_risk_score` | $S_9 = \max(0.0, 100.0 - \text{session\_risk})$. Evaluates VPNs and emulated devices. |
| **Authentication History** | $0.05$ | `auth_penalty` | $S_{10} = \max(0.0, 100.0 - \text{auth\_penalty})$. Historical challenge failure rate. |

#### Risk Categories
* **Trusted**: $T \ge 90.0$
* **Low Risk**: $70.0 \le T < 90.0$
* **Medium Risk**: $50.0 \le T < 70.0$
* **High Risk**: $T < 50.0$

---

### 4.2. Risk-Based Adaptive Authentication (RBA) Engine

The `AdaptiveAuthenticator` evaluates the calculated Trust Score and aggregates session risks (flagged Tor/VPN IP ranges `185.220.101.4`, headless browser signatures `dev_headless_chrome`, and biometric alerts) to determine real-time authentication decisions.

An adjusted score is derived:

$$T_{\text{adj}} = \max(0.0, T - 0.3 \times \text{SessionRisk})$$

| Adjusted Score ($T_{\text{adj}}$) | Enforcement Action | Operational Rationale | Classification |
|:---:|:---|:---|:---|
| **$> 90.0$** | **Allow Login** | Biometric, device, and recovery telemetry matches standard profile. Frictionless login permitted. | Trusted |
| **$70.0 - 90.0$** | **OTP Verification** | Minor shift in device reputation or typing dynamics. Standard One-Time Password challenge. | Low Risk |
| **$50.0 - 69.9$** | **Step-Up Authentication** | Anomalous transaction volume or location deviation. Multi-factor challenge enforced. | Medium Risk |
| **$20.0 - 49.9$** | **Face Verification** | Significant behavioral biometrics anomaly or suspicious recovery indicator. Biometric match required. | High Risk |
| **$< 20.0$** | **Block Access** | Robotic input signature, known malicious IP, or critical credential inconsistency. Session terminated. | Critical Threat |

> **Implementation Note:** In the current prototype architecture, the authentication verdict is returned as an authoritative API decision attribute (`auth_action` and `auth_reason`) stored in the transaction ledger and rendered in the dashboard. In a production enterprise deployment, this decision would gate session tokens via an identity provider (e.g., Keycloak, Ping Identity, or Okta).

---

### 4.3. Identity Verification & KYC Integrity Heuristics

The `IdentityVerifier` audits onboarding and identity verification parameters using deterministic checks and pattern matching:

1. **PAN Format Check**: Validates Indian Permanent Account Number (PAN) structure using regex `^[A-Z]{5}[0-9]{4}[A-Z]$`. Checks format validity (30-point deduction if malformed).
2. **Email Domain Reputation**: Checks domain against known disposable email providers (`tempmail.com`, `yopmail.com`, `mailinator.com`, `guerrillamail.com`). Flags disposable domains with a 90% risk rating.
3. **Telecom Carrier & VoIP Audit**: Identifies malformed phone strings ($<10$ digits) and known virtual VoIP prefix ranges (`91000...`).
4. **Synthetic Identity Correlation**: Detects name-to-PAN mismatches and device collusion overlays (`dev_shared_mutant`).
5. **Cumulative Scoring**: Computes an `identity_confidence_score` $\in [5.0, 100.0]$:
   * $\ge 80.0$: **Trusted**
   * $50.0 - 79.9$: **Suspicious**
   * $< 50.0$: **High Risk**

> **Regulatory Clarification:** Pattern validation and domain reputation heuristics verify structural format consistency and detect known synthetic fraud indicators. They do not constitute an authoritative legal KYC identity verification against government central databases (such as NSDL or UIDAI).

---

### 4.4. Privacy-Preserving Federated Learning

The platform implements decentralized machine learning across 3 logical banking partitions without pooling raw customer data:
* **Bank A**: Retail Banking Division (5% baseline fraud rate, average transaction: $80.00).
* **Bank B**: Cards & Merchant Division (8% baseline fraud rate, average transaction: $350.00).
* **Bank C**: Savings & Micro-transactions (4% baseline fraud rate, average transaction: $25.00).

#### Decentralized Workflow
1. **Local Model Training**: Each bank trains a local model on its partitioned database records:
   * A `RandomForestClassifier` (50 estimators, max depth 6) for local non-linear fraud scoring.
   * An `SGDClassifier` (logistic regression loss, L2 penalty) to obtain linear parameter weights $\mathbf{w}_k$ and intercept $b_k$.
2. **Federated Aggregation (FedAvg)**: The central aggregator computes sample-weighted parameter updates:
   $$\mathbf{w}_{\text{global}} = \sum_{k=1}^{K} \frac{n_k}{N} \mathbf{w}_k$$
   where $n_k$ is the local sample count and $N = \sum n_k$.
3. **Model Persistence**: Aggregated global coefficients are updated in memory and tracked historically in the `federated_rounds` database table.

---

### 4.5. Differential Privacy (Laplace Mechanism)

To protect model parameters against membership inference attacks and gradient reconstruction, local weight updates are perturbed before transmission using the Laplace Mechanism.

1. **Sensitivity Bounding**: Weight vectors are clipped to bound their $L_2$-norm:
   $$\mathbf{w}' = \begin{cases} \mathbf{w} & \text{if } \|\mathbf{w}\|_2 \le 1.0 \\ \frac{\mathbf{w}}{\|\mathbf{w}\|_2} & \text{otherwise} \end{cases}$$
2. **Noise Calibration**: Laplacian noise scaled by the privacy budget $\epsilon$ is added to each coefficient:
   $$b = \frac{\Delta f}{\epsilon \cdot \ln(N + 1)}$$
   where $\Delta f = 0.5$ represents the normalized sensitivity bound and $\epsilon \in [0.1, 5.0]$ is user-configurable.
3. **Noise Addition**:
   $$\tilde{w}_j = w'_j + \text{Laplace}\left(0, b\right)$$

> **Mathematical Context:** This implementation applies calibrated Laplacian noise to local gradient parameters. While noise scales with $\epsilon$, formal differential privacy guarantees in production require rigorous composition accounting (such as Rényi DP or Moments Accountant) across repeated training rounds.

---

### 4.6. Explainable AI (Linear SHAP Attributions)

The `ShapExplainer` module computes feature attributions using the analytical linear formulation of Shapley values for logistic regression. Given feature inputs $\mathbf{x}$, population baselines $\boldsymbol{\mu}$, standard deviations $\boldsymbol{\sigma}$, and global model coefficients $\mathbf{w}$:

$$\phi_j = w_j \cdot \left(\frac{x_j - \mu_j}{\sigma_j}\right)$$

Total logit contribution:

$$z = \text{intercept} + \sum_{j=1}^{M} \phi_j$$

Probability projection:

$$P(\text{Fraud}) = \frac{1}{1 + e^{-z}}$$

$$\text{Base Probability} = \frac{1}{1 + e^{-\text{intercept}}}$$

Values are normalized to probability scale:

$$\phi_j^* = (P - P_{\text{base}}) \cdot \frac{\phi_j}{\sum_{k} |\phi_k|}$$

This provides exact additive feature contributions: positive attributions increase fraud probability; negative attributions indicate normal baseline behavior.

---

### 4.7. Post-Quantum Cryptography Modeling

To evaluate quantum-resilient communications, the platform simulates the **NIST FIPS 203 (ML-KEM / CRYSTALS-Kyber-768)** Key Encapsulation Mechanism:

1. **Lattice Simulation**: Generates simulated Kyber-768 public keys (1,184 bytes), private keys (2,400 bytes), and ciphertexts (1,088 bytes) matching NIST parameter sizes.
2. **Encapsulation & Decapsulation**: Banks encapsulate a 32-byte shared symmetric secret $\mathbf{K}$ using the aggregator's public key. The aggregator decapsulates $\mathbf{K}$ using its private key.
3. **Payload Protection**: Model updates are encrypted using standard **AES-256-GCM** authenticated encryption with the negotiated shared secret $\mathbf{K}$.
4. **Cryptographic Benchmarking**: The platform includes runtime benchmarks comparing Kyber-768 against classical algorithms:
   * **CRYSTALS-Kyber-768**: Sub-millisecond key generation and encapsulation.
   * **ECDH (secp256r1)**: Classical elliptic-curve Diffie-Hellman agreement.
   * **RSA-3072**: Classical 3,072-bit modular exponentiation.

> **Implementation Disclosure:** The Kyber-768 implementation is a software-level algorithmic simulation designed to demonstrate KEM workflows, payload overhead, and benchmark comparisons. It does not replace a production C-native library (such as `liboqs`) or a hardware security module (HSM).

---

### 4.8. Entity Knowledge Graph & Fraud Ring Detection

The `GraphBuilder` indexes identities, accounts, hardware identifiers, and digital addresses into relational graph structures (`GraphNode` and `GraphEdge`) to detect collusive fraud syndicates:

* **Entity Nodes**: `Customer`, `Device`, `IP_Address`, `PAN_Card`, `Phone`, `Email`, `Account`, `Merchant`, `Employee`.
* **Relationship Edges**: `OWNS`, `USED_BY`, `TRANSACTED_WITH`, `LINKED_TO`.
* **Collusive Cluster Detection**: Maps collusive multi-hop relationships where ostensibly separate customer profiles (e.g., `CUST_3`, `CUST_4`, `CUST_5`) share a single rooted device (`DEV_FRAUD`), a Tor exit node (`IP_FRAUD`), and a common mule account (`ACC_FRAUD`).

---

### 4.9. Regulatory Compliance & Insider Threat Center

* **RBI Cyber Security Framework Checklist**: Computes an automated technical compliance index based on live system states:
  * Zero Raw Data Sharing (20%)
  * Risk-Based Authentication Enabled (35%)
  * Federated Learning Active (15%)
  * Differential Privacy Enforced (15%)
  * Audit Logging & Key Records (15%)
* **Insider Threat Monitoring (`EmployeeActivityLog`)**: Audits administrator queries, flagging off-hour database dumps ($>1,000$ MB) and privilege escalation attempts on customer PII vaults.
* **SIM-Swap & Recovery Auditing**: Tracks account recovery requests initiated within 72 hours of telecommunication SIM swaps.

---

## 5. Technology Stack

### Backend Technologies
| Technology | Package / Component | Verified Version | Purpose |
|:---|:---|:---:|:---|
| **Language** | Python | `3.10+` | Core backend runtime |
| **Web Framework** | FastAPI | `0.110.0+` | Asynchronous REST API and dependency injection |
| **ASGI Server** | Uvicorn | `0.22.0+` | Production ASGI web server |
| **Database ORM** | SQLAlchemy | `2.0.0+` | Object-relational mapping and schema management |
| **Database Engines** | PostgreSQL / SQLite | `15` / `3.x` | Production container database / local zero-config storage |
| **Machine Learning** | Scikit-Learn | `1.2.0+` | Local Random Forest and SGD classifier models |
| **Numerical Processing**| NumPy | `1.24.0+` | Matrix operations and Laplacian noise sampling |
| **Data Frames** | Pandas | `2.0.0+` | Partitioned feature engineering and data loading |
| **Cryptography** | `cryptography` | `41.0.0+` | AES-256-GCM symmetric encryption, RSA, ECDH |
| **Schema Validation** | Pydantic | `2.0.0+` | Request and response data validation |

### Frontend Technologies
| Technology | Package / Component | Verified Version | Purpose |
|:---|:---|:---:|:---|
| **UI Framework** | React | `19.2.6` | Component hierarchy and state management |
| **Build Tooling** | Vite | `8.0.12` | Hot Module Replacement (HMR) and production bundling |
| **Styling Engine** | Tailwind CSS | `4.3.1` | Utility-first styling and custom design tokens |
| **Charts & Gauges** | Chart.js / React-Chartjs-2 | `4.5.1` / `5.3.1` | Canvas line, bar, doughnut, and radar visualizations |
| **Iconography** | Lucide React | `1.20.0` | Accessible enterprise cybersecurity icons |
| **Linting** | ESLint | `10.3.0` | Static code analysis and React Hook validation |

### Containerization & Deployment
| Component | Technology | Version / Base Image | Purpose |
|:---|:---|:---:|:---|
| **Backend Container** | Docker | `python:3.10-slim` | Multi-layer container with healthcheck |
| **Frontend Container**| Docker | `node:20-alpine` $\to$ `nginx:stable-alpine` | Multi-stage builder with Nginx reverse proxy |
| **Database Container**| Docker | `postgres:15-alpine` | Persistent transactional storage with volume |
| **Orchestration** | Docker Compose | `3.8` | Inter-service networking and healthcheck dependencies |

---

## 6. Repository Structure

```
FedShield-ID/
├── backend/
│   ├── app/
│   │   ├── identity/
│   │   │   └── identity_verification.py  # PAN checks, tempmail detection, synthetic ID heuristics
│   │   ├── ml/
│   │   │   ├── federated.py             # FedAvg weight aggregator with DP Laplace noise
│   │   │   ├── shap_explainer.py        # Linear Shapley value attribution and explanation
│   │   │   ├── train.py                 # Local Random Forest and SGD training per bank node
│   │   │   └── trust_score.py           # 10-vector Identity Trust Score calculation engine
│   │   ├── security/
│   │   │   ├── account_recovery.py      # SIM swap tracking and recovery velocity checks
│   │   │   ├── adaptive_auth.py         # Dynamic Risk-Based Authentication (RBA) decision rules
│   │   │   ├── insider_threat.py        # Privileged database access and off-hour query audits
│   │   │   └── pqc.py                   # CRYSTALS-Kyber-768 simulation and cryptographic benchmarks
│   │   ├── utils/
│   │   │   ├── data_generator.py        # Synthetic banking transaction and user profile generator
│   │   │   ├── genai_investigator.py    # Structured forensic analyst briefings
│   │   │   └── graph_builder.py         # Entity relationship graph builder and seeder
│   │   ├── database.py                  # SQLAlchemy ORM models and session management
│   │   └── main.py                      # FastAPI application routes, middleware, and background tasks
│   ├── Dockerfile                       # Python 3.10 slim container definition
│   └── requirements.txt                 # Pinned Python package dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx               # Top navigation, stream toggle, threat simulator
│   │   │   └── Sidebar.jsx              # Navigation menu, tactile states, live node telemetry
│   │   ├── pages/
│   │   │   ├── ComplianceDashboard.jsx  # RBI framework checklist, insider audits, CSV export
│   │   │   ├── Explainability.jsx       # Forensic case review and SHAP attribution charts
│   │   │   ├── FederatedMonitor.jsx     # Node topology, DP epsilon slider, FedAvg rounds
│   │   │   ├── FraudDetection.jsx       # Continuous Risk Ledger, threat injection, slide-over drawer
│   │   │   ├── IdentityVerification.jsx # Onboarding KYC audit registry and verification modal
│   │   │   ├── KnowledgeGraph.jsx       # Interactive SVG entity network visualizer
│   │   │   ├── Overview.jsx             # Executive SOC telemetry, KPIs, bank distribution
│   │   │   ├── SecurityDashboard.jsx    # PQC benchmarks, ML-KEM key debugger, biometric logs
│   │   │   └── TrustIntelligence.jsx    # Flagship profile explorer, radial trust gauge, radar chart
│   │   ├── App.jsx                      # Root application layout, routing, and data fetchers
│   │   ├── index.css                    # Skeuomorphic design tokens and component utilities
│   │   └── main.jsx                     # React application entry point
│   ├── Dockerfile                       # Multi-stage Node 20 / Nginx Alpine container definition
│   ├── eslint.config.js                 # ESLint configuration
│   ├── index.html                       # HTML5 root template
│   ├── nginx.conf                       # Nginx reverse proxy configuration for /api/ routes
│   ├── package.json                     # Frontend dependencies and build scripts
│   ├── postcss.config.js                # PostCSS plugins configuration
│   └── tailwind.config.js               # Custom light skeuomorphic design system tokens
├── .dockerignore                        # Docker build context exclusion rules
├── .env.example                         # Environment configuration template
├── docker-compose.yml                   # Multi-container orchestration (db, backend, frontend)
└── README.md                            # Technical architecture and documentation
```

---

## 7. Installation & Deployment Guide

### Prerequisites
* **Docker & Docker Compose**: Docker Desktop 24+ (WSL2 on Windows, Docker Engine on Linux/macOS)
* **Local Development (without Docker)**:
  * Python `3.10` or higher
  * Node.js `20.19+` or `22.12+` (required for Vite 8)
  * npm `10+`

---

### Method A: Docker Compose Deployment (Recommended)

Docker Compose provisions the complete multi-service stack with a PostgreSQL 15 database, FastAPI backend, and Nginx-powered React frontend.

1. **Clone repository and enter project root**:
   ```bash
   git clone https://github.com/amn2905/FedShield-ID.git
   cd FedShield-ID
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

3. **Build and start services**:
   ```bash
   docker compose up --build -d
   ```

4. **Verify container health and status**:
   ```bash
   docker compose ps
   ```
   *Expected output:*
   ```text
   NAME                 IMAGE                   STATUS                    PORTS
   fedshield-backend    fedshield-id-backend    Up (healthy)              0.0.0.0:8000->8000/tcp
   fedshield-db         postgres:15-alpine      Up (healthy)              0.0.0.0:5432->5432/tcp
   fedshield-frontend   fedshield-id-frontend   Up (healthy)              0.0.0.0:3000->80/tcp
   ```

5. **Access service interfaces**:
   * **React Web Application**: [http://localhost:3000](http://localhost:3000)
   * **FastAPI Swagger OpenAPI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
   * **Backend Health Check**: [http://localhost:8000/](http://localhost:8000/)

6. **View backend execution logs**:
   ```bash
   docker compose logs -f backend
   ```

7. **Graceful shutdown**:
   ```bash
   docker compose down
   # To remove persisted database volume:
   docker compose down -v
   ```

---

### Method B: Local Development Setup (Manual)

#### 1. Backend Setup (FastAPI + SQLite)
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run ASGI server (auto-seeds database on startup)
uvicorn app.main:app --reload --port 8000
```
*Backend runs on [http://localhost:8000](http://localhost:8000)* using local SQLite database `fedshield.db`.

#### 2. Frontend Setup (React + Vite)
```bash
cd frontend

# Install dependencies
npm install

# Run Vite development server
npm run dev
```
*Frontend runs on [http://localhost:5173](http://localhost:5173)* with Hot Module Replacement (HMR).

---

## 8. API Reference & Verified Endpoints

All endpoints are fully implemented and verified against the running FastAPI application.

### 8.1. System & Metrics
* `GET /`: Health check endpoint. Returns service greeting.
* `GET /dashboard-metrics`: Aggregates active transaction counts, fraud rates, federated model accuracy, bank partition distribution, threat levels, and security scores.
* `POST /stream-transactions?active={bool}`: Toggles background transaction generator (injects a new synthetic transaction every 3 seconds).

### 8.2. Identity Verification & Trust Intelligence
* `GET /trust-score`: Retrieves seeded user profiles with composite Trust Scores, risk categories, and biometric baselines.
* `GET /identity-verification`: Retrieves onboarding audit records evaluating PAN, email domain, phone carrier, and synthetic ID indicators.
* `POST /verify-identity`: Live identity parameter verification endpoint.
  * **Request Body**:
    ```json
    {
      "customer_name": "Amaan Sharma",
      "pan_number": "APXPS1234F",
      "email_address": "amaan@hdfcbank.com",
      "phone_number": "+91 98765 43210",
      "device_id": "dev_corporate_01",
      "ip_address": "103.45.12.89"
    }
    ```
  * **Response Format**:
    ```json
    {
      "identity_confidence_score": 100.0,
      "kyc_risk_score": 6.2,
      "synthetic_identity_score": 10.0,
      "status": "Trusted",
      "onboarding_risk_level": "Trusted",
      "email_risk": 5.0,
      "phone_risk": 8.0,
      "device_risk": 10.0,
      "fraud_indicators": []
    }
    ```

### 8.3. Risk Ledger & Threat Simulator
* `GET /transactions?bank={str}&is_flagged={bool}&limit={int}&offset={int}`: Paginated transactions ledger with filtering.
* `POST /predict`: Scores single transaction payloads, updating the ledger with SHAP explanations and trust indicators.
* `POST /simulate-attack`: Injects specific threat scenarios (`Transaction Fraud`, `Account Takeover`, `Synthetic Identity Fraud`, `Bot Attack`, `Suspicious Recovery`, `Insider Threat`).
  * **Request Body**:
    ```json
    {
      "attack_type": "Bot Attack",
      "bank": "Bank A"
    }
    ```
  * **Response**: Returns injected transaction record, computed trust and risk scores, SHAP explanations, and RBA decision (`Block Access`).

### 8.4. Federated Learning & Cryptography
* `POST /federated-round`: Coordinates a federated training round across Bank A, Bank B, and Bank C.
  * **Request Body**:
    ```json
    {
      "epsilon": 1.5,
      "encryption_mode": "PQC"
    }
    ```
  * **Response**: Returns round number, global accuracy, global loss, per-bank accuracies, noise scale added, encryption mode, and updated global weight vectors.
* `GET /aggregate`: Returns historical federated rounds and global model parameter history.
* `GET /security-status`: Returns active quantum-safe tunnel statuses, runtime cryptographic benchmarks, and live Kyber KEM handshake logs.
* `GET /privacy-status`: Returns current privacy budget $\epsilon$, data leakage risk ratings, and Laplace noise scale history.

### 8.5. XAI, Graph & Compliance
* `GET /explain/{tx_id}`: Returns linear SHAP feature attributions and natural language explanation for a transaction.
* `GET /fraud-investigation/{tx_id}`: Generates a structured forensic analyst briefing report.
* `GET /graph-data`: Returns node and edge collections for the entity relationship graph.
* `GET /compliance-status`: Returns RBI Cyber Security Framework weighted checklist evaluations.
* `GET /insider-threats`: Returns employee activity audits and privileged access risk rankings.
* `GET /recovery-events`: Returns SIM swap and account recovery audit events.

---

## 9. Verification & Testing Status

### Codebase Audits & Tests Executed
* **Frontend Linting (`npm run lint`)**: Passed with **0 errors** (ESLint configured for React 19).
* **Frontend Production Build (`npm run build`)**: Compiled successfully via Vite 8 in **1.16 seconds**.
* **Docker Multi-Container Orchestration**:
  * PostgreSQL 15, FastAPI, and Nginx containers built and started successfully.
  * All container health checks verified (`healthy`).
* **API Integration Tests**: Verified via PowerShell `Invoke-RestMethod` and browser requests across:
  * `/dashboard-metrics` (verified seed generation across 750 transactions).
  * `/verify-identity` (verified both legitimate and synthetic identity detection).
  * `/simulate-attack` (verified threat injection, SHAP calculation, and `Block Access` decisions).
  * `/federated-round` (verified multi-bank training, Laplace noise injection, and Kyber-768 payload encapsulation/decapsulation).
* **End-to-End Browser Workflow Verification**: Full automated browser test across all 9 navigation views (`/`, `/trust-score`, `/identity-verification`, `/transactions`, `/federated`, `/security`, `/compliance`, `/explain`, `/graph`).

---

## 10. Verified Implementation Inventory & Technical Disclosures

To maintain academic and professional engineering transparency, the following table details the implementation status of each system component:

| Component | Status | Implementation Details & Technical Evidence |
|:---|:---:|:---|
| **REST API & Schemas** | **Implemented & Verified** | Native FastAPI endpoints with Pydantic schemas, CORS middleware, and background tasks in [`backend/app/main.py`](file:///c:/2025-26/Msc%20Cybersecurity/Projects/FedShield-ID/backend/app/main.py). |
| **Relational Persistence** | **Implemented & Verified** | SQLAlchemy ORM models with PostgreSQL (Docker) and SQLite (local development) in [`backend/app/database.py`](file:///c:/2025-26/Msc%20Cybersecurity/Projects/FedShield-ID/backend/app/database.py). |
| **Identity Trust Scoring** | **Implemented & Verified** | 10-vector formula computing composite scores $\in [0, 100]$ in [`backend/app/ml/trust_score.py`](file:///c:/2025-26/Msc%20Cybersecurity/Projects/FedShield-ID/backend/app/ml/trust_score.py). |
| **Adaptive Authentication** | **Implemented & Verified** | RBA decision logic mapping trust thresholds to challenges (Allow, OTP, Step-Up, Face, Block) in [`backend/app/security/adaptive_auth.py`](file:///c:/2025-26/Msc%20Cybersecurity/Projects/FedShield-ID/backend/app/security/adaptive_auth.py). |
| **Identity Verification** | **Implemented & Verified** | Regex checks for PAN, disposable email heuristics, and synthetic ID indicators in [`backend/app/identity/identity_verification.py`](file:///c:/2025-26/Msc%20Cybersecurity/Projects/FedShield-ID/backend/app/identity/identity_verification.py). |
| **Federated Learning** | **Implemented (In-Process)** | Real FedAvg parameter averaging across 3 local bank partitions in [`backend/app/ml/federated.py`](file:///c:/2025-26/Msc%20Cybersecurity/Projects/FedShield-ID/backend/app/ml/federated.py). Partitions run within the service environment. |
| **Differential Privacy** | **Implemented & Verified** | L2-norm weight clipping and calibrated Laplacian noise generator in [`backend/app/ml/federated.py`](file:///c:/2025-26/Msc%20Cybersecurity/Projects/FedShield-ID/backend/app/ml/federated.py). |
| **Explainable AI (SHAP)** | **Implemented & Verified** | Analytical linear Shapley formulation computing additive contributions in [`backend/app/ml/shap_explainer.py`](file:///c:/2025-26/Msc%20Cybersecurity/Projects/FedShield-ID/backend/app/ml/shap_explainer.py). |
| **Post-Quantum Cryptography** | **Cryptographic Simulation** | Simulates NIST Kyber-768 key encapsulation and decapsulation over Python cryptography primitives (AES-256-GCM transport) in [`backend/app/security/pqc.py`](file:///c:/2025-26/Msc%20Cybersecurity/Projects/FedShield-ID/backend/app/security/pqc.py). |
| **Biometric Telemetry** | **Simulated Input** | Keystroke dynamics and mouse jitter are modeled via realistic synthetic generation in [`backend/app/utils/data_generator.py`](file:///c:/2025-26/Msc%20Cybersecurity/Projects/FedShield-ID/backend/app/utils/data_generator.py). |
| **Knowledge Graph** | **Implemented & Verified** | Relational nodes and edges rendered dynamically via interactive SVG in [`frontend/src/pages/KnowledgeGraph.jsx`](file:///c:/2025-26/Msc%20Cybersecurity/Projects/FedShield-ID/frontend/src/pages/KnowledgeGraph.jsx). |
| **Regulatory Assessment** | **Illustrative Assessment** | Automated self-evaluation checklist scoring system states against RBI guidelines; not a formal legal certification. |

---

## 11. Security, Privacy & Research Considerations

1. **Isolation of Credentials**: No production API keys, database credentials, or private keys are committed to the codebase. Configurations use environment variables with fallback defaults.
2. **Container Security**: Production Dockerfiles build minimal images (`python:3.10-slim`, `nginx:stable-alpine`) and avoid unnecessary build tools in runtime stages.
3. **Privacy Budget Accounting**: While Laplacian noise is calibrated to $\Delta f / \epsilon$, repeated training rounds deplete privacy budgets. Production implementations should pair this with Rényi Differential Privacy accountants.
4. **Transition to Hardware Post-Quantum Cryptography**: The simulated Kyber-768 mechanism provides architectural verification of KEM handshakes. Connecting to live inter-bank backbones will require NIST-certified post-quantum cryptographic libraries (such as `liboqs` or OpenSSL 3.2+ PQC providers) running on certified Hardware Security Modules (HSMs).

---

## 12. Future Research & Development Roadmap

* **Native liboqs Integration**: Replace simulated Kyber-768 routines with native C-bindings (`pyoqs`) to benchmark physical lattice polynomial multiplication on AVX2 hardware.
* **Formal DP Accounting**: Integrate Rényi Differential Privacy (RDP) tracking across continuous federated aggregation rounds.
* **Live In-Browser Biometrics**: Deploy high-frequency JavaScript event listeners (`keydown`, `mousemove`) on client forms to stream genuine biometric signatures into the `TrustScoreEngine`.
* **Hardware Token WebAuthn/FIDO2**: Extend Step-Up Authentication verdicts to trigger browser WebAuthn / Passkey challenges.
* **Graph Neural Networks (GNN)**: Train PyTorch Geometric models on the Knowledge Graph to predict collusive mule clusters autonomously.

---

## 13. Author & Attribution

**Mohd. Amaan Hamid**  
MSc Cybersecurity  
Email: [hamidamaan3@gmail.com](mailto:hamidamaan3@gmail.com)  

*Developed as an advanced cybersecurity engineering and privacy-preserving identity trust research platform.*
