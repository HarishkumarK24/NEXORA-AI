import React, { useState, useRef } from 'react';
import { 
  Sparkles, UploadCloud, FileText, ArrowRight, Zap, CheckCircle2, 
  Layers, Cpu, Shield, RefreshCw, Clock, ArrowUpRight, Check, AlertTriangle
} from 'lucide-react';

interface LandingHomePageProps {
  onStartAnalysis: (projectName: string, projectDesc: string, reqText: string, files: File[]) => Promise<void>;
  recentProjects: any[];
  onSelectProject: (projectId: number) => void;
  isAnalyzing: boolean;
}

export const LandingHomePage: React.FC<LandingHomePageProps> = ({
  onStartAnalysis,
  recentProjects,
  onSelectProject,
  isAnalyzing
}) => {
  const [projectName, setProjectName] = useState('OmniCommerce Enterprise Platform');
  const [projectDesc, setProjectDesc] = useState('Multi-vendor e-commerce platform with real-time checkout, international payments, and order tracking.');
  const [inputMode, setInputMode] = useState<'text' | 'upload'>('text');
  const [requirementsText, setRequirementsText] = useState(
`- Customers should be able to browse product catalogs, view details, and add items to cart.
- Customers can proceed to checkout, pay online via Stripe, and receive instant confirmation notifications.
- The system must track order fulfillment status live with two-day delivery tracking.
- The application backend must reliably sustain 10,000 concurrent active users during promotions.
- The system must prevent inventory overselling and protect customer personal information.`
  );
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (idx: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const loadEcommercePreset = () => {
    setProjectName('OmniCommerce NextGen Platform');
    setProjectDesc('TCS AI Engineering Hackathon – Autonomous E-Commerce Architecture');
    setRequirementsText(
`- Customers should be able to browse catalogs and purchase products online easily.
- The company expects rapid international expansion to overseas customer markets in Phase 2.
- The shopping experience must be intuitive, fast, and feature-rich.
- The application backend must reliably sustain 10,000 concurrent users during peak promotion hours.
- The backend should be maintainable, scalable, and run on a single low-capacity server during initial testing.
- The core API must provide robust error recovery and automated retry queues.
- All payment transactions must be strictly protected with zero raw card numbers stored.
- Customer personal identifiable information (PII) must be encrypted at rest and in transit.
- Orders should be delivered within two days of purchase confirmation.
- Customers should be able to track orders live on an interactive status map.`
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    onStartAnalysis(projectName, projectDesc, requirementsText, uploadedFiles);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F8F5EE] py-10 px-6 sm:px-10 max-w-6xl mx-auto space-y-12">
      
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#9C381E]/10 border border-[#9C381E]/20 text-[#9C381E] text-xs font-bold font-mono tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          FULLY AUTONOMOUS AI SOFTWARE ARCHITECT
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1E232A] font-['Space_Grotesk'] tracking-tight leading-tight">
          Turn Your Requirements Into a Complete Software Architecture.
        </h1>

        <p className="text-sm sm:text-base text-[#5C574C] leading-relaxed max-w-2xl mx-auto font-medium">
          Upload your requirements. NEXORA AI automatically discovers gaps, solves design problems, and builds a validated software architecture.
        </p>
      </div>

      {/* Main Analysis Input Card */}
      <div className="bg-white border border-[#DFD9CD] rounded-3xl p-6 sm:p-10 shadow-lg shadow-[#1E232A]/5 relative overflow-hidden">
        {/* Subtle background gradient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#E06D3B]/5 rounded-full blur-3xl pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          {/* Project Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1E232A] uppercase tracking-wider font-mono">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. OmniCommerce Global Platform"
                required
                className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DFD9CD] rounded-2xl text-xs font-semibold text-[#1E232A] focus:outline-none focus:border-[#9C381E] focus:ring-1 focus:ring-[#9C381E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1E232A] uppercase tracking-wider font-mono">
                Short Project Description
              </label>
              <input
                type="text"
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                placeholder="e.g. Real-time shopping, catalog search, international payments"
                className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DFD9CD] rounded-2xl text-xs font-semibold text-[#1E232A] focus:outline-none focus:border-[#9C381E] focus:ring-1 focus:ring-[#9C381E]"
              />
            </div>
          </div>

          {/* Mode Tabs & Presets */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#F2ECE1]">
            <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#DFD9CD]">
              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  inputMode === 'text'
                    ? 'bg-white text-[#9C381E] shadow-sm border border-[#DFD9CD]'
                    : 'text-[#716C5F] hover:text-[#1E232A]'
                }`}
              >
                Direct Requirements Input
              </button>
              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  inputMode === 'upload'
                    ? 'bg-white text-[#9C381E] shadow-sm border border-[#DFD9CD]'
                    : 'text-[#716C5F] hover:text-[#1E232A]'
                }`}
              >
                Upload Documents {uploadedFiles.length > 0 && `(${uploadedFiles.length})`}
              </button>
            </div>

            <button
              type="button"
              onClick={loadEcommercePreset}
              className="text-xs text-[#9C381E] hover:text-[#7A2C17] font-bold flex items-center gap-1.5 self-start sm:self-auto bg-[#9C381E]/5 hover:bg-[#9C381E]/10 px-3 py-1.5 rounded-xl border border-[#9C381E]/20 transition-all font-mono"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load E-Commerce Hackathon Test Scenario
            </button>
          </div>

          {/* Text Input Area */}
          {inputMode === 'text' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#5C574C] flex items-center justify-between">
                <span>Enter or paste your software requirements, user stories, and constraints:</span>
                <span className="text-[11px] font-mono text-[#716C5F]">Autonomous 9-Stage Pipeline</span>
              </label>
              <textarea
                rows={7}
                value={requirementsText}
                onChange={(e) => setRequirementsText(e.target.value)}
                placeholder="Describe what users should be able to do, performance bounds, integrations, and security rules..."
                className="w-full p-4 bg-[#FAF8F5] border border-[#DFD9CD] rounded-2xl text-xs font-mono text-[#1E232A] focus:outline-none focus:border-[#9C381E] focus:ring-1 focus:ring-[#9C381E] leading-relaxed resize-none"
              />
            </div>
          )}

          {/* File Upload Area */}
          {inputMode === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.txt,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#DFD9CD] hover:border-[#9C381E] rounded-3xl p-8 text-center cursor-pointer bg-[#FAF8F5] hover:bg-[#FAF8F5]/80 transition-all"
              >
                <UploadCloud className="w-10 h-10 mx-auto text-[#9C381E] mb-3 animate-pulse" />
                <h4 className="text-sm font-bold text-[#1E232A]">
                  Click to Browse or Drag Stakeholder Files Here
                </h4>
                <p className="text-xs text-[#716C5F] mt-1">
                  Supported formats: PDF (.pdf), Word (.docx), Plain Text (.txt), CSV (.csv)
                </p>
                <span className="inline-block mt-3 px-3 py-1 bg-white border border-[#DFD9CD] rounded-xl text-[11px] font-bold text-[#5C574C]">
                  Multi-file upload enabled
                </span>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#1E232A] uppercase tracking-wider font-mono">
                    Ready for Ingestion ({uploadedFiles.length} files):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {uploadedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-[#FAF8F5] border border-[#DFD9CD] rounded-2xl text-xs"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="w-4 h-4 text-[#9C381E] shrink-0" />
                          <span className="font-semibold text-[#1E232A] truncate">{file.name}</span>
                          <span className="text-[10px] text-[#716C5F] font-mono shrink-0">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-[#9C381E] hover:text-red-700 font-bold px-2 py-0.5 rounded text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Autonomous Execution Highlights & Action Button */}
          <div className="pt-4 border-t border-[#F2ECE1] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#5C574C]">
              <span className="flex items-center gap-1.5 font-semibold text-[#2D5A43]">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A43]" /> Zero Manual Interruptions
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-semibold text-[#2D5A43]">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A43]" /> Auto-Resolves Gaps
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-semibold text-[#2D5A43]">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A43]" /> Regenerates Architecture & ADRs
              </span>
            </div>

            <button
              type="submit"
              disabled={isAnalyzing || (!requirementsText.trim() && uploadedFiles.length === 0)}
              className="w-full md:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#9C381E] to-[#E06D3B] hover:from-[#822E18] hover:to-[#C85929] text-white font-extrabold text-sm shadow-xl shadow-[#9C381E]/25 flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none font-['Space_Grotesk'] tracking-wide"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing Autonomous Pipeline...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Start Autonomous Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Autonomous Pipeline Stages Preview */}
      <div className="bg-[#FAF8F5] border border-[#E3DAC9] rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#1E232A] uppercase tracking-wider font-['Space_Grotesk']">
            Autonomous Software Architecture Execution Pipeline
          </h3>
          <span className="text-[11px] font-mono text-[#716C5F]">End-to-End Autonomous Agent</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { step: '1 & 2', title: 'Document & 9-Class Classification', desc: 'Ingests documents, classifies 9 requirement types' },
            { step: '3 & 4', title: 'Gap Detection & Dependency Graph', desc: 'Detects missing webhooks, locks, PII risks & graph dependencies' },
            { step: '5', title: 'Solution Synthesis', desc: 'Generates structured fixes with before & after impact scenarios' },
            { step: '6 & 7', title: 'Auto-Resolution & Architecture', desc: 'Incorporates verified specs into baseline & regenerates architecture' },
            { step: '8 & 9', title: 'ADR Matrix & Revalidation', desc: 'Formulates ADR records & executes 7-point validation audit' }
          ].map((s, idx) => (
            <div key={idx} className="p-4 bg-white border border-[#DFD9CD] rounded-2xl shadow-xs space-y-1">
              <div className="text-[10px] font-bold font-mono text-[#9C381E] uppercase">
                Stage {s.step}
              </div>
              <div className="text-xs font-bold text-[#1E232A]">
                {s.title}
              </div>
              <div className="text-[11px] text-[#716C5F] leading-tight">
                {s.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Projects & Analysis History */}
      {recentProjects && recentProjects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#9C381E]" />
              <h3 className="text-sm font-bold text-[#1E232A] uppercase tracking-wider font-['Space_Grotesk']">
                Recent Projects & Analysis History
              </h3>
            </div>
            <span className="text-xs text-[#716C5F] font-mono">{recentProjects.length} projects analyzed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                className="bg-white border border-[#DFD9CD] hover:border-[#9C381E] p-5 rounded-2xl shadow-xs hover:shadow-md cursor-pointer transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-[#9C381E] bg-[#9C381E]/10 px-2 py-0.5 rounded">
                    {p.project_code}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-[#2D5A43] bg-[#2D5A43]/10 px-2 py-0.5 rounded-full">
                    Readiness {p.readiness_score}%
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#1E232A] group-hover:text-[#9C381E] transition-colors truncate">
                    {p.title}
                  </h4>
                  <p className="text-xs text-[#5C574C] line-clamp-2 mt-1">
                    {p.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#F2ECE1] flex items-center justify-between text-[11px] text-[#716C5F]">
                  <span>Baseline v{p.version}.0</span>
                  <span className="flex items-center gap-1 font-bold text-[#9C381E] group-hover:translate-x-0.5 transition-transform">
                    Explore Architecture <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
