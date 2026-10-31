import React, { useState } from 'react';
import { 
  Search, Filter, CheckCircle2, FileText, ArrowRight, Sparkles, Tag, Layers
} from 'lucide-react';

interface RequirementsExplorerViewProps {
  requirements: any[];
  documents: any[];
}

export const RequirementsExplorerView: React.FC<RequirementsExplorerViewProps> = ({
  requirements,
  documents
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<'ALL' | 'ORIGINAL' | 'ENHANCED'>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  const categories = [
    'ALL',
    'functional',
    'non_functional',
    'business',
    'technical_constraint',
    'security',
    'performance',
    'reliability',
    'compliance',
    'integration'
  ];

  const filtered = requirements.filter(r => {
    // Search filter
    const matchesSearch = !searchTerm || 
      r.original_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.req_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.stakeholder.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    const matchesCategory = selectedCategory === 'ALL' || r.req_type.toLowerCase() === selectedCategory.toLowerCase();

    // Type filter
    const matchesType = selectedType === 'ALL' || 
      (selectedType === 'ENHANCED' && r.is_enhanced) ||
      (selectedType === 'ORIGINAL' && !r.is_enhanced);

    // Priority filter
    const matchesPriority = selectedPriority === 'ALL' || r.priority.toLowerCase() === selectedPriority.toLowerCase();

    return matchesSearch && matchesCategory && matchesType && matchesPriority;
  });

  const enhancedCount = requirements.filter(r => r.is_enhanced).length;
  const originalCount = requirements.filter(r => !r.is_enhanced).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="bg-[#FAF8F5] border border-[#E3DAC9] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#9C381E]/10 text-[#9C381E] mb-2 font-mono">
            <Layers className="w-3.5 h-3.5" />
            <span>Requirements Intelligence Explorer • 9 Classifications</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#1E232A] font-['Space_Grotesk'] tracking-tight">
            Requirements Specification Explorer
          </h2>
          <p className="text-xs text-[#716C5F] mt-1 max-w-2xl leading-relaxed">
            Inspect all extracted stakeholder requirements alongside AI-enhanced specifications autonomously incorporated into the project baseline.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#716C5F]">Specifications</span>
            <div className="text-lg font-mono font-extrabold text-[#1E232A]">
              {requirements.length} Total
            </div>
          </div>
          <div className="h-8 w-[1px] bg-[#DFD9CD]" />
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#2D5A43]">AI Baseline Fixes</span>
            <div className="text-lg font-mono font-extrabold text-[#2D5A43]">
              +{enhancedCount}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Category Distribution Bar */}
      <div className="bg-white border border-[#DFD9CD] rounded-2xl p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-mono font-bold">
          <span className="text-[#1E232A]">Requirements Category Coverage</span>
          <span className="text-[#2D5A43]">9 Engineering Dimensions Active</span>
        </div>
        <div className="w-full h-3 bg-[#FAF8F5] rounded-full overflow-hidden flex border border-[#DFD9CD]">
          <div style={{ width: '35%' }} className="bg-[#9C381E] h-full" title="Functional (35%)" />
          <div style={{ width: '18%' }} className="bg-[#E06D3B] h-full" title="Security (18%)" />
          <div style={{ width: '15%' }} className="bg-[#2D5A43] h-full" title="Performance (15%)" />
          <div style={{ width: '12%' }} className="bg-blue-600 h-full" title="Reliability (12%)" />
          <div style={{ width: '10%' }} className="bg-purple-600 h-full" title="Compliance (10%)" />
          <div style={{ width: '10%' }} className="bg-amber-600 h-full" title="Integration (10%)" />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-[#716C5F] pt-1">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#9C381E]" /> Functional (35%)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#E06D3B]" /> Security (18%)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2D5A43]" /> Performance (15%)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600" /> Reliability (12%)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-600" /> Compliance (10%)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-600" /> Integration (10%)</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#DFD9CD] rounded-3xl p-5 shadow-sm space-y-4">
        
        {/* Search & Type filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#716C5F]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code, requirement text, or stakeholder..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#DFD9CD] rounded-xl text-xs font-medium text-[#1E232A] focus:outline-none focus:border-[#9C381E]"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#DFD9CD] shrink-0">
            <button
              onClick={() => setSelectedType('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedType === 'ALL'
                  ? 'bg-white text-[#9C381E] shadow-sm border border-[#DFD9CD]'
                  : 'text-[#716C5F] hover:text-[#1E232A]'
              }`}
            >
              All ({requirements.length})
            </button>
            <button
              onClick={() => setSelectedType('ORIGINAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedType === 'ORIGINAL'
                  ? 'bg-white text-[#9C381E] shadow-sm border border-[#DFD9CD]'
                  : 'text-[#716C5F] hover:text-[#1E232A]'
              }`}
            >
              Original ({originalCount})
            </button>
            <button
              onClick={() => setSelectedType('ENHANCED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedType === 'ENHANCED'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-[#2D5A43] hover:text-[#1E232A]'
              }`}
            >
              AI-Enhanced (+{enhancedCount})
            </button>
          </div>
        </div>

        {/* Categories Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-[#F2ECE1] pt-3">
          <span className="text-[11px] font-bold text-[#716C5F] uppercase font-mono shrink-0">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1 rounded-xl font-medium shrink-0 transition-all capitalize ${
                selectedCategory === cat
                  ? 'bg-[#1E232A] text-white font-bold'
                  : 'bg-[#FAF8F5] text-[#5C574C] hover:text-[#1E232A] border border-[#DFD9CD]'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#716C5F] px-1 font-mono">
          <span>Showing {filtered.length} of {requirements.length} specifications</span>
          <span>Baseline v2.0</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filtered.map((req) => (
            <div
              key={req.id || req.req_code}
              className={`p-5 rounded-2xl border transition-all space-y-2.5 ${
                req.is_enhanced 
                  ? 'bg-emerald-50/40 border-emerald-200/80 shadow-xs'
                  : 'bg-white border-[#DFD9CD] shadow-xs hover:border-[#9C381E]/40'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                    req.is_enhanced ? 'bg-emerald-100 text-emerald-800' : 'bg-[#9C381E]/10 text-[#9C381E]'
                  }`}>
                    {req.req_code}
                  </span>

                  {req.is_enhanced ? (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                      <Sparkles className="w-3 h-3" />
                      AI-ENHANCED (BASELINE v2.0)
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] font-semibold text-[#716C5F] bg-[#FAF8F5] border border-[#DFD9CD] px-2 py-0.5 rounded-full">
                      Original Stakeholder Requirement
                    </span>
                  )}

                  <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#DFD9CD] text-[#5C574C]">
                    {req.req_type}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase ${
                    req.priority === 'critical' ? 'bg-red-100 text-red-700' :
                    req.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {req.priority} Priority
                  </span>
                  <span className="text-[11px] text-[#716C5F] font-mono">
                    Status: <strong className="text-[#2D5A43]">{req.status}</strong>
                  </span>
                </div>
              </div>

              <div className="text-xs sm:text-sm font-semibold text-[#1E232A] leading-relaxed">
                {req.original_text}
              </div>

              <div className="pt-2 border-t border-[#F2ECE1] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#716C5F]">
                <div>
                  <strong className="text-[#1E232A]">Source:</strong> {req.source || 'Direct Stakeholder Specification'}
                </div>
                <div>
                  <strong className="text-[#1E232A]">Stakeholder:</strong> {req.stakeholder}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
