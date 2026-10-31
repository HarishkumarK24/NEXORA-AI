import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, AlertTriangle, Shield, Cpu, Layers, Database, 
  ArrowRight, Sparkles, RefreshCw, Lock, Zap, Server, Activity, 
  FileText, Check, X, GitCommit, ChevronRight, AlertOctagon, TrendingUp
} from 'lucide-react';

/**
 * Animated Number Counter component
 */
export const AnimatedCounter: React.FC<{
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}> = ({ value, duration = 1200, decimals = 1, prefix = '', suffix = '', className = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = 0;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayValue(startValue + (value - startValue) * eased);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return (
    <span className={`font-mono ${className}`}>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
};

/**
 * Visual Circular Readiness Gauge
 */
export const VisualReadinessGauge: React.FC<{
  score: number;
  initialScore?: number;
  size?: number;
}> = ({ score, initialScore = 48, size = 160 }) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const initialOffset = circumference - (initialScore / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E0D5"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Initial score ghost line */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F0C9BE"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={initialOffset}
          strokeLinecap="round"
          fill="none"
          opacity={0.6}
        />
        {/* Final score animated line */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#readinessGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="readinessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2D5A43" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <AnimatedCounter
          value={score}
          decimals={1}
          suffix="%"
          className="text-2xl sm:text-3xl font-extrabold text-[#1E232A]"
        />
        <span className="text-[10px] font-mono font-bold text-[#2D5A43] uppercase tracking-wider">
          READINESS
        </span>
      </div>
    </div>
  );
};

/**
 * Visual Conflict Detection & Resolution Diagram
 * Shows 10k users vs 1 server conflict connected by warning line, resolved via HPA
 */
export const VisualConflictDiagram: React.FC = () => {
  return (
    <div className="bg-white border border-[#DFD9CD] rounded-2xl p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <h4 className="text-xs font-bold font-['Space_Grotesk'] text-[#1E232A]">
              Visual Conflict Resolution Engine
            </h4>
            <p className="text-[10px] text-[#716C5F]">
              Contradiction autonomously detected and re-engineered
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-[#2D5A43]">
          AUTO-RECONCILED
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-3 text-xs">
        {/* Card 1: Requirement Statement A */}
        <div className="p-3.5 bg-red-50/60 border border-red-200 rounded-xl space-y-1">
          <span className="text-[9px] font-mono font-bold text-red-700 uppercase">Input Constraint A</span>
          <div className="font-bold text-[#1E232A]">10,000 Concurrent Users</div>
          <p className="text-[10px] text-[#716C5F]">Peak promotion checkout load requirement.</p>
        </div>

        {/* Center: Conflict Lightning / Warning Wire */}
        <div className="flex flex-col items-center justify-center py-2 relative">
          <div className="w-full flex items-center justify-center">
            <div className="h-0.5 w-full bg-gradient-to-r from-red-300 via-amber-400 to-emerald-400" />
            <div className="absolute px-2.5 py-1 rounded-full bg-[#1E232A] text-white text-[9px] font-mono font-bold flex items-center gap-1 shadow-md">
              <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>NEXORA RECONCILER</span>
            </div>
          </div>
          <span className="text-[9px] font-mono text-emerald-700 font-bold mt-3">
            Synthesized HPA Auto-scaler
          </span>
        </div>

        {/* Card 2: Generated Architecture Remedy */}
        <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
          <span className="text-[9px] font-mono font-bold text-[#2D5A43] uppercase">Resolved Architecture</span>
          <div className="font-bold text-[#1E232A]">Kubernetes HPA (3–20 Pods)</div>
          <p className="text-[10px] text-[#716C5F]">PostgreSQL Read Replicas + Kong Gateway.</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Visual Defense-in-Depth Layered Security Architecture
 */
export const VisualSecurityArchitecture: React.FC = () => {
  const layers = [
    { name: "Layer 1: Perimeter Edge", tech: "Cloudflare Edge CDN", detail: "DDoS mitigation & TLS termination", icon: Shield, col: "text-amber-700" },
    { name: "Layer 2: API Gateway", tech: "Kong Gateway Rate Limiter", detail: "OAuth2 / JWT token validation", icon: Lock, col: "text-[#E06D3B]" },
    { name: "Layer 3: Transport Security", tech: "TLS 1.3 Strict In-Transit", detail: "End-to-end encrypted packet payload", icon: Activity, col: "text-[#9C381E]" },
    { name: "Layer 4: Data Vault", tech: "PostgreSQL AES-256 Vault", detail: "Encrypted columns for card & PII data", icon: Database, col: "text-[#2D5A43]" }
  ];

  return (
    <div className="bg-white border border-[#DFD9CD] rounded-2xl p-5 space-y-3.5 shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-[#F2ECE1]">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#2D5A43]" />
          <h4 className="text-xs font-bold font-['Space_Grotesk'] text-[#1E232A]">
            Layered Security & PCI-DSS Defense Architecture
          </h4>
        </div>
        <span className="font-mono text-[10px] font-bold text-[#2D5A43] bg-emerald-100 px-2 py-0.5 rounded">
          Bank-Grade Standard
        </span>
      </div>

      <div className="space-y-2">
        {layers.map((l, i) => {
          const Icon = l.icon;
          return (
            <div key={i} className="p-2.5 bg-[#FAF8F5] border border-[#DFD9CD] rounded-xl flex items-center justify-between gap-3 hover:border-[#2D5A43]/40 transition-all">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-white border border-[#DFD9CD] flex items-center justify-center shrink-0">
                  <Icon className={`w-3.5 h-3.5 ${l.col}`} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1E232A] flex items-center gap-1.5">
                    <span>{l.name}</span>
                    <span className="text-[10px] font-mono text-[#716C5F]">({l.tech})</span>
                  </div>
                  <div className="text-[10px] text-[#716C5F]">{l.detail}</div>
                </div>
              </div>
              <span className="font-mono text-[9px] font-bold text-[#2D5A43] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                VERIFIED
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Visual Reliability & Failure Recovery Diagram
 */
export const VisualReliabilityRecovery: React.FC = () => {
  const steps = [
    { step: "1", title: "Delivery / Stock Drop", desc: "Carrier webhook emits order failure" },
    { step: "2", title: "HMAC Signature Check", desc: "Prevents forged refund requests" },
    { step: "3", title: "Idempotency Lock", desc: "Redis mutex guarantees 1 refund per charge" },
    { step: "4", title: "Ledger Reversal", desc: "Automated double-entry reconciliation" }
  ];

  return (
    <div className="bg-white border border-[#DFD9CD] rounded-2xl p-5 space-y-3.5 shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-[#F2ECE1]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#9C381E]" />
          <h4 className="text-xs font-bold font-['Space_Grotesk'] text-[#1E232A]">
            Automated Failure Recovery & Refund State Machine
          </h4>
        </div>
        <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          Zero Orphaned Transactions
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
        {steps.map((s, idx) => (
          <div key={idx} className="p-3 bg-[#FAF8F5] border border-[#DFD9CD] rounded-xl space-y-1 relative group">
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-[#1E232A] text-white flex items-center justify-center text-[10px] font-mono font-bold">
                {s.step}
              </span>
              {idx < 3 && (
                <ArrowRight className="w-3.5 h-3.5 text-[#9C381E] hidden sm:block opacity-60" />
              )}
            </div>
            <div className="font-bold text-[#1E232A] text-[11px] pt-1">{s.title}</div>
            <p className="text-[10px] text-[#716C5F] leading-tight">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Visual Scalability Curve (Kubernetes HPA 3 -> 20 Pods)
 */
export const VisualScalabilityDiagram: React.FC = () => {
  return (
    <div className="bg-white border border-[#DFD9CD] rounded-2xl p-5 space-y-3.5 shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-[#F2ECE1]">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#E06D3B]" />
          <h4 className="text-xs font-bold font-['Space_Grotesk'] text-[#1E232A]">
            Dynamic Scalability Curve (0 to 50,000 Active Sessions)
          </h4>
        </div>
        <span className="font-mono text-[10px] font-bold text-[#2D5A43] bg-emerald-100 px-2 py-0.5 rounded">
          HPA Validated
        </span>
      </div>

      <div className="space-y-3">
        {/* Visual Bar Comparison */}
        <div className="space-y-2 text-xs">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1">
              <span className="text-[#9C381E]">Before: Single Server Limit</span>
              <span className="text-red-700">850 Users (504 Crashes)</span>
            </div>
            <div className="w-full h-3 bg-red-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: '12%' }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1">
              <span className="text-[#2D5A43]">After: NEXORA HPA Elastic Cluster</span>
              <span className="text-emerald-700 font-bold">50,000 Users (Sustained)</span>
            </div>
            <div className="w-full h-3 bg-emerald-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#2D5A43] to-emerald-400 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        {/* Replica Scale Indicators */}
        <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE1] text-[10px] font-mono text-[#716C5F]">
          <span>Min: 3 Pod Replicas (Idle)</span>
          <span className="text-emerald-700 font-bold">Autoscales in &lt;15s via Metrics Server</span>
          <span>Max: 20 Pod Replicas (Peak)</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Visual Document Processing Pipeline Illustration
 */
export const VisualDocumentProcessing: React.FC = () => {
  return (
    <div className="p-4 bg-gradient-to-r from-[#FAF8F5] to-white border border-[#DFD9CD] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#9C381E]/10 flex items-center justify-center text-[#9C381E] shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <div className="font-bold text-[#1E232A]">Document Intelligence Ingestion</div>
          <div className="text-[10px] text-[#716C5F]">PDF, Word (.docx), TXT, CSV with multi-stakeholder origin tagging</div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-[10px] font-bold">PDF</span>
        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-mono text-[10px] font-bold">DOCX</span>
        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono text-[10px] font-bold">TXT</span>
        <ArrowRight className="w-3.5 h-3.5 text-[#9C381E]" />
        <span className="px-2.5 py-1 bg-[#1E232A] text-white rounded-lg font-mono text-[10px] font-bold flex items-center gap-1 shadow-xs">
          <Sparkles className="w-3 h-3 text-[#E06D3B]" /> 9 Classes Extracted
        </span>
      </div>
    </div>
  );
};
