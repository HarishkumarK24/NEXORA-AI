import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle2, ChevronDown, ChevronUp, Cpu, Shield, Layers, ArrowRight
} from 'lucide-react';

interface RecommendedSolutionsViewProps {
  recommendations: any[];
}

export const RecommendedSolutionsView: React.FC<RecommendedSolutionsViewProps> = ({
  recommendations
}) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="bg-[#FAF8F5] border border-[#E3DAC9] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#2D5A43]/10 text-[#2D5A43] mb-2 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Solutions Engine • Progressive Disclosure</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#1E232A] font-['Space_Grotesk'] tracking-tight">
            Recommended Engineering Solutions
          </h2>
          <p className="text-xs text-[#716C5F] mt-1 max-w-2xl leading-relaxed">
            Every detected gap is resolved through plain-English progressive disclosure: human-understandable explanation first, followed by deep architectural specifications.
          </p>
        </div>

        <div className="bg-white border border-[#DFD9CD] px-4 py-2.5 rounded-2xl shadow-xs text-right shrink-0">
          <span className="text-[10px] uppercase font-bold text-[#716C5F]">Generated Solutions</span>
          <div className="text-lg font-mono font-extrabold text-[#2D5A43]">
            {recommendations.length} Active
          </div>
        </div>
      </div>

      {/* Solutions Cards List */}
      <div className="space-y-4">
        {recommendations.map((rec) => {
          const isExpanded = expandedId === rec.id;
          const tech = rec.technical_details || {};

          return (
            <div
              key={rec.id}
              className="bg-white border border-[#DFD9CD] rounded-3xl p-6 shadow-sm space-y-4 hover:border-[#9C381E]/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#9C381E]/10 text-[#9C381E]">
                    {rec.rec_code}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#716C5F]">
                    {rec.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    AUTONOMOUSLY COMMITTED IN BASELINE v2.0
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-[#1E232A] font-['Space_Grotesk']">
                {rec.title}
              </h3>

              {/* 4 Plain English Cards (Progressive Disclosure) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                
                <div className="p-4 bg-[#FAF8F5] border border-[#DFD9CD] rounded-2xl space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#9C381E] font-mono">
                    Simple Explanation (Plain English)
                  </div>
                  <p className="text-xs text-[#1E232A] leading-relaxed">
                    {rec.simple_explanation}
                  </p>
                </div>

                <div className="p-4 bg-[#FAF8F5] border border-[#DFD9CD] rounded-2xl space-y-1">
                  <div className="text-[10px] uppercase font-bold text-amber-700 font-mono">
                    Why It Matters (Business Risk)
                  </div>
                  <p className="text-xs text-[#1E232A] leading-relaxed">
                    {rec.why_it_matters}
                  </p>
                </div>

                <div className="p-4 bg-[#FAF8F5] border border-[#DFD9CD] rounded-2xl space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#2D5A43] font-mono">
                    Recommended Action
                  </div>
                  <p className="text-xs text-[#1E232A] leading-relaxed">
                    {rec.recommended_action}
                  </p>
                </div>

                <div className="p-4 bg-[#FAF8F5] border border-[#DFD9CD] rounded-2xl space-y-1">
                  <div className="text-[10px] uppercase font-bold text-emerald-700 font-mono">
                    Expected Outcome
                  </div>
                  <p className="text-xs text-[#1E232A] leading-relaxed">
                    {rec.expected_result}
                  </p>
                </div>

              </div>

              {/* Expandable Technical Details */}
              <div className="pt-2 border-t border-[#F2ECE1]">
                <button
                  onClick={() => toggleExpand(rec.id)}
                  className="text-xs text-[#9C381E] hover:text-[#7A2C17] font-bold flex items-center gap-1 font-mono transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <span>Hide Deep Architectural Specifications</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Expand Technical Details (Technologies, Patterns & Trade-offs)</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-3 p-5 bg-[#FAF8F5] border border-[#DFD9CD] rounded-2xl space-y-4 text-xs animate-fade-in">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#716C5F] font-mono">
                          Recommended Technologies:
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {(tech.technologies || []).map((t: string, idx: number) => (
                            <span key={idx} className="font-mono text-[11px] px-2 py-0.5 rounded bg-white border border-[#DFD9CD] font-bold text-[#1E232A]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#716C5F] font-mono">
                          Software Design Patterns:
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {(tech.patterns || []).map((p: string, idx: number) => (
                            <span key={idx} className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 font-bold text-emerald-800">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#DFD9CD]">
                      <div>
                        <strong className="text-[#1E232A]">Implementation Complexity:</strong>{' '}
                        <span className="text-[#5C574C]">{tech.complexity}</span>
                      </div>
                      <div>
                        <strong className="text-[#1E232A]">Architecture Trade-offs:</strong>{' '}
                        <span className="text-[#5C574C]">{tech.trade_offs}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#DFD9CD] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#716C5F]">
                      <div>
                        <strong className="text-[#1E232A]">Affected Components:</strong>{' '}
                        {(rec.affected_components || []).join(', ')}
                      </div>
                      <div>
                        <strong className="text-[#1E232A]">Linked Requirements:</strong>{' '}
                        {(rec.affected_requirements || []).join(', ')}
                      </div>
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
