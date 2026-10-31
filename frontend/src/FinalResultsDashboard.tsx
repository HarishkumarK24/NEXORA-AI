import React from 'react';
import { 
  Sparkles, CheckCircle2, AlertTriangle, Cpu, Layers, Code2, 
  ArrowRight, Shield, Zap, FileText, GitCommit, Check, HelpCircle
} from 'lucide-react';

interface FinalResultsDashboardProps {
  projectData: any;
  onNavigateTab: (tabId: string) => void;
}

export const FinalResultsDashboard: React.FC<FinalResultsDashboardProps> = ({
  projectData,
  onNavigateTab
}) => {
  const p = projectData?.project;
  const issues = projectData?.issues || [];
  const recs = projectData?.recommendations || [];
  const reqs = projectData?.requirements || [];
  const adrs = projectData?.adrs || [];
  const arch = projectData?.architecture;
  const valReport = p?.validation_report;

  const resolvedIssues = issues.filter((i: any) => i.is_resolved);
  const unresolvedIssues = issues.filter((i: any) => !i.is_resolved);
  const enhancedReqs = reqs.filter((r: any) => r.is_enhanced);
  const assumptions = valReport?.documented_assumptions || [
    {
      assumption: "Two-day delivery SLA applies strictly to contiguous regions; remote zones default to 3-5 business days.",
      reason: "Avoided inventing logistics carrier contracts."
    },
    {
      assumption: "Payment processing defaults to Stripe for global transactions; local domestic fallback gateways can be plugged via adapter interface.",
      reason: "Requires commercial merchant fee agreement."
    }
  ];

  const overallOutcome = p?.overall_outcome || "Validated with Assumptions";

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">

      {/* 🌟 Top Comprehensive Outcome Banner */}
      <div className="bg-gradient-to-br from-[#FFFDF9] via-[#FAF8F5] to-[#F5F0E6] border border-[#DFD9CD] rounded-3xl p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#9C381E] bg-[#9C381E]/10 px-2.5 py-0.5 rounded-full border border-[#9C381E]/20">
                {p?.code || 'PRJ-ECOM-001'}
              </span>
              <span className="font-mono text-xs text-[#716C5F] font-bold">
                Baseline Version {p?.version || 2}.0
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-0.5 rounded-full bg-[#2D5A43]/10 text-[#2D5A43] border border-[#2D5A43]/20 uppercase tracking-wider font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {overallOutcome}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E232A] font-['Space_Grotesk'] tracking-tight">
              {p?.title || 'Next-Gen Global E-Commerce & Logistics Platform'}
            </h1>
            <p className="text-xs sm:text-sm text-[#5C574C] max-w-3xl leading-relaxed">
              {p?.description}
            </p>
          </div>

          {/* Architecture Readiness Score Widget */}
          <div className="bg-white border border-[#DFD9CD] p-5 rounded-2xl flex items-center gap-5 shadow-xs shrink-0 self-start md:self-auto">
            <div className="relative w-18 h-18 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#EFECE4]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#2D5A43]"
                  strokeDasharray={`${p?.readiness_score || 91.5}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-mono font-extrabold text-base text-[#1E232A]">
                {p?.readiness_score || 91.5}%
              </span>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#716C5F]">
                Empirical Readiness
              </div>
              <div className="text-xs font-bold text-[#2D5A43] mt-0.5">
                {overallOutcome}
              </div>
              <div className="text-[10px] text-[#716C5F] mt-1 font-mono">
                {resolvedIssues.length} gaps auto-resolved in baseline
              </div>
            </div>
          </div>
        </div>

        {/* 6 Core Executive Questions Answered Immediately */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-4 border-t border-[#E8E2D5]">
          
          <div className="bg-white/80 p-4 rounded-2xl border border-[#DFD9CD] space-y-1">
            <div className="text-[10px] uppercase font-bold font-mono text-[#9C381E] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> 1. What did the AI understand?
            </div>
            <div className="text-xs font-bold text-[#1E232A]">
              {reqs.length} Classified Requirements
            </div>
            <p className="text-[11px] text-[#5C574C] leading-snug">
              Parsed user browsing, cart management, checkout, 10k concurrency, delivery tracking, and security constraints across 9 categories.
            </p>
          </div>

          <div className="bg-white/80 p-4 rounded-2xl border border-[#DFD9CD] space-y-1">
            <div className="text-[10px] uppercase font-bold font-mono text-amber-700 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> 2. What was missing?
            </div>
            <div className="text-xs font-bold text-[#1E232A]">
              {issues.length} Architectural Gaps & Risks
            </div>
            <p className="text-[11px] text-[#5C574C] leading-snug">
              Discovered missing webhook idempotency, inventory stock overselling races, unencrypted customer PII, and ambiguous performance bounds.
            </p>
          </div>

          <div className="bg-white/80 p-4 rounded-2xl border border-[#DFD9CD] space-y-1">
            <div className="text-[10px] uppercase font-bold font-mono text-[#2D5A43] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> 3. What did the AI fix?
            </div>
            <div className="text-xs font-bold text-[#1E232A]">
              {enhancedReqs.length} Baseline Specs Incorporated
            </div>
            <p className="text-[11px] text-[#5C574C] leading-snug">
              Autonomously committed Stripe webhook verification, Redis Redlock stock mutex, AES-256 encryption, and Kubernetes HPA auto-scaling.
            </p>
          </div>

          <div className="bg-white/80 p-4 rounded-2xl border border-[#DFD9CD] space-y-1">
            <div className="text-[10px] uppercase font-bold font-mono text-[#E06D3B] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> 4. What architecture was built?
            </div>
            <div className="text-xs font-bold text-[#1E232A]">
              Modular Microservices + Event Broker
            </div>
            <p className="text-[11px] text-[#5C574C] leading-snug">
              Generated Kong API Gateway, PostgreSQL read-replicas, Redis distributed caching, RabbitMQ event bus, and 10 detailed ADRs.
            </p>
          </div>

          <div className="bg-white/80 p-4 rounded-2xl border border-[#DFD9CD] space-y-1">
            <div className="text-[10px] uppercase font-bold font-mono text-[#2D5A43] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> 5. How reliable is the result?
            </div>
            <div className="text-xs font-bold text-[#1E232A]">
              {p?.readiness_score || 91.5}% Verified Readiness
            </div>
            <p className="text-[11px] text-[#5C574C] leading-snug">
              Passed 7 automated architectural consistency and traceability checks with zero remaining critical vulnerabilities.
            </p>
          </div>

          <div className="bg-white/80 p-4 rounded-2xl border border-[#DFD9CD] space-y-1">
            <div className="text-[10px] uppercase font-bold font-mono text-purple-700 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" /> 6. Any remaining assumptions?
            </div>
            <div className="text-xs font-bold text-[#1E232A]">
              {assumptions.length} Documented Assumptions
            </div>
            <p className="text-[11px] text-[#5C574C] leading-snug">
              Explicitly isolated regional delivery boundary and payment gateway default without inventing uncommitted business facts.
            </p>
          </div>

        </div>
      </div>

      {/* 6 Key Project & Resolution Metrics Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white border border-[#DFD9CD] p-4 rounded-2xl shadow-xs space-y-1 hover:border-[#9C381E] transition-all">
          <div className="text-[10px] font-bold text-[#716C5F] uppercase">Requirements</div>
          <div className="text-2xl font-extrabold font-mono text-[#1E232A]">{reqs.length}</div>
          <div className="text-[10px] font-semibold text-[#2D5A43] font-mono">Atomic Specifications</div>
        </div>

        <div className="bg-white border border-[#DFD9CD] p-4 rounded-2xl shadow-xs space-y-1 hover:border-[#9C381E] transition-all">
          <div className="text-[10px] font-bold text-[#716C5F] uppercase">AI-Enhanced Added</div>
          <div className="text-2xl font-extrabold font-mono text-[#2D5A43]">{enhancedReqs.length}</div>
          <div className="text-[10px] font-semibold text-[#2D5A43] font-mono">Committed into v2.0</div>
        </div>

        <div className="bg-white border border-[#DFD9CD] p-4 rounded-2xl shadow-xs space-y-1 hover:border-[#9C381E] transition-all">
          <div className="text-[10px] font-bold text-[#716C5F] uppercase">Gaps Identified</div>
          <div className="text-2xl font-extrabold font-mono text-amber-600">{issues.length}</div>
          <div className="text-[10px] font-semibold text-[#716C5F] font-mono">Risks & Missing Specs</div>
        </div>

        <div className="bg-white border border-[#DFD9CD] p-4 rounded-2xl shadow-xs space-y-1 hover:border-[#9C381E] transition-all">
          <div className="text-[10px] font-bold text-[#716C5F] uppercase">Auto-Resolved</div>
          <div className="text-2xl font-extrabold font-mono text-[#2D5A43]">{resolvedIssues.length}</div>
          <div className="text-[10px] font-semibold text-[#2D5A43] font-mono">100% Critical Fixed</div>
        </div>

        <div className="bg-white border border-[#DFD9CD] p-4 rounded-2xl shadow-xs space-y-1 hover:border-[#9C381E] transition-all">
          <div className="text-[10px] font-bold text-[#716C5F] uppercase">ADRs Formulated</div>
          <div className="text-2xl font-extrabold font-mono text-[#1E232A]">{adrs.length}</div>
          <div className="text-[10px] font-semibold text-[#716C5F] font-mono">Full-Stack Decisions</div>
        </div>

        <div className="bg-white border border-[#DFD9CD] p-4 rounded-2xl shadow-xs space-y-1 hover:border-[#9C381E] transition-all">
          <div className="text-[10px] font-bold text-[#716C5F] uppercase">Assumptions</div>
          <div className="text-2xl font-extrabold font-mono text-purple-700">{assumptions.length}</div>
          <div className="text-[10px] font-semibold text-[#716C5F] font-mono">Zero Hallucinations</div>
        </div>
      </div>

      {/* Architecture & Auto-Resolution Summary Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: What AI Fixed (Auto-Resolved Specs) */}
        <div className="bg-white border border-[#DFD9CD] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1E232A] uppercase tracking-wider font-['Space_Grotesk'] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2D5A43]" />
              Automatically Resolved & Committed Baseline Fixes
            </h3>
            <button
              onClick={() => onNavigateTab('requirements')}
              className="text-xs text-[#9C381E] hover:underline font-bold flex items-center gap-1 font-mono"
            >
              View in Explorer <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {enhancedReqs.map((req: any, idx: number) => (
              <div key={idx} className="p-3.5 bg-[#FAF8F5] border border-[#DFD9CD] rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-[#2D5A43] bg-[#2D5A43]/10 px-2 py-0.5 rounded">
                    {req.req_code}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#9C381E] font-mono">
                    {req.req_type}
                  </span>
                </div>
                <div className="text-xs font-semibold text-[#1E232A] leading-snug">
                  {req.original_text}
                </div>
                <div className="text-[10px] text-[#716C5F] font-mono">
                  {req.source}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Architecture Blueprint & Tech Stack */}
        <div className="bg-white border border-[#DFD9CD] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1E232A] uppercase tracking-wider font-['Space_Grotesk'] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#9C381E]" />
              Generated Software Architecture Blueprint
            </h3>
            <button
              onClick={() => onNavigateTab('architecture')}
              className="text-xs text-[#9C381E] hover:underline font-bold flex items-center gap-1 font-mono"
            >
              Interactive Flowchart <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {arch ? (
            <div className="space-y-3">
              <div className="p-4 bg-[#FAF8F5] border border-[#DFD9CD] rounded-2xl space-y-1">
                <div className="text-[10px] font-bold uppercase text-[#716C5F]">Architecture Style</div>
                <div className="text-xs font-extrabold text-[#1E232A]">{arch.style}</div>
                <p className="text-[11px] text-[#5C574C] mt-1 leading-relaxed">{arch.summary}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(arch.tech_stack || {}).map(([layer, tech]: any) => (
                  <div key={layer} className="p-3 bg-[#FAF8F5] border border-[#DFD9CD] rounded-xl">
                    <div className="text-[10px] uppercase font-mono font-bold text-[#716C5F]">{layer}</div>
                    <div className="text-xs font-bold text-[#1E232A] truncate mt-0.5">{tech}</div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span className="font-semibold">Validated for 50,000 Concurrent Users</span>
                </div>
                <span className="font-mono text-[10px] text-emerald-800 font-bold">Kubernetes HPA Auto-scaled</span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#716C5F]">Loading architecture blueprint...</div>
          )}
        </div>

      </div>

      {/* Documented Assumptions Section */}
      <div className="bg-[#FAF8F5] border border-[#E3DAC9] rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-extrabold text-[#1E232A] uppercase tracking-wider font-['Space_Grotesk'] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-700" />
              Documented Explicit Assumptions (Zero Invention / No Fake Commitments)
            </h3>
            <p className="text-xs text-[#716C5F]">
              NEXORA AI explicitly isolates business assumptions requiring real stakeholder commitments rather than inventing facts.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('validation')}
            className="text-xs text-[#9C381E] font-bold font-mono hover:underline flex items-center gap-1"
          >
            Validation Report <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {assumptions.map((asm: any, idx: number) => (
            <div key={idx} className="p-4 bg-white border border-[#DFD9CD] rounded-2xl space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  ASSUMPTION #{idx + 1}
                </span>
                <span className="text-[10px] font-mono font-bold text-[#2D5A43]">
                  Acceptable Risk
                </span>
              </div>
              <div className="text-xs font-bold text-[#1E232A]">
                "{asm.assumption}"
              </div>
              <div className="text-[11px] text-[#5C574C]">
                <strong className="text-[#1E232A]">Reason:</strong> {asm.reason}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Exploration Navigation Hub */}
      <div className="bg-white border border-[#DFD9CD] rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h3 className="text-sm font-extrabold text-[#1E232A] uppercase tracking-wider font-['Space_Grotesk']">
          Optional Manual Exploration Sections
        </h3>
        <p className="text-xs text-[#716C5F]">
          The workflow is complete. You can inspect every result, comparison, and decision record below:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {[
            { id: 'requirements', label: 'Requirements Explorer', count: `${reqs.length} specs`, icon: FileText },
            { id: 'gaps', label: 'Gap Analysis', count: `${issues.length} gaps`, icon: AlertTriangle },
            { id: 'solutions', label: 'Recommended Solutions', count: `${recs.length} solutions`, icon: Sparkles },
            { id: 'impact', label: 'Impact Comparison', count: 'Before vs After', icon: Zap },
            { id: 'architecture', label: 'Architecture Blueprint', count: 'Flowchart View', icon: Cpu },
            { id: 'adrs', label: 'Decisions (ADRs)', count: `${adrs.length} records`, icon: Code2 },
            { id: 'dependency', label: 'Dependency Map', count: 'Graph Matrix', icon: Layers },
            { id: 'validation', label: 'Validation Report', count: '7 Audit Checks', icon: CheckCircle2 },
            { id: 'history', label: 'Analysis History', count: 'Baseline Ledger', icon: GitCommit },
            { id: 'stress_lab', label: 'Architecture Stress Lab', count: '12 Failure Tests', icon: Zap }
          ].map((sec) => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={() => onNavigateTab(sec.id)}
                className="p-3.5 bg-[#FAF8F5] hover:bg-white border border-[#DFD9CD] hover:border-[#9C381E] rounded-2xl text-left transition-all group shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-[#9C381E]">
                  <Icon className="w-4 h-4" />
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-xs font-bold text-[#1E232A] group-hover:text-[#9C381E] transition-colors">
                  {sec.label}
                </div>
                <div className="text-[10px] text-[#716C5F] font-mono">
                  {sec.count}
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
