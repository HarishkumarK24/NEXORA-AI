import re
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.entities import (
    Ticket, TicketStatus, TicketPriority, RiskLevel, ApprovalRequest,
    ApprovalStatus, AgentExecutionLog, MajorIncident, Asset, KnowledgeArticle, AuditEvent
)
from app.tools.registry import ToolRegistry, sim_state

class AIILGraph:
    """
    Autonomous Incident Intelligence Loop (AIIL) State Machine Orchestrator.
    Covers the 7-stage lifecycle across 8 coordinated AI agents:
    STAGE 1: UNDERSTAND (Intake Intelligence Agent)
    STAGE 2: INVESTIGATE (Knowledge + Asset Tools)
    STAGE 3: REASON (Root Cause Investigation Agent)
    STAGE 4: PLAN (Resolution Planning Agent)
    STAGE 5: ACT (Execution Agent with Human-In-The-Loop Approval Gates)
    STAGE 6: VERIFY (Verification Agent - independent telemetry check)
    STAGE 7: ADAPT (Dynamic Adaptation, Failure Recovery, Major Incident Detection)
    """

    @classmethod
    def _log_agent(cls, db: Session, ticket_id: int, agent_name: str, stage: str, action: str, reasoning: str, evidence: dict = None, confidence: float = 1.0):
        log = AgentExecutionLog(
            ticket_id=ticket_id,
            agent_name=agent_name,
            stage=stage,
            action=action,
            reasoning_summary=reasoning,
            evidence_data=evidence or {},
            confidence=confidence,
            status="COMPLETED"
        )
        db.add(log)
        db.commit()
        return log

    @classmethod
    def run_stage_understand(cls, db: Session, ticket: Ticket) -> Dict[str, Any]:
        """STAGE 1: Understand natural language, extract symptoms, assets, exam criticality."""
        desc = (ticket.title + " " + ticket.description).lower()
        
        # 1. Categorization
        cat = "Network" if any(w in desc for w in ["wifi", "wi-fi", "network", "connect", "internet", "signal", "packet"]) else \
              "Account and Authentication" if any(w in desc for w in ["login", "password", "sso", "auth", "token", "access", "lock"]) else \
              "Printer" if any(w in desc for w in ["print", "paper", "jam", "toner"]) else \
              "Software" if any(w in desc for w in ["software", "crash", "app", "license", "install"]) else "Other IT Issues"
        ticket.category = cat

        # 2. Extract context
        is_exam = "exam" in desc or "test" in desc or "quiz" in desc or "midterm" in desc
        ticket.is_exam_critical = is_exam

        # Extract Building
        match_bld = re.search(r'building\s*([a-zA-Z0-9]+)|block\s*([a-zA-Z0-9]+)', desc)
        if match_bld:
            bld_char = match_bld.group(1) or match_bld.group(2)
            ticket.building = f"Building {bld_char.upper()}"
        elif not ticket.building:
            ticket.building = "Building B" # Default campus building

        # Extract Room
        match_room = re.search(r'room\s*([0-9a-zA-Z]+)|lab\s*([0-9a-zA-Z]+)', desc)
        if match_room:
            ticket.room = f"Room {(match_room.group(1) or match_room.group(2)).upper()}"

        ticket.status = TicketStatus.ANALYZING
        db.commit()

        cls._log_agent(
            db, ticket.id, "INTAKE_AGENT", "UNDERSTAND", "ENTITY_EXTRACTION",
            f"Extracted category: {ticket.category}, Building: {ticket.building}, Exam Critical: {ticket.is_exam_critical}",
            {"symptoms_extracted": ["latency", "disconnection" if "wifi" in desc else "access_failure"], "exam_flag": is_exam},
            confidence=0.96
        )
        return {"category": ticket.category, "building": ticket.building, "exam_critical": ticket.is_exam_critical}

    @classmethod
    def run_stage_investigate(cls, db: Session, ticket: Ticket) -> Dict[str, Any]:
        """STAGE 2: Correlate historical tickets, search KB, check asset status & network telemetry."""
        ticket.status = TicketStatus.INVESTIGATING
        db.commit()

        # Check telemetry for building
        net_telemetry = ToolRegistry.check_network_health(db, ticket.building, ticket_id=ticket.id)
        
        # Identify asset
        candidate_asset = db.query(Asset).filter(Asset.building == ticket.building).first()
        asset_info = ToolRegistry.check_asset_status(db, candidate_asset.id, ticket_id=ticket.id) if candidate_asset else {}
        if candidate_asset:
            ticket.affected_asset_id = candidate_asset.id

        # Search knowledge base
        kb_matches = ToolRegistry.search_knowledge_base(db, f"{ticket.category} {ticket.title}")

        # Check for correlated tickets in same building within last 30 minutes
        recent_cutoff = datetime.utcnow() - timedelta(minutes=45)
        correlated = db.query(Ticket).filter(
            Ticket.building == ticket.building,
            Ticket.id != ticket.id,
            Ticket.created_at >= recent_cutoff
        ).all()

        evidence_payload = {
            "network_telemetry": net_telemetry,
            "asset_diagnostics": asset_info,
            "kb_top_match": kb_matches[0] if kb_matches else None,
            "correlated_ticket_ids": [t.ticket_code for t in correlated],
            "correlated_count": len(correlated)
        }

        cls._log_agent(
            db, ticket.id, "KNOWLEDGE_INVESTIGATION_AGENT", "INVESTIGATE", "MULTI_SOURCE_TELEMETRY",
            f"Investigated asset {ticket.affected_asset_id}. Found {len(correlated)} correlated building incidents.",
            evidence_payload,
            confidence=0.94
        )
        return evidence_payload

    @classmethod
    def run_stage_reason(cls, db: Session, ticket: Ticket, investigation_data: dict) -> Dict[str, Any]:
        """STAGE 3: Root Cause Reasoning, hypothesis formation, priority evaluation, major incident check."""
        ticket.status = TicketStatus.INVESTIGATING
        
        net = investigation_data.get("network_telemetry", {})
        asset = investigation_data.get("asset_diagnostics", {})
        corr_count = investigation_data.get("correlated_count", 0)

        # Priority calculation
        if ticket.is_exam_critical or corr_count >= 2 or net.get("packet_loss_pct", 0) > 30:
            ticket.priority = TicketPriority.CRITICAL
            ticket.sla_due_at = datetime.utcnow() + timedelta(minutes=30) # 30 min SLA
            urgency_reason = "Elevated to CRITICAL: Academic exam impact & multiple correlated campus complaints."
        elif corr_count > 0 or net.get("packet_loss_pct", 0) > 10:
            ticket.priority = TicketPriority.HIGH
            ticket.sla_due_at = datetime.utcnow() + timedelta(hours=2)
            urgency_reason = "Elevated to HIGH: Telemetry packet degradation observed."
        else:
            ticket.priority = TicketPriority.MEDIUM
            ticket.sla_due_at = datetime.utcnow() + timedelta(hours=8)
            urgency_reason = "Standard priority for individual workstation symptom."

        # Check for Major Incident emergence (Cluster > 2 tickets)
        if corr_count >= 2 and not ticket.parent_incident_id:
            major = db.query(MajorIncident).filter(
                MajorIncident.affected_building == ticket.building,
                MajorIncident.is_active == True
            ).first()
            if not major:
                major = MajorIncident(
                    code=f"MAJ-{ticket.building.replace(' ', '')}-001",
                    title=f"Infrastructure Outage in {ticket.building}",
                    summary=f"Automated major incident declared: {corr_count + 1} synchronized user complaints indicating infrastructure failure.",
                    affected_building=ticket.building,
                    affected_service=ticket.category,
                    severity="SEV-1",
                    is_active=True
                )
                db.add(major)
                db.commit()
                db.refresh(major)
            ticket.parent_incident_id = major.id
            ticket.is_major_incident = True

        # Hypotheses Generation
        hypotheses = []
        if asset.get("status") == "DEGRADED" or net.get("packet_loss_pct", 0) > 20:
            hypotheses.append({
                "hypothesis": f"Hardware freeze or memory exhaustion on Access Point {ticket.affected_asset_id}",
                "confidence": 0.92,
                "supporting_evidence": [
                    f"Asset {ticket.affected_asset_id} reports status {asset.get('status', 'DEGRADED')}",
                    f"Network probe reports {net.get('packet_loss_pct', 0)}% packet loss",
                    f"{corr_count + 1} users in {ticket.building} reporting identical downtime"
                ],
                "contradicting_evidence": []
            })
        elif ticket.category == "Account and Authentication":
            hypotheses.append({
                "hypothesis": "Corrupted SSO session cache and Kerberos token timeout",
                "confidence": 0.88,
                "supporting_evidence": ["User authentication handshake failed with token stale code"],
                "contradicting_evidence": []
            })
        else:
            hypotheses.append({
                "hypothesis": "Local network card misconfiguration or DHCP release failure",
                "confidence": 0.75,
                "supporting_evidence": ["Isolated failure symptoms"],
                "contradicting_evidence": ["Other local devices maintain link stability"]
            })

        best_hyp = hypotheses[0]
        ticket.root_cause_hypothesis = best_hyp["hypothesis"]
        ticket.confidence_score = best_hyp["confidence"]
        db.commit()

        cls._log_agent(
            db, ticket.id, "ROOT_CAUSE_AGENT", "REASON", "HYPOTHESIS_FORMULATION",
            f"Determined Root Cause: {best_hyp['hypothesis']} (Confidence: {best_hyp['confidence'] * 100}%). {urgency_reason}",
            {"hypotheses": hypotheses, "priority_evaluation": urgency_reason},
            confidence=best_hyp["confidence"]
        )
        return {"best_hypothesis": best_hyp, "priority": ticket.priority, "is_major": ticket.is_major_incident}

    @classmethod
    def run_stage_plan(cls, db: Session, ticket: Ticket, reason_data: dict) -> Dict[str, Any]:
        """STAGE 4: Resolution Planning Agent evaluates action paths and flags Human Approval gates."""
        ticket.status = TicketStatus.PLANNING
        
        plan_steps = []
        requires_human = False
        action_type = ""
        risk = RiskLevel.LOW

        if "Access Point" in (ticket.root_cause_hypothesis or ""):
            action_type = "RESTART_ACCESS_POINT"
            risk = RiskLevel.HIGH
            requires_human = True
            plan_steps = [
                {"step": 1, "action": "check_asset_status", "risk": "LOW", "target": ticket.affected_asset_id},
                {"step": 2, "action": "simulate_access_point_restart", "risk": "HIGH", "target": ticket.affected_asset_id, "requires_approval": True},
                {"step": 3, "action": "verify_connectivity", "risk": "LOW", "target": ticket.affected_asset_id}
            ]
        elif ticket.category == "Account and Authentication":
            action_type = "FLUSH_ACCOUNT_CACHE"
            risk = RiskLevel.MEDIUM
            requires_human = True
            plan_steps = [
                {"step": 1, "action": "simulate_account_cache_flush", "risk": "MEDIUM", "target": ticket.creator.username if ticket.creator else "user", "requires_approval": True},
                {"step": 2, "action": "verify_connectivity", "risk": "LOW", "target": "SSO_GATEWAY"}
            ]
        else:
            action_type = "RUN_DIAGNOSTICS"
            risk = RiskLevel.LOW
            requires_human = False
            plan_steps = [
                {"step": 1, "action": "execute_diagnostic", "risk": "LOW", "target": "10.0.1.1"},
                {"step": 2, "action": "verify_connectivity", "risk": "LOW", "target": "GATEWAY"}
            ]

        ticket.selected_plan = {
            "action_type": action_type,
            "risk_level": risk.value,
            "requires_approval": requires_human,
            "steps": plan_steps,
            "estimated_recovery_seconds": 45
        }

        if requires_human:
            ticket.status = TicketStatus.WAITING_APPROVAL
            # Create ApprovalRequest entity
            approval = ApprovalRequest(
                ticket_id=ticket.id,
                action_type=action_type,
                description=f"Authorized command requested: {action_type} on {ticket.affected_asset_id or 'infrastructure'}.",
                reason=ticket.root_cause_hypothesis,
                risk_level=risk,
                potential_impact=f"Temporary 15-second sub-millisecond route switch for users in {ticket.building}.",
                target_asset=ticket.affected_asset_id,
                action_payload={"steps": plan_steps},
                status=ApprovalStatus.PENDING
            )
            db.add(approval)
        else:
            ticket.status = TicketStatus.EXECUTING

        db.commit()

        cls._log_agent(
            db, ticket.id, "PLANNING_AGENT", "PLAN", "PLAN_GENERATION",
            f"Generated 3-step recovery strategy. Risk: {risk.value.upper()}. Human Approval Required: {requires_human}",
            ticket.selected_plan,
            confidence=0.95
        )
        return ticket.selected_plan

    @classmethod
    def run_stage_act(cls, db: Session, ticket: Ticket, bypass_approval_check: bool = False) -> Dict[str, Any]:
        """STAGE 5: Execution Agent performs approved operations against simulated IT environment."""
        if not ticket.selected_plan:
            return {"success": False, "message": "No active plan"}

        # Enforce governance rule: High risk operations strictly require human approval
        if ticket.selected_plan.get("requires_approval") and not bypass_approval_check:
            approval = db.query(ApprovalRequest).filter(
                ApprovalRequest.ticket_id == ticket.id,
                ApprovalRequest.status == ApprovalStatus.APPROVED
            ).first()
            if not approval:
                ticket.status = TicketStatus.WAITING_APPROVAL
                db.commit()
                return {"success": False, "message": "Blocked by AI Governance Gate: Pending human approval."}

        ticket.status = TicketStatus.EXECUTING
        db.commit()

        action_type = ticket.selected_plan.get("action_type")
        execution_results = []

        if action_type == "RESTART_ACCESS_POINT":
            res = ToolRegistry.simulate_access_point_restart(db, ticket.affected_asset_id, ticket_id=ticket.id)
            execution_results.append(res)
        elif action_type == "FLUSH_ACCOUNT_CACHE":
            res = ToolRegistry.simulate_account_cache_flush(db, ticket.creator.username if ticket.creator else "student1", ticket_id=ticket.id)
            execution_results.append(res)
        else:
            res = ToolRegistry.execute_diagnostic(db, "10.0.1.1", ticket_id=ticket.id)
            execution_results.append(res)

        cls._log_agent(
            db, ticket.id, "EXECUTION_AGENT", "ACT", "EXECUTE_TOOL",
            f"Executed tool operations for plan: {action_type}. State mutation applied.",
            {"results": execution_results},
            confidence=0.98
        )
        return {"success": True, "results": execution_results}

    @classmethod
    def run_stage_verify(cls, db: Session, ticket: Ticket) -> Dict[str, Any]:
        """STAGE 6: Verification Agent checks independent post-resolution telemetry."""
        ticket.status = TicketStatus.VERIFYING
        db.commit()

        ver_res = ToolRegistry.verify_connectivity(db, ticket.affected_asset_id, ticket.building, ticket_id=ticket.id)
        ticket.verification_results = ver_res
        
        is_verified = ver_res.get("verified", False)

        if is_verified:
            ticket.status = TicketStatus.RESOLVED
            ticket.resolved_at = datetime.utcnow()
            
            # If part of major incident, check if other tickets can be resolved
            if ticket.parent_incident_id:
                major = db.query(MajorIncident).filter(MajorIncident.id == ticket.parent_incident_id).first()
                if major:
                    other_tickets = db.query(Ticket).filter(
                        Ticket.parent_incident_id == major.id,
                        Ticket.id != ticket.id
                    ).all()
                    for ot in other_tickets:
                        ot.status = TicketStatus.RESOLVED
                        ot.resolved_at = datetime.utcnow()
                        cls._log_agent(
                            db, ot.id, "SUPERVISOR_AGENT", "VERIFY", "MAJOR_INCIDENT_COORDINATION",
                            f"Cascade resolved under Parent Incident {major.code}. Infrastructure confirmed operational.",
                            {"parent_incident": major.code}
                        )
                    major.is_active = False
                    major.resolved_at = datetime.utcnow()

            db.commit()
            cls._log_agent(
                db, ticket.id, "VERIFICATION_AGENT", "VERIFY", "INDEPENDENT_VERIFICATION",
                f"Resolution VERIFIED: Packet loss at {ver_res.get('packet_loss_pct')}% and hardware operational.",
                ver_res,
                confidence=1.0
            )
            return {"status": "RESOLVED", "verified": True, "details": ver_res}
        else:
            # Resolution failed! Trigger STAGE 7: ADAPT
            return cls.run_stage_adapt(db, ticket, "Verification checks failed post-execution")

    @classmethod
    def run_stage_adapt(cls, db: Session, ticket: Ticket, trigger_reason: str) -> Dict[str, Any]:
        """STAGE 7: Autonomous Adaptation, Replanning, or Escalation upon failure."""
        ticket.adaptation_count += 1
        ticket.status = TicketStatus.FAILED_ADAPTING
        db.commit()

        cls._log_agent(
            db, ticket.id, "SUPERVISOR_AGENT", "ADAPT", "DYNAMIC_ADAPTATION_TRIGGERED",
            f"Adaptation Cycle #{ticket.adaptation_count}: {trigger_reason}. Initiating dynamic fallback plan.",
            {"adaptation_reason": trigger_reason, "cycle": ticket.adaptation_count},
            confidence=0.85
        )

        if ticket.adaptation_count > 2:
            ticket.status = TicketStatus.ESCALATED
            db.commit()
            cls._log_agent(
                db, ticket.id, "SUPERVISOR_AGENT", "ADAPT", "ESCALATION",
                "Max autonomous adaptation cycles reached. Escalated to Tier-3 Senior Network Administrator.",
                {"escalated_tier": 3}
            )
            return {"status": "ESCALATED", "message": "Escalated to human expert after failed autonomous retries"}

        # Dynamic Replanning: fallback alternative hypothesis
        ticket.root_cause_hypothesis = "Upstream VLAN Gateway mismatch / DHCP lease starvation"
        ticket.selected_plan = {
            "action_type": "FLUSH_DHCP_AND_FALLBACK_ROUTING",
            "risk_level": "MEDIUM",
            "requires_approval": False,
            "steps": [
                {"step": 1, "action": "execute_diagnostic", "risk": "LOW", "target": "VLAN_GATEWAY"},
                {"step": 2, "action": "verify_connectivity", "risk": "LOW", "target": ticket.affected_asset_id}
            ]
        }
        ticket.status = TicketStatus.PLANNING
        db.commit()

        return {"status": "REPLANNED", "new_hypothesis": ticket.root_cause_hypothesis, "cycle": ticket.adaptation_count}

    @classmethod
    def run_full_lifecycle(cls, db: Session, ticket_id: int) -> Dict[str, Any]:
        """Full pipeline execution runner."""
        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
        if not ticket:
            return {"error": "Ticket not found"}

        # 1. UNDERSTAND
        cls.run_stage_understand(db, ticket)
        
        # 2. INVESTIGATE
        inv = cls.run_stage_investigate(db, ticket)
        
        # 3. REASON
        cls.run_stage_reason(db, ticket, inv)
        
        # 4. PLAN
        plan = cls.run_stage_plan(db, ticket, inv)
        
        # 5. ACT & VERIFY (if low risk, or proceed to approval hold)
        if not plan.get("requires_approval"):
            cls.run_stage_act(db, ticket)
            cls.run_stage_verify(db, ticket)

        db.refresh(ticket)
        return {
            "ticket_code": ticket.ticket_code,
            "status": ticket.status.value,
            "priority": ticket.priority.value,
            "hypothesis": ticket.root_cause_hypothesis,
            "plan": ticket.selected_plan
        }
