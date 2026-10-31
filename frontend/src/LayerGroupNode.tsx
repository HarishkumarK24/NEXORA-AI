import React, { memo } from 'react';

export interface GroupNodeData {
  label: string;
  badge?: string;
  width: number;
  height: number;
  borderColor?: string;
  bgColor?: string;
}

export const LayerGroupNode = memo(({ data }: { data: GroupNodeData }) => {
  return (
    <div 
      style={{ width: `${data.width}px`, height: `${data.height}px` }}
      className={`rounded-2xl border-2 border-dashed ${data.borderColor || 'border-[#D9D1C3]'} ${data.bgColor || 'bg-[#FAF8F4]/70'} p-3 select-none pointer-events-none transition-all shadow-xs`}
    >
      <div className="flex items-center justify-between px-2 pt-1">
        <span className="text-[11px] uppercase font-bold tracking-widest text-[#716C5F] font-mono">
          {data.label}
        </span>
        {data.badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-[#DFD9CD] text-[#5C574C]">
            {data.badge}
          </span>
        )}
      </div>
    </div>
  );
});
