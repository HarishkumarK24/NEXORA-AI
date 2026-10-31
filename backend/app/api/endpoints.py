from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime
from jose import jwt, JWTError

from app.core.config import settings
from app.core.database import get_db
from app.models.entities import (
    User, UserRole, Project, ProjectDocument, Requirement, 
    RequirementIssue, ClarificationQuestion, StakeholderResponse,
    SoftwareArchitecture, ArchitectureDecisionRecord, ProjectVersion,
    AuditEvent, RequirementType, RequirementPriority, RequirementStatus,
    ProposedRecommendation, RecommendationStatus
)
from app.core.security import verify_password, create_access_token
from app.tools.registry import RequirementsToolRegistry
from app.sim.stress_lab import ArchitectureStressLab

api_router = APIRouter()

# ----------------- AUTH DEPENDENCY -----------------
def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization:
        user = db.query(User).filter(User.role == UserRole.BUSINESS_OWNER).first()
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required")
        return user
    
    token = authorization.replace("Bearer ", "").strip()
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token claims")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token validation failed or expired")
        
    user = db.query(User).filter(User.username == username).first()
    if not user:
        user = db.query(User).filter(User.email == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ----------------- SCHEMAS -----------------
class LoginRequest(BaseModel):
    username: str
    password: str

class ProjectCreateRequest(BaseModel):
    title: str
    description: str
    domain: Optional[str] = "E-Commerce & Retail"

class DocumentSubmitRequest(BaseModel):
    project_id: int
    filename: str
    stakeholder_type: str
    content: str

class QuestionAnswerRequest(BaseModel):
    question_id: int
    selected_option: Optional[str] = None
    response_text: str

class StressInjectRequest(BaseModel):
    project_id: int
    scenario_id: str
    custom_text: Optional[str] = None

# ----------------- AUTH ENDPOINTS -----------------
@api_router.post("/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.username == payload.username) | (User.email == payload.username)
    ).first()
    
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid administrator credentials. Access restricted to authorized personnel.")
    
    token = create_access_token({"sub": user.username, "role": user.role.value, "user_id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": "Administrator",
            "organization": user.organization
        }
    }

# ----------------- PROJECTS -----------------
@api_router.get("/projects")
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
    return [{
        "id": p.id,
        "project_code": p.project_code,
        "title": p.title,
        "description": p.description,
        "domain": p.domain,
        "readiness_score": p.readiness_score,
        "version": p.version,
        "status": p.status,
        "created_at": str(p.created_at),
        "documents_count": len(p.documents),
        "requirements_count": len(p.requirements),
        "issues_count": len([i for i in p.issues if not i.is_resolved]),
        "questions_count": len([q for q in p.questions if q.status == "pending"])
    } for p in projects]

class AutonomousStartRequest(BaseModel):
    title: str
    description: str
    domain: Optional[str] = "E-Commerce & Retail"
    requirements_text: Optional[str] = None
    stakeholder_type: Optional[str] = "Business Owner / Product Manager"

@api_router.post("/projects/autonomous_start")
def start_autonomous_project(
    payload: AutonomousStartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a new project and executes the full 9-stage autonomous pipeline in one shot.
    Zero manual interruptions, confirmations, or approvals.
    """
    proj_count = db.query(Project).count()
    code = f"PRJ-{proj_count+1:03d}"
    
    proj = Project(
        project_code=code,
        title=payload.title,
        description=payload.description,
        domain=payload.domain or "E-Commerce & Retail",
        creator_id=current_user.id if current_user else 1,
        version=1,
        status="PROCESSING_AUTONOMOUSLY"
    )
    db.add(proj)
    db.commit()
    db.refresh(proj)

    # If requirements text provided, add as primary document
    if payload.requirements_text and payload.requirements_text.strip():
        doc = ProjectDocument(
            project_id=proj.id,
            filename=f"01_{payload.title.replace(' ', '_')}_Specs.txt",
            file_type="TXT",
            file_size=format_file_size(len(payload.requirements_text.encode('utf-8'))),
            processing_status="Processed",
            stakeholder_type=payload.stakeholder_type or "Business Owner / Product Manager",
            content=payload.requirements_text
        )
        db.add(doc)
        db.commit()

    # Execute complete 9-stage autonomous pipeline!
    result = RequirementsToolRegistry.execute_complete_autonomous_pipeline(db, proj.id)
    return {
        "success": True,
        "project_id": proj.id,
        "pipeline_result": result
    }

@api_router.get("/projects/{project_id}")
def get_project_workspace(project_id: int, db: Session = Depends(get_db)):
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    docs = [{
        "id": d.id,
        "filename": d.filename,
        "file_type": d.file_type or "TXT",
        "file_size": d.file_size or "12 KB",
        "processing_status": d.processing_status or "Processed",
        "stakeholder_type": d.stakeholder_type,
        "content": d.content,
        "created_at": str(d.created_at)
    } for d in proj.documents]

    reqs = [{
        "id": r.id,
        "req_code": r.req_code,
        "original_text": r.original_text,
        "stakeholder": r.stakeholder,
        "req_type": r.req_type.value,
        "priority": r.priority.value,
        "status": r.status.value,
        "source": r.source_reference,
        "is_enhanced": getattr(r, "is_enhanced", False),
        "enhancement_source": getattr(r, "enhancement_source", None),
        "version": getattr(r, "version", 1)
    } for r in proj.requirements]

    issues = [{
        "id": i.id,
        "issue_code": i.issue_code,
        "issue_type": i.issue_type.value,
        "severity": i.severity.value,
        "title": i.title,
        "explanation": i.explanation,
        "affected_stakeholders": i.affected_stakeholders,
        "business_impact": i.business_impact,
        "suggested_resolution": i.suggested_resolution,
        "is_resolved": i.is_resolved
    } for i in proj.issues]

    questions = [{
        "id": q.id,
        "question_code": q.question_code,
        "assigned_stakeholder": q.assigned_stakeholder,
        "question_text": q.question_text,
        "options": q.suggested_options,
        "reason": q.reason_for_asking,
        "impact": q.impact_if_unanswered,
        "status": q.status.value,
        "responses": [{
            "id": r.id,
            "responder": r.responder.full_name if r.responder else "Stakeholder",
            "text": r.response_text,
            "selected_option": r.selected_option,
            "created_at": str(r.created_at)
        } for r in q.responses]
    } for q in proj.questions]

    arch = None
    if proj.architecture:
        a = proj.architecture
        arch = {
            "style": a.architecture_style,
            "summary": a.summary,
            "tech_stack": a.tech_stack,
            "components": a.components,
            "database_design": a.database_design,
            "api_specifications": a.api_specifications,
            "security": a.security_architecture,
            "deployment": a.deployment_architecture,
            "system_diagram": a.system_diagram_mermaid,
            "er_diagram": a.er_diagram_mermaid
        }

    adrs = [{
        "id": ad.id,
        "adr_code": ad.adr_code,
        "title": ad.title,
        "category": ad.category or "System Layer",
        "status": ad.status,
        "recommended_tech": ad.recommended_tech,
        "context": ad.context,
        "decision": ad.decision,
        "alternatives": ad.considered_alternatives,
        "comparison_criteria": ad.comparison_criteria,
        "consequences": ad.consequences,
        "linked_requirements": ad.linked_requirement_ids
    } for ad in proj.adrs]

    versions = [{
        "version": v.version_number,
        "trigger": v.trigger_event,
        "summary": v.changed_summary,
        "approved_by": getattr(v, "approved_by", "Administrator"),
        "related_gap": getattr(v, "related_gap", None),
        "previous_value": getattr(v, "previous_value", None),
        "new_value": getattr(v, "new_value", None),
        "components": v.impacted_components,
        "created_at": str(v.created_at)
    } for v in proj.history_versions]

    recommendations = [{
        "id": r.id,
        "rec_code": r.rec_code,
        "issue_id": r.issue_id,
        "title": r.title,
        "category": r.category,
        "severity": r.severity.value,
        "simple_explanation": r.simple_explanation,
        "why_it_matters": r.why_it_matters,
        "recommended_action": r.recommended_action,
        "expected_result": r.expected_result,
        "technical_details": r.technical_details,
        "scenario_unresolved": r.scenario_unresolved,
        "scenario_resolved": r.scenario_resolved,
        "affected_requirements": r.affected_requirements,
        "affected_components": r.affected_components,
        "source_evidence": r.source_evidence,
        "status": r.status.value,
        "rejection_reason": r.rejection_reason,
        "committed_at": str(r.committed_at) if r.committed_at else None,
        "committed_by": r.committed_by
    } for r in (proj.recommendations or [])]

    return {
        "project": {
            "id": proj.id,
            "code": proj.project_code,
            "title": proj.title,
            "description": proj.description,
            "domain": proj.domain,
            "readiness_score": proj.readiness_score,
            "version": proj.version,
            "status": proj.status,
            "overall_outcome": getattr(proj, "overall_outcome", "Validated with Assumptions") or "Validated with Assumptions",
            "validation_report": getattr(proj, "validation_report", None),
            "dependency_graph": getattr(proj, "dependency_graph", None)
        },
        "documents": docs,
        "requirements": reqs,
        "issues": issues,
        "questions": questions,
        "architecture": arch,
        "adrs": adrs,
        "recommendations": recommendations,
        "version_history": versions
    }


# ----------------- DOCUMENT SUBMISSION & EXTRACTION -----------------
import io
import csv
from fastapi import UploadFile, File, Form
from fastapi.responses import Response

def extract_text_from_upload(filename: str, file_bytes: bytes) -> str:
    ext = filename.lower().split(".")[-1] if "." in filename else ""
    if ext == "pdf":
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            text = ""
            for page in reader.pages:
                text += (page.extract_text() or "") + "\n"
            return text.strip() or f"Extracted document text from {filename}"
        except Exception as e:
            return f"Error extracting PDF text: {str(e)}"
    elif ext in ["docx", "doc"]:
        try:
            import docx
            doc_file = docx.Document(io.BytesIO(file_bytes))
            text = "\n".join([p.text for p in doc_file.paragraphs if p.text])
            return text.strip() or f"Extracted document text from {filename}"
        except Exception as e:
            return f"Error extracting DOCX text: {str(e)}"
    elif ext == "csv":
        try:
            decoded = file_bytes.decode("utf-8", errors="ignore")
            reader = csv.reader(io.StringIO(decoded))
            rows = []
            for r in reader:
                if r:
                    rows.append(" | ".join(r))
            return "\n".join(rows)
        except Exception as e:
            return f"Error reading CSV: {str(e)}"
    else:
        # Default txt / text formats
        return file_bytes.decode("utf-8", errors="ignore")

def format_file_size(size_bytes: int) -> str:
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"

@api_router.post("/documents/upload")
async def upload_document(
    project_id: int = Form(...),
    stakeholder_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    contents = await file.read()
    filename = file.filename or "uploaded_document.txt"
    file_ext = filename.upper().split(".")[-1] if "." in filename else "TXT"
    file_size_str = format_file_size(len(contents))
    
    extracted_text = extract_text_from_upload(filename, contents)
    if not extracted_text.strip():
        extracted_text = f"Document content from {filename} ({file_size_str})"

    doc = ProjectDocument(
        project_id=project_id,
        filename=filename,
        file_type=file_ext,
        file_size=file_size_str,
        processing_status="Processed",
        stakeholder_type=stakeholder_type,
        content=extracted_text
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Automatically extract atomic requirements from content
    extracted = RequirementsToolRegistry.parse_and_extract_document(db, doc.id)
    # Reanalyze gaps, conflicts, clarifications and readiness score
    RequirementsToolRegistry.analyze_gaps_and_conflicts(db, project_id)
    RequirementsToolRegistry.generate_clarifications(db, project_id)
    RequirementsToolRegistry.calculate_readiness_score(db, project_id)

    return {
        "status": "SUCCESS",
        "document_id": doc.id,
        "filename": doc.filename,
        "file_type": doc.file_type,
        "file_size": doc.file_size,
        "processing_status": doc.processing_status,
        "stakeholder_type": doc.stakeholder_type,
        "extracted_count": len(extracted),
        "extracted_requirements": extracted
    }

@api_router.post("/documents")
def submit_document(payload: DocumentSubmitRequest, db: Session = Depends(get_db)):
    doc = ProjectDocument(
        project_id=payload.project_id,
        filename=payload.filename,
        file_type="TXT",
        file_size=format_file_size(len(payload.content.encode('utf-8'))),
        processing_status="Processed",
        stakeholder_type=payload.stakeholder_type,
        content=payload.content
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Automatically extract requirements
    extracted = RequirementsToolRegistry.parse_and_extract_document(db, doc.id)
    # Reanalyze gaps and conflicts
    RequirementsToolRegistry.analyze_gaps_and_conflicts(db, payload.project_id)
    RequirementsToolRegistry.generate_clarifications(db, payload.project_id)
    RequirementsToolRegistry.calculate_readiness_score(db, payload.project_id)

    return {
        "document_id": doc.id,
        "extracted_count": len(extracted),
        "extracted_requirements": extracted
    }

@api_router.get("/documents/{doc_id}/download")
def download_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(ProjectDocument).filter(ProjectDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return Response(
        content=doc.content,
        media_type="text/plain",
        headers={"Content-Disposition": f'attachment; filename="{doc.filename}"'}
    )

@api_router.delete("/documents/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(ProjectDocument).filter(ProjectDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    project_id = doc.project_id
    # Remove associated requirements
    db.query(Requirement).filter(Requirement.document_id == doc.id).delete()
    db.delete(doc)
    db.commit()

    # Reanalyze
    RequirementsToolRegistry.analyze_gaps_and_conflicts(db, project_id)
    RequirementsToolRegistry.calculate_readiness_score(db, project_id)

    return {"status": "DELETED", "document_id": doc_id}

# ----------------- CLARIFICATION RESPONSES -----------------
@api_router.post("/clarifications/respond")
def respond_clarification(
    payload: QuestionAnswerRequest, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    q = db.query(ClarificationQuestion).filter(ClarificationQuestion.id == payload.question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    resp = StakeholderResponse(
        question_id=q.id,
        responder_id=current_user.id,
        response_text=payload.response_text,
        selected_option=payload.selected_option
    )
    db.add(resp)
    q.status = "answered"
    
    # Mark associated issue resolved if applicable
    if q.issue:
        q.issue.is_resolved = True

    db.commit()

    # Dynamic Reanalysis: update readiness and re-architect
    readiness = RequirementsToolRegistry.calculate_readiness_score(db, q.project_id)
    RequirementsToolRegistry.generate_full_software_architecture(db, q.project_id)

    # Record version change
    proj = db.query(Project).filter(Project.id == q.project_id).first()
    if proj:
        proj.version += 1
        ver = ProjectVersion(
            project_id=proj.id,
            version_number=proj.version,
            trigger_event=f"Clarification answered: {q.question_code}",
            changed_summary=f"Stakeholder answered '{payload.selected_option or payload.response_text}'. Architecture dynamically re-evaluated.",
            impacted_components=["Payment Gateway", "Database Ledgers"]
        )
        db.add(ver)
        db.commit()

    return {
        "status": "ANSWERED_AND_REANALYZED",
        "readiness_score": readiness,
        "question_id": q.id
    }

# ----------------- ARCHITECTURE DECISION RECORDS -----------------
class ADRStatusUpdateRequest(BaseModel):
    status: str # ACCEPTED, REJECTED, REVISED

@api_router.patch("/adrs/{adr_id}/status")
def update_adr_status(adr_id: int, payload: ADRStatusUpdateRequest, db: Session = Depends(get_db)):
    adr = db.query(ArchitectureDecisionRecord).filter(ArchitectureDecisionRecord.id == adr_id).first()
    if not adr:
        raise HTTPException(status_code=404, detail="ADR not found")
    
    adr.status = payload.status
    db.commit()

    # Record version
    proj = db.query(Project).filter(Project.id == adr.project_id).first()
    if proj:
        proj.version += 1
        ver = ProjectVersion(
            project_id=proj.id,
            version_number=proj.version,
            trigger_event=f"ADR updated: {adr.adr_code}",
            changed_summary=f"Decision status for {adr.title} changed to {payload.status}.",
            impacted_components=[adr.category or "Architecture"]
        )
        db.add(ver)
        db.commit()

    return {"status": "SUCCESS", "adr_id": adr_id, "new_status": adr.status}

# ----------------- ARCHITECTURE GENERATION -----------------
@api_router.post("/projects/{project_id}/generate-architecture")
def trigger_architecture_generation(project_id: int, db: Session = Depends(get_db)):
    result = RequirementsToolRegistry.generate_full_software_architecture(db, project_id)
    return result

# ----------------- ARCHITECTURE STRESS LAB -----------------
@api_router.get("/stress/scenarios")
def get_stress_scenarios():
    return ArchitectureStressLab.get_scenarios()

@api_router.post("/stress/inject")
def inject_stress_scenario(payload: StressInjectRequest, db: Session = Depends(get_db)):
    return ArchitectureStressLab.inject_stress_scenario(db, payload.project_id, payload.scenario_id, payload.custom_text)

@api_router.post("/stress/simulate")
def simulate_stress_scenario(payload: StressInjectRequest, db: Session = Depends(get_db)):
    return ArchitectureStressLab.simulate_failure_scenario(db, payload.project_id, payload.scenario_id, payload.custom_text)

# ----------------- NEXORA 2.0 AUTONOMOUS AGENT PIPELINE -----------------
class AnalyzePipelineRequest(BaseModel):
    project_id: int

class RecommendationActionRequest(BaseModel):
    recommendation_id: int
    action: str # "approve", "reject", "propose"
    rejection_reason: Optional[str] = None

class BaselineCommitRequest(BaseModel):
    project_id: int
    recommendation_ids: List[int]
    confirmation_notes: Optional[str] = None

class ChangeImpactRequest(BaseModel):
    project_id: int
    requirement_statement: str

@api_router.post("/pipeline/analyze")
def run_autonomous_pipeline(payload: AnalyzePipelineRequest, db: Session = Depends(get_db)):
    """Runs the complete 8-stage automated pipeline: Ingestion -> Specs -> Gaps -> Recommendations -> Architecture."""
    return RequirementsToolRegistry.execute_complete_autonomous_pipeline(db, payload.project_id)

@api_router.get("/projects/{project_id}/recommendations")
def get_recommendations(project_id: int, db: Session = Depends(get_db)):
    """Fetches all proposed solutions with simple explanations and before-after scenarios."""
    recs = db.query(ProposedRecommendation).filter(ProposedRecommendation.project_id == project_id).all()
    if not recs:
        # Auto-generate if not yet present
        RequirementsToolRegistry.generate_recommended_solutions(db, project_id)
        recs = db.query(ProposedRecommendation).filter(ProposedRecommendation.project_id == project_id).all()

    return [{
        "id": r.id,
        "rec_code": r.rec_code,
        "issue_id": r.issue_id,
        "title": r.title,
        "category": r.category,
        "severity": r.severity.value,
        "simple_explanation": r.simple_explanation,
        "why_it_matters": r.why_it_matters,
        "recommended_action": r.recommended_action,
        "expected_result": r.expected_result,
        "technical_details": r.technical_details,
        "scenario_unresolved": r.scenario_unresolved,
        "scenario_resolved": r.scenario_resolved,
        "affected_requirements": r.affected_requirements,
        "affected_components": r.affected_components,
        "source_evidence": r.source_evidence,
        "status": r.status.value,
        "rejection_reason": r.rejection_reason,
        "committed_at": str(r.committed_at) if r.committed_at else None,
        "committed_by": r.committed_by
    } for r in recs]

@api_router.post("/recommendations/action")
def update_recommendation_status(payload: RecommendationActionRequest, db: Session = Depends(get_db)):
    """Approve or Reject individual recommendations."""
    rec = db.query(ProposedRecommendation).filter(ProposedRecommendation.id == payload.recommendation_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    if payload.action == "approve":
        rec.status = RecommendationStatus.APPROVED
    elif payload.action == "reject":
        rec.status = RecommendationStatus.REJECTED
        rec.rejection_reason = payload.rejection_reason or "Rejected by Administrator"
    elif payload.action == "propose":
        rec.status = RecommendationStatus.PROPOSED
    db.commit()

    return {"success": True, "recommendation_id": rec.id, "new_status": rec.status.value}

@api_router.post("/baseline/commit")
def commit_project_baseline(payload: BaselineCommitRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Atomically commits approved recommendations into official project baseline and creates new version."""
    result = RequirementsToolRegistry.execute_baseline_commit(
        db, payload.project_id, payload.recommendation_ids, actor_name=current_user.full_name or "Administrator"
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Commit failed"))
    return result

@api_router.post("/impact/analyze")
def analyze_change_impact(payload: ChangeImpactRequest, db: Session = Depends(get_db)):
    """Dynamic Change Impact Engine evaluating downstream effects of requirement modifications."""
    return RequirementsToolRegistry.execute_change_impact_analysis(db, payload.project_id, payload.requirement_statement)

