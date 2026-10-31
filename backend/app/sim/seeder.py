from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.entities import (
    User, UserRole, Project, ProjectDocument, Requirement, 
    RequirementIssue, ClarificationQuestion, SoftwareArchitecture,
    ArchitectureDecisionRecord, ProjectVersion, AuditEvent,
    RequirementType, RequirementPriority, RequirementStatus, IssueType, IssueSeverity
)
from app.core.security import get_password_hash
from app.tools.registry import RequirementsToolRegistry

def seed_database(db: Session):
    """
    Seeds comprehensive initial enterprise data for the software architecture engineering platform:
    1. 4 Role-based demo accounts (Business Owner, Developer, Security, AI Architect)
    2. Amazon-like E-Commerce Project with 4 Multi-Stakeholder documents:
       - Manager (Business & Expansion)
       - Developer (10k Concurrency & Single Server Conflict)
       - Security Team (Payment security & Customer privacy)
       - Customer (Two-day delivery target & Order tracking)
    3. Extracted requirements, detected gaps & conflicts, clarification questions, architecture blueprint, and ADRs.
    """
    # 1. Single Primary Administrator User (admin / Nexora@Admin2026)
    admin_configs = [
        {
            "username": "admin",
            "email": "admin@nexora.ai",
            "password": "Nexora@Admin2026",
            "full_name": "Chief Software Architect",
            "role": UserRole.ADMIN,
            "org": "NEXORA Enterprise Engineering Directorate"
        },
        # Backward compatibility for existing test runners
        {
            "username": "architect",
            "email": "architect@nexora.ai",
            "password": "Nexora@Admin2026",
            "full_name": "Chief Software Architect",
            "role": UserRole.ADMIN,
            "org": "NEXORA Enterprise Engineering Directorate"
        }
    ]

    for uc in admin_configs:
        existing = db.query(User).filter((User.username == uc["username"]) | (User.email == uc["email"])).first()
        if not existing:
            u = User(
                username=uc["username"],
                email=uc["email"],
                hashed_password=get_password_hash(uc["password"]),
                full_name=uc["full_name"],
                role=uc["role"],
                organization=uc["org"]
            )
            db.add(u)
        else:
            existing.hashed_password = get_password_hash(uc["password"])
            existing.role = uc["role"]
            existing.full_name = uc["full_name"]

    db.commit()

    # 2. Flagship Project: Enterprise Multi-Vendor E-Commerce Platform
    admin_user = db.query(User).filter(User.username == "admin").first()
    proj = db.query(Project).filter(Project.project_code == "PRJ-ECOM-001").first()

    if not proj:
        print("🌱 Seeding Enterprise E-Commerce Requirements Project...")
        proj = Project(
            creator_id=admin_user.id if admin_user else 1,
            project_code="PRJ-ECOM-001",
            title="Next-Gen Global E-Commerce & Logistics Platform",
            description="Multi-vendor e-commerce platform supporting product catalog, real-time cart checkout, international currency payments, two-day express dispatch tracking, and 10,000 concurrent sessions.",
            domain="E-Commerce, Retail & Logistics",
            readiness_score=72.5,
            version=1,
            status="CLARIFYING"
        )
        db.add(proj)
        db.commit()
        db.refresh(proj)

        # 3. Four Multi-Stakeholder Ingested Documents
        doc_manager = ProjectDocument(
            project_id=proj.id,
            filename="01_Business_Manager_Requirements.txt",
            file_type="TXT",
            stakeholder_type="Business Manager",
            content="""- Customers should be able to browse catalogs and purchase products online easily.
- The company expects rapid international expansion to overseas customer markets in Phase 2.
- The shopping experience must be intuitive, fast, and feature-rich."""
        )
        doc_developer = ProjectDocument(
            project_id=proj.id,
            filename="02_Developer_Constraints.txt",
            file_type="TXT",
            stakeholder_type="Developer",
            content="""- The application backend must reliably sustain 10,000 concurrent users during peak promotion hours.
- The backend should be maintainable, scalable, and run on a single low-capacity server during initial testing.
- The core API must provide robust error recovery and automated retry queues."""
        )
        doc_security = ProjectDocument(
            project_id=proj.id,
            filename="03_Security_Compliance_Specs.txt",
            file_type="TXT",
            stakeholder_type="Security Team",
            content="""- All payment transactions must be strictly protected with zero raw card numbers stored.
- Customer personal identifiable information (PII) must be encrypted at rest and in transit.
- Multi-factor authentication and role-based access must govern administrative order dashboards."""
        )
        doc_customer = ProjectDocument(
            project_id=proj.id,
            filename="04_Customer_Expectations.txt",
            file_type="TXT",
            stakeholder_type="Customer",
            content="""- Orders should be delivered within two days of purchase confirmation.
- Customers should be able to track orders live on an interactive status map."""
        )
        db.add_all([doc_manager, doc_developer, doc_security, doc_customer])
        db.commit()

        # Parse & extract requirements from all 4 documents
        docs = [doc_manager, doc_developer, doc_security, doc_customer]
        for d in docs:
            RequirementsToolRegistry.parse_and_extract_document(db, d.id)

        # Stage 3: Analyze gaps, missing info, and conflicts
        RequirementsToolRegistry.analyze_gaps_and_conflicts(db, proj.id)

        # Stage 4: Generate targeted clarification questions
        RequirementsToolRegistry.generate_clarifications(db, proj.id)

        # Stage 5: Generate Recommended Solutions & Before/After Scenarios
        RequirementsToolRegistry.generate_recommended_solutions(db, proj.id)

        # Stage 6: Calculate initial Readiness score
        RequirementsToolRegistry.calculate_readiness_score(db, proj.id)

        # Stage 8: Generate Software Architecture, Database ER, APIs, and ADRs
        RequirementsToolRegistry.generate_full_software_architecture(db, proj.id)

        # Baseline Version Record
        db.add(ProjectVersion(
            project_id=proj.id,
            version_number=1,
            trigger_event="Initial Requirements Analysis & Gap Detection",
            changed_summary="Initial baseline created with 4 stakeholder documents, extracted specifications, and identified gaps.",
            approved_by="System",
            related_gap="Initial Setup",
            previous_value="None",
            new_value="Version 1.0",
            impacted_components=["API Gateway", "Order Service", "Payment Service", "Database"],
            baseline_snapshot={"requirements_count": 8, "gaps_count": 5, "readiness": 72.5}
        ))

        # Audit Event
        db.add(AuditEvent(
            event_type="PROJECT_BOOTSTRAPPED",
            actor="NEXORA_REQUIREMENTS_ENGINE",
            details=f"Project {proj.project_code} initialized with 4 stakeholder documents, automated gap analysis, recommended solutions, and software architecture blueprint."
        ))
        db.commit()
        print("✅ Flagship Requirements Project Seeded Successfully!")

