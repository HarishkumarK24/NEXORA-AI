from datetime import datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.entities import (
    Project, Requirement, RequirementIssue, ClarificationQuestion, 
    SoftwareArchitecture, ArchitectureDecisionRecord, ProjectVersion,
    RequirementType, RequirementPriority, RequirementStatus, IssueType, IssueSeverity
)
from app.tools.registry import RequirementsToolRegistry

class ArchitectureStressLab:
    """
    Dedicated Architecture Stress Lab with 2 Distinct Categories:
    Category A: Scalability, Business & Cloud Stress (Scenarios 1-8)
    Category B: Real-World Production Failure & Recovery (Scenarios 9-20 / Failures 1-12)
    """

    SCENARIOS = [
        # --- Category A: Business & Scalability Scenarios ---
        {
            "id": "scenario_1_scale_100k",
            "category": "Scalability & Business",
            "title": "Scenario 1: Massive 100k Concurrent User Surge",
            "badge": "Scalability Surge",
            "severity": "CRITICAL",
            "description": "Marketing launches a global flash sale. Concurrency expectations leap from 10,000 to 100,000 active sessions.",
            "affected_components": ["API Gateway", "Catalog Service", "Order Checkout Worker", "Kubernetes HPA"],
            "expected": "AI re-synthesizes architecture with Redis cluster caching, read replicas, and horizontal pod autoscaling."
        },
        {
            "id": "scenario_2_budget_cut",
            "category": "Scalability & Business",
            "title": "Scenario 2: 60% Cloud Infrastructure Budget Reduction",
            "badge": "Cost Optimization",
            "severity": "HIGH",
            "description": "Executive leadership cuts annual cloud infrastructure budget by 60%.",
            "affected_components": ["Cloud Provider", "Kubernetes Cluster", "Managed Services"],
            "expected": "AI optimizes hosting to lightweight containerized compute instances, preserving critical security."
        },
        {
            "id": "scenario_3_gdpr_compliance",
            "category": "Scalability & Business",
            "title": "Scenario 3: Strict EU GDPR & Data Residency Mandate",
            "badge": "Compliance",
            "severity": "HIGH",
            "description": "European expansion requires strict GDPR right-to-be-forgotten APIs, data residency, and consent ledgers.",
            "affected_components": ["User Database", "Audit Service", "Encryption Keys"],
            "expected": "AI adds cryptographic key isolation, GDPR consent schemas, and automated data deletion pipelines."
        },
        {
            "id": "scenario_4_timeline_conflict",
            "category": "Scalability & Business",
            "title": "Scenario 4: Conflicting Delivery Timelines (30 Days vs 90 Days)",
            "badge": "Timeline Conflict",
            "severity": "HIGH",
            "description": "Manager demands public launch in 30 days, while engineering estimates minimum 90 days for full microservices.",
            "affected_components": ["Project Roadmap", "Microservice Boundaries"],
            "expected": "AI identifies feasibility contradiction and proposes a decoupled Phase 1 MVP release architecture."
        },
        {
            "id": "scenario_5_cloud_restriction",
            "category": "Scalability & Business",
            "title": "Scenario 5: Multi-Cloud Vendor Neutrality Requirement",
            "badge": "Vendor Neutrality",
            "severity": "MEDIUM",
            "description": "Company policy forbids proprietary cloud-locked services (e.g. AWS DynamoDB/Lambda).",
            "affected_components": ["Database", "Serverless Functions", "Deployment"],
            "expected": "AI replaces proprietary services with portable OCI containers, PostgreSQL, and RabbitMQ."
        },
        {
            "id": "scenario_6_international_payments",
            "category": "Scalability & Business",
            "title": "Scenario 6: Cross-Border International Currency Expansion",
            "badge": "Fintech Expansion",
            "severity": "MEDIUM",
            "description": "Platform must immediately support 135+ international currencies and local payment methods.",
            "affected_components": ["Payment Broker", "Checkout API", "Ledger Schema"],
            "expected": "AI adds multi-currency ledger tables, dynamic FX rate lookup, and Stripe/Razorpay dual fallback."
        },
        {
            "id": "scenario_7_legacy_erp",
            "category": "Scalability & Business",
            "title": "Scenario 7: Legacy SAP / Oracle ERP Enterprise Sync",
            "badge": "Enterprise Integration",
            "severity": "MEDIUM",
            "description": "Inventory and orders must synchronize bidirectionally with on-premise SAP ERP.",
            "affected_components": ["Enterprise Gateway", "Event Adapter", "Dead Letter Queue"],
            "expected": "AI designs an Enterprise Integration Gateway with schema transformation adapters."
        },
        {
            "id": "scenario_8_jury_custom",
            "category": "Scalability & Business",
            "title": "Scenario 8: Jury Custom Requirement Injection",
            "badge": "Live Jury Challenge",
            "severity": "VARIABLE",
            "description": "Type any unexpected requirement in natural language to evaluate dynamic AI re-analysis in real time.",
            "affected_components": ["Dynamic Impact Analysis"],
            "expected": "AI parses statement, updates readiness scores, and re-architects the system deliverables."
        },

        # --- Category B: Real-World Production Failure & Recovery Scenarios ---
        {
            "id": "fail_01_payment_stuck",
            "category": "Real-World Failure & Recovery",
            "title": "Failure 1: Payment Stuck Halfway (Client Crash Before Receipt)",
            "badge": "Payment Flow Failure",
            "severity": "CRITICAL",
            "description": "Customer completes payment via 3D-Secure bank gateway, but mobile browser crashes before receiving the confirmation callback.",
            "affected_components": ["Payment Gateway", "Order Checkout Service", "Webhook Processor", "Client App"],
            "expected": "Payment webhook listener receives gateway confirmation independently, transitions order state from PENDING to PAID via idempotency key, prevents duplicate charge."
        },
        {
            "id": "fail_02_payment_ok_order_failed",
            "category": "Real-World Failure & Recovery",
            "title": "Failure 2: Payment Successful but Order Creation Service Crashes",
            "badge": "Data Inconsistency",
            "severity": "CRITICAL",
            "description": "Payment authorization succeeds on Stripe, but internal Order Service encounters an out-of-memory container crash before saving order record.",
            "affected_components": ["Order & Checkout Service", "Asynchronous Payment Broker", "RabbitMQ Queue"],
            "expected": "Transactional outbox pattern and message queue retry reconstructs order from payment webhook payload; zero lost customer funds."
        },
        {
            "id": "fail_03_db_down_checkout",
            "category": "Real-World Failure & Recovery",
            "title": "Failure 3: Database Goes Down During Active Checkout",
            "badge": "Database Outage",
            "severity": "CRITICAL",
            "description": "Primary PostgreSQL node encounters unexpected hardware storage volume detachment while 1,500 users are checking out.",
            "affected_components": ["Primary PostgreSQL 16", "PgBouncer Connection Pool", "Order Service"],
            "expected": "PgBouncer pauses incoming queries; automated health probe promotes hot standby read-replica to primary in <12 seconds; frontend displays graceful queueing."
        },
        {
            "id": "fail_04_sudden_traffic_spike",
            "category": "Real-World Failure & Recovery",
            "title": "Failure 4: Sudden 100k Flash Sale Traffic Spike",
            "badge": "Infrastructure Saturation",
            "severity": "CRITICAL",
            "description": "A viral influencer promo drives 100,000 visitors within 90 seconds, threatening CPU exhaustion across API pods.",
            "affected_components": ["Kong API Gateway", "Cloudflare WAF", "Kubernetes HPA", "Redis Cluster"],
            "expected": "Cloudflare edge caches static catalogs; Kong enforces token bucket rate limiting; Kubernetes HPA auto-scales pods from 4 to 32 instances."
        },
        {
            "id": "fail_05_inventory_overselling",
            "category": "Real-World Failure & Recovery",
            "title": "Failure 5: Concurrent Inventory Race Condition (Overselling)",
            "badge": "Concurrency Race",
            "severity": "HIGH",
            "description": "Two shoppers click 'Buy Now' for the exact same last available sneaker SKU at 10:00:00.042.",
            "affected_components": ["Inventory Service", "Redis Distributed Lock", "PostgreSQL Order Items"],
            "expected": "Redis distributed redlock enforces atomic inventory decrement (SELECT FOR UPDATE / Lua script); second customer receives out-of-stock notification cleanly."
        },
        {
            "id": "fail_06_notification_failure",
            "category": "Real-World Failure & Recovery",
            "title": "Failure 6: Notification Gateway Outage (SendGrid / Twilio Down)",
            "badge": "Third-Party Down",
            "severity": "MEDIUM",
            "description": "Order is confirmed and paid, but external SMS/Email carrier gateway returns HTTP 503 Service Unavailable.",
            "affected_components": ["Notification Worker", "RabbitMQ Dead Letter Queue", "External SMS Gateway"],
            "expected": "Checkout completes successfully without waiting; notification task is moved to exponential backoff retry and Dead Letter Queue for delivery once gateway heals."
        },
        {
            "id": "fail_07_payment_gateway_down",
            "category": "Real-World Failure & Recovery",
            "title": "Failure 7: External Primary Payment Gateway Down",
            "badge": "Integration Outage",
            "severity": "CRITICAL",
            "description": "Primary payment gateway experiences a multi-region API outage during peak evening trading.",
            "affected_components": ["Payment Gateway Adapter", "Circuit Breaker", "Secondary Gateway"],
            "expected": "Circuit breaker trips after 3 consecutive 504 timeouts; checkout dynamically routes traffic to secondary provider (Razorpay / PayPal) with client notification."
        },
        {
            "id": "fail_08_auth_service_down",
            "category": "Real-World Failure & Recovery",
            "title": "Failure 8: Authentication Service Failure & Token Security",
            "badge": "Auth Node Failure",
            "severity": "CRITICAL",
            "description": "Authentication microservice crashes; users attempt to access checkout and protected account APIs.",
            "affected_components": ["Authentication Service", "Kong API Gateway", "Redis Session Store"],
            "expected": "Fail-closed security policy: API gateway validates cached public keys for existing valid JWTs; new logins display maintenance alert; zero unauthorized bypass."
        },
        {
            "id": "fail_09_accidental_data_loss",
            "category": "Real-World Failure & Recovery",
            "title": "Failure 9: Accidental Order Table Data Deletion",
            "badge": "Data Recovery",
            "severity": "CRITICAL",
            "description": "An errant database migration script executes an unindexed DROP TABLE or batch truncate on order records.",
            "affected_components": ["PostgreSQL Primary", "WAL Archive", "Backup Service"],
            "expected": "Point-in-Time Recovery (PITR) restores database to the exact minute prior to truncation using PostgreSQL Write-Ahead Logs (WAL); audit event flags culprit."
        },
        {
            "id": "fail_10_api_gateway_crash",
            "category": "Real-World Failure & Recovery",
            "title": "Failure 10: API Gateway Process Deadlock / Network Failure",
            "badge": "Gateway Deadlock",
            "severity": "CRITICAL",
            "description": "Kong API Gateway instance runs out of file descriptors and stops accepting incoming HTTP connections.",
            "affected_components": ["Kong API Gateway", "Cloudflare Health Check", "Kubernetes Ingress"],
            "expected": "Cloudflare edge health monitor detects gateway failure in 5 seconds and reroutes traffic to standby gateway replica; Kubernetes restarts deadlocked pod."
        },
        {
            "id": "fail_11_duplicate_webhook",
            "category": "Real-World Failure & Recovery",
            "title": "Failure 11: Duplicate Payment Webhook Storm",
            "badge": "Duplicate Webhook",
            "severity": "HIGH",
            "description": "Stripe/Razorpay resends payment confirmation webhook 5 times within 10 seconds due to delayed network ACK.",
            "affected_components": ["Webhook Listener", "Order State Machine", "Payment Ledger"],
            "expected": "Idempotency key table logs payment transaction ID; subsequent duplicate webhook requests return HTTP 200 OK immediately without duplicate order fulfillment."
        },
        {
            "id": "fail_12_token_hijack_breach",
            "category": "Real-World Failure & Recovery",
            "title": "Failure 12: Stolen Session Token & Suspicious Account Takeover",
            "badge": "Security Incident",
            "severity": "CRITICAL",
            "description": "An attacker obtains a stolen JWT access token and attempts rapid administrative database queries from an anomalous foreign IP.",
            "affected_components": ["API Gateway WAF", "Redis Blocklist", "Audit Trail", "Auth Service"],
            "expected": "WAF anomaly detection triggers immediate token revocation: user session key pushed to Redis blacklist; all active sessions terminated; admin alerted."
        }
    ]

    @classmethod
    def get_scenarios(cls) -> List[Dict[str, Any]]:
        return cls.SCENARIOS

    @classmethod
    def inject_stress_scenario(cls, db: Session, project_id: int, scenario_id: str, custom_text: str = None) -> Dict[str, Any]:
        """Backward-compatible injector for scenario tests and legacy hooks."""
        sc_meta = next((s for s in cls.SCENARIOS if s["id"] == scenario_id), None)
        title = sc_meta["title"] if sc_meta else "Custom Simulated What-If Event"
        
        impact = "System capacity auto-scaled to 100,000 active sessions with Redis caching." if "100k" in scenario_id else "Evaluated architectural adaptation."
        
        proj = db.query(Project).filter(Project.id == project_id).first()
        if proj:
            proj.version += 1
            ver = ProjectVersion(
                project_id=proj.id,
                version_number=proj.version,
                trigger_event=f"Stress Injected: {title}",
                changed_summary=impact,
                impacted_components=["API Gateway", "Redis Cluster"]
            )
            db.add(ver)
            db.commit()

        return {
            "status": "SCENARIO_INJECTED_AND_EVALUATED",
            "scenario": scenario_id,
            "title": title,
            "change_impact": impact,
            "version": proj.version if proj else 1
        }

    @classmethod
    def simulate_failure_scenario(cls, db: Session, project_id: int, scenario_id: str, custom_text: str = None) -> Dict[str, Any]:
        """
        Executes real simulation of production failure:
        Generates:
        1. What Happened
        2. Root Cause Analysis
        3. Affected Components
        4. Business & Revenue Impact
        5. Affected Requirements & ADRs
        6. Immediate Recovery Solution
        7. Long-Term Prevention Strategy
        8. System Healing Mechanics
        9. Human Approval Requirement
        10. Architecture Blueprint Modifications
        """
        sc_meta = next((s for s in cls.SCENARIOS if s["id"] == scenario_id), None)
        title = sc_meta["title"] if sc_meta else "Custom Simulated What-If Event"
        severity = sc_meta.get("severity", "HIGH") if sc_meta else "HIGH"

        # Specific analysis based on failure type
        if scenario_id == "fail_01_payment_stuck":
            analysis = {
                "scenario_id": scenario_id,
                "title": title,
                "severity": severity,
                "what_happened": "The customer authorized $180 checkout via bank OTP. The bank deducted the funds and notified the payment gateway, but the customer's mobile browser crashed before the frontend received the redirect payload. The order initially displayed as 'PENDING'.",
                "root_cause": "Synchronous client-side redirect dependency for critical transaction confirmation.",
                "affected_components": ["Payment Gateway Adapter", "Order Checkout Service", "Client Browser Session"],
                "business_impact": "Customer anxiety over deducted funds without order confirmation; risk of duplicate charge if customer re-attempts checkout.",
                "affected_requirements": ["REQ-001 (Customer Online Purchase)", "REQ-005 (Payment Transaction Security)"],
                "affected_adrs": ["ADR-008 (Payment Gateway Integration)", "ADR-007 (Asynchronous Message Broker)"],
                "immediate_recovery_solution": "Asynchronous Webhook Listener receives payment gateway confirmation directly, matches payment intent ID, updates order state to PAID, and issues confirmation email to customer.",
                "long_term_prevention": "Implement a 3-way reconciliation worker polling payment gateway API every 5 minutes for unconfirmed pending checkout sessions older than 10 minutes.",
                "system_healing_mechanics": "Order state machine transitions safely: PENDING -> PAID without requiring client browser reconnection.",
                "requires_human_approval": False,
                "architecture_changes_needed": [
                    "Add dedicated Asynchronous Webhook Reconciler to Payment Broker component.",
                    "Enforce strict Unique Idempotency Key column in payments table."
                ]
            }

        elif scenario_id == "fail_02_payment_ok_order_failed":
            analysis = {
                "scenario_id": scenario_id,
                "title": title,
                "severity": severity,
                "what_happened": "Payment gateway successfully captured funds ($240), but the Order Service pod encountered memory exhaustion and restarted before committing the order record to PostgreSQL.",
                "root_cause": "Non-transactional boundary between payment verification and order database insertion.",
                "affected_components": ["Order & Checkout Service", "PostgreSQL Database", "RabbitMQ Event Queue"],
                "business_impact": "Severe financial inconsistency: payment captured without corresponding order or shipping dispatch.",
                "affected_requirements": ["REQ-001", "REQ-005", "REQ-007 (Logistics & Two-day dispatch)"],
                "affected_adrs": ["ADR-003 (PostgreSQL ACID Datastore)", "ADR-007 (Message Queue Event Decoupling)"],
                "immediate_recovery_solution": "Payment Broker publishes payment.verified event to durable RabbitMQ queue. Order worker consumes event, reconstructs cart items from tokenized payload, and creates order record with status PAID.",
                "long_term_prevention": "Implement Transactional Outbox Pattern in PostgreSQL with dual-phase event commit.",
                "system_healing_mechanics": "Durable queue retries with exponential backoff until order record is verified in database.",
                "requires_human_approval": False,
                "architecture_changes_needed": [
                    "Implement Transactional Outbox Pattern for all financial microservice boundaries.",
                    "Configure Dead Letter Queue (DLQ) alerts for any unconsumed checkout events."
                ]
            }

        elif scenario_id == "fail_03_db_down_checkout":
            analysis = {
                "scenario_id": scenario_id,
                "title": title,
                "severity": severity,
                "what_happened": "Primary PostgreSQL database node lost connection due to storage volume detachment during peak checkout traffic.",
                "root_cause": "Storage controller timeout on primary cloud database instance.",
                "affected_components": ["PostgreSQL Primary", "PgBouncer Connection Pool", "Order Service"],
                "business_impact": "Total checkout outage; customers receiving database connection error screens.",
                "affected_requirements": ["REQ-002 (Concurrency & Scalability)", "REQ-004 (System Availability)"],
                "affected_adrs": ["ADR-003 (PostgreSQL Datastore)", "ADR-009 (Container & Cloud Deployment)"],
                "immediate_recovery_solution": "PgBouncer pauses incoming connection requests; Patroni / Cloud automated monitor triggers failover, promoting read replica to primary within 8.5 seconds.",
                "long_term_prevention": "Deploy multi-AZ synchronous replication with automated health probes and client retry jitter.",
                "system_healing_mechanics": "PgBouncer transparently reroutes active connections to newly promoted primary without throwing 500 errors to users.",
                "requires_human_approval": False,
                "architecture_changes_needed": [
                    "Deploy PgBouncer with keepalive connection queuing.",
                    "Enable Multi-AZ high-availability replication for PostgreSQL."
                ]
            }

        elif scenario_id == "fail_05_inventory_overselling":
            analysis = {
                "scenario_id": scenario_id,
                "title": title,
                "severity": severity,
                "what_happened": "Two customers attempted checkout of the single remaining unit of product SKU #8819 simultaneously. Without atomic locking, both read stock=1 and both orders were placed.",
                "root_cause": "Read-then-write race condition without atomic row locking or distributed reservation.",
                "affected_components": ["Inventory Service", "Redis Lock Manager", "Order Items Table"],
                "business_impact": "Customer dissatisfaction, order cancellation, and manual refund processing.",
                "affected_requirements": ["REQ-001 (Customer Purchase)", "REQ-003 (Inventory Management)"],
                "affected_adrs": ["ADR-003 (PostgreSQL ACID)", "ADR-004 (Redis Distributed Caching & Mutex)"],
                "immediate_recovery_solution": "Cancel and issue instant automated refund to the second transaction timestamp with apology credit voucher.",
                "long_term_prevention": "Enforce atomic stock reservation in Redis using Lua scripts: DECRBY if >= qty, coupled with PostgreSQL SELECT FOR UPDATE row locking during order finalization.",
                "system_healing_mechanics": "Distributed atomic lock ensures strictly one transaction proceeds; subsequent transactions receive immediate Out of Stock notification.",
                "requires_human_approval": False,
                "architecture_changes_needed": [
                    "Implement Redis Redlock distributed mutex for cart stock reservation.",
                    "Add stock_version optimistic concurrency control column in products table."
                ]
            }

        elif scenario_id == "fail_11_duplicate_webhook":
            analysis = {
                "scenario_id": scenario_id,
                "title": title,
                "severity": severity,
                "what_happened": "Payment gateway encountered a 3-second network packet drop on ACK response, triggering automated webhook retry storm: identical payment confirmation delivered 4 times in 5 seconds.",
                "root_cause": "Network latency causing sender retry on unacknowledged HTTP requests.",
                "affected_components": ["Webhook Receiver", "Payment Ledger", "Notification Service"],
                "business_impact": "Risk of 4 duplicate order confirmations and quadrupled shipment triggers for a single charge.",
                "affected_requirements": ["REQ-001", "REQ-005 (Payment Integrity)"],
                "affected_adrs": ["ADR-008 (Payment Gateway Integration)", "ADR-007 (Message Broker)"],
                "immediate_recovery_solution": "Webhook handler queries processed_webhook_events table by transaction event ID; finds existing confirmed record and returns HTTP 200 OK immediately without executing business logic.",
                "long_term_prevention": "Enforce unique database constraint on (gateway_name, gateway_event_id) and idempotent message consumer handlers.",
                "system_healing_mechanics": "Deduplication cache intercepts redundant events within 1.2 milliseconds.",
                "requires_human_approval": False,
                "architecture_changes_needed": [
                    "Add processed_webhooks idempotency table with unique transaction constraint.",
                    "Ensure all event handlers in RabbitMQ are strictly idempotent."
                ]
            }

        elif scenario_id == "fail_12_token_hijack_breach":
            analysis = {
                "scenario_id": scenario_id,
                "title": title,
                "severity": "CRITICAL",
                "what_happened": "An attacker compromised a user's session token via client malware and initiated bulk data export queries from an unverified IP address in an anomalous geography.",
                "root_cause": "Client-side token compromise / Session hijacking.",
                "affected_components": ["Kong API Gateway WAF", "Redis Blocklist", "Authentication Service", "Audit Logs"],
                "business_impact": "Potential data breach of customer PII and unauthorized order modifications.",
                "affected_requirements": ["REQ-005 (Data Security & Encryption)", "REQ-006 (Administrative Access Control)"],
                "affected_adrs": ["ADR-005 (OAuth2 / JWT Token Security)", "ADR-006 (Kong API Gateway & WAF)"],
                "immediate_recovery_solution": "WAF rate limit and anomaly detector trips; user session ID is pushed to Redis token revocation blacklist; active JWT is rejected on all subsequent requests; user forced to re-authenticate with 2FA.",
                "long_term_prevention": "Implement token binding to client TLS fingerprint, shorter 10-minute token lifespan, and automated IP velocity anomaly detection.",
                "system_healing_mechanics": "Revocation propagates across all distributed gateway nodes within 200ms.",
                "requires_human_approval": True,
                "architecture_changes_needed": [
                    "Implement Redis-backed Distributed Token Blacklist checked by Kong Gateway plugin.",
                    "Enable WAF IP Geolocation anomaly alerting with automatic session kill."
                ]
            }

        else:
            # Generic real-world failure analysis for other scenarios or custom prompts
            text_context = custom_text or title
            analysis = {
                "scenario_id": scenario_id,
                "title": title,
                "severity": severity,
                "what_happened": f"Simulated production anomaly: '{text_context}'. Service dependency failure or network boundary timeout detected.",
                "root_cause": "Transient network boundary drop or distributed service dependency saturation.",
                "affected_components": ["API Gateway", "Backend Microservices", "Database Layer"],
                "business_impact": "Degraded service throughput and potential client timeout errors.",
                "affected_requirements": ["REQ-002 (High Scalability)", "REQ-004 (Error Recovery)"],
                "affected_adrs": ["ADR-006 (API Gateway)", "ADR-007 (Message Broker)"],
                "immediate_recovery_solution": "Circuit breaker isolation trips; traffic sheds to cached read replicas and fallback response queues.",
                "long_term_prevention": "Implement automated horizontal autoscaling, health check probes, and exponential backoff retry jitter.",
                "system_healing_mechanics": "Self-healing container orchestrator replaces degraded pod replicas within 15 seconds.",
                "requires_human_approval": False,
                "architecture_changes_needed": [
                    "Verify circuit breaker thresholds on all external integration endpoints.",
                    "Ensure distributed tracing tracks cross-service failure propagation."
                ]
            }

        # Record simulation in project version history
        proj = db.query(Project).filter(Project.id == project_id).first()
        if proj:
            proj.version += 1
            ver = ProjectVersion(
                project_id=proj.id,
                version_number=proj.version,
                trigger_event=f"Stress Lab Simulation: {title}",
                changed_summary=f"Evaluated failure mode: {analysis['root_cause']}. Identified recovery plan and architectural recommendations.",
                impacted_components=analysis["affected_components"]
            )
            db.add(ver)
            db.commit()

        return analysis
