import React, { useState } from "react";
import { FlowNode } from "../types";
import { ArrowRight, Layers, FileCode, Cpu, Check, HelpCircle } from "lucide-react";

interface ExecutionFlowModuleProps {
  steps: FlowNode[];
}

export default function ExecutionFlowModule({ steps }: ExecutionFlowModuleProps) {
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);

  const displaySteps = steps.length > 0 ? steps : [
    {
      id: "sf-1",
      label: "Client Request",
      description: "Client submits subscription payload calling POST /api/payments/subscribe.",
      file: "src/server.ts",
      step: 1,
      type: "client",
      code: `axios.post('/api/payments/subscribe', { priceId: 'price_premium' }, { headers: { Authorization: 'Bearer x' }})`
    },
    {
      id: "sf-2",
      label: "Auth Token Verification",
      description: "Express router forwards headers to authentication checking middleware validating signature metrics.",
      file: "src/middleware/auth.ts",
      step: 2,
      type: "controller",
      code: `jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => { ... })`
    },
    {
      id: "sf-3",
      label: "Fetch Billing Profile",
      description: "paymentController queries PostgreSQL to ensure a custom stripe customer profile is logged.",
      file: "src/controllers/paymentController.ts",
      step: 3,
      type: "service",
      code: `db.query('SELECT stripe_customer_id FROM users WHERE id = $1', [userId])`
    },
    {
      id: "sf-4",
      label: "Trigger Stripe Gate",
      description: "Sends payload to Stripe API and redirects user to secure checkout page.",
      file: "src/services/stripeService.ts",
      step: 4,
      type: "database",
      code: `stripe.checkout.sessions.create({ customer: customerId, mode: 'subscription', ... })`
    }
  ] as FlowNode[];

  const activeStep = displaySteps[activeStepIdx] || displaySteps[0];

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "client":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "controller":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "service":
        return "bg-indigo-50 text-indigo-800 border-indigo-200";
      default:
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">FlowTrace Execution Analytics</h2>
            <p className="text-sm text-slate-500 mt-0.5 max-w-2xl">
              Trace code paths step-by-step. Maps out execution lines inside controllers, middleware filters, services, and queries so junior engineers onboard in minutes.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* visual Horizontal Process path steps */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-50">
            Pipeline Request Steps
          </h3>
          <div className="space-y-2">
            {displaySteps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setActiveStepIdx(idx)}
                className={`w-full flex items-center gap-3 text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  activeStepIdx === idx
                    ? "bg-blue-50 border-blue-200 shadow-xs scale-102"
                    : "bg-white border-slate-100 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <span className={`w-6.5 h-6.5 flex items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                  activeStepIdx === idx ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {step.step}
                </span>
                <div className="flex-1 min-w-0">
                  <span className={`text-xs font-black uppercase tracking-wider block ${
                    activeStepIdx === idx ? "text-blue-800" : "text-slate-500"
                  }`}>
                    {step.type}
                  </span>
                  <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{step.label}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 text-2xs text-slate-400 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> Click on steps above to focus code contexts.
          </div>
        </div>

        {/* Selected Step Code Execution description and visualizer panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-2xs font-extrabold uppercase border ${getTypeStyles(activeStep.type)}`}>
                {activeStep.type} Layer
              </span>
              <h4 className="font-extrabold text-slate-800 text-sm">{activeStep.label}</h4>
            </div>
            <span className="text-xs font-mono text-slate-400">{activeStep.file}</span>
          </div>

          <div className="p-6 space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 text-sm text-slate-700 leading-relaxed font-sans">
              <span className="font-extrabold text-slate-800 text-xs block mb-1">Execution Process description:</span>
              {activeStep.description}
            </div>

            {/* Code Highlight Snippet */}
            <div className="rounded-xl border border-slate-200 overflow-hidden text-xs font-mono bg-slate-950 text-slate-300">
              <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-2xs text-slate-500 shrink-0">
                <span className="flex items-center gap-1.5"><FileCode className="w-3.5 h-3.5 text-blue-500" /> Active Implementation logic</span>
                <span>line frame</span>
              </div>
              <pre className="p-4 leading-normal max-h-[175px] overflow-auto select-text text-slate-300 leading-relaxed">
                <code>{activeStep.code}</code>
              </pre>
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-400 font-sans">
            <span>Flow State Isolation: verified stable</span>
            <span className="flex items-center gap-1 text-emerald-600 font-bold"><Check className="w-3.5 h-3.5" /> Pipeline Audited</span>
          </div>
        </div>
      </div>
    </div>
  );
}
