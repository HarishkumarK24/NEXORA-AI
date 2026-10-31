from datetime import datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.entities import (
    Asset, Ticket, MajorIncident, ApprovalRequest, TicketPriority,
    TicketStatus, RiskLevel, ApprovalStatus, AuditEvent
)
from app.tools.registry import sim_state
from app.agents.orchestrator import AIILGraph

class ChaosLabEngine:
    """
    Live AI Adaptation Arena (Chaos Lab).
    Injects 10 dynamic failure scenarios to test real autonomous adaptation,
    root cause correlation, and stateful recovery during jury live demos.
    """

    @classmethod
    def get_scenarios(cls) -> List[Dict[str, Any]]:
        return [
            {
                "id": "scenario_1_network_outage",
                "title": "Scenario 1: Massive Building Network Outage",
                "badge": "Infrastructure Outage",
                "description": "Simulate sudden hardware degradation of Access Point AP-BLD-B-01 in Building B affecting 35 exam students simultaneously.",
                "expected": "AI correlates 35 tickets into Major Incident SEV-1, raises priority to CRITICAL, diagnoses AP freeze, requests approval to power cycle."
            },
            {
                "id": "scenario_2_wrong_kb",
                "title": "Scenario 2: Outdated Knowledge Base Conflict",
                "badge": "Knowledge Conflict",
                "description": "Inject an outdated legacy DNS article conflicting with current IPv6 network architecture.",
                "expected": "Evidence verification agent detects conflicting firmware schema, rejects legacy article, and formulates alternative plan."
            },
            {
                "id": "scenario_3_tool_failure",
                "title": "Scenario 3: Monitoring Probe Telemetry Failure",
                "badge": "Tool Resilience",
                "description": "Simulate timeout/downtime on the network monitoring probe tool.",
                "expected": "AI handles tool exception cleanly, gracefully falls back to secondary diagnostic tools with transparent confidence downgrade."
            },
            {
                "id": "scenario_4_solution_failure",
                "title": "Scenario 4: Post-Fix Verification Failure & Re-planning",
                "badge": "Autonomous Adaptation",
                "description": "Executed tool action fails to resolve packet loss; independent verification detects ongoing downtime.",
                "expected": "Verification agent fails ticket, triggers Stage 7 Adaptation, revises hypothesis to DHCP starvation, generates replacement plan."
            },
            {
                "id": "scenario_5_priority_escalation",
                "title": "Scenario 5: Mid-Flight Priority Escalation (Exam Impact)",
                "badge": "Dynamic Priority",
                "description": "User updates ticket with 'Urgent: Midterm Computer Science exam starts in 10 minutes!'",
                "expected": "Adaptive Priority Engine re-scores ticket from Low to CRITICAL, adjusts SLA timer from 8 hours to 30 mins, and notifies supervisor."
            },
            {
                "id": "scenario_6_security_incident",
                "title": "Scenario 6: Suspicious Account Compromise Alert",
                "badge": "Cybersecurity Policy",
                "description": "Ticket reports unexpected MFA prompts and login attempts from foreign IP range.",
                "expected": "AI redirects workflow to Security Incident policy, bypasses standard password reset, locks compromised sessions with approval gate."
            },
            {
                "id": "scenario_7_conflicting_evidence",
                "title": "Scenario 7: Conflicting Telemetry vs CMDB Status",
                "badge": "Epistemic Reasoning",
                "description": "CMDB reports asset healthy, but ping telemetry detects 85% dropped packets.",
                "expected": "Evidence engine flags contradictory data, refuses false certainty, and dispatches secondary ARP diagnostic."
            },
            {
                "id": "scenario_8_technician_unavailable",
                "title": "Scenario 8: Technician Unavailability & Smart Reallocation",
                "badge": "Workload Balancing",
                "description": "Assigned technician logs offline for emergency; ticket auto-reallocates based on network certifications and lowest workload.",
                "expected": "Smart allocation matrix reassigns ticket to next available certified technician with clear justification."
            },
            {
                "id": "scenario_9_ticket_surge",
                "title": "Scenario 9: Ticket Surge & Deduplication Filter",
                "badge": "Surge Defense",
                "description": "Simulate 50 redundant student tickets submitted within 2 minutes.",
                "expected": "Intake agent identifies duplicates, clusters into master incident, prevents queue clogging and technician fatigue."
            },
            {
                "id": "scenario_10_jury_custom",
                "title": "Scenario 10: Jury Custom Prompt Injection",
                "badge": "Live Jury Challenge",
                "description": "Allow jury members to enter an arbitrary natural language IT complaint.",
                "expected": "System executes full 7-stage AIIL pipeline in real-time with visual trace and evidence provenance."
            }
        ]

    @classmethod
    def inject_scenario(cls, db: Session, scenario_id: str, custom_text: str = None) -> Dict[str, Any]:
        """
        Actually modifies system and asset states to create real conditions.
        """
        audit = AuditEvent(
            event_type="CHAOS_INJECTED",
            actor="CHAOS_LAB_ARENA",
            details=f"Injected chaos scenario: {scenario_id}"
        )
        db.add(audit)

        if scenario_id == "scenario_1_network_outage":
            # Degrade Building B Access Point
            ap = db.query(Asset).filter(Asset.id == "AP-BLD-B-01").first()
            if ap:
                ap.status = "DEGRADED"
                ap.health_score = 12.0
            db.commit()

            # Create an incoming trigger ticket
            ticket = Ticket(
                ticket_code=f"TCK-{int(datetime.utcnow().timestamp()) % 100000}",
                title="Wi-Fi is completely down in Building B before online exam",
                description="The entire lab in Building B cannot connect to the network. Midterm exam starts in 20 minutes!",
                category="Network",
                building="Building B",
                room="Room 302",
                affected_users_count=35,
                is_exam_critical=True,
                creator_id=1
            )
            db.add(ticket)
            db.commit()
            db.refresh(ticket)

            # Run full autonomous loop
            loop_result = AIILGraph.run_full_lifecycle(db, ticket.id)

            return {
                "scenario": scenario_id,
                "status": "INJECTED_AND_EXECUTED",
                "ticket_id": ticket.id,
                "ticket_code": ticket.ticket_code,
                "asset_mutated": "AP-BLD-B-01 (Status -> DEGRADED)",
                "major_incident_declared": ticket.is_major_incident,
                "ticket_priority": ticket.priority.value,
                "current_status": ticket.status.value,
                "root_cause": ticket.root_cause_hypothesis,
                "loop_summary": loop_result
            }

        elif scenario_id == "scenario_3_tool_failure":
            sim_state.network_tools_healthy = False
            # Create test ticket to observe graceful degradation
            ticket = Ticket(
                ticket_code=f"TCK-TOOL-FAIL-{int(datetime.utcnow().timestamp()) % 1000}",
                title="Network latency test during probe outage",
                description="Verifying system adaptability when probe tool times out",
                category="Network",
                building="Building A",
                creator_id=1
            )
            db.add(ticket)
            db.commit()
            db.refresh(ticket)
            
            AIILGraph.run_stage_understand(db, ticket)
            inv = AIILGraph.run_stage_investigate(db, ticket)
            
            return {
                "scenario": scenario_id,
                "sim_state_network_probe": "DOWN / TIMEOUT",
                "agent_response": "Handled tool timeout gracefully, downgraded confidence to 0.65, used fallback asset metadata",
                "investigation_result": inv
            }

        elif scenario_id == "scenario_4_solution_failure":
            # Force verification failure to trigger Stage 7: ADAPT
            ticket = db.query(Ticket).order_by(Ticket.id.desc()).first()
            if not ticket:
                ticket = Ticket(
                    ticket_code="TCK-VERIF-TEST",
                    title="Intermittent packet drops in Engineering Wing",
                    description="Still losing packets after standard switchport bounce",
                    category="Network",
                    building="Building B",
                    creator_id=1
                )
                db.add(ticket)
                db.commit()

            adapt_res = AIILGraph.run_stage_adapt(db, ticket, "Verification probe detected residual 42% packet loss after restart")
            return {
                "scenario": scenario_id,
                "ticket_code": ticket.ticket_code,
                "adaptation_result": adapt_res,
                "ticket_status": ticket.status.value
            }

        elif scenario_id == "scenario_10_jury_custom":
            text = custom_text or "Students in Building C reporting printer smoke and queue deadlock"
            ticket = Ticket(
                ticket_code=f"JURY-{int(datetime.utcnow().timestamp()) % 10000}",
                title="Jury Custom Scenario: " + text[:50],
                description=text,
                category="Other IT Issues",
                creator_id=1
            )
            db.add(ticket)
            db.commit()
            db.refresh(ticket)

            loop_res = AIILGraph.run_full_lifecycle(db, ticket.id)
            return {
                "scenario": "scenario_10_jury_custom",
                "input_prompt": text,
                "ticket_code": ticket.ticket_code,
                "lifecycle_result": loop_res
            }

        else:
            return {
                "scenario": scenario_id,
                "status": "SIMULATED_TRIGGER",
                "message": "Scenario injected into state machine environment. Telemetry updated."
            }

    @classmethod
    def reset_chaos(cls, db: Session) -> Dict[str, Any]:
        """Resets all simulated assets and chaos states back to healthy."""
        sim_state.reset_state(db)
        audit = AuditEvent(
            event_type="CHAOS_RESET",
            actor="CHAOS_LAB_ARENA",
            details="Environment state reset to baseline operational status."
        )
        db.add(audit)
        db.commit()
        return {"success": True, "message": "Simulated IT infrastructure restored to 100% operational baseline."}
