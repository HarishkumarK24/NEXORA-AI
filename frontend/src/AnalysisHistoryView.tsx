import React from 'react';
import { 
  GitCommit, Clock, CheckCircle2, ArrowRight, Layers, Shield, Sparkles
} from 'lucide-react';

interface AnalysisHistoryViewProps {
  versionHistory: any[];
}

export const AnalysisHistoryView: React.FC<AnalysisHistoryViewProps> = ({
  versionHistory
}) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="bg-[#FAF8F5] border border-[#E3DAC9] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#9C381E]/10 text-[#9C381E] mb-2 font-mono">
            <GitCommit className="w-3.5 h-3.5" />
            <span>Immutable Project Baseline Ledger & Audit History</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#1E232A] font-['Space_Grotesk'] tracking-tight">
            Baseline Version History & Evolution Ledger
          </h2>
          <p className="text-xs text-[#716C5F] mt-1 max-w-2xl leading-relaxed">
            Cryptographically timestamped baseline history recording how stakeholder inputs transformed into the verified software architecture baseline.
          </p>
        </div>

        <div className="bg-white border border-[#DFD9CD] p-4 rounded-2xl shadow-xs text-right shrink-0">
          <span className="text-[10px] uppercase font-bold text-[#716C5F]">Active Baseline</span>
          <div className="text-base font-mono font-extrabold text-[#9C381E]">
            Version {versionHistory.length > 0 ? versionHistory[0].version : '2'}.0
          </div>
        </div>
      </div>

      {/* Version History Timeline */}
      <div className="space-y-4">
        {versionHistory.map((ver, idx) => (
          <div
            key={idx}
            className="bg-white border border-[#DFD9CD] rounded-3xl p-6 shadow-sm space-y-4 hover:border-[#9C381E]/40 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F2ECE1]">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#9C381E] text-white">
                  Version {ver.version}.0
                </span>
                <span className="text-xs font-bold text-[#1E232A]">
                  {ver.trigger}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-[#716C5F]">
                <Clock className="w-3.5 h-3.5 text-[#9C381E]" />
                <span>{ver.created_at || 'Just now'}</span>
                <span>•</span>
                <span className="text-[#2D5A43] font-bold">Committed by: {ver.approved_by || 'NEXORA Autonomous Agent'}</span>
              </div>
            </div>

            <div className="text-xs text-[#5C574C] leading-relaxed">
              {ver.summary}
            </div>

            {ver.components && ver.components.length > 0 && (
              <div className="p-3.5 bg-[#FAF8F5] border border-[#DFD9CD] rounded-2xl space-y-1.5">
                <span className="text-[10px] uppercase font-mono font-bold text-[#716C5F]">
                  Impacted Architecture Components:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ver.components.map((c: string, cidx: number) => (
                    <span key={cidx} className="font-mono text-[11px] px-2 py-0.5 rounded bg-white border border-[#DFD9CD] font-bold text-[#1E232A]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
