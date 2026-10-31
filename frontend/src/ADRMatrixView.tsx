import React, { useState } from 'react';
import { 
  FileText, Shield, Database, Cpu, Layers, CheckCircle2, 
  XCircle, RotateCcw, Filter, ExternalLink, ArrowRight, AlertCircle
} from 'lucide-react';
import { ModalPortal } from './PortalPrimitives';

interface ADRProps {
  adrs: any[];
  authToken: string | null;
  onStatusChange: () => void;
  showToast: (msg: string) => void;
}

export function ADRMatrixView({ adrs, authToken, onStatusChange, showToast }: ADRProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeAdr, setActiveAdr] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const categories = ['ALL', 'Frontend', 'Backend', 'Database', 'Cache', 'Auth', 'API Gateway', 'Message Queue', 'Payment Gateway', 'Cloud & Containers', 'Observability'];
  const statuses = ['ALL', 'ACCEPTED', 'PROPOSED', 'REJECTED'];

  const filteredAdrs = adrs.filter(adr => {
    const matchCat = selectedCategory === 'ALL' || (adr.category && adr.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    const matchStat = selectedStatus === 'ALL' || adr.status === selectedStatus;
    return matchCat && matchStat;
  });

  const handleUpdateStatus = async (adrId: number, newStatus: string) => {
    if (!authToken) return;
    setUpdatingId(adrId);
    try {
      const res = await fetch(`/api/v1/adrs/${adrId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Status update failed');
      showToast(`ADR status changed to ${newStatus}`);
      onStatusChange();
      if (activeAdr && activeAdr.id === adrId) {
        setActiveAdr({ ...activeAdr, status: newStatus });
      }
    } catch (e) {
      showToast('Error updating ADR status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="bg-white border border-[#DFD9CD] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#9C381E]" />
            <span className="text-xs font-bold text-[#1E232A] uppercase tracking-wider font-['Space_Grotesk']">
              Filter by Technology Category:
            </span>
          </div>

          {/* Status quick toggle */}
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#DFD9CD]">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  selectedStatus === s 
                    ? 'bg-[#1E232A] text-white shadow-xs' 
                    : 'text-[#716C5F] hover:text-[#1E232A]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Categories scrollable pill list */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === c
                  ? 'bg-[#9C381E] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#5C574C] hover:bg-[#EAE4D7] border border-[#DFD9CD]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ADR Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAdrs.map(adr => (
          <div 
            key={adr.id} 
            className="p-5 bg-white border border-[#DFD9CD] rounded-2xl shadow-sm space-y-3 flex flex-col justify-between hover:border-[#9C381E]/40 transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#9C381E] bg-[#9C381E]/10 px-2 py-0.5 rounded">
                    {adr.adr_code}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    {adr.category || 'Architecture'}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  adr.status === 'ACCEPTED' ? 'bg-[#2D5A43]/10 text-[#2D5A43]' :
                  adr.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {adr.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-[#1E232A] mt-2 font-['Space_Grotesk']">
                {adr.title}
              </h3>

              <div className="text-xs text-[#5C574C] mt-2 space-y-1">
                <div>
                  <span className="font-bold text-[#1E232A]">Decision: </span>
                  {adr.decision}
                </div>
                <div>
                  <span className="font-bold text-[#1E232A]">Context: </span>
                  <span className="line-clamp-2">{adr.context}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#F2ECE1] space-y-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveAdr(adr)}
                  className="text-xs font-bold text-[#9C381E] hover:text-[#802D18] flex items-center gap-1"
                >
                  View Trade-Off Matrix & Alternatives <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Action buttons to Accept / Reject / Revise */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  disabled={updatingId === adr.id || adr.status === 'ACCEPTED'}
                  onClick={() => handleUpdateStatus(adr.id, 'ACCEPTED')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                    adr.status === 'ACCEPTED' 
                      ? 'bg-[#2D5A43]/15 text-[#2D5A43] cursor-default' 
                      : 'bg-white hover:bg-[#EAF2ED] border border-[#2D5A43]/30 text-[#2D5A43]'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {adr.status === 'ACCEPTED' ? 'Accepted' : 'Accept'}
                </button>
                <button
                  disabled={updatingId === adr.id || adr.status === 'REJECTED'}
                  onClick={() => handleUpdateStatus(adr.id, 'REJECTED')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                    adr.status === 'REJECTED'
                      ? 'bg-red-100 text-red-700 cursor-default'
                      : 'bg-white hover:bg-red-50 border border-red-200 text-red-600'
                  }`}
                >
                  <XCircle className="w-3 h-3" />
                  {adr.status === 'REJECTED' ? 'Rejected' : 'Reject'}
                </button>
                <button
                  disabled={updatingId === adr.id || adr.status === 'REVISED'}
                  onClick={() => handleUpdateStatus(adr.id, 'REVISED')}
                  className="py-1.5 px-3 rounded-xl text-[11px] font-bold bg-[#FAF8F5] hover:bg-gray-100 border border-[#DFD9CD] text-[#5C574C] flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Revise
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trade-off Matrix Comparison Modal via ModalPortal */}
      <ModalPortal
        isOpen={!!activeAdr}
        onClose={() => setActiveAdr(null)}
        maxWidth="max-w-2xl"
      >
        {activeAdr && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#9C381E]/10 text-[#9C381E]">
                  ADR Decision & Trade-Off Matrix
                </span>
                <h3 className="text-lg font-bold text-[#1E232A] mt-1 font-['Space_Grotesk']">
                  {activeAdr.adr_code}: {activeAdr.title}
                </h3>
                <div className="text-xs text-[#5C574C] font-semibold mt-0.5">
                  Category: <span className="text-[#9C381E]">{activeAdr.category}</span> | Recommended: <span className="font-bold text-[#2D5A43]">{activeAdr.recommended_tech || activeAdr.decision}</span>
                </div>
              </div>
              <button 
                onClick={() => setActiveAdr(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Context & Decision */}
            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#DFD9CD] text-xs space-y-1.5">
              <div><span className="font-bold text-[#1E232A]">Context:</span> {activeAdr.context}</div>
              <div><span className="font-bold text-[#1E232A]">Chosen Strategy:</span> {activeAdr.decision}</div>
              <div><span className="font-bold text-[#1E232A]">Consequences:</span> {activeAdr.consequences}</div>
            </div>

            {/* 7-Point Comparison Criteria Matrix */}
            {activeAdr.comparison_criteria && (
              <div>
                <h4 className="text-xs font-bold text-[#1E232A] uppercase tracking-wider mb-2 font-['Space_Grotesk']">
                  Multi-Dimensional Trade-Off Matrix
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {Object.entries(activeAdr.comparison_criteria).map(([metric, score]: any) => (
                    <div key={metric} className="p-2.5 bg-white border border-[#DFD9CD] rounded-xl">
                      <div className="text-[10px] uppercase font-bold text-[#716C5F] capitalize">
                        {metric.replace('_', ' ')}
                      </div>
                      <div className="text-xs font-bold text-[#1E232A] mt-0.5">{score}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evaluated Alternatives */}
            {activeAdr.alternatives && activeAdr.alternatives.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-[#1E232A] uppercase tracking-wider mb-2 font-['Space_Grotesk']">
                  Evaluated Industry Alternatives
                </h4>
                <div className="space-y-2">
                  {activeAdr.alternatives.map((alt: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl border border-[#DFD9CD] bg-[#FAF8F5] text-xs space-y-1">
                      <div className="font-bold text-[#9C381E] flex items-center justify-between">
                        <span>Alternative {idx + 1}: {alt.option}</span>
                      </div>
                      <div className="text-gray-700"><span className="font-bold text-emerald-700">Pros:</span> {alt.pros}</div>
                      <div className="text-gray-700"><span className="font-bold text-red-700">Cons:</span> {alt.cons}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={() => setActiveAdr(null)}
              className="w-full py-2.5 bg-[#1E232A] hover:bg-[#2F3642] text-white rounded-xl text-xs font-bold transition-all"
            >
              Close Trade-Off Matrix
            </button>
          </div>
        )}
      </ModalPortal>
    </div>
  );
}
