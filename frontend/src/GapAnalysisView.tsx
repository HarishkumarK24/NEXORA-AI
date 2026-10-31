import React, { useState } from 'react';
import { 
  AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Shield, Sparkles, Filter, Info
} from 'lucide-react';
import { VisualConflictDiagram } from './VisualStoryComponents';

interface GapAnalysisViewProps {
  issues: any[];
}

export const GapAnalysisView: React.FC<GapAnalysisViewProps> = ({ issues }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'RESOLVED' | 'UNRESOLVED'>('ALL');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const filtered = issues.filter(issue => {
    const matchesSev = selectedSeverity === 'ALL' || issue.severity.toLowerCase() === selectedSeverity.toLowerCase();
    const matchesStatus = selectedStatus === 'ALL' ||
      (selectedStatus === 'RESOLVED' && issue.is_resolved) ||
      (selectedStatus === 'UNRESOLVED' && !issue.is_resolved);
    return matchesSev && matchesStatus;
  });

  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const highCount = issues.filter(i => i.severity === 'high').length;
  const resolvedCount = issues.filter(i => i.is_resolved).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="bg-[#FAF8F5] border border-[#E3DAC9] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 mb-2 font-mono">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Architectural Gaps, Conflicts & Missing Information</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#1E232A] font-['Space_Grotesk'] tracking-tight">
            Gap & Conflict Intelligence Analysis
          </h2>
          <p className="text-xs text-[#716C5F] mt-1 max-w-2xl leading-relaxed">
            Contextual reasoning engine automatically identified architectural deficiencies, concurrency bottlenecks, and unhandled failure states.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#716C5F]">Total Gaps</span>
            <div className="text-lg font-mono font-extrabold text-amber-700">
              {issues.length} Identified
            </div>
          </div>
          <div className="h-8 w-[1px] bg-[#DFD9CD]" />
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#2D5A43]">Auto-Resolved</span>
            <div className="text-lg font-mono font-extrabold text-[#2D5A43]">
              {resolvedCount} of {issues.length}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Conflict Resolution Diagram */}
      <VisualConflictDiagram />

      {/* Filters Bar */}
      <div className="bg-white border border-[#DFD9CD] rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#716C5F] uppercase font-mono">Filter Severity:</span>
          {['ALL', 'critical', 'high', 'medium', 'low'].map(s => (
            <button
              key={s}
              onClick={() => setSelectedSeverity(s)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all capitalize ${
                selectedSeverity === s
                  ? 'bg-[#1E232A] text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-[#5C574C] hover:text-[#1E232A] border border-[#DFD9CD]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#DFD9CD]">
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              selectedStatus === 'ALL'
                ? 'bg-white text-[#1E232A] shadow-sm'
                : 'text-[#716C5F] hover:text-[#1E232A]'
            }`}
          >
            All Gaps
          </button>
          <button
            onClick={() => setSelectedStatus('RESOLVED')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              selectedStatus === 'RESOLVED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[#2D5A43] hover:text-[#1E232A]'
            }`}
          >
            Auto-Resolved ({resolvedCount})
          </button>
        </div>
      </div>

      {/* Gaps List */}
      <div className="space-y-4">
        {filtered.map((issue) => {
          const isExpanded = expandedId === issue.id;

          return (
            <div
              key={issue.id}
              className={`bg-white border rounded-3xl p-6 shadow-sm transition-all space-y-4 ${
                issue.is_resolved 
                  ? 'border-[#DFD9CD] hover:border-[#2D5A43]/50'
                  : 'border-amber-300 bg-amber-50/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#9C381E]/10 text-[#9C381E]">
                    {issue.issue_code}
                  </span>

                  <span className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full uppercase ${
                    issue.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    issue.severity === 'high' ? 'bg-amber-100 text-amber-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {issue.severity} Severity
                  </span>

                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#DFD9CD] text-[#716C5F]">
                    {issue.issue_type}
                  </span>
                </div>

                <div>
                  {issue.is_resolved ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Auto-Resolved in Baseline v2.0
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold font-mono">
                      <Info className="w-3.5 h-3.5" />
                      Documented Explicit Assumption
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Simple Explanation */}
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#1E232A] font-['Space_Grotesk']">
                  {issue.title}
                </h3>
                <p className="text-xs text-[#5C574C] leading-relaxed">
                  {issue.explanation}
                </p>
              </div>

              {/* Business Impact Card */}
              <div className="p-3.5 bg-[#FAF8F5] border border-[#DFD9CD] rounded-2xl flex items-start gap-3 text-xs">
                <AlertTriangle className="w-4 h-4 text-[#9C381E] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1E232A]">Potential Business Impact:</strong>{' '}
                  <span className="text-[#5C574C]">{issue.business_impact}</span>
                </div>
              </div>

              {/* Expandable Technical Root Cause & Evidence */}
              <div>
                <button
                  onClick={() => toggleExpand(issue.id)}
                  className="text-xs text-[#9C381E] hover:text-[#7A2C17] font-bold flex items-center gap-1 font-mono transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <span>Hide Technical Details & Evidence Quote</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>View Technical Details & Evidence Quote</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-3 p-4 bg-[#FAF8F5] border border-[#DFD9CD] rounded-2xl space-y-3 text-xs animate-fade-in">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#716C5F] font-mono">
                        Source Evidence Quote from Stakeholder Requirements:
                      </span>
                      <div className="mt-1 p-2.5 bg-white border border-[#DFD9CD] rounded-xl font-mono text-[11px] text-[#1E232A]">
                        "{issue.evidence_quote || 'Direct requirement extract'}"
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#716C5F] font-mono">
                        Suggested Technical Resolution:
                      </span>
                      <div className="mt-1 text-[#2D5A43] font-semibold">
                        {issue.suggested_resolution}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#DFD9CD] text-[11px] text-[#716C5F]">
                      <strong>Affected Stakeholders:</strong> {issue.affected_stakeholders}
                    </div>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
