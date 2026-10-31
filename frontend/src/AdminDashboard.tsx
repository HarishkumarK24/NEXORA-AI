import React, { useState } from 'react';
import { 
  Shield, Server, AlertTriangle, CheckCircle2, Clock, 
  Users, Activity, Play, RotateCcw, ChevronRight, Eye
} from 'lucide-react';

interface AdminDashboardProps {
  user: any;
  tickets: any[];
  approvals: any[];
  assets: any[];
  onReviewApproval: (id: number, decision: 'APPROVED' | 'REJECTED') => void;
  onSelectTicket: (t: any) => void;
  onRefresh: () => void;
  showToast: (msg: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  tickets,
  approvals,
  assets,
  onReviewApproval,
  onSelectTicket,
  onRefresh,
  showToast
}) => {
  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  const criticalTickets = tickets.filter(t => t.priority === 'critical');
  const degradedAssets = assets.filter(a => a.status !== 'OPERATIONAL');

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Top Admin Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white border border-[#DFD9CD] p-5 rounded-2xl shadow-sm">
          <div className="text-xs uppercase tracking-wider font-semibold text-[#716C5F]">Total Incidents</div>
          <div className="text-3xl font-extrabold text-[#1E232A] mt-1 font-['Space_Grotesk']">
            {tickets.length} Recorded
          </div>
          <div className="text-xs text-[#2D5A43] font-medium mt-1">Campus-wide coverage</div>
        </div>

        <div className="bg-white border border-[#DFD9CD] p-5 rounded-2xl shadow-sm">
          <div className="text-xs uppercase tracking-wider font-semibold text-[#716C5F]">Governance Approvals</div>
          <div className="text-3xl font-extrabold text-[#E06D3B] mt-1 font-['Space_Grotesk']">
            {pendingApprovals.length} Pending
          </div>
          <div className="text-xs text-[#E06D3B] font-medium mt-1">Awaiting executive authorization</div>
        </div>

        <div className="bg-white border border-[#DFD9CD] p-5 rounded-2xl shadow-sm">
          <div className="text-xs uppercase tracking-wider font-semibold text-[#716C5F]">Infrastructure Health</div>
          <div className="text-3xl font-extrabold text-[#2D5A43] mt-1 font-['Space_Grotesk']">
            {assets.length - degradedAssets.length} / {assets.length}
          </div>
          <div className="text-xs text-[#716C5F] font-medium mt-1">
            {degradedAssets.length > 0 ? `${degradedAssets.length} Degraded Nodes` : 'All Nodes Operational'}
          </div>
        </div>

        <div className="bg-white border border-[#DFD9CD] p-5 rounded-2xl shadow-sm">
          <div className="text-xs uppercase tracking-wider font-semibold text-[#716C5F]">Critical Outages</div>
          <div className="text-3xl font-extrabold text-[#9C381E] mt-1 font-['Space_Grotesk']">
            {criticalTickets.length} Active
          </div>
          <div className="text-xs text-[#9C381E] font-medium mt-1">Academic Exam Impacts</div>
        </div>
      </div>

      {/* Pending High-Risk Human Governance Approvals */}
      <div className="bg-white border border-[#DFD9CD] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#E06D3B]" />
            <h2 className="text-base font-bold text-[#1E232A] font-['Space_Grotesk']">
              Pending High-Risk Governance Approvals ({pendingApprovals.length})
            </h2>
          </div>
          <span className="text-xs bg-[#E06D3B]/10 text-[#E06D3B] font-bold px-3 py-1 rounded-full border border-[#E06D3B]/20">
            Executive Authorization Required
          </span>
        </div>

        <p className="text-xs text-[#716C5F]">
          The autonomous AI has proposed consequential system repairs (hardware reboot, token invalidation). Review the supporting evidence and impact before approving.
        </p>

        {pendingApprovals.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#716C5F] bg-[#FAF8F5] rounded-2xl border border-[#DFD9CD]">
            ✓ No high-risk actions pending. System is running within autonomous safety bounds.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApprovals.map(app => (
              <div key={app.id} className="p-5 bg-[#FAF8F5] border border-[#DFD9CD] rounded-2xl space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#9C381E] bg-[#9C381E]/10 px-2 py-0.5 rounded">
                        {app.ticket_code}
                      </span>
                      <h3 className="text-sm font-bold text-[#1E232A]">{app.action_type}</h3>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                        Risk: {app.risk_level}
                      </span>
                    </div>
                    <p className="text-xs text-[#5C574C] mt-1.5">{app.description}</p>
                  </div>
                  <span className="text-xs font-mono text-[#716C5F]">{app.created_at.slice(11, 16)}</span>
                </div>

                <div className="p-3 bg-white border border-[#DFD9CD] rounded-xl text-xs space-y-1">
                  <div><span className="font-bold text-[#1E232A]">Root-Cause Hypothesis:</span> {app.reason}</div>
                  <div><span className="font-bold text-[#1E232A]">Potential Production Impact:</span> {app.potential_impact}</div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => onReviewApproval(app.id, 'APPROVED')}
                    className="px-5 py-2.5 bg-[#2D5A43] hover:bg-[#234734] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    ✓ Authorize & Trigger Execution
                  </button>
                  <button
                    onClick={() => onReviewApproval(app.id, 'REJECTED')}
                    className="px-5 py-2.5 bg-white border border-[#DFD9CD] hover:bg-gray-50 text-xs font-bold rounded-xl text-gray-700 transition-all"
                  >
                    ✕ Reject Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Infrastructure CMDB & Major Incident Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Campus Assets Status */}
        <div className="bg-[#FAF8F5] border border-[#E3DAC9] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1E232A] font-['Space_Grotesk']">
              Campus Infrastructure CMDB ({assets.length} Nodes)
            </h2>
            <span className="text-xs text-[#716C5F] font-mono">Live Telemetry</span>
          </div>

          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {assets.map(a => (
              <div key={a.id} className="p-3.5 bg-white border border-[#DFD9CD] rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#9C381E]">{a.id}</span>
                    <span className="font-semibold text-[#1E232A]">{a.name}</span>
                  </div>
                  <div className="text-[11px] text-[#716C5F] mt-0.5">{a.building} • IP: {a.ip_address}</div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    a.status === 'OPERATIONAL' ? 'bg-[#2D5A43]/10 text-[#2D5A43]' : 'bg-red-100 text-red-700'
                  }`}>
                    {a.status}
                  </span>
                  <div className="text-[10px] text-[#2D5A43] font-bold mt-1">Health: {a.health_score}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise Incident Stream */}
        <div className="bg-[#FAF8F5] border border-[#E3DAC9] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1E232A] font-['Space_Grotesk']">
              Campus Incident Stream
            </h2>
            <span className="text-xs text-[#716C5F]">Real-time queue</span>
          </div>

          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {tickets.map(t => (
              <div 
                key={t.id} 
                onClick={() => onSelectTicket(t)}
                className="p-3.5 bg-white border border-[#DFD9CD] rounded-xl hover:border-[#E06D3B] cursor-pointer transition-all flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#9C381E]">{t.ticket_code}</span>
                    <span className="font-semibold text-[#1E232A] line-clamp-1">{t.title}</span>
                  </div>
                  <div className="text-[11px] text-[#716C5F] mt-0.5">{t.building} • {t.category}</div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                    t.status === 'resolved' ? 'bg-[#2D5A43]/10 text-[#2D5A43]' :
                    t.status === 'waiting_approval' ? 'bg-[#E06D3B]/10 text-[#E06D3B]' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
