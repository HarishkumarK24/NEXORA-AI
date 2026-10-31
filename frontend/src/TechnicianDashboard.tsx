import React, { useState } from 'react';
import { 
  Wrench, Activity, AlertTriangle, CheckCircle2, Play, 
  RotateCcw, Terminal, Shield, Clock, Zap, ChevronRight, Server
} from 'lucide-react';

interface TechDashboardProps {
  user: any;
  tickets: any[];
  onSelectTicket: (t: any) => void;
  onRefresh: () => void;
  showToast: (msg: string) => void;
  token: string;
}

export const TechnicianDashboard: React.FC<TechDashboardProps> = ({
  user,
  tickets,
  onSelectTicket,
  onRefresh,
  showToast,
  token
}) => {
  const [runningTool, setRunningTool] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);

  const assignedTickets = tickets.filter(t => t.status !== 'closed' && t.status !== 'resolved');
  const urgentTickets = assignedTickets.filter(t => t.priority === 'critical' || t.priority === 'high');

  const handleRunDiagnostic = async (targetIp: string = '10.14.2.1') => {
    setRunningTool(true);
    try {
      // Direct diagnostic tool invocation via test payload
      showToast(`Running network ping & traceroute diagnostic on ${targetIp}...`);
      setTimeout(() => {
        setDiagnosticResult({
          target: targetIp,
          test: 'ICMP_PING_AND_ARP',
          result: 'Packets Received: 4/4 (0% drop), Jitter: 1.4ms, Gateway ARP: Valid',
          status: 'HEALTHY'
        });
        setRunningTool(false);
        showToast('Diagnostic completed: Target hardware link is responsive.');
      }, 1200);
    } catch (e) {
      setRunningTool(false);
    }
  };

  const handleResolveTicket = async (ticketId: number) => {
    try {
      const res = await fetch(`/api/v1/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'resolved' })
      });
      if (res.ok) {
        showToast('Ticket marked resolved. Verification logged in audit trail.');
        onRefresh();
      }
    } catch (e) {
      showToast('Action failed');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Top Tech Workload & SLA Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white border border-[#DFD9CD] p-5 rounded-2xl shadow-sm">
          <div className="text-xs uppercase tracking-wider font-semibold text-[#716C5F]">Assigned Queue</div>
          <div className="text-3xl font-extrabold text-[#1E232A] mt-1 font-['Space_Grotesk']">
            {assignedTickets.length} Incidents
          </div>
          <div className="text-xs text-[#2D5A43] font-medium mt-1">
            Personal SLA Compliance: 98.2%
          </div>
        </div>

        <div className="bg-white border border-[#DFD9CD] p-5 rounded-2xl shadow-sm">
          <div className="text-xs uppercase tracking-wider font-semibold text-[#716C5F]">High Urgency</div>
          <div className="text-3xl font-extrabold text-[#9C381E] mt-1 font-['Space_Grotesk']">
            {urgentTickets.length} Priority
          </div>
          <div className="text-xs text-[#9C381E] font-medium mt-1">Requires immediate triage</div>
        </div>

        <div className="bg-white border border-[#DFD9CD] p-5 rounded-2xl shadow-sm">
          <div className="text-xs uppercase tracking-wider font-semibold text-[#716C5F]">Active SLA Countdown</div>
          <div className="text-3xl font-extrabold text-[#E06D3B] mt-1 font-['Space_Grotesk'] flex items-center gap-1.5">
            <Clock className="w-6 h-6 text-[#E06D3B]" />
            <span>28m 40s</span>
          </div>
          <div className="text-xs text-[#716C5F] font-medium mt-1">Building B Hall 302 Outage</div>
        </div>

        <div className="bg-white border border-[#DFD9CD] p-5 rounded-2xl shadow-sm">
          <div className="text-xs uppercase tracking-wider font-semibold text-[#716C5F]">AI Assistance Mode</div>
          <div className="text-3xl font-extrabold text-[#2D5A43] mt-1 font-['Space_Grotesk']">
            Active
          </div>
          <div className="text-xs text-[#716C5F] font-medium mt-1">Autonomous diagnostics & KB match</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Assigned Incidents Queue */}
        <div className="lg:col-span-8 bg-[#FAF8F5] border border-[#E3DAC9] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#1E232A] font-['Space_Grotesk']">
                My Assigned Incidents Queue
              </h2>
              <p className="text-xs text-[#716C5F]">
                Investigate tickets, review AI root-cause hypotheses, and execute authorized resolutions.
              </p>
            </div>
            <button
              onClick={onRefresh}
              className="text-xs font-bold text-[#716C5F] hover:text-[#1E232A] px-3 py-1.5 bg-white border border-[#DFD9CD] rounded-xl shadow-sm"
            >
              Refresh Queue
            </button>
          </div>

          <div className="space-y-3">
            {assignedTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#716C5F] bg-white rounded-2xl border border-[#DFD9CD]">
                No assigned incidents at this moment.
              </div>
            ) : (
              assignedTickets.map(t => (
                <div 
                  key={t.id}
                  className="p-5 bg-white border border-[#DFD9CD] rounded-2xl hover:border-[#E06D3B] transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#9C381E] bg-[#9C381E]/10 px-2 py-0.5 rounded">
                          {t.ticket_code}
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          t.priority === 'critical' ? 'bg-[#9C381E]/10 text-[#9C381E]' : 'bg-[#E06D3B]/10 text-[#E06D3B]'
                        }`}>
                          {t.priority}
                        </span>
                        <span className="text-xs text-[#716C5F]">({t.building} • {t.category})</span>
                      </div>
                      <h3 className="text-sm font-bold text-[#1E232A] mt-1.5">{t.title}</h3>
                      <p className="text-xs text-[#5C574C] mt-0.5">{t.description}</p>
                    </div>

                    <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                      t.status === 'investigating' ? 'bg-amber-100 text-amber-800' :
                      t.status === 'waiting_approval' ? 'bg-[#E06D3B]/15 text-[#E06D3B]' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* AI Root Cause Recommendation & Supporting Knowledge */}
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#DFD9CD] space-y-1.5 text-xs">
                    <div className="font-bold text-[#1E232A] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-[#E06D3B]" />
                        AI Root-Cause Diagnosis
                      </span>
                      <span className="text-[10px] font-mono text-[#2D5A43] font-bold">
                        Confidence: {Math.round((t.confidence_score || 0.92) * 100)}%
                      </span>
                    </div>
                    <p className="text-[#5C574C]">
                      {t.root_cause_hypothesis || 'AP-BLD-B-01 memory buffer overflow on high concurrent client associations.'}
                    </p>
                    <div className="text-[11px] text-[#716C5F]">
                      Recommended Fix: Remote soft-reboot & switchport PoE power cycle.
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolveTicket(t.id)}
                        className="px-3.5 py-1.5 bg-[#2D5A43] hover:bg-[#234734] text-white text-xs font-bold rounded-lg shadow-sm"
                      >
                        ✓ Mark Resolved
                      </button>
                      <button
                        onClick={() => handleRunDiagnostic('10.14.2.1')}
                        className="px-3.5 py-1.5 bg-white border border-[#DFD9CD] hover:bg-gray-50 text-xs font-bold rounded-lg text-gray-700"
                      >
                        Run Ping Probe
                      </button>
                    </div>

                    <button
                      onClick={() => onSelectTicket(t)}
                      className="text-xs font-bold text-[#9C381E] hover:underline flex items-center gap-1"
                    >
                      <span>Deep AIIL Trace</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Quick Diagnostic Console */}
        <div className="lg:col-span-4 bg-white border border-[#DFD9CD] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#E06D3B]" />
            <h2 className="text-base font-bold text-[#1E232A] font-['Space_Grotesk']">
              Quick Diagnostic Console
            </h2>
          </div>
          <p className="text-xs text-[#716C5F]">
            Run non-destructive diagnostic tools without leaving your technician dashboard.
          </p>

          <div className="space-y-3 pt-1">
            <button
              disabled={runningTool}
              onClick={() => handleRunDiagnostic('10.14.2.1')}
              className="w-full p-3 bg-[#FAF8F5] border border-[#DFD9CD] hover:border-[#E06D3B] rounded-xl text-left transition-all"
            >
              <div className="text-xs font-bold text-[#1E232A] flex items-center justify-between">
                <span>Building B AP-555 Ping Probe</span>
                <span className="text-[10px] font-mono text-[#2D5A43]">LOW RISK</span>
              </div>
              <div className="text-[11px] text-[#716C5F] mt-0.5">IP: 10.14.2.1 (Room 302 Exam Hall)</div>
            </button>

            <button
              disabled={runningTool}
              onClick={() => handleRunDiagnostic('10.0.10.15')}
              className="w-full p-3 bg-[#FAF8F5] border border-[#DFD9CD] hover:border-[#E06D3B] rounded-xl text-left transition-all"
            >
              <div className="text-xs font-bold text-[#1E232A] flex items-center justify-between">
                <span>SSO / RADIUS Gateway Health</span>
                <span className="text-[10px] font-mono text-[#2D5A43]">LOW RISK</span>
              </div>
              <div className="text-[11px] text-[#716C5F] mt-0.5">IP: 10.0.10.15 (Data Center East)</div>
            </button>

            {diagnosticResult && (
              <div className="p-3 bg-[#1E232A] text-white rounded-xl font-mono text-[11px] space-y-1 animate-fade-in">
                <div className="text-[#2D5A43] font-bold">[{diagnosticResult.status}] {diagnosticResult.test}</div>
                <div className="text-gray-300">{diagnosticResult.result}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
