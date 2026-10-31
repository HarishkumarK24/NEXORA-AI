import React, { useState } from 'react';
import { 
  PlusCircle, CheckCircle2, Clock, RotateCcw, AlertCircle, 
  HelpCircle, Send, Check, Shield, FileText, ChevronRight
} from 'lucide-react';

interface StudentDashboardProps {
  user: any;
  tickets: any[];
  onTicketCreated: () => void;
  onSelectTicket: (t: any) => void;
  showToast: (msg: string) => void;
  token: string;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  tickets,
  onTicketCreated,
  onSelectTicket,
  showToast,
  token
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [building, setBuilding] = useState('Building B');
  const [room, setRoom] = useState('Hall 302');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      showToast('Please provide both a title and details of the issue.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/tickets', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          building,
          room
        })
      });

      if (!res.ok) throw new Error('Submission failed');
      const data = await res.json();
      showToast(`✨ Ticket ${data.ticket_code} submitted! AI specialists are investigating.`);
      setTitle('');
      setDescription('');
      onTicketCreated();
    } catch (e: any) {
      showToast('Failed to create ticket: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmResolution = async (ticketId: number, statusVal: 'closed' | 'reopened') => {
    try {
      const res = await fetch(`/api/v1/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: statusVal })
      });
      if (res.ok) {
        showToast(statusVal === 'closed' ? 'Thank you! Issue marked as resolved.' : 'Issue reopened. AI team alerted.');
        onTicketCreated();
      }
    } catch (e) {
      showToast('Action failed');
    }
  };

  const activeTickets = tickets.filter(t => t.status !== 'closed' && t.status !== 'resolved');
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#FFFBF5] to-[#FAF8F5] border border-[#E3DAC9] p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider font-bold text-[#9C381E]">
            Student & Employee Support Desk
          </div>
          <h1 className="text-2xl font-extrabold text-[#1E232A] mt-1 font-['Space_Grotesk']">
            Welcome back, {user.full_name}
          </h1>
          <p className="text-xs text-[#716C5F] mt-1">
            Need help with Wi-Fi, classroom equipment, or account access? Report your problem below, and our autonomous AI will troubleshoot immediately.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center px-4 py-2 bg-white rounded-2xl border border-[#DFD9CD]">
            <div className="text-xl font-black text-[#9C381E] font-['Space_Grotesk']">{activeTickets.length}</div>
            <div className="text-[10px] text-[#716C5F] uppercase font-bold">In Progress</div>
          </div>
          <div className="text-center px-4 py-2 bg-white rounded-2xl border border-[#DFD9CD]">
            <div className="text-xl font-black text-[#2D5A43] font-['Space_Grotesk']">{resolvedTickets.length}</div>
            <div className="text-[10px] text-[#716C5F] uppercase font-bold">Resolved</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Report a Problem */}
        <div className="lg:col-span-5 bg-white border border-[#DFD9CD] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-[#E06D3B]" />
            <h2 className="text-base font-bold text-[#1E232A] font-['Space_Grotesk']">
              Report a Problem
            </h2>
          </div>
          <p className="text-xs text-[#716C5F]">
            Describe what is happening in plain English. AI will automatically identify the equipment and locate previous fixes.
          </p>

          <form onSubmit={handleCreate} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-[#4A453A] mb-1">
                What problem are you experiencing?
              </label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g. Wi-Fi disconnected during online exam"
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#DFD9CD] rounded-xl text-xs font-medium text-[#1E232A] focus:outline-none focus:border-[#E06D3B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A453A] mb-1">
                More Details & Symptoms
              </label>
              <textarea 
                rows={3} 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="e.g. The exam in Hall 302 started 5 minutes ago and the screen says server timed out..."
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#DFD9CD] rounded-xl text-xs font-medium text-[#1E232A] focus:outline-none focus:border-[#E06D3B]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#4A453A] mb-1">
                  Campus Building
                </label>
                <select 
                  value={building} 
                  onChange={e => setBuilding(e.target.value)}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#DFD9CD] rounded-xl text-xs text-[#1E232A]"
                >
                  <option value="Building B">Building B (Exam Center)</option>
                  <option value="Building A">Building A (Admin)</option>
                  <option value="Building C">Building C (Engineering)</option>
                  <option value="Library">Library Commons</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A453A] mb-1">
                  Room or Area
                </label>
                <input 
                  type="text" 
                  value={room} 
                  onChange={e => setRoom(e.target.value)}
                  placeholder="e.g. Room 302"
                  className="w-full p-2 bg-[#FAF8F5] border border-[#DFD9CD] rounded-xl text-xs text-[#1E232A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#9C381E] hover:bg-[#802D18] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {loading ? 'Submitting & Launching AIIL...' : 'Submit Support Request'}
            </button>
          </form>
        </div>

        {/* Right Section: My Active Tickets & Progress */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#FAF8F5] border border-[#E3DAC9] rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#1E232A] font-['Space_Grotesk'] flex items-center justify-between">
              <span>My Active Support Requests ({activeTickets.length})</span>
              <span className="text-xs text-[#716C5F] font-normal">Real-Time Status</span>
            </h2>

            {activeTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#716C5F] bg-white rounded-2xl border border-[#DFD9CD]">
                You have no unresolved tickets. Everything is running smoothly!
              </div>
            ) : (
              <div className="space-y-3">
                {activeTickets.map(t => (
                  <div 
                    key={t.id}
                    className="p-4 bg-white border border-[#DFD9CD] rounded-2xl hover:border-[#E06D3B] transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#9C381E]">{t.ticket_code}</span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            t.priority === 'critical' ? 'bg-[#9C381E]/10 text-[#9C381E]' : 'bg-[#E06D3B]/10 text-[#E06D3B]'
                          }`}>
                            {t.priority} Priority
                          </span>
                          <span className="text-xs text-[#716C5F]">({t.building})</span>
                        </div>
                        <h3 className="text-sm font-bold text-[#1E232A] mt-1">{t.title}</h3>
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

                    {/* AI Diagnosis Preview */}
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#DFD9CD] text-xs">
                      <div className="font-bold text-[#1E232A] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A43]" />
                        What the AI has figured out so far:
                      </div>
                      <div className="text-[#5C574C] mt-1">
                        {t.root_cause_hypothesis || 'AI is currently analyzing network signals and checking recent campus equipment updates.'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => onSelectTicket(t)}
                        className="text-xs font-bold text-[#9C381E] hover:underline flex items-center gap-1"
                      >
                        <span>View complete AI investigation trail</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="text-[10px] text-[#716C5F] font-mono">
                        Submitted: {t.created_at.slice(11, 16)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Previous Resolved Incidents with Satisfaction Confirm */}
          <div className="bg-[#FAF8F5] border border-[#E3DAC9] rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#1E232A] font-['Space_Grotesk']">
              Resolved & Past Requests ({resolvedTickets.length})
            </h2>

            {resolvedTickets.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#716C5F] bg-white rounded-2xl border border-[#DFD9CD]">
                No previously closed requests.
              </div>
            ) : (
              <div className="space-y-3">
                {resolvedTickets.map(t => (
                  <div key={t.id} className="p-4 bg-white border border-[#DFD9CD] rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#2D5A43]">{t.ticket_code}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#2D5A43]/10 text-[#2D5A43]">
                          Resolved
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#1E232A] mt-1">{t.title}</div>
                      <div className="text-[11px] text-[#716C5F] mt-0.5">
                        Fixed via: {t.root_cause_hypothesis || 'Automated hardware power cycle'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleConfirmResolution(t.id, 'closed')}
                        className="px-3 py-1.5 bg-[#2D5A43]/10 hover:bg-[#2D5A43]/20 text-[#2D5A43] text-xs font-bold rounded-lg transition-all"
                      >
                        ✓ Confirm Fixed
                      </button>
                      <button
                        onClick={() => handleConfirmResolution(t.id, 'reopened')}
                        className="px-3 py-1.5 border border-[#DFD9CD] hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg transition-all"
                      >
                        Reopen Issue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
