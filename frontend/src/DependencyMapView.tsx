import React, { useState } from 'react';
import { 
  Layers, Cpu, Database, Code2, ArrowRight, CheckCircle2, Search, Filter, Shield
} from 'lucide-react';

interface DependencyMapViewProps {
  dependencyGraph: any;
  requirements: any[];
}

export const DependencyMapView: React.FC<DependencyMapViewProps> = ({
  dependencyGraph,
  requirements
}) => {
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [nodeFilter, setNodeFilter] = useState<'ALL' | 'requirement' | 'service' | 'database'>('ALL');

  const nodes = dependencyGraph?.nodes || [];
  const links = dependencyGraph?.links || [];
  const traceability = dependencyGraph?.traceability || [];

  const filteredNodes = nodes.filter((n: any) => {
    if (nodeFilter === 'ALL') return true;
    return n.type === nodeFilter;
  });

  const getConnectedLinks = (nodeId: string) => {
    return links.filter((l: any) => l.source === nodeId || l.target === nodeId);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="bg-[#FAF8F5] border border-[#E3DAC9] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#9C381E]/10 text-[#9C381E] mb-2 font-mono">
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive Dependency & Impact Modeling</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#1E232A] font-['Space_Grotesk'] tracking-tight">
            System Dependency & Traceability Map
          </h2>
          <p className="text-xs text-[#716C5F] mt-1 max-w-2xl leading-relaxed">
            Trace how business requirements cascade down to microservices, database entities, caching layers, and Architectural Decision Records (ADRs).
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-[#DFD9CD] p-3 rounded-2xl shadow-xs text-xs font-mono text-[#1E232A]">
          <span className="font-bold text-[#2D5A43]">{nodes.length} Nodes</span>
          <span>•</span>
          <span className="font-bold text-[#9C381E]">{links.length} Dependency Edges</span>
        </div>
      </div>

      {/* Node Filter Tabs */}
      <div className="bg-white border border-[#DFD9CD] rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#716C5F] uppercase font-mono">Filter Layer:</span>
          {[
            { id: 'ALL', label: 'All Layers' },
            { id: 'requirement', label: 'Requirements' },
            { id: 'service', label: 'Microservices' },
            { id: 'database', label: 'Data Stores & Cache' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setNodeFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                nodeFilter === f.id
                  ? 'bg-[#1E232A] text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-[#5C574C] hover:text-[#1E232A] border border-[#DFD9CD]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-[#716C5F] font-mono">Click any node to inspect upstream/downstream ripples</span>
      </div>

      {/* Interactive Visual Node Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left: Nodes Grid */}
        <div className="md:col-span-2 bg-white border border-[#DFD9CD] rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#1E232A] uppercase tracking-wider font-['Space_Grotesk']">
            Architecture Node Graph ({filteredNodes.length} active nodes)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredNodes.map((node: any) => {
              const isSelected = selectedNode?.id === node.id;
              const connected = getConnectedLinks(node.id);

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                    isSelected 
                      ? 'border-[#9C381E] bg-[#9C381E]/5 shadow-md'
                      : 'border-[#DFD9CD] bg-[#FAF8F5] hover:bg-white hover:border-[#9C381E]/50 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded ${
                      node.type === 'service' ? 'bg-purple-100 text-purple-800' :
                      node.type === 'database' || node.type === 'cache' || node.type === 'queue' ? 'bg-blue-100 text-blue-800' :
                      node.is_enhanced ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {node.type}
                    </span>
                    <span className="text-[10px] text-[#716C5F] font-mono">
                      {connected.length} links
                    </span>
                  </div>

                  <div className="text-xs font-bold text-[#1E232A]">
                    {node.label}
                  </div>

                  {node.category && (
                    <div className="text-[10px] text-[#5C574C] font-mono">
                      {node.category}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Node Details & Connected Ripples */}
        <div className="bg-white border border-[#DFD9CD] rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#1E232A] uppercase tracking-wider font-['Space_Grotesk']">
            Node Dependency Inspector
          </h3>

          {selectedNode ? (
            <div className="space-y-4 text-xs animate-fade-in">
              <div className="p-4 bg-[#FAF8F5] border border-[#DFD9CD] rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-mono font-bold text-[#9C381E]">
                  {selectedNode.type} Details
                </span>
                <div className="text-sm font-extrabold text-[#1E232A]">
                  {selectedNode.label}
                </div>
                {selectedNode.full_text && (
                  <p className="text-xs text-[#5C574C] leading-relaxed">
                    {selectedNode.full_text}
                  </p>
                )}
              </div>

              {/* Connected Links */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#716C5F] font-mono">
                  Direct Downstream / Upstream Dependencies:
                </span>
                <div className="space-y-2">
                  {getConnectedLinks(selectedNode.id).map((l: any, idx: number) => (
                    <div key={idx} className="p-3 bg-[#FAF8F5] border border-[#DFD9CD] rounded-xl flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-bold text-[#1E232A]">
                          {l.source === selectedNode.id ? 'Calls ➔' : 'Called by ➔'}
                        </span>
                        <span className="text-[#9C381E] truncate">
                          {l.source === selectedNode.id ? l.target : l.source}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#2D5A43] font-bold shrink-0">
                        {l.relationship}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#716C5F] bg-[#FAF8F5] rounded-2xl border border-dashed border-[#DFD9CD]">
              Select any node in the left matrix to inspect its ripple dependencies and connected architecture components.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
