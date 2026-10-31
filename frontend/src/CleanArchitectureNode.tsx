import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Globe, Smartphone, LayoutDashboard, Shield, Lock, Key,
  ShoppingBag, Search, ShoppingCart, PackageCheck, CreditCard,
  Boxes, Bell, Database, Zap, Cpu, Radio, Mail, Truck,
  Activity, Cloud, CheckCircle2, ChevronRight
} from 'lucide-react';

export interface CleanNodeData {
  id: string;
  title: string;
  subtitle: string;
  category: 'client' | 'gateway' | 'service' | 'data' | 'integration' | 'supporting';
  tech: string;
  role: string;
  responsibilities: string[];
  securityNote: string;
  connections: string[];
  isHighlighted?: boolean;
  isSelected?: boolean;
  badge?: string;
}

const getCategoryConfig = (category: string, title: string) => {
  const t = title.toLowerCase();

  if (category === 'client') {
    let icon = Globe;
    if (t.includes('mobile')) icon = Smartphone;
    if (t.includes('admin')) icon = LayoutDashboard;
    return {
      bg: 'bg-white',
      border: 'border-[#CADAE4]',
      iconBg: 'bg-[#EBF3F8] text-[#1E3A5F]',
      chipBg: 'bg-[#F2F7FA] text-[#1E3A5F]',
      accentColor: '#1E3A5F',
      icon
    };
  }

  if (category === 'gateway') {
    let icon = Shield;
    if (t.includes('auth')) icon = Lock;
    return {
      bg: 'bg-white',
      border: 'border-[#F0C9BA]',
      iconBg: 'bg-[#FCEEE8] text-[#9C381E]',
      chipBg: 'bg-[#FFF3EE] text-[#9C381E]',
      accentColor: '#9C381E',
      icon
    };
  }

  if (category === 'service') {
    let icon = Boxes;
    if (t.includes('product') || t.includes('catalog')) icon = ShoppingBag;
    if (t.includes('search')) icon = Search;
    if (t.includes('cart')) icon = ShoppingCart;
    if (t.includes('order')) icon = PackageCheck;
    if (t.includes('payment')) icon = CreditCard;
    if (t.includes('notification')) icon = Bell;
    return {
      bg: 'bg-white',
      border: 'border-[#D1DFD6]',
      iconBg: 'bg-[#EAF2ED] text-[#2D5A43]',
      chipBg: 'bg-[#F2F7F4] text-[#2D5A43]',
      accentColor: '#2D5A43',
      icon
    };
  }

  if (category === 'data') {
    let icon = Database;
    if (t.includes('cache') || t.includes('redis')) icon = Zap;
    if (t.includes('queue') || t.includes('broker') || t.includes('kafka')) icon = Cpu;
    return {
      bg: 'bg-white',
      border: 'border-[#C8D8E0]',
      iconBg: 'bg-[#E6EFF4] text-[#1B4B66]',
      chipBg: 'bg-[#F0F5F8] text-[#1B4B66]',
      accentColor: '#1B4B66',
      icon
    };
  }

  if (category === 'integration') {
    let icon = Radio;
    if (t.includes('payment')) icon = CreditCard;
    if (t.includes('email') || t.includes('sms')) icon = Mail;
    if (t.includes('shipping') || t.includes('carrier')) icon = Truck;
    return {
      bg: 'bg-[#FFFBF7]',
      border: 'border-[#EAD5CA]',
      iconBg: 'bg-[#FCECE3] text-[#C95B2A]',
      chipBg: 'bg-[#FFF3EC] text-[#C95B2A]',
      accentColor: '#C95B2A',
      icon
    };
  }

  // Supporting (Monitoring & Cloud)
  return {
    bg: 'bg-[#FBF9F7]',
    border: 'border-[#DFD9CD]',
    iconBg: 'bg-[#EDE4D5] text-[#5C574C]',
    chipBg: 'bg-[#F5EFE6] text-[#5C574C]',
    accentColor: '#5C574C',
    icon: t.includes('monitor') ? Activity : Cloud
  };
};

export const CleanArchitectureNode = memo(({ data, selected }: { data: CleanNodeData; selected?: boolean }) => {
  const config = getCategoryConfig(data.category, data.title);
  const IconComponent = config.icon;

  const isSelected = selected || data.isSelected;
  const isHighlighted = data.isHighlighted;

  return (
    <div 
      className={`relative w-[210px] rounded-xl border transition-all duration-150 p-3.5 shadow-sm cursor-pointer select-none ${config.bg} ${
        isSelected
          ? 'border-[#9C381E] ring-4 ring-[#9C381E]/20 shadow-lg scale-[1.03] z-30'
          : isHighlighted
            ? 'border-[#E06D3B] ring-2 ring-[#E06D3B]/40 shadow-md scale-[1.01] z-20'
            : `${config.border} hover:border-[#9C381E] hover:shadow-md`
      }`}
    >
      {/* Top Handle for Ingoing Connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-[#9C381E] !border-2 !border-white !-top-1.5 transition-transform"
      />

      {/* Left Handle for Side Inbound */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-2 !h-2 !bg-[#5C574C] !border-2 !border-white !-left-1"
      />

      {/* Node Header with Clean Circular Icon */}
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg ${config.iconBg} flex items-center justify-center shrink-0`}>
          <IconComponent className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-[#1E232A] font-['Space_Grotesk'] truncate leading-tight">
            {data.title}
          </h4>
          <p className="text-[10px] text-[#716C5F] truncate font-medium mt-0.5">
            {data.subtitle}
          </p>
        </div>
      </div>

      {/* Tech Pill */}
      <div className="mt-2.5 flex items-center justify-between">
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${config.chipBg} truncate max-w-[155px]`}>
          {data.tech}
        </span>
        <span className="text-[#9C381E] opacity-70 hover:opacity-100">
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>

      {/* Right Handle for Side Outbound */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2 !h-2 !bg-[#5C574C] !border-2 !border-white !-right-1"
      />

      {/* Bottom Handle for Outgoing Connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-[#2D5A43] !border-2 !border-white !-bottom-1.5 transition-transform"
      />
    </div>
  );
});
