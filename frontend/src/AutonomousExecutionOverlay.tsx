import React, { useEffect, useState } from 'react';
import { 
  Sparkles, RefreshCw, CheckCircle2, AlertTriangle, Layers, Cpu, Shield, Database, Code2
} from 'lucide-react';

interface AutonomousExecutionOverlayProps {
  onComplete: () => void;
  projectName: string;
}

export const AutonomousExecutionOverlay: React.FC<AutonomousExecutionOverlayProps> = ({
  onComplete,
  projectName
}) => {
  const [currentStage, setCurrentStage] = useState(1);

  const stages = [
    { num: 1, title: 'Document Intelligence & Ingestion', desc: 'Extracting statements, preserving source references and context' },
    { num: 2, title: '9-Class Requirement Classification', desc: 'Classifying functional, performance, security, compliance, reliability specs' },
    { num: 3, title: 'Contextual Gap & Conflict Detection', desc: 'Identifying missing webhooks, inventory locks, PII risks, and scalability bounds' },
    { num: 4, title: 'Structured Dependency & Traceability Modeling', desc: 'Constructing end-to-end dependency graph linking specs to microservices' },
    { num: 5, title: 'Autonomous Solution Synthesis', desc: 'Formulating structured solutions with plain-English before & after impact scenarios' },
    { num: 6, title: 'Autonomous Baseline Resolution & Spec Incorporation', desc: 'Incorporating verified technical specifications directly into project baseline v2.0' },
    { num: 7, title: 'Software Architecture & Flowchart Regeneration', desc: 'Regenerating microservices, database schemas, API specs, and visual flowcharts' },
    { num: 8, title: 'ADR Matrix Formulation', desc: 'Formulating 10 full-stack Architectural Decision Records with alternative criteria' },
    { num: 9, title: 'Iterative Automatic Revalidation & Verification', desc: 'Executing 7-point automated audit; validating critical gap resolution & traceability' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStage(prev => {
        if (prev < 9) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 800);
          return 9;
        }
      });
    }, 450);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#1E232A]/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border border-[#DFD9CD] rounded-3xl p-8 max-w-2xl w-full shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F2ECE1]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9C381E] to-[#E06D3B] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1E232A] font-['Space_Grotesk']">
                Autonomous Architecture Engineering in Progress
              </h3>
              <p className="text-xs text-[#716C5F] font-mono">
                {projectName} • Zero Manual Interruptions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-[#FAF8F5] border border-[#DFD9CD] rounded-full text-xs font-mono font-bold text-[#9C381E]">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Stage {currentStage} of 9
          </div>
        </div>

        {/* Progress Stages Stack */}
        <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
          {stages.map((s) => {
            const isCompleted = currentStage > s.num;
            const isCurrent = currentStage === s.num;

            return (
              <div
                key={s.num}
                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isCurrent 
                    ? 'bg-[#9C381E]/5 border-[#9C381E] shadow-sm'
                    : isCompleted
                    ? 'bg-[#FAF8F5] border-[#E3DAC9] text-[#1E232A]'
                    : 'bg-white border-[#F2ECE1] opacity-40'
                }`}
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#2D5A43]" />
                  ) : isCurrent ? (
                    <RefreshCw className="w-4 h-4 text-[#9C381E] animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px] text-gray-400 font-mono">
                      {s.num}
                    </div>
                  )}
                </div>

                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isCurrent ? 'text-[#9C381E]' : 'text-[#1E232A]'}`}>
                      Stage {s.num}: {s.title}
                    </span>
                    {isCompleted && (
                      <span className="text-[10px] uppercase font-bold text-[#2D5A43] font-mono">
                        VERIFIED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#5C574C] leading-normal">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-[#F2ECE1] flex items-center justify-between text-xs text-[#716C5F]">
          <span className="font-mono">
            Autonomous resolution: Applying verified specifications directly to baseline...
          </span>
          <span className="font-bold text-[#2D5A43]">
            {Math.round((currentStage / 9) * 100)}%
          </span>
        </div>

      </div>
    </div>
  );
};
