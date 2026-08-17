import React from 'react';
import {
  X,
  Award,
  CheckCircle2,
  Cpu,
  Globe,
  Users,
  Rocket,
  Presentation,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface DelegateBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DelegateBriefingModal: React.FC<DelegateBriefingModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl space-y-6 relative my-8">
        {/* Close Button */}
        <button
          id="btn-close-briefing"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              PulseBRICS — International Delegate 5-Minute Executive Briefing
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluation Alignment & Technical Architecture for National Health Ministries
            </p>
          </div>
        </div>

        {/* Evaluation Criteria Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* 1. Problem-Solution Fit (20%) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">1. Problem-Solution Fit</span>
              <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">20% Weight</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Directly addresses medicine stockouts, patient footfall, and bed/staff utilization across PHC networks via state-to-district-to-facility drilldown and automated inter-district redistribution.
            </p>
          </div>

          {/* 2. AI / Technical Execution (25%) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">2. Google AI Execution</span>
              <span className="font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-[11px]">25% Weight</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Powered by Google Gemini 3.7 Flash: performs 30-day demand forecasting, emergency stockout risk scoring, inter-district transfer route optimization, and syndromic outbreak surge planning.
            </p>
          </div>

          {/* 3. Cross-Border Applicability (20%) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">3. Cross-Border BRICS</span>
              <span className="font-mono text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">20% Weight</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Multi-nation framework (India NHM, Brazil SUS, South Africa NHI). Privacy-preserving federated model sharing enables cross-border epidemiological intelligence without raw patient data leaving national borders.
            </p>
          </div>

          {/* 4. Deployability & Scalability (20%) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">4. Rapid Deployability</span>
              <span className="font-mono text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-[11px]">20% Weight</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Can be piloted in national health ministries in weeks: lightweight API connectors interface with existing HMIS, e-Aushadhi, and biometric attendance databases.
            </p>
          </div>

          {/* 5. Impact Potential (10%) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">5. Scale of Benefit</span>
              <span className="font-mono text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[11px]">10% Weight</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Protects hundreds of millions of citizens by preventing primary-tier stockouts of life-saving medicines (IV fluids, oxytocin, antivenom) and preventing hospital emergency department saturation.
            </p>
          </div>

          {/* 6. Presentation & Clarity (5%) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">6. Presentation & Clarity</span>
              <span className="font-mono text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200 text-[11px]">5% Weight</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Clean Minimalism design system with crisp typography, subtle slate borders, and instant actionable intelligence.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            id="btn-got-it"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Return to Command Center
          </button>
        </div>
      </div>
    </div>
  );
};
