import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Globe, Shield, Server, Database, Radio, CreditCard, 
  Cpu, Cloud, Activity, CheckCircle2, ChevronRight, Lock
} from 'lucide-react';

export interface ArchitectureNodeData {
  label: string;
  category: 'client' | 'gateway' | 'auth' | 'service' | 'data' | 'integration' | 'infra';
  layer: string;
  tech: string;
  role: string;
  responsibilities: string[];
  securityNote: string;
  connections: string[];
  isExternal?: boolean;
  isCritical?: boolean;
  isSelected?: boolean;
  isHighlighted?: boolean;
}

const getCategoryStyles = (category: string, isExternal?: boolean) => {
  if (isExternal) {
    return {
      bg: 'bg-[#FFF8F5]',
      border: 'border-[#F2C4B3]',
      headerBg: 'bg-[#FFEAE2] text-[#9C381E]',
      icon: CreditCard,
      accent: '#9C381E',
      badge: 'EXTERNAL'
    };
  }

  switch (category) {
    case 'client':
      return {
        bg: 'bg-[#F9FBFC]',
        border: 'border-[#CADAE4]',
        headerBg: 'bg-[#EAF2F8] text-[#1E3A5F]',
        icon: Globe,
        accent: '#1E3A5F',
        badge: 'TIER 1 • PRESENTATION'
      };
    case 'gateway':
    case 'auth':
      return {
        bg: 'bg-[#FCFAF7]',
        border: 'border-[#E8D4BE]',
        headerBg: 'bg-[#FCECDA] text-[#9C381E]',
        icon: Shield,
        accent: '#9C381E',
        badge: 'TIER 2 • ENTRY & RBAC'
      };
    case 'service':
      return {
        bg: 'bg-[#F9FAF8]',
        border: 'border-[#D1DFD6]',
        headerBg: 'bg-[#E3EFE8] text-[#2D5A43]',
        icon: Server,
        accent: '#2D5A43',
        badge: 'TIER 3 • CORE APPS'
      };
    case 'data':
      return {
        bg: 'bg-[#FBFBFA]',
        border: 'border-[#D9DFE2]',
        headerBg: 'bg-[#E5EEF2] text-[#1B4B66]',
        icon: Database,
        accent: '#1B4B66',
        badge: 'TIER 4 • PERSISTENCE'
      };
    case 'integration':
      return {
        bg: 'bg-[#FFF9F6]',
        border: 'border-[#EAD5CA]',
        headerBg: 'bg-[#FCE6DC] text-[#C95B2A]',
        icon: Radio,
        accent: '#C95B2A',
        badge: 'TIER 5 • INTEGRATION'
      };
    case 'infra':
    default:
      return {
        bg: 'bg-[#FBF9F7]',
        border: 'border-[#DED5C9]',
        headerBg: 'bg-[#EDE4D5] text-[#5C574C]',
        icon: Cloud,
        accent: '#5C574C',
        badge: 'TIER 6 • CLOUD & APM'
      };
  }
};

export const CustomArchitectureNode = memo(({ data, selected }: { data: ArchitectureNodeData; selected?: boolean }) => {
  const styles = getCategoryStyles(data.category, data.isExternal);
  const IconComponent = styles.icon;

  const isSelected = selected || data.isSelected;
  const isHighlighted = data.isHighlighted;

  return (
    <div 
      className={`relative w-[280px] rounded-2xl border-2 transition-all duration-150 shadow-sm ${styles.bg} ${
        isSelected 
          ? 'border-[#9C381E] ring-4 ring-[#9C381E]/20 shadow-xl scale-[1.03] z-30' 
          : isHighlighted
            ? 'border-[#E06D3B] ring-2 ring-[#E06D3B]/30 shadow-md scale-[1.01] z-20'
            : `${styles.border} hover:border-[#9C381E]/60 hover:shadow-md`
      }`}
    >
      {/* Target input connection handle on top */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-[#9C381E] !border-2 !border-white !-top-1.5 transition-transform hover:!scale-125"
      />

      {/* Target input connection handle on left */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-2.5 !h-2.5 !bg-[#5C574C] !border-2 !border-white !-left-1.5"
      />

      {/* Card Header */}
      <div className={`px-3.5 py-2 rounded-t-xl border-b border-[#E3DAC9] flex items-center justify-between ${styles.headerBg}`}>
        <div className="flex items-center gap-2">
          <IconComponent className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[10px] uppercase font-bold tracking-wider font-mono">
            {styles.badge}
          </span>
        </div>
        {data.isCritical && (
          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 tracking-wider">
            CRITICAL
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3.5 space-y-2">
        <div className="flex items-start justify-between gap-1">
          <h4 className="text-xs font-bold text-[#1E232A] font-['Space_Grotesk'] leading-tight">
            {data.label}
          </h4>
        </div>

        {/* Tech Stack Chip */}
        <div className="inline-block px-2 py-0.5 rounded-md bg-white border border-[#DFD9CD] font-mono text-[10px] text-[#9C381E] font-bold">
          {data.tech}
        </div>

        {/* Role / Summary */}
        <p className="text-[11px] text-[#5C574C] line-clamp-2 leading-relaxed">
          {data.role}
        </p>

        {/* Footer info & click indicator */}
        <div className="pt-2 border-t border-[#F0EAE1] flex items-center justify-between text-[10px]">
          <span className="text-[#716C5F] font-mono">
            {data.connections?.length || 0} link{data.connections?.length === 1 ? '' : 's'}
          </span>
          <span className="font-bold text-[#9C381E] flex items-center gap-0.5 group-hover:underline">
            Inspect <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Source output connection handle on bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[#2D5A43] !border-2 !border-white !-bottom-1.5 transition-transform hover:!scale-125"
      />

      {/* Source output connection handle on right */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2.5 !h-2.5 !bg-[#5C574C] !border-2 !border-white !-right-1.5"
      />
    </div>
  );
});
