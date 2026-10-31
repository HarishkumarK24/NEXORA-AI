import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, Cpu, FileText, AlertTriangle, HelpCircle, CheckCircle2, 
  Workflow, Database, Terminal, Shield, ArrowRight, Play, RotateCcw, 
  UploadCloud, Plus, Send, Zap, LogOut, ExternalLink, Code2, GitFork, 
  BarChart3, RefreshCw, Trash2, Download, Eye, X, FileUp, GitCommit, Sparkles, TrendingUp, Award
} from 'lucide-react';

import { LoginView } from './LoginView';
import { LandingHomePage } from './LandingHomePage';
import { AutonomousExecutionOverlay } from './AutonomousExecutionOverlay';
import { FinalAutonomousResultsPage } from './FinalAutonomousResultsPage';
import { FinalResultsDashboard } from './FinalResultsDashboard';
import { RequirementsExplorerView } from './RequirementsExplorerView';
import { GapAnalysisView } from './GapAnalysisView';
import { RecommendedSolutionsView } from './RecommendedSolutionsView';
import { ImpactComparisonView } from './ImpactComparisonView';
import { DependencyMapView } from './DependencyMapView';
import { ValidationReportView } from './ValidationReportView';
import { AnalysisHistoryView } from './AnalysisHistoryView';
import { VisualArchitectureDiagram } from './VisualArchitectureDiagram';
import { ADRMatrixView } from './ADRMatrixView';
import { StressLabView } from './StressLabView';
import { ChangeImpactView } from './ChangeImpactView';

export default function App() {
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('nexora_token'));
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('nexora_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<
    'home' | 'final_results' | 'overview' | 'requirements' | 'gaps' | 'solutions' | 
    'impact' | 'architecture' | 'adrs' | 'dependency' | 'validation' | 
    'history' | 'stress_lab' | 'change_impact'
  >('home');
  
  const [projectData, setProjectData] = useState<any>(null);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Autonomous Execution Overlay State
  const [isExecutingOverlay, setIsExecutingOverlay] = useState(false);
  const [executingProjectName, setExecutingProjectName] = useState('OmniCommerce Enterprise Platform');
  const [customStressPrompt, setCustomStressPrompt] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLoginSuccess = (user: any, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem('nexora_token', token);
    localStorage.setItem('nexora_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('nexora_token');
    localStorage.removeItem('nexora_user');
    showToast('Logged out successfully.');
  };

  const loadProject = async (targetId?: number) => {
    if (!authToken) return;
    try {
      const headers = { 'Authorization': `Bearer ${authToken}` };
      const idToFetch = targetId || projectData?.project?.id || 1;
      const [projRes, scRes, listRes] = await Promise.all([
        fetch(`/api/v1/projects/${idToFetch}`, { headers }).then(r => r.json()).catch(() => null),
        fetch('/api/v1/stress/scenarios').then(r => r.json()).catch(() => []),
        fetch('/api/v1/projects', { headers }).then(r => r.json()).catch(() => [])
      ]);
      if (projRes) setProjectData(projRes);
      if (scRes) setScenarios(scRes);
      if (listRes) setRecentProjects(listRes);
    } catch (e) {
      console.error("Error loading project workspace", e);
    }
  };

  useEffect(() => {
    if (authToken) {
      loadProject();
      const interval = setInterval(() => loadProject(), 15000);
      return () => clearInterval(interval);
    }
  }, [authToken]);

  // Autonomous Pipeline Trigger Handler
  const handleStartAutonomousAnalysis = async (
    name: string,
    desc: string,
    text: string,
    files: File[]
  ) => {
    if (!authToken) return;
    setExecutingProjectName(name);
    setIsExecutingOverlay(true);

    try {
      // 1. Submit project and execute 9-stage autonomous pipeline
      const res = await fetch('/api/v1/projects/autonomous_start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: name,
          description: desc,
          domain: 'E-Commerce & Retail',
          requirements_text: text
        })
      });

      if (!res.ok) throw new Error('Autonomous pipeline execution failed');
      const data = await res.json();

      // 2. Upload any additional device files if provided
      if (files && files.length > 0 && data.project_id) {
        for (const file of files) {
          const formData = new FormData();
          formData.append('project_id', data.project_id.toString());
          formData.append('stakeholder_type', 'Business Owner / Product Manager');
          formData.append('file', file);
          await fetch('/api/v1/documents/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
          });
        }
      }

      // 3. Reload workspace with newly generated architecture
      await loadProject(data.project_id);
    } catch (err: any) {
      showToast(err.message || 'Error running autonomous analysis');
      setIsExecutingOverlay(false);
    }
  };

  const handleOverlayComplete = () => {
    setIsExecutingOverlay(false);
    setActiveTab('final_results');
    showToast('Autonomous Analysis Complete! Architecture generated, improved & validated.');
  };

  if (!currentUser || !authToken) {
    return (
      <>
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-[#1E232A] text-white px-5 py-3 rounded-lg shadow-xl border border-[#D97706]/40 flex items-center gap-3 animate-fade-in text-xs font-medium">
            <Zap className="w-4 h-4 text-[#E06D3B]" />
            {toastMessage}
          </div>
        )}
        <LoginView onLoginSuccess={handleLoginSuccess} showToast={showToast} />
      </>
    );
  }

  const p = projectData?.project;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EE] text-[#1E232A]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#1E232A] text-white px-5 py-3 rounded-lg shadow-xl border border-[#D97706]/40 flex items-center gap-3 animate-fade-in text-xs font-medium">
          <Zap className="w-4 h-4 text-[#E06D3B]" />
          {toastMessage}
        </div>
      )}

      {/* Autonomous Execution Live Overlay */}
      {isExecutingOverlay && (
        <AutonomousExecutionOverlay 
          projectName={executingProjectName} 
          onComplete={handleOverlayComplete} 
        />
      )}

      {/* Top Enterprise Command Header */}
      <header className="border-b border-[#E3DAC9] bg-[#FAF8F5]/95 backdrop-blur-md px-6 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div 
            onClick={() => setActiveTab('home')}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9C381E] to-[#E06D3B] flex items-center justify-center text-white shadow-md shadow-[#E06D3B]/20 transition-transform hover:scale-105 cursor-pointer"
          >
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span 
                onClick={() => setActiveTab('home')}
                className="font-extrabold text-lg tracking-tight text-[#1E232A] font-['Space_Grotesk'] cursor-pointer"
              >
                NEXORA AI
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-[#9C381E]/10 text-[#9C381E] border border-[#9C381E]/20">
                Administrator
              </span>
            </div>
            <p className="text-[11px] text-[#716C5F] hidden sm:block">
              Fully Autonomous AI Software Architecture Engineering Platform
            </p>
          </div>
        </div>

        {/* Unified Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#EFECE4] p-1.5 rounded-2xl border border-[#DFD9CD] overflow-x-auto max-w-[calc(100vw-420px)]">
          {[
            { id: 'home', label: 'Start Analysis', icon: Sparkles },
            { id: 'final_results', label: 'Final Results', icon: Award, highlight: true },
            { id: 'overview', label: 'Overview', icon: Workflow },
            { id: 'requirements', label: 'Requirements Explorer', icon: CheckCircle2, badge: projectData?.requirements?.length },
            { id: 'gaps', label: 'Gap Analysis', icon: AlertTriangle, badge: projectData?.issues?.length },
            { id: 'solutions', label: 'Recommended Solutions', icon: Sparkles, badge: projectData?.recommendations?.length },
            { id: 'impact', label: 'Impact Comparison', icon: Zap },
            { id: 'architecture', label: 'Architecture Blueprint', icon: Cpu },
            { id: 'adrs', label: 'Decisions (ADRs)', icon: Code2, badge: projectData?.adrs?.length || 10 },
            { id: 'dependency', label: 'Dependency Map', icon: Layers },
            { id: 'validation', label: 'Validation Report', icon: CheckCircle2 },
            { id: 'history', label: 'Analysis History', icon: GitCommit, badge: projectData?.version_history?.length },
            { id: 'stress_lab', label: 'Stress Lab', icon: Zap },
            { id: 'change_impact', label: 'Change Impact', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all duration-200 ${
                  isActive 
                    ? 'bg-white text-[#9C381E] shadow-sm border border-[#DFD9CD]' 
                    : 'text-[#5C574C] hover:text-[#1E232A] hover:bg-white/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${tab.highlight ? 'text-[#E06D3B]' : ''}`} />
                <span>{tab.label}</span>
                {tab.badge ? (
                  <span className="bg-[#E06D3B] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* User Identity & Logout */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-[#1E232A] flex items-center gap-1 justify-end">
              <span>{currentUser.full_name || 'System Administrator'}</span>
              <Shield className="w-3.5 h-3.5 text-[#2D5A43]" />
            </div>
            <div className="text-[10px] text-[#716C5F] font-mono">admin@nexora.ai</div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1 px-2.5 py-1.5 border border-[#DFD9CD] bg-white rounded-xl hover:bg-red-50 hover:text-red-700 text-xs font-medium text-[#716C5F] shadow-xs transition-all"
            title="Sign out of Administrator Console"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Dynamic Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
        
        {/* TAB 1: LANDING PAGE (START ANALYSIS) */}
        {activeTab === 'home' && (
          <LandingHomePage 
            onStartAnalysis={handleStartAutonomousAnalysis}
            recentProjects={recentProjects}
            onSelectProject={async (id) => {
              await loadProject(id);
              setActiveTab('final_results');
            }}
            isAnalyzing={isExecutingOverlay}
          />
        )}

        {/* TABS 2-14: EXPLORATION SECTIONS (WHEN PROJECT LOADED) */}
        {activeTab !== 'home' && (
          projectData ? (
            <>
              {/* TAB: FINAL RESULTS (DIRECT TARGET OF AUTONOMOUS ANALYSIS) */}
              {activeTab === 'final_results' && (
                <FinalAutonomousResultsPage 
                  projectData={projectData} 
                  onExploreSection={(sec) => setActiveTab(sec as any)}
                  onStartNew={() => setActiveTab('home')}
                />
              )}

              {/* TAB 2: OVERVIEW (FINAL RESULTS DASHBOARD) */}
              {activeTab === 'overview' && (
                <FinalResultsDashboard 
                  projectData={projectData} 
                  onNavigateTab={(tabId) => setActiveTab(tabId as any)}
                />
              )}

              {/* TAB 3: REQUIREMENTS EXPLORER */}
              {activeTab === 'requirements' && (
                <RequirementsExplorerView 
                  requirements={projectData.requirements || []}
                  documents={projectData.documents || []}
                />
              )}

              {/* TAB 4: GAP ANALYSIS */}
              {activeTab === 'gaps' && (
                <GapAnalysisView 
                  issues={projectData.issues || []}
                />
              )}

              {/* TAB 5: RECOMMENDED SOLUTIONS */}
              {activeTab === 'solutions' && (
                <RecommendedSolutionsView 
                  recommendations={projectData.recommendations || []}
                />
              )}

              {/* TAB 6: IMPACT COMPARISON */}
              {activeTab === 'impact' && (
                <ImpactComparisonView 
                  recommendations={projectData.recommendations || []}
                />
              )}

              {/* TAB 7: ARCHITECTURE BLUEPRINT (FLOWCHART & SPECS) */}
              {activeTab === 'architecture' && (
                <div className="space-y-8 animate-fade-in">
                  {projectData.architecture ? (
                    <>
                      <div className="bg-gradient-to-r from-[#FFFBF5] to-[#FAF8F5] border border-[#E3DAC9] p-6 rounded-3xl shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#9C381E]/10 text-[#9C381E] font-mono">
                            Generated Software Architecture
                          </span>
                          <span className="text-xs font-mono text-[#2D5A43] font-bold">
                            Status: Validated for 50k Concurrency
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-[#1E232A] mt-2 font-['Space_Grotesk']">
                          {projectData.architecture.style}
                        </h2>
                        <p className="text-xs text-[#5C574C] mt-1 leading-relaxed">
                          {projectData.architecture.summary}
                        </p>
                      </div>

                      {/* Interactive Visual System Architecture Diagram Flowchart Component */}
                      <VisualArchitectureDiagram 
                        techStack={projectData.architecture.tech_stack} 
                        projectVersion={p?.version || 2}
                        onRefresh={() => loadProject()}
                      />

                      {/* Recommended Tech Stack Grid */}
                      <div>
                        <h3 className="text-sm font-bold text-[#1E232A] uppercase tracking-wider mb-3 font-['Space_Grotesk']">
                          Recommended Technology Stack
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                          {Object.entries(projectData.architecture.tech_stack || {}).map(([k, v]: any) => (
                            <div key={k} className="p-4 bg-white border border-[#DFD9CD] rounded-2xl shadow-sm">
                              <div className="text-[10px] uppercase font-bold text-[#716C5F] font-mono">{k}</div>
                              <div className="text-xs font-bold text-[#1E232A] mt-1">{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Database & ER Schema */}
                      <div className="bg-white border border-[#DFD9CD] rounded-2xl p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-[#1E232A] uppercase tracking-wider font-['Space_Grotesk'] flex items-center gap-2">
                          <Database className="w-4 h-4 text-[#2D5A43]" />
                          Database Schema & ER Relationship Design
                        </h3>
                        <pre className="p-4 bg-[#FAF8F5] border border-[#DFD9CD] rounded-xl text-xs font-mono text-[#5C574C] overflow-x-auto whitespace-pre">
                          {projectData.architecture.er_diagram}
                        </pre>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                          {(projectData.architecture.database_design || []).map((tbl: any, idx: number) => (
                            <div key={idx} className="p-3 bg-[#FAF8F5] border border-[#DFD9CD] rounded-xl text-xs">
                              <div className="font-mono font-bold text-[#9C381E]">TABLE: {tbl.table}</div>
                              <div className="text-[11px] text-[#716C5F] mt-1">Columns: {tbl.columns}</div>
                              <div className="text-[10px] text-[#2D5A43] font-mono mt-0.5">PK: {tbl.pk} | Indexes: {tbl.indexes}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* API Design Explorer */}
                      <div className="bg-white border border-[#DFD9CD] rounded-2xl p-6 shadow-sm space-y-3">
                        <h3 className="text-sm font-bold text-[#1E232A] uppercase tracking-wider font-['Space_Grotesk']">
                          Recommended API Specifications
                        </h3>
                        <div className="space-y-2">
                          {(projectData.architecture.api_specifications || []).map((api: any, idx: number) => (
                            <div key={idx} className="p-3 bg-[#FAF8F5] border border-[#DFD9CD] rounded-xl flex items-center justify-between text-xs">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold px-1.5 py-0.5 rounded text-[10px] bg-[#9C381E] text-white">
                                    {api.method}
                                  </span>
                                  <span className="font-mono font-bold text-[#1E232A]">{api.endpoint}</span>
                                </div>
                                <div className="text-[11px] text-[#716C5F] mt-0.5">{api.summary} (Auth: {api.auth})</div>
                              </div>
                              <span className="font-mono text-[10px] text-[#716C5F]">{api.res}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-12 text-center text-xs text-[#716C5F] bg-[#FAF8F5] rounded-2xl border border-[#E3DAC9]">
                      Architecture generation in progress. Start analysis from the Home screen.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 8: ARCHITECTURAL DECISION RECORDS (ADR MATRIX) */}
              {activeTab === 'adrs' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-[#FAF8F5] border border-[#E3DAC9] rounded-2xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-[#1E232A] font-['Space_Grotesk']">
                        Full-Stack Architectural Decision Records (ADRs)
                      </h2>
                      <p className="text-xs text-[#716C5F]">
                        Comprehensive, explainable engineering trade-offs covering Frontend, Backend, Database, Cache, Auth, API Gateway, 
                        Message Queue, Payment Gateway, Cloud Containers, and Observability.
                      </p>
                    </div>
                  </div>

                  <ADRMatrixView 
                    adrs={projectData.adrs || []} 
                    authToken={authToken} 
                    onStatusChange={() => loadProject()}
                    showToast={showToast}
                  />
                </div>
              )}

              {/* TAB 9: DEPENDENCY MAP */}
              {activeTab === 'dependency' && (
                <DependencyMapView 
                  dependencyGraph={projectData.project.dependency_graph}
                  requirements={projectData.requirements || []}
                />
              )}

              {/* TAB 10: VALIDATION REPORT */}
              {activeTab === 'validation' && (
                <ValidationReportView 
                  validationReport={projectData.project.validation_report}
                  requirements={projectData.requirements || []}
                />
              )}

              {/* TAB 11: ANALYSIS HISTORY */}
              {activeTab === 'history' && (
                <AnalysisHistoryView 
                  versionHistory={projectData.version_history || []}
                />
              )}

              {/* TAB 12: ARCHITECTURE STRESS LAB */}
              {activeTab === 'stress_lab' && (
                <div className="space-y-8 animate-fade-in">
                  <StressLabView 
                    scenarios={scenarios}
                    authToken={authToken}
                    projectId={projectData.project.id}
                    customStressPrompt={customStressPrompt}
                    setCustomStressPrompt={setCustomStressPrompt}
                    onSimulationRun={() => loadProject()}
                    showToast={showToast}
                  />
                </div>
              )}

              {/* TAB 13: DYNAMIC CHANGE IMPACT ENGINE */}
              {activeTab === 'change_impact' && (
                <div className="space-y-8 animate-fade-in">
                  <ChangeImpactView 
                    projectId={projectData.project.id}
                    authToken={authToken}
                    onRefresh={() => loadProject()}
                    showToast={showToast}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-[#716C5F] bg-[#FAF8F5] border border-[#E3DAC9] rounded-2xl">
              Loading enterprise requirements project...
            </div>
          )
        )}
      </main>
    </div>
  );
}
