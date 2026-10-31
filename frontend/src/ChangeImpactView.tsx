import React, { useState } from 'react';
import { 
  Zap, ArrowRight, AlertTriangle, CheckCircle2, TrendingUp, DollarSign, 
  Layers, Shield, Server, Database, Sparkles, RefreshCw
} from 'lucide-react';

interface ChangeImpactProps {
  projectId: number;
  authToken: string | null;
  onRefresh: () => void;
  showToast: (msg: string) => void;
}

export const ChangeImpactView: React.FC<ChangeImpactProps> = ({
  projectId,
  authToken,
  onRefresh,
  showToast
}) => {
  const [statement, setStatement] = useState('The shopping application must support 100,000 concurrent users.');
  const [loading, setLoading] = useState(false);
  const [impactResult, setImpactResult] = useState<any | null>(null);

  const testPresets = [
    {
      label: '100,000 Concurrent Users (Scalability Surge)',
      text: 'The shopping application must support 100,000 concurrent users during holiday promotions.'
    },
    {
      label: 'Multi-Currency & Cryptocurrency Checkout',
      text: 'Support international multi-currency settlement and Bitcoin / Ethereum crypto checkout.'
    },
    {
      label: '1-Hour Drone Express Delivery Guarantee',
      text: 'Guarantee 1-hour automated drone delivery dispatch with live GPS telemetry tracking.'
    }
  ];

  const handleRunImpactAnalysis = async (customPrompt?: string) => {
    if (!authToken) return;
    const promptToUse = customPrompt || statement;
    setLoading(true);
    try {
      const res = await fetch('/api/v1/impact/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          project_id: projectId,
          requirement_statement: promptToUse
        })
      });

      if (!res.ok) throw new Error('Impact analysis failed');
      const data = await res.json();
      setImpactResult(data);
      showToast('Change Impact Analysis complete! Downstream effects mapped.');
    } catch (e) {
      showToast('Error analyzing change impact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-[#FAF8F5] border border-[#E3DAC9] rounded-3xl p-6 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E06D3B]/10 text-[#E06D3B] mb-2 border border-[#E06D3B]/20">
          <Zap className="w-3.5 h-3.5" />
          <span>Signature Feature • Dynamic Change Impact Intelligence</span>
        </div>
        <h2 className="text-2xl font-extrabold text-[#1E232A] font-['Space_Grotesk'] tracking-tight">
          Requirement Change Impact Intelligence Engine
        </h2>
        <p className="text-xs text-[#716C5F] mt-1 max-w-3xl leading-relaxed">
          Whenever a requirement is added, edited, or escalated (e.g. from 10,000 to 100,000 concurrent users), 
          NEXORA automatically computes all downstream cascading effects across database capacity, caching tiers, 
          outdated ADRs, cloud costs, and system failure risks.
        </p>
      </div>

      {/* Input Box & Presets */}
      <div className="bg-white border border-[#DFD9CD] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#1E232A]">
            Enter New or Modified Requirement Statement:
          </label>
          <span className="text-[11px] text-[#716C5F]">Automated downstream ripple analysis</span>
        </div>

        <div className="flex gap-3">
          <input 
            type="text"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder="e.g. Increase application capacity from 10,000 to 100,000 concurrent users."
            className="flex-1 px-4 py-3 bg-[#FAF8F5] border border-[#DFD9CD] rounded-2xl text-xs font-medium text-[#1E232A] focus:outline-none focus:border-[#9C381E]"
          />
          <button
            onClick={() => handleRunImpactAnalysis()}
            disabled={loading}
            className="px-6 py-3 bg-[#9C381E] hover:bg-[#802D18] text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Evaluating Ripples...' : 'Analyze Downstream Ripples'}
          </button>
        </div>

        {/* Quick presets */}
        <div className="pt-2 border-t border-[#F2ECE1] flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-[#716C5F]">Try Test Cases:</span>
          {testPresets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setStatement(p.text);
                handleRunImpactAnalysis(p.text);
              }}
              className="text-[11px] px-3 py-1 rounded-xl bg-[#FAF8F5] hover:bg-white border border-[#DFD9CD] text-[#1E232A] font-medium transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Impact Results Map */}
      {impactResult && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Strip */}
          <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                  {impactResult.severity}
                </span>
                <span className="text-xs font-bold text-[#1E232A]">
                  Change Classification: {impactResult.change_type}
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#1E232A] mt-1">
                "{impactResult.requirement_analyzed}"
              </h4>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-[#716C5F]">Estimated Cost Delta</span>
              <div className="text-sm font-bold text-[#9C381E] font-mono mt-0.5">
                {impactResult.cost_tradeoffs.estimated_cloud_cost_delta}
              </div>
            </div>
          </div>

          {/* Component Ripple Matrix */}
          <div className="bg-white border border-[#DFD9CD] rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#1E232A] uppercase tracking-wider font-['Space_Grotesk'] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#9C381E]" />
              Downstream Architecture Component Impact Map
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#DFD9CD] text-[10px] uppercase font-bold text-[#716C5F]">
                    <th className="pb-3">Component Node</th>
                    <th className="pb-3">Current Specification</th>
                    <th className="pb-3">Required Architectural Upgrade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2ECE1]">
                  {impactResult.affected_components.map((comp: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[#FAF8F5] transition-all">
                      <td className="py-3 font-bold text-[#1E232A]">
                        {comp.name}
                      </td>
                      <td className="py-3 text-[#5C574C] font-mono text-[11px]">
                        {comp.current}
                      </td>
                      <td className="py-3 font-semibold text-[#2D5A43]">
                        {comp.required}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Outdated ADRs and Trade-offs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Outdated ADRs */}
            <div className="bg-white border border-[#DFD9CD] rounded-3xl p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#1E232A] uppercase tracking-wider">
                  Outdated Architecture Decisions (ADRs)
                </h4>
                <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                  Action Required
                </span>
              </div>
              <div className="space-y-2.5">
                {impactResult.outdated_adrs.map((adr: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#DFD9CD] space-y-1">
                    <div className="font-bold text-xs text-[#9C381E]">{adr.code}: {adr.title}</div>
                    <div className="text-[11px] text-[#5C574C]">{adr.impact}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Comparison: Without vs With Changes */}
            <div className="bg-white border border-[#DFD9CD] rounded-3xl p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-[#1E232A] uppercase tracking-wider">
                Risk & Resilience Evaluation
              </h4>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-red-50/70 border border-red-200 text-red-900 space-y-1">
                  <div className="font-bold text-[11px] text-red-800 uppercase">If Ignored (Bottleneck):</div>
                  <p className="text-[11px] text-[#5C574C]">{impactResult.risk_comparison.without_changes}</p>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-1">
                  <div className="font-bold text-[11px] text-emerald-800 uppercase">With Architectural Upgrade:</div>
                  <p className="text-[11px] text-[#5C574C]">{impactResult.risk_comparison.with_changes}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
