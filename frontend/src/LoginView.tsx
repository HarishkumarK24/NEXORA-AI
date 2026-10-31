import React, { useState } from 'react';
import { 
  Shield, Cpu, ArrowRight, Eye, EyeOff, CheckCircle2, 
  Lock, Sparkles, User, Key, Layers, FileText, Award
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: any, token: string) => void;
  showToast: (msg: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, showToast }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Nexora@Admin2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('Please enter both your administrator username and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Authentication failed. Please verify administrator credentials.');
      }

      const data = await res.json();
      showToast(`Welcome back, Administrator! Signed in to NEXORA AI.`);
      onLoginSuccess(data.user, data.access_token);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect to authentication service.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoCreds = () => {
    setUsername('admin');
    setPassword('Nexora@Admin2026');
    setErrorMsg(null);
    showToast('Loaded demo Administrator credentials (admin / Nexora@Admin2026)');
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#1E232A] flex flex-col justify-between selection:bg-[#E06D3B]/20 selection:text-[#E06D3B]">
      {/* Top Header */}
      <header className="px-8 py-5 border-b border-[#E3DAC9] bg-[#FAF8F5]/90 backdrop-blur flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9C381E] to-[#E06D3B] flex items-center justify-center text-white shadow-md shadow-[#E06D3B]/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-[#1E232A] font-['Space_Grotesk']">NEXORA AI</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#2D5A43]/10 text-[#2D5A43] border border-[#2D5A43]/20">
                TCS AI Hackathon
              </span>
            </div>
            <p className="text-xs text-[#716C5F]">AI-Powered Requirements Intelligence & Software Architecture Engineering Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-[#716C5F] font-mono flex items-center gap-2 px-3 py-1.5 bg-[#FAF8F5] border border-[#DFD9CD] rounded-full shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#2D5A43] animate-pulse"></span>
            <span>Security Gateway: SECURE</span>
          </div>
        </div>
      </header>

      {/* Main Single Login Section */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 flex flex-col lg:flex-row items-center justify-center gap-10">
        {/* Left Side: System Information & Capabilities */}
        <div className="lg:w-1/2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-[#9C381E]/10 text-[#9C381E] border border-[#9C381E]/20">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold text-[#1E232A] tracking-tight font-['Space_Grotesk'] leading-tight">
            Autonomous Enterprise Requirements & Architecture Platform
          </h1>

          <p className="text-sm text-[#5C574C] leading-relaxed">
            Consolidating multi-stakeholder specifications, extracting structured user stories, detecting conflicting constraints, and autonomously synthesizing complete enterprise software architectures.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/80 border border-[#DFD9CD]">
              <div className="w-8 h-8 rounded-lg bg-[#2D5A43]/10 text-[#2D5A43] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1E232A]">Unified Administrative Access</h4>
                <p className="text-[11px] text-[#716C5F] mt-0.5">
                  Full command over all 8 modules: Stakeholder Ingestion, Requirement Extraction, Gap/Conflict Matrix, Clarifications, Architecture Flowcharts, ADRs, and Failure Stress Labs.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/80 border border-[#DFD9CD]">
              <div className="w-8 h-8 rounded-lg bg-[#9C381E]/10 text-[#9C381E] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1E232A]">Autonomous 8-Agent Architecture Pipeline</h4>
                <p className="text-[11px] text-[#716C5F] mt-0.5">
                  Powered by ParserAgent, SpecExtractor, ConsistencyAuditor, ClarificationAgent, SystemArchitect, ADRWriter, StressAgent, and ComplianceAuditor.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-[#5C574C] flex items-center justify-between">
            <div>
              <span className="font-bold text-[#9C381E]">Demo Admin Credentials:</span>
              <span className="font-mono ml-2 text-[#1E232A]">admin / Nexora@Admin2026</span>
            </div>
            <button
              onClick={handleFillDemoCreds}
              type="button"
              className="text-[11px] font-bold text-[#9C381E] hover:underline"
            >
              Fill Credentials
            </button>
          </div>
        </div>

        {/* Right Side: Administrator Login Card */}
        <div className="lg:w-1/2 w-full max-w-md">
          <div className="bg-white border border-[#DFD9CD] rounded-3xl p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#9C381E] to-[#E06D3B] flex items-center justify-center text-white mx-auto shadow-md shadow-[#9C381E]/20 mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-[#1E232A] font-['Space_Grotesk']">
                Administrator Sign In
              </h2>
              <p className="text-xs text-[#716C5F] mt-1">
                Enter your authorized administrator credentials
              </p>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
                <span className="font-bold">Error:</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4A453A] mb-1.5">
                  Username or Work Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#716C5F]">
                    <User className="w-4 h-4" />
                  </div>
                  <input 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#DFD9CD] rounded-xl text-xs font-medium text-[#1E232A] focus:outline-none focus:border-[#E06D3B]"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#4A453A]">Password</label>
                  <button
                    type="button"
                    onClick={() => setPassword('Nexora@Admin2026')}
                    className="text-[11px] text-[#9C381E] hover:underline font-mono"
                  >
                    Paste Demo Password
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#716C5F]">
                    <Key className="w-4 h-4" />
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#FAF8F5] border border-[#DFD9CD] rounded-xl text-xs font-medium text-[#1E232A] focus:outline-none focus:border-[#E06D3B]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#716C5F] hover:text-[#1E232A]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#5C574C]">
                  <input 
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#DFD9CD] text-[#E06D3B] focus:ring-[#E06D3B]"
                  />
                  <span>Remember administrator session</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-[#9C381E] hover:bg-[#802D18] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {loading ? 'Authenticating...' : (
                  <>
                    <span>Authenticate & Access Platform</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#F2ECE1] text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-[#2D5A43] font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>Enterprise Grade • Role: Administrator</span>
              </div>
              <p className="text-[11px] text-[#716C5F] mt-1">
                Protected by Salted Hash Encryption & JWT Bearer Tokens
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-4 border-t border-[#E3DAC9] bg-[#FAF8F5] text-center text-xs text-[#716C5F] flex flex-col md:flex-row items-center justify-between">
        <div>NEXORA AI • Autonomous Requirements Intelligence & Architecture Engineering</div>
        <div className="text-[11px] font-mono mt-1 md:mt-0">
          TCS AI Engineering Hackathon • Enterprise Administrator Console
        </div>
      </footer>
    </div>
  );
};
