import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, Enum, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "administrator"                # Platform Administrator (Single Authority)
    AI_ARCHITECT = "ai_architect"          # Legacy alias
    BUSINESS_OWNER = "business_owner"      # Legacy alias
    DEVELOPER = "developer"                # Legacy alias
    SECURITY_REVIEWER = "security_reviewer"# Legacy alias

class RequirementType(str, enum.Enum):
    FUNCTIONAL = "functional"
    NON_FUNCTIONAL = "non_functional"
    BUSINESS = "business"
    TECHNICAL_CONSTRAINT = "technical_constraint"
    SECURITY = "security"
    PERFORMANCE = "performance"
    RELIABILITY = "reliability"
    COMPLIANCE = "compliance"
    INTEGRATION = "integration"

class RequirementPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class RequirementStatus(str, enum.Enum):
    EXTRACTED = "extracted"
    NEEDS_CLARIFICATION = "needs_clarification"
    CLARIFIED = "clarified"
    VALIDATED = "validated"
    REJECTED = "rejected"

class IssueType(str, enum.Enum):
    MISSING_INFO = "missing_info"
    CONFLICT = "conflict"
    AMBIGUOUS = "ambiguous"
    INCOMPLETE = "incomplete"
    FEASIBILITY = "feasibility"

class IssueSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class QuestionStatus(str, enum.Enum):
    PENDING = "pending"
    ANSWERED = "answered"
    DISMISSED = "dismissed"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.BUSINESS_OWNER, nullable=False)
    organization = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    projects_created = relationship("Project", back_populates="creator")
    responses_submitted = relationship("StakeholderResponse", back_populates="responder")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    project_code = Column(String(30), unique=True, index=True, nullable=False) # e.g. PRJ-ECOM-001
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    domain = Column(String(100), default="E-Commerce & Retail")
    readiness_score = Column(Float, default=0.0) # Calculated 0.0 - 100.0%
    version = Column(Integer, default=1)
    status = Column(String(50), default="COLLECTING") # COLLECTING, ANALYZING, CLARIFYING, VALIDATED, ARCHITECTED
    overall_outcome = Column(String(100), default="Validated with Assumptions") # Successfully Validated, Validated with Assumptions, Partially Validated, Needs Additional Information
    validation_report = Column(JSON, nullable=True) # Full 9-point validation check results
    dependency_graph = Column(JSON, nullable=True) # Traceability and dependency graph
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    creator = relationship("User", back_populates="projects_created")
    documents = relationship("ProjectDocument", back_populates="project", cascade="all, delete-orphan")
    requirements = relationship("Requirement", back_populates="project", cascade="all, delete-orphan")
    issues = relationship("RequirementIssue", back_populates="project", cascade="all, delete-orphan")
    questions = relationship("ClarificationQuestion", back_populates="project", cascade="all, delete-orphan")
    architecture = relationship("SoftwareArchitecture", back_populates="project", uselist=False, cascade="all, delete-orphan")
    adrs = relationship("ArchitectureDecisionRecord", back_populates="project", cascade="all, delete-orphan")
    agent_logs = relationship("AgentExecutionLog", back_populates="project", cascade="all, delete-orphan")
    history_versions = relationship("ProjectVersion", back_populates="project", cascade="all, delete-orphan")
    recommendations = relationship("ProposedRecommendation", back_populates="project", cascade="all, delete-orphan")

class ProjectDocument(Base):
    __tablename__ = "project_documents"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    filename = Column(String(200), nullable=False)
    file_type = Column(String(20), default="TXT") # TXT, PDF, DOCX, CSV
    file_size = Column(String(30), default="12 KB")
    processing_status = Column(String(30), default="Processed") # Uploaded, Processing, Processed, Failed
    stakeholder_type = Column(String(50), nullable=False) # Manager, Developer, Security, Customer, etc.
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="documents")
    requirements = relationship("Requirement", back_populates="document")

class Requirement(Base):
    __tablename__ = "requirements"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("project_documents.id"), nullable=True)
    req_code = Column(String(30), index=True, nullable=False) # REQ-001, REQ-002
    original_text = Column(Text, nullable=False)
    cleaned_statement = Column(Text, nullable=False)
    stakeholder = Column(String(50), nullable=False) # Business Manager, Developer, Security Team, Customer
    req_type = Column(Enum(RequirementType), default=RequirementType.FUNCTIONAL)
    priority = Column(Enum(RequirementPriority), default=RequirementPriority.MEDIUM)
    status = Column(Enum(RequirementStatus), default=RequirementStatus.EXTRACTED)
    source_reference = Column(String(200), nullable=True) # e.g. "Manager_Requirements.txt, Line 4"
    assumptions = Column(Text, nullable=True)
    is_enhanced = Column(Boolean, default=False) # True if auto-resolved into baseline by Autonomous Agent
    enhancement_source = Column(String(100), nullable=True) # e.g. "Auto-resolved from GAP-001"
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="requirements")
    document = relationship("ProjectDocument", back_populates="requirements")
    issues = relationship("RequirementIssue", back_populates="requirement")

class RequirementIssue(Base):
    __tablename__ = "requirement_issues"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    requirement_id = Column(Integer, ForeignKey("requirements.id"), nullable=True)
    issue_code = Column(String(30), index=True, nullable=False) # GAP-001, CONF-001
    issue_type = Column(Enum(IssueType), nullable=False)
    severity = Column(Enum(IssueSeverity), default=IssueSeverity.MEDIUM)
    title = Column(String(200), nullable=False)
    explanation = Column(Text, nullable=False)
    affected_stakeholders = Column(String(200), nullable=False) # e.g. "Business Manager, Developer"
    business_impact = Column(Text, nullable=False)
    suggested_resolution = Column(Text, nullable=False)
    evidence_quote = Column(Text, nullable=True)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="issues")
    requirement = relationship("Requirement", back_populates="issues")
    questions = relationship("ClarificationQuestion", back_populates="issue")
    recommendations = relationship("ProposedRecommendation", back_populates="issue")

class ClarificationQuestion(Base):
    __tablename__ = "clarification_questions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    issue_id = Column(Integer, ForeignKey("requirement_issues.id"), nullable=True)
    question_code = Column(String(30), index=True, nullable=False) # CLAR-001
    assigned_stakeholder = Column(String(50), nullable=False)
    question_text = Column(Text, nullable=False)
    suggested_options = Column(JSON, nullable=True) # ["Stripe", "Razorpay", "PayPal", "Multiple"]
    reason_for_asking = Column(Text, nullable=False)
    impact_if_unanswered = Column(Text, nullable=False)
    status = Column(Enum(QuestionStatus), default=QuestionStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="questions")
    issue = relationship("RequirementIssue", back_populates="questions")
    responses = relationship("StakeholderResponse", back_populates="question", cascade="all, delete-orphan")

class StakeholderResponse(Base):
    __tablename__ = "stakeholder_responses"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("clarification_questions.id"), nullable=False)
    responder_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    response_text = Column(Text, nullable=False)
    selected_option = Column(String(100), nullable=True)
    attachment_ref = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    question = relationship("ClarificationQuestion", back_populates="responses")
    responder = relationship("User", back_populates="responses_submitted")

class SoftwareArchitecture(Base):
    __tablename__ = "software_architectures"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, unique=True)
    architecture_style = Column(String(100), default="Modular Microservices with Event Broker")
    summary = Column(Text, nullable=False)
    tech_stack = Column(JSON, nullable=False) # Frontend, Backend, DB, Cache, Gateway, Auth
    components = Column(JSON, nullable=False) # [{name, role, inputs, outputs, dependencies}]
    database_design = Column(JSON, nullable=False) # [{table, columns, pk, fk, indexes}]
    api_specifications = Column(JSON, nullable=False) # [{method, endpoint, summary, auth, req, res}]
    security_architecture = Column(JSON, nullable=False) # auth, data_protection, encryption, threats
    deployment_architecture = Column(JSON, nullable=False) # hosting, containers, scaling, cicd
    system_diagram_mermaid = Column(Text, nullable=False) # Mermaid graph flow
    er_diagram_mermaid = Column(Text, nullable=False) # Mermaid ER diagram
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="architecture")

class ArchitectureDecisionRecord(Base):
    __tablename__ = "architecture_decision_records"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    adr_code = Column(String(30), index=True, nullable=False) # ADR-001
    title = Column(String(200), nullable=False)
    category = Column(String(50), default="Database") # Frontend, Backend, Database, Cache, Auth, Gateway, Queue, Cloud, Containerization, Monitoring, Payment, Security
    status = Column(String(30), default="ACCEPTED") # PROPOSED, ACCEPTED, REJECTED, SUPERSEDED
    context = Column(Text, nullable=False)
    recommended_tech = Column(String(100), nullable=True)
    decision = Column(Text, nullable=False)
    considered_alternatives = Column(JSON, nullable=False) # [{option, pros, cons}]
    comparison_criteria = Column(JSON, nullable=True) # {performance, scalability, security, cost, complexity, maintenance, compatibility}
    consequences = Column(Text, nullable=False)
    linked_requirement_ids = Column(JSON, nullable=True) # ["REQ-001", "REQ-005"]
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="adrs")

class RecommendationStatus(str, enum.Enum):
    PROPOSED = "proposed"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMMITTED = "committed"

class ProposedRecommendation(Base):
    __tablename__ = "proposed_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    issue_id = Column(Integer, ForeignKey("requirement_issues.id"), nullable=True)
    rec_code = Column(String(30), index=True, nullable=False) # REC-001
    title = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)
    severity = Column(Enum(IssueSeverity), default=IssueSeverity.MEDIUM)
    
    # Progressive Disclosure Explanations
    simple_explanation = Column(Text, nullable=False)
    why_it_matters = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    expected_result = Column(Text, nullable=False)
    technical_details = Column(JSON, nullable=False) # {patterns, technologies, complexity, trade_offs, remaining_risks}
    
    # Before-and-After Scenarios
    scenario_unresolved = Column(JSON, nullable=False) # {failure_mode, business_risk, customer_impact, financial_impact, severity}
    scenario_resolved = Column(JSON, nullable=False) # {expected_improvement, behavioral_change, resilient_components, security_perf_gains}
    
    # Traceability
    affected_requirements = Column(JSON, nullable=False) # ["REQ-001", "REQ-005"]
    affected_components = Column(JSON, nullable=False) # ["Checkout Service", "Payment Service", "PostgreSQL Database"]
    source_evidence = Column(Text, nullable=True)
    
    status = Column(Enum(RecommendationStatus), default=RecommendationStatus.PROPOSED)
    rejection_reason = Column(Text, nullable=True)
    committed_at = Column(DateTime, nullable=True)
    committed_by = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="recommendations")
    issue = relationship("RequirementIssue", back_populates="recommendations")

class ProjectVersion(Base):
    __tablename__ = "project_versions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    trigger_event = Column(String(200), nullable=False) # e.g. "Committed REC-001: Verified Webhooks"
    changed_summary = Column(Text, nullable=False)
    approved_by = Column(String(100), default="Administrator")
    related_gap = Column(String(100), nullable=True)
    previous_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    impacted_components = Column(JSON, nullable=True)
    baseline_snapshot = Column(JSON, nullable=True) # Full snapshot of requirements, readiness, tech stack
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="history_versions")

class AgentExecutionLog(Base):
    __tablename__ = "agent_execution_logs"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    agent_name = Column(String(50), nullable=False) # DOCUMENT_INTEL, CLASSIFICATION, GAP_ANALYSIS, etc.
    stage = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)
    summary = Column(Text, nullable=False)
    evidence = Column(JSON, nullable=True)
    confidence = Column(Float, default=1.0)
    latency_ms = Column(Float, default=0.0)
    status = Column(String(30), default="COMPLETED")
    timestamp = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="agent_logs")

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=False) # REQUIREMENT_EXTRACTED, CONFLICT_DETECTED, ARCHITECTURE_GENERATED, STRESS_INJECTED, BASELINE_COMMITTED
    actor = Column(String(100), nullable=False)
    details = Column(Text, nullable=False)
    meta_info = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

