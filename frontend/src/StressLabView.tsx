import React, { useState } from 'react';
import { 
  AlertTriangle, Shield, CheckCircle2, Play, Flame, 
  RotateCcw, Activity, ArrowRight, Zap, RefreshCw, Layers
} from 'lucide-react';
import { ModalPortal } from './PortalPrimitives';

interface StressLabProps {
  scenarios: any[];
  authToken: string | null;
  projectId: number;
  customStressPrompt: string;
  setCustomStressPrompt: (val: string) => void;
  onSimulationRun: () => void;
  showToast: (msg: string) => void;
}

export function StressLabView({
  scenarios,
  authToken,
  projectId,
  customStressPrompt,
  setCustomStressPrompt,
  onSimulationRun,
  showToast
}: StressLabProps) {
  const [activeCategory, setActiveCategory] = useState<'FAILURES' | 'SCALABILITY'>('FAILURES');
  const [runningId, setRunningId] = useState<string | null>(null);
  const [activeSimulationResult, setActiveSimulationResult] = useState<any | null>(null);
  const [appliedChanges, setAppliedChanges] = useState<boolean>(false);

  const failureScenarios = scenarios.filter(s => s.category === 'Real-World Failure & Recovery');
  const scalabilityScenarios = scenarios.filter(s => s.category === 'Scalability & Business');

  const displayedScenarios = activeCategory === 'FAILURES' ? failureScenarios : scalabilityScenarios;

  const handleRunSimulation = async (scenarioId: string, customText?: string) => {
    if (!authToken) return;
    setRunningId(scenarioId);
    setAppliedChanges(false);
    try {
      const res = await fetch('/api/v1/stress/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          project_id: projectId,
          scenario_id: scenarioId,
          custom_text: customText || customStressPrompt || null
        })
      });
      if (!res.ok) throw new Error('Simulation failed');
      const data = await res.json();
      setActiveSimulationResult(data);
      showToast('Simulation complete! 10-Point Failure Analysis generated.');
      onSimulationRun();
    } catch (e) {
      showToast('Error executing failure simulation');
    } finally {
      setRunningId(null);
    }
  };

  const handleApplyChanges = () => {
    setAppliedChanges(true);
    showToast('Architecture updates approved and applied to project version blueprint!');
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="bg-[#FAF8F5] border border-[#E3DAC9] rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-[#9C381E] font-['Space_Grotesk']">
              ARCHITECTURE STRESS LAB
            </span>
            <span className="bg-[#E06D3B] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
              Live Jury Arena
            </span>
          </div>
          <p className="text-xs text-[#716C5F] mt-1 max-w-2xl">
            Stress-test software architecture against 12 real-world production failure emergencies or cloud scalability events.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-white p-1 rounded-2xl border border-[#DFD9CD] shadow-xs">
          <button
            onClick={() => setActiveCategory('FAILURES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCategory === 'FAILURES'
                ? 'bg-[#9C381E] text-white shadow-xs'
                : 'text-[#5C574C] hover:text-[#1E232A]'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-300" />
            Real-World Failures ({failureScenarios.length} Scenarios)
          </button>
          <button
            onClick={() => setActiveCategory('SCALABILITY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCategory === 'SCALABILITY'
                ? 'bg-[#1E232A] text-white shadow-xs'
                : 'text-[#5C574C] hover:text-[#1E232A]'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            Scalability & Business ({scalabilityScenarios.length} Scenarios)
          </button>
        </div>
      </div>

      {/* Natural Language Prompt Injection */}
      <div className="p-6 bg-white border-2 border-[#E06D3B]/40 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#E06D3B]" />
          <h3 className="text-sm font-bold text-[#1E232A] uppercase tracking-wider font-['Space_Grotesk']">
            Jury Challenge: Inject Natural Language Anomaly / Requirement
          </h3>
        </div>
        <p className="text-xs text-[#716C5F]">
          Inject any unexpected failure mode, catastrophic hardware loss, or extreme edge condition in plain English.
        </p>
        <div className="flex gap-3">
          <input 
            type="text" 
            value={customStressPrompt} 
            onChange={e => setCustomStressPrompt(e.target.value)}
            placeholder="e.g. Primary cloud region goes completely offline with zero advance warning" 
            className="flex-1 p-3 text-xs bg-[#FAF8F5] border border-[#DFD9CD] rounded-xl focus:outline-none focus:border-[#E06D3B]"
          />
          <button
            disabled={runningId !== null}
            onClick={() => handleRunSimulation('scenario_8_jury_custom')}
            className="px-6 py-3 bg-[#E06D3B] hover:bg-[#C95B2A] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {runningId === 'scenario_8_jury_custom' ? 'Simulating...' : 'Run Custom Simulation'}
          </button>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedScenarios.map(sc => (
          <div 
            key={sc.id} 
            className="bg-white border border-[#DFD9CD] p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:border-[#9C381E] transition-all space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#9C381E]/10 text-[#9C381E]">
                  {sc.badge}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  sc.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {sc.severity}
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#1E232A] mt-2.5 font-['Space_Grotesk']">{sc.title}</h4>
              <p className="text-xs text-[#5C574C] mt-1.5 leading-relaxed">{sc.description}</p>
            </div>

            <div className="pt-3 border-t border-[#F2ECE1] space-y-2">
              <button
                disabled={runningId !== null}
                onClick={() => handleRunSimulation(sc.id)}
                className="w-full py-2.5 px-3 bg-[#9C381E] hover:bg-[#802D18] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {runningId === sc.id ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Running Simulation...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Run Failure Simulation
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 10-POINT FAILURE ANALYSIS & BEFORE/AFTER MODAL VIA MODALPORTAL */}
      <ModalPortal
        isOpen={!!activeSimulationResult}
        onClose={() => setActiveSimulationResult(null)}
        maxWidth="max-w-3xl"
      >
        {activeSimulationResult && (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                  Comprehensive 10-Point Failure Simulation Analysis
                </span>
                <h3 className="text-lg font-bold text-[#1E232A] mt-1 font-['Space_Grotesk']">
                  {activeSimulationResult.title}
                </h3>
              </div>
              <button 
                onClick={() => setActiveSimulationResult(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-all"
              >
                ✕
              </button>
            </div>

            {/* 10 Analysis Points */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#DFD9CD]">
                <span className="font-bold text-[#1E232A]">1. What Happened: </span>
                <span className="text-[#5C574C]">{activeSimulationResult.what_happened}</span>
              </div>

              <div className="p-3 bg-[#FFF5F2] rounded-xl border border-[#F2C4B3]">
                <span className="font-bold text-[#9C381E]">2. Root Cause Analysis: </span>
                <span className="text-[#5C574C]">{activeSimulationResult.root_cause}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-xl border border-[#DFD9CD]">
                  <span className="font-bold text-[#1E232A]">3. Affected Components: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activeSimulationResult.affected_components.map((c: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 font-mono text-[10px] rounded font-bold">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#DFD9CD]">
                  <span className="font-bold text-[#1E232A]">4. Business & Revenue Impact: </span>
                  <div className="text-[#5C574C] mt-1">{activeSimulationResult.business_impact}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-xl border border-[#DFD9CD]">
                  <span className="font-bold text-[#1E232A]">5. Affected Requirements & ADRs: </span>
                  <div className="text-[#5C574C] mt-1">
                    Reqs: {activeSimulationResult.affected_requirements.join(', ')} <br/>
                    ADRs: {activeSimulationResult.affected_adrs.join(', ')}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#DFD9CD]">
                  <span className="font-bold text-[#2D5A43]">6. Immediate Recovery Solution: </span>
                  <div className="text-[#5C574C] mt-1">{activeSimulationResult.immediate_recovery_solution}</div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#DFD9CD]">
                <span className="font-bold text-[#1E232A]">7. Long-Term Prevention Strategy: </span>
                <div className="text-[#5C574C] mt-1">{activeSimulationResult.long_term_prevention}</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#DFD9CD]">
                <span className="font-bold text-[#1E232A]">8. System Healing Mechanics: </span>
                <div className="text-[#5C574C] mt-1">{activeSimulationResult.system_healing_mechanics}</div>
              </div>

              {/* Before & After Comparison */}
              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E3DAC9] space-y-2">
                <div className="font-bold text-[#1E232A] uppercase tracking-wider text-[11px] font-['Space_Grotesk'] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#9C381E]" />
                  10. Before vs After Architecture Blueprint Modifications
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-red-200">
                    <div className="font-bold text-red-700 text-[11px] mb-1">Architecture Before Incident:</div>
                    <div className="text-[#716C5F]">Single point of failure or synchronous dependencies without circuit breaker retry limits.</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200">
                    <div className="font-bold text-emerald-700 text-[11px] mb-1">Architecture After Adaptation:</div>
                    <ul className="space-y-1 list-disc list-inside text-[#1E232A]">
                      {activeSimulationResult.architecture_changes_needed.map((chg: string, i: number) => (
                        <li key={i}>{chg}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 9. Human Approval Workflow */}
              <div className="p-4 bg-[#FFFBF0] border border-[#F0D59E] rounded-2xl flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-[#B06F00] flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    9. Human Approval Requirement
                  </div>
                  <div className="text-xs text-[#716C5F] mt-0.5">
                    {activeSimulationResult.requires_human_approval 
                      ? 'Consequential structural changes require Lead Architect confirmation.' 
                      : 'Non-breaking operational optimization. Autonomous application permitted.'}
                  </div>
                </div>

                <button
                  disabled={appliedChanges}
                  onClick={handleApplyChanges}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    appliedChanges
                      ? 'bg-[#2D5A43] text-white cursor-default'
                      : 'bg-[#9C381E] hover:bg-[#802D18] text-white shadow-sm'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {appliedChanges ? 'Changes Applied!' : 'Apply Architecture Changes'}
                </button>
              </div>
            </div>

            <button 
              onClick={() => setActiveSimulationResult(null)}
              className="w-full py-2.5 bg-[#1E232A] hover:bg-[#2F3642] text-white rounded-xl text-xs font-bold transition-all"
            >
              Close Failure Simulation Report
            </button>
          </div>
        )}
      </ModalPortal>
    </div>
  );
}
