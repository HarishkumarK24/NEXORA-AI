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

/**
 * GIF-LIKE MICRO-ANIMATION 1: Live Laser Document Scanner
 * Features sweeping neon laser beam, blinking optical LEDs, drifting extracted tokens, and real-time token telemetry.
 */
export const GifLikeDocumentScanner: React.FC<{ isScanning?: boolean; className?: string }> = ({ 
  isScanning = true, 
  className = '' 
}) => {
  return (
    <div className={`relative bg-[#1A1F26] border border-[#2D3748] rounded-2xl p-4 shadow-xl overflow-hidden ${className}`}>
      {/* Top Console Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-800 text-[10px] font-mono">
        <div className="flex items-center gap-2 text-gray-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E06D3B] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E06D3B]"></span>
          </span>
          <span className="font-bold text-[#E06D3B] tracking-wider uppercase">AI OPTICAL DOCUMENT SCANNER</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-400">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-led-slow"></span>
          <span>48 TOKENS/SEC</span>
        </div>
      </div>

      {/* Document Scanner Bed */}
      <div className="relative mt-3 bg-[#0F1318] rounded-xl p-4 border border-gray-800/80 min-h-[140px] overflow-hidden flex flex-col justify-between">
        
        {/* Sweeping Laser Beam (GIF-like continuous scan) */}
        {isScanning && (
          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E06D3B] to-transparent shadow-[0_0_15px_#E06D3B,0_0_30px_#9C381E] z-20 pointer-events-none animate-scanline">
            {/* Laser Focal Dot */}
            <div className="absolute left-1/2 -top-1 w-3 h-3 bg-white rounded-full shadow-[0_0_8px_#ffffff] transform -translate-x-1/2"></div>
          </div>
        )}

        {/* Simulated Document Lines */}
        <div className="space-y-2 opacity-60 z-10">
          <div className="h-2 w-3/4 bg-gray-600 rounded"></div>
          <div className="h-2 w-5/6 bg-gray-700 rounded"></div>
          <div className="h-2 w-2/3 bg-gray-600 rounded"></div>
          <div className="h-2 w-4/5 bg-gray-700 rounded"></div>
          <div className="h-2 w-1/2 bg-gray-600 rounded"></div>
        </div>

        {/* Floating Extracted Tokens (GIF-like animated drift) */}
        <div className="absolute inset-0 z-15 pointer-events-none p-3 flex flex-wrap gap-2 items-center justify-around">
          <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-[#E06D3B]/20 text-[#E06D3B] border border-[#E06D3B]/40 animate-float-gentle shadow-xs">
            🏷️ 10,000 CONCURRENCY
          </span>
          <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-float-gentle [animation-delay:0.8s] shadow-xs">
            🔒 PII AES-256 GCM
          </span>
          <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-float-gentle [animation-delay:1.6s] shadow-xs">
            ⚡ REDIS DISTRIBUTED LOCK
          </span>
          <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-purple-500/20 text-purple-400 border border-purple-500/40 animate-float-gentle [animation-delay:2.2s] shadow-xs">
            🛡️ IDEMPOTENCY KEY
          </span>
        </div>

        {/* Telemetry Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800/80 text-[9px] font-mono text-gray-400 z-10">
          <span>PARSED: 9 DIMENSIONS</span>
          <span className="text-emerald-400 font-bold">ACCURACY: 99.4%</span>
          <span>FORMAT: MULTI-FILE STREAM</span>
        </div>
      </div>
    </div>
  );
};

/**
 * GIF-LIKE MICRO-ANIMATION 2: High-Tech Radar Gap Detector
 * Features rotating circular radar sweep line, pinging red/amber gap blips, and target coordinate readouts.
 */
export const GifLikeRadarGapDetector: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative bg-[#0F141C] border border-[#232F3E] rounded-2xl p-4 shadow-xl overflow-hidden ${className}`}>
      {/* Console Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#232F3E] text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-led-fast"></span>
          <span className="font-bold text-red-400 tracking-wider">RADAR GAP & RISK DETECTOR</span>
        </div>
        <span className="text-cyan-400 font-mono text-[9px]">SWEEP: 360° CONT</span>
      </div>

      {/* Radar Screen Area */}
      <div className="relative mt-3 w-full aspect-square max-w-[200px] mx-auto rounded-full bg-[#080D14] border-2 border-cyan-900/60 flex items-center justify-center overflow-hidden shadow-[inset_0_0_20px_rgba(6,182,212,0.15)]">
        
        {/* Concentric Distance Rings */}
        <div className="absolute w-3/4 h-3/4 rounded-full border border-cyan-800/30"></div>
        <div className="absolute w-1/2 h-1/2 rounded-full border border-cyan-800/40"></div>
        <div className="absolute w-1/4 h-1/4 rounded-full border border-cyan-800/50"></div>
        
        {/* Crosshair Grids */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-800/30"></div>
        <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-800/30"></div>

        {/* Rotating Radar Sweep Cone (GIF-like continuous 360 sweep) */}
        <div className="absolute inset-0 animate-radar-sweep pointer-events-none">
          <div className="w-1/2 h-1/2 bg-gradient-to-br from-cyan-400/30 via-cyan-500/10 to-transparent rounded-tl-full origin-bottom-right"></div>
          {/* Leading beam line */}
          <div className="absolute top-0 right-1/2 w-0.5 h-1/2 bg-cyan-300 shadow-[0_0_8px_#22d3ee]"></div>
        </div>

        {/* Pinging Gap Blip 1: Bottleneck */}
        <div className="absolute top-[28%] right-[25%] flex items-center justify-center">
          <span className="w-3 h-3 rounded-full bg-red-500/40 animate-radar-ping absolute"></span>
          <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]"></span>
          <span className="absolute left-3 top-0 text-[8px] font-mono text-red-400 font-bold whitespace-nowrap bg-black/60 px-1 rounded">
            GAP 01
          </span>
        </div>

        {/* Pinging Gap Blip 2: Race Condition */}
        <div className="absolute bottom-[30%] left-[28%] flex items-center justify-center">
          <span className="w-3 h-3 rounded-full bg-amber-500/40 animate-radar-ping [animation-delay:0.9s] absolute"></span>
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]"></span>
          <span className="absolute right-3 top-0 text-[8px] font-mono text-amber-300 font-bold whitespace-nowrap bg-black/60 px-1 rounded">
            GAP 02
          </span>
        </div>

        {/* Pinging Gap Blip 3: Security Risk */}
        <div className="absolute top-[35%] left-[22%] flex items-center justify-center">
          <span className="w-3 h-3 rounded-full bg-red-500/40 animate-radar-ping [animation-delay:1.5s] absolute"></span>
          <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_#ef4444]"></span>
          <span className="absolute left-3 -top-2 text-[8px] font-mono text-red-300 font-bold whitespace-nowrap bg-black/60 px-1 rounded">
            RISK
          </span>
        </div>

        {/* Radar Center Hub */}
        <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] z-10"></div>
      </div>

      {/* Detection Ticker */}
      <div className="mt-3 p-2 bg-[#141A23] rounded-lg border border-[#232F3E] flex items-center justify-between text-[9px] font-mono">
        <span className="text-gray-400">DETECTED: <strong className="text-red-400">7 ARCHITECTURAL GAPS</strong></span>
        <span className="text-emerald-400 font-bold">STATUS: AUTO-SOLVED</span>
      </div>
    </div>
  );
};

/**
 * GIF-LIKE MICRO-ANIMATION 3: Live Server Blade Cluster
 * Features 3 server chassis blades, asynchronous blinking activity LEDs, and flowing fiber data packets.
 */
export const GifLikeServerCluster: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative bg-[#161B22] border border-[#30363D] rounded-2xl p-4 shadow-xl ${className}`}>
      {/* Console Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#30363D] text-[10px] font-mono">
        <div className="flex items-center gap-2 text-gray-200">
          <Server className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold text-emerald-400 tracking-wider">HPA AUTONOMOUS CLUSTER</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-[9px]">
          <span>UPTIME: 99.99%</span>
          <span className="text-emerald-400 font-bold">p99: 42ms</span>
        </div>
      </div>

      {/* Server Rack Blade Units */}
      <div className="mt-3 space-y-2">
        {/* Blade 1: Ingress / Gateway */}
        <div className="p-2.5 bg-[#0D1117] border border-[#30363D] rounded-xl flex items-center justify-between relative overflow-hidden">
          {/* Animated data packet traveling across blade (GIF-like data pulse) */}
          <div className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-data-flow pointer-events-none"></div>

          <div className="flex items-center gap-2 z-10">
            <div className="flex flex-col gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-led-slow"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-led-fast"></span>
            </div>
            <div>
              <div className="text-[10px] font-bold font-mono text-gray-200">BLADE 01: API GATEWAY (KONG)</div>
              <div className="text-[8px] font-mono text-gray-400">Rate Limiter • SSL Offload • Auth Shield</div>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-cyan-900/40 text-cyan-300 border border-cyan-800/60 rounded font-mono text-[9px] font-bold z-10">
            10,000 REQ/S
          </span>
        </div>

        {/* Blade 2: Microservices Pods */}
        <div className="p-2.5 bg-[#0D1117] border border-[#30363D] rounded-xl flex items-center justify-between relative overflow-hidden">
          {/* Animated data packet traveling across blade */}
          <div className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent animate-data-flow [animation-delay:0.6s] pointer-events-none"></div>

          <div className="flex items-center gap-2 z-10">
            <div className="flex flex-col gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-led-slow"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-led-fast"></span>
            </div>
            <div>
              <div className="text-[10px] font-bold font-mono text-gray-200">BLADE 02: K8S POD ENGINE</div>
              <div className="text-[8px] font-mono text-gray-400">HPA 3 → 20 Pods • Checkout & Catalog</div>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-emerald-900/40 text-emerald-300 border border-emerald-800/60 rounded font-mono text-[9px] font-bold z-10">
            REPLICAS: 8/20
          </span>
        </div>

        {/* Blade 3: Distributed State & Database */}
        <div className="p-2.5 bg-[#0D1117] border border-[#30363D] rounded-xl flex items-center justify-between relative overflow-hidden">
          {/* Animated data packet traveling across blade */}
          <div className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-[#E06D3B]/20 to-transparent animate-data-flow [animation-delay:1.1s] pointer-events-none"></div>

          <div className="flex items-center gap-2 z-10">
            <div className="flex flex-col gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-led-slow"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-led-fast"></span>
            </div>
            <div>
              <div className="text-[10px] font-bold font-mono text-gray-200">BLADE 03: POSTGRES + REDIS</div>
              <div className="text-[8px] font-mono text-gray-400">Read Replica Pool • Distributed Lock</div>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-purple-900/40 text-purple-300 border border-purple-800/60 rounded font-mono text-[9px] font-bold z-10">
            LATENCY: 4ms
          </span>
        </div>
      </div>

      {/* Cluster Status Footer */}
      <div className="mt-2.5 flex items-center justify-between text-[9px] font-mono text-gray-400 pt-2 border-t border-[#30363D]">
        <span>CONTAINER ENGINE: RUNNING</span>
        <span className="text-emerald-400 font-bold">HEALTH: 100% HEALTHY</span>
      </div>
    </div>
  );
};

/**
 * GIF-LIKE MICRO-ANIMATION 4: Security Shield with Orbital Rings
 * Features central pulsing shield and double rotating orbital rings with zero-trust security particles.
 */
export const GifLikeSecurityShield: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative bg-gradient-to-br from-[#111827] to-[#1F2937] border border-gray-700 rounded-2xl p-4 shadow-xl flex flex-col items-center justify-center text-center overflow-hidden ${className}`}>
      
      {/* Orbital Shield Core */}
      <div className="relative w-28 h-28 flex items-center justify-center my-2">
        {/* Outer Orbital Ring 1 (GIF-like spinning orbit) */}
        <div className="absolute inset-0 rounded-full border border-dashed border-[#E06D3B]/50 animate-orbit pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E06D3B] shadow-[0_0_8px_#E06D3B] absolute -top-1 left-1/2 transform -translate-x-1/2"></div>
        </div>

        {/* Inner Orbital Ring 2 (Counter-spin) */}
        <div className="absolute inset-3 rounded-full border border-dashed border-cyan-400/50 [animation:orbitSpin_6s_linear_infinite_reverse] pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
        </div>

        {/* Central Pulsing Security Shield Icon */}
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#9C381E] to-[#E06D3B] flex items-center justify-center shadow-[0_0_20px_rgba(224,109,59,0.5)] animate-pulse-glow">
          <Shield className="w-7 h-7 text-white" />
          <Lock className="w-3.5 h-3.5 text-white absolute -bottom-1 -right-1 bg-[#1E232A] rounded-full p-0.5" />
        </div>
      </div>

      <div className="mt-1 space-y-1">
        <div className="text-xs font-bold text-white font-['Space_Grotesk']">
          Zero-Trust Security Perimeter
        </div>
        <div className="text-[10px] text-gray-400 font-mono">
          AES-256 GCM • TLS 1.3 • PCI-DSS Compliant
        </div>
      </div>

      {/* Security Specs Grid */}
      <div className="mt-3 grid grid-cols-2 gap-1.5 w-full text-[9px] font-mono text-gray-300">
        <div className="p-1.5 bg-black/40 rounded border border-gray-700/60 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-led-slow"></span>
          <span>PII Encrypted</span>
        </div>
        <div className="p-1.5 bg-black/40 rounded border border-gray-700/60 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-led-slow"></span>
          <span>Zero Plaintext</span>
        </div>
      </div>
    </div>
  );
};

