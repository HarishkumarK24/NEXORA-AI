import React from 'react';
import { 
  AlertTriangle, CheckCircle2, Zap, ArrowRight, Shield, Layers, HelpCircle, AlertOctagon
} from 'lucide-react';

interface ImpactComparisonViewProps {
  recommendations: any[];
}

export const ImpactComparisonView: React.FC<ImpactComparisonViewProps> = ({
  recommendations
}) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="bg-[#FAF8F5] border border-[#E3DAC9] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#9C381E]/10 text-[#9C381E] mb-2 font-mono">
            <Zap className="w-3.5 h-3.5" />
            <span>Before & After Impact Intelligence • Predictive Scenarios</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#1E232A] font-['Space_Grotesk'] tracking-tight">
            Before-and-After Architectural Impact Comparison
          </h2>
          <p className="text-xs text-[#716C5F] mt-1 max-w-2xl leading-relaxed">
            Side-by-side demonstration of system behavior: what goes wrong if a gap remains unaddressed versus how resilience improves when the solution is incorporated into the baseline.
          </p>
        </div>

        <div className="p-3 bg-white border border-[#DFD9CD] rounded-2xl shadow-xs text-xs font-mono text-[#716C5F] max-w-xs text-right">
          <span className="text-[10px] font-bold text-amber-700 uppercase">AI Predictive Scenarios</span>
          <div className="text-[11px] text-[#5C574C] mt-0.5">
            Estimates based on architectural design patterns & load failure models
          </div>
        </div>
      </div>

      {/* Scenarios Grid List */}
      <div className="space-y-6">
        {recommendations.map((rec) => {
          const unres = rec.scenario_unresolved || {};
          const res = rec.scenario_resolved || {};

          return (
            <div
              key={rec.id}
              className="bg-white border border-[#DFD9CD] rounded-3xl p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F2ECE1]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#9C381E]/10 text-[#9C381E]">
                    {rec.rec_code}
                  </span>
                  <h3 className="text-sm font-bold text-[#1E232A] font-['Space_Grotesk']">
                    {rec.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#2D5A43] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  APPLIED IN BASELINE v2.0
                </div>
              </div>

              {/* Side-by-Side Scenarios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Scenario A: Without Solution (Terracotta / Red Alert) */}
                <div className="bg-[#FFF8F6] border border-[#F3D5CC] rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F3D5CC]">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#9C381E] uppercase font-mono">
                      <AlertOctagon className="w-4 h-4 text-[#9C381E]" />
                      Scenario A • Without Recommended Solution
                    </div>
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                      {unres.severity || 'CRITICAL RISK'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#716C5F] font-mono">
                        Potential Failure Mode:
                      </span>
                      <p className="text-xs font-semibold text-[#1E232A] mt-0.5">
                        {unres.failure_mode}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#716C5F] font-mono">
                        Business & Customer Consequence:
                      </span>
                      <p className="text-xs text-[#5C574C] mt-0.5">
                        {unres.business_risk} {unres.customer_impact}
                      </p>
                    </div>

                    {unres.financial_impact && (
                      <div className="pt-2 border-t border-[#F3D5CC] flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#9C381E] uppercase font-mono">Financial Liability:</span>
                        <span className="font-mono text-[#9C381E] font-bold">{unres.financial_impact}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scenario B: With Solution (Deep Forest Green) */}
                <div className="bg-[#F6FAF7] border border-[#CDE5D5] rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#CDE5D5]">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#2D5A43] uppercase font-mono">
                      <CheckCircle2 className="w-4 h-4 text-[#2D5A43]" />
                      Scenario B • With Recommended Solution (Baseline v2.0)
                    </div>
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      VERIFIED RESILIENT
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#716C5F] font-mono">
                        Expected Improvement:
                      </span>
                      <p className="text-xs font-semibold text-[#1E232A] mt-0.5">
                        {res.expected_improvement}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#716C5F] font-mono">
                        Runtime Behavioral Change:
                      </span>
                      <p className="text-xs text-[#5C574C] mt-0.5">
                        {res.behavioral_change}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#CDE5D5] flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#2D5A43] uppercase font-mono">Resilient Components:</span>
                      <span className="font-mono text-[#2D5A43] font-bold">
                        {(res.resilient_components || []).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer Note */}
              <div className="text-[10px] text-[#716C5F] font-mono flex items-center justify-between pt-1">
                <span>Predicted by NEXORA Architecture Simulation Engine</span>
                <span className="text-[#2D5A43] font-bold">100% Traceability Mapped</span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
