import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, Shield, ArrowRight, Eye, ChevronDown, 
  ChevronUp, GitCommit, Check, X, Sparkles, RefreshCw, Layers, Cpu, Database
} from 'lucide-react';
import { ModalPortal } from './PortalPrimitives';

interface Recommendation {
  id: number;
  rec_code: string;
  issue_id: number;
  title: string;
  category: string;
  severity: string;
  simple_explanation: string;
  why_it_matters: string;
  recommended_action: string;
  expected_result: string;
  technical_details: {
    technologies?: string[];
    patterns?: string[];
    complexity?: string;
    trade_offs?: string;
    remaining_risks?: string;
  };
  scenario_unresolved: {
    title: string;
    failure_mode: string;
    business_risk: string;
    customer_impact: string;
    financial_impact: string;
    severity: string;
  };
  scenario_resolved: {
    title: string;
    expected_improvement: string;
    behavioral_change: string;
    resilient_components: string[];
    security_perf_gains: string;
  };
  affected_requirements: string[];
  affected_components: string[];
  source_evidence?: string;
  status: 'proposed' | 'approved' | 'rejected' | 'committed';
  rejection_reason?: string;
  committed_at?: string;
  committed_by?: string;
}

interface ProjectVersionItem {
  version: number;
  trigger: string;
  summary: string;
  approved_by?: string;
  related_gap?: string;
  previous_value?: string;
  new_value?: string;
  components?: string[];
  created_at: string;
}

interface ReviewCommitCenterProps {
  recommendations: Recommendation[];
  versions: ProjectVersionItem[];
  projectId: number;
  authToken: string | null;
  onRefresh: () => void;
  showToast: (msg: string) => void;
}

export const ReviewCommitCenter: React.FC<ReviewCommitCenterProps> = ({
  recommendations,
  versions,
  projectId,
  authToken,
  onRefresh,
  showToast
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'PROPOSED' | 'APPROVED' | 'COMMITTED' | 'REJECTED'>('ALL');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [commitModalOpen, setCommitModalOpen] = useState(false);
  const [recsToCommit, setRecsToCommit] = useState<Recommendation[]>([]);
  const [committing, setCommitting] = useState(false);
  const [commitSuccessData, setCommitSuccessData] = useState<any | null>(null);

  const filteredRecs = recommendations.filter(r => {
    if (selectedFilter === 'ALL') return true;
    return r.status.toUpperCase() === selectedFilter;
  });

  const approvedRecs = recommendations.filter(r => r.status === 'approved');
  const proposedRecs = recommendations.filter(r => r.status === 'proposed');
  const committedRecs = recommendations.filter(r => r.status === 'committed');

  const handleAction = async (recId: number, action: 'approve' | 'reject' | 'propose') => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/v1/recommendations/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          recommendation_id: recId,
          action
        })
      });
      if (!res.ok) throw new Error('Action failed');
      showToast(action === 'approve' ? 'Recommendation Approved! Ready for Baseline Commit.' : 'Recommendation status updated.');
      onRefresh();
    } catch (e) {
      showToast('Error updating recommendation action');
    }
  };

  const handleApproveAllProposed = async () => {
    if (!authToken) return;
    for (const r of proposedRecs) {
      await handleAction(r.id, 'approve');
    }
    showToast(`Approved all ${proposedRecs.length} proposed recommendations.`);
  };

  const openCommitConfirmation = (recs: Recommendation[]) => {
    if (recs.length === 0) {
      showToast('Please approve at least one recommendation to commit.');
      return;
    }
    setRecsToCommit(recs);
    setCommitModalOpen(true);
    setCommitSuccessData(null);
  };

  const executeCommit = async () => {
    if (!authToken || recsToCommit.length === 0) return;
    setCommitting(true);
    try {
      const res = await fetch('/api/v1/baseline/commit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          project_id: projectId,
          recommendation_ids: recsToCommit.map(r => r.id),
          confirmation_notes: 'Confirmed by Administrator via Review & Commit Center'
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Commit failed');
      }

      const data = await res.json();
      setCommitSuccessData(data);
      showToast(`Success! Baseline Version ${data.version}.0 committed successfully!`);
      onRefresh();
    } catch (e: any) {
      showToast(e.message || 'Error executing baseline commit');
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header Banner with Action Buttons */}
      <div className="bg-[#FAF8F5] border border-[#E3DAC9] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#9C381E]/10 text-[#9C381E] mb-2 border border-[#9C381E]/20">
            <GitCommit className="w-3.5 h-3.5" />
            <span>Human-in-the-Loop Governance</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#1E232A] font-['Space_Grotesk'] tracking-tight">
            Review & Commit Changes
          </h2>
          <p className="text-xs text-[#716C5F] mt-1 max-w-2xl leading-relaxed">
            AI recommends changes with clear plain-English explanations and side-by-side consequence comparisons.
            No consequential change is applied until you explicitly review, approve, and commit it to the project baseline.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {proposedRecs.length > 0 && (
            <button
              onClick={handleApproveAllProposed}
              className="px-4 py-2.5 rounded-xl border border-[#DFD9CD] bg-white hover:bg-[#FAF8F5] text-[#1E232A] text-xs font-bold shadow-xs transition-all"
            >
              Approve All Compatible ({proposedRecs.length})
            </button>
          )}

          <button
            onClick={() => openCommitConfirmation(approvedRecs.length > 0 ? approvedRecs : proposedRecs)}
            className="px-5 py-2.5 rounded-xl bg-[#2D5A43] hover:bg-[#234835] text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition-all"
          >
            <GitCommit className="w-4 h-4" />
            <span>Commit Approved Changes ({approvedRecs.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Bar & Quick Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-[#DFD9CD] p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          {(['ALL', 'PROPOSED', 'APPROVED', 'COMMITTED', 'REJECTED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedFilter(tab)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedFilter === tab
                  ? 'bg-[#1E232A] text-white shadow-xs'
                  : 'text-[#5C574C] hover:text-[#1E232A] hover:bg-[#FAF8F5]'
              }`}
            >
              {tab === 'ALL' ? `All Solutions (${recommendations.length})` : 
               tab === 'PROPOSED' ? `Proposed (${proposedRecs.length})` :
               tab === 'APPROVED' ? `Approved (${approvedRecs.length})` :
               tab === 'COMMITTED' ? `Committed (${committedRecs.length})` : `Rejected`}
            </button>
          ))}
        </div>

        <div className="text-xs text-[#716C5F] font-mono">
          Baseline Version: <span className="font-bold text-[#1E232A]">v{versions[0]?.version || 1}.0</span>
        </div>
      </div>

      {/* 3. List of Recommendations with Before-and-After Scenarios */}
      <div className="space-y-5">
        {filteredRecs.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#716C5F] bg-white rounded-2xl border border-[#DFD9CD]">
            No recommendations match the selected filter.
          </div>
        ) : (
          filteredRecs.map((rec) => {
            const isExpanded = expandedId === rec.id;
            return (
              <div 
                key={rec.id}
                className={`bg-white border rounded-3xl p-6 shadow-sm transition-all duration-200 ${
                  rec.status === 'committed' ? 'border-[#2D5A43]/40 bg-[#FAF8F5]/50' :
                  rec.status === 'approved' ? 'border-[#2D5A43] ring-2 ring-[#2D5A43]/15' : 'border-[#DFD9CD]'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F2ECE1] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#9C381E] bg-[#9C381E]/10 px-2 py-0.5 rounded">
                        {rec.rec_code}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {rec.category}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        rec.severity === 'critical' ? 'bg-red-100 text-red-700' :
                        rec.severity === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {rec.severity} Severity
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#1E232A] font-['Space_Grotesk'] pt-1">
                      {rec.title}
                    </h3>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      rec.status === 'committed' ? 'bg-[#2D5A43] text-white' :
                      rec.status === 'approved' ? 'bg-[#2D5A43]/15 text-[#2D5A43] border border-[#2D5A43]/30' :
                      rec.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {rec.status === 'committed' ? '✓ In Project Baseline' : rec.status.toUpperCase()}
                    </span>

                    {rec.status !== 'committed' && (
                      <div className="flex items-center gap-1.5 border-l border-[#DFD9CD] pl-2.5">
                        {rec.status !== 'approved' && (
                          <button
                            onClick={() => handleAction(rec.id, 'approve')}
                            className="p-1.5 bg-[#2D5A43]/10 hover:bg-[#2D5A43] text-[#2D5A43] hover:text-white rounded-lg transition-all"
                            title="Approve this solution"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {rec.status !== 'rejected' && (
                          <button
                            onClick={() => handleAction(rec.id, 'reject')}
                            className="p-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg transition-all"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        {rec.status === 'approved' && (
                          <button
                            onClick={() => openCommitConfirmation([rec])}
                            className="px-3 py-1 bg-[#2D5A43] hover:bg-[#234835] text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                          >
                            Commit Now
                          </button>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                      className="p-1.5 text-[#716C5F] hover:text-[#1E232A] hover:bg-[#FAF8F5] rounded-lg transition-all"
                      title={isExpanded ? 'Collapse' : 'Expand Details'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Plain-English Guided Summary (Progressive Disclosure) */}
                <div className="py-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E3DAC9]/60">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-[#9C381E] mb-1">
                        Plain-English Explanation (Why It Matters)
                      </div>
                      <p className="text-xs text-[#1E232A] leading-relaxed">
                        {rec.simple_explanation}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/60">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-[#2D5A43] mb-1">
                        Recommended Solution Action
                      </div>
                      <p className="text-xs text-[#2D5A43] font-medium leading-relaxed">
                        {rec.recommended_action}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Side-by-Side Impact Analysis: If NOT Fixed vs If Solution Applied */}
                <div className="pt-2">
                  <div className="text-[10px] uppercase font-extrabold tracking-wider text-[#716C5F] mb-2 flex items-center justify-between">
                    <span>Before vs After Impact Comparison</span>
                    <span className="font-mono text-[9px] text-[#716C5F] bg-gray-100 px-2 py-0.5 rounded">
                      Simulated Predicted Outcomes
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Scenario A: If NOT fixed (Red / Muted Terracotta) */}
                    <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-red-800 font-bold">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                          <span>Scenario A: If Gap Is NOT Fixed</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-800">
                          Risk: {rec.scenario_unresolved.severity}
                        </span>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-red-700">Possible Failure Mode:</div>
                        <p className="text-[#5C574C] mt-0.5 leading-relaxed">{rec.scenario_unresolved.failure_mode}</p>
                      </div>
                      <div className="pt-1 border-t border-red-200/60 flex items-center justify-between text-[11px] text-red-800">
                        <span>Customer Impact: {rec.scenario_unresolved.customer_impact}</span>
                      </div>
                    </div>

                    {/* Scenario B: If Solution IS Applied (Green) */}
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-emerald-900 font-bold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Scenario B: If Solution IS Applied</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Resilient
                        </span>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-emerald-800">Expected Improvement:</div>
                        <p className="text-[#5C574C] mt-0.5 leading-relaxed">{rec.scenario_resolved.expected_improvement}</p>
                      </div>
                      <div className="pt-1 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-900">
                        <span>Gains: {rec.scenario_resolved.security_perf_gains}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expandable Technical Details (Progressive Disclosure) */}
                {isExpanded && (
                  <div className="mt-5 pt-4 border-t border-[#F2ECE1] space-y-4 animate-fade-in">
                    <div className="text-[10px] uppercase font-extrabold tracking-wider text-[#9C381E]">
                      Technical Engineering Specification
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-[#FAF8F5] border border-[#DFD9CD] rounded-xl">
                        <div className="font-bold text-[#1E232A]">Technologies & Libraries:</div>
                        <div className="text-[11px] text-[#5C574C] mt-1 font-mono">
                          {rec.technical_details.technologies?.join(', ') || 'Standard Patterns'}
                        </div>
                      </div>

                      <div className="p-3 bg-[#FAF8F5] border border-[#DFD9CD] rounded-xl">
                        <div className="font-bold text-[#1E232A]">Design Patterns:</div>
                        <div className="text-[11px] text-[#5C574C] mt-1">
                          {rec.technical_details.patterns?.join(', ') || 'Layered Architecture'}
                        </div>
                      </div>

                      <div className="p-3 bg-[#FAF8F5] border border-[#DFD9CD] rounded-xl">
                        <div className="font-bold text-[#1E232A]">Complexity & Trade-offs:</div>
                        <div className="text-[11px] text-[#5C574C] mt-1">
                          {rec.technical_details.complexity} • {rec.technical_details.trade_offs}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="font-bold text-[#4A453A]">Affected Components:</span>
                      {rec.affected_components.map((comp, idx) => (
                        <span key={idx} className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. Project Baseline Version History Table */}
      <div className="bg-white border border-[#DFD9CD] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#1E232A] font-['Space_Grotesk']">
              Official Project Baseline Change History
            </h3>
            <p className="text-xs text-[#716C5F]">
              Immutable audit ledger of approved and committed architectural requirements.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#2D5A43] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {versions.length} Baselines Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DFD9CD] text-[10px] uppercase font-bold text-[#716C5F] tracking-wider">
                <th className="pb-3">Version</th>
                <th className="pb-3">Change Summary</th>
                <th className="pb-3">Approved By</th>
                <th className="pb-3">Date & Time</th>
                <th className="pb-3">Impacted Components</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE1]">
              {versions.map((ver, idx) => (
                <tr key={idx} className="hover:bg-[#FAF8F5] transition-all">
                  <td className="py-3 font-mono font-bold text-[#9C381E]">
                    v{ver.version}.0
                  </td>
                  <td className="py-3 font-semibold text-[#1E232A]">
                    {ver.summary}
                  </td>
                  <td className="py-3 text-[#5C574C]">
                    {ver.approved_by || 'Administrator'}
                  </td>
                  <td className="py-3 text-[11px] text-[#716C5F] font-mono">
                    {new Date(ver.created_at).toLocaleString()}
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {ver.components?.slice(0, 3).map((c, i) => (
                        <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Confirmation Before Committing Modal */}
      <ModalPortal isOpen={commitModalOpen} onClose={() => setCommitModalOpen(false)} maxWidth="max-w-2xl">
        <div className="space-y-5">
          {commitSuccessData ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#2D5A43]/15 text-[#2D5A43] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-[#1E232A] font-['Space_Grotesk']">
                Baseline Version {commitSuccessData.version}.0 Successfully Committed!
              </h3>
              <p className="text-xs text-[#5C574C] max-w-md mx-auto leading-relaxed">
                {commitSuccessData.summary}
              </p>
              <div className="p-3 bg-[#FAF8F5] border border-[#DFD9CD] rounded-2xl text-xs font-mono max-w-md mx-auto text-[#2D5A43]">
                Completeness Score Updated: {commitSuccessData.readiness_score}%
              </div>
              <button
                onClick={() => {
                  setCommitModalOpen(false);
                  setCommitSuccessData(null);
                }}
                className="mt-2 px-6 py-2.5 bg-[#1E232A] hover:bg-[#2F3642] text-white text-xs font-bold rounded-xl"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="border-b border-[#F2ECE1] pb-3">
                <span className="text-[10px] uppercase font-bold text-[#9C381E] tracking-wider">
                  Mandatory Human Confirmation Gate
                </span>
                <h3 className="text-lg font-bold text-[#1E232A] font-['Space_Grotesk'] mt-0.5">
                  You are about to commit {recsToCommit.length} change(s) to the project baseline.
                </h3>
              </div>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {recsToCommit.map((rec) => (
                  <div key={rec.id} className="p-3.5 bg-[#FAF8F5] border border-[#DFD9CD] rounded-2xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-[#1E232A]">
                      <span>{rec.rec_code}: {rec.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {rec.severity}
                      </span>
                    </div>
                    <p className="text-[#5C574C] text-[11px]">{rec.simple_explanation}</p>
                    <div className="text-[10px] text-[#2D5A43] font-semibold">
                      Action: {rec.recommended_action}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Application-Level Commit:</span> Commits approved changes into the official NEXORA project baseline, re-synthesizes the architecture blueprint, and increments the project version.
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F2ECE1]">
                <button
                  type="button"
                  onClick={() => setCommitModalOpen(false)}
                  className="px-4 py-2 border border-[#DFD9CD] rounded-xl text-xs font-bold text-[#5C574C] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={committing}
                  onClick={executeCommit}
                  className="px-5 py-2 bg-[#2D5A43] hover:bg-[#234835] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                  <GitCommit className="w-4 h-4" />
                  {committing ? 'Validating & Committing Baseline...' : 'Confirm & Commit Changes'}
                </button>
              </div>
            </>
          )}
        </div>
      </ModalPortal>
    </div>
  );
};
