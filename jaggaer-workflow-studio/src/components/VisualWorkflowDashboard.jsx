import React, { useMemo } from "react";
import { Section } from "./Section";
import { buildWorkflowModel } from "../utils/workflowUtils";

export function VisualWorkflowDashboard({ form, title, subtitle }) {
  const model = useMemo(() => buildWorkflowModel(form), [form]);
  const visualNodes = model.activities.map((activity) => {
    if (activity.name === "START" || activity.name === "END") {
      return { id: activity.name, label: activity.name, kind: activity.type };
    }
    return {
      id: activity.name,
      label: activity.stepName || activity.name,
      kind: activity.type,
    };
  });

  const kindStyle = (kind) => {
    if (kind === "start" || kind === "end") return "border-slate-300 bg-slate-50 text-slate-700";
    if (kind === "automated") return "border-emerald-300 bg-emerald-50 text-emerald-800";
    if (kind === "notification") return "border-amber-300 bg-amber-50 text-amber-800";
    return "border-sky-300 bg-sky-50 text-sky-800";
  };

  return (
    <Section title={title} subtitle={subtitle}>
      <div className="rounded-2xl border-4 border-sky-600/60 bg-white p-4">
        <div className="mb-2 text-sm font-medium text-slate-700">Workflow process</div>
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max items-center gap-3">
            {visualNodes.map((node, index) => (
              <React.Fragment key={node.id}>
                <div className={`min-w-[150px] rounded-2xl border px-4 py-3 text-center text-sm font-semibold shadow-sm ${kindStyle(node.kind)}`}>
                  {node.label}
                </div>
                {index < visualNodes.length - 1 ? <div className="h-0.5 w-10 bg-slate-300" /> : null}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border-4 border-sky-600/60 bg-white p-4">
          <div className="mb-3 text-sm font-semibold text-slate-900">Steps</div>
          <div className="space-y-3 text-sm text-slate-700">
            {model.steps.length === 0 ? (
              <div>No steps defined.</div>
            ) : (
              model.steps.map((step) => (
                <div key={step.name} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="font-semibold text-slate-900">{step.name}</div>
                  <div className="mt-1 text-xs text-slate-600">{step.help}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border-4 border-amber-500/70 bg-white p-4">
          <div className="mb-3 text-sm font-semibold text-slate-900">Activities</div>
          <div className="space-y-3 text-sm text-slate-700 max-h-[420px] overflow-auto pr-1">
            {model.activities.map((activity) => (
              <div key={activity.name} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="font-semibold text-slate-900">{activity.name}</div>
                <div className="mt-1 text-xs text-slate-600">
                  {activity.type}
                  {activity.stepName ? ` | Step: ${activity.stepName}` : ""}
                  {activity.folderRef ? ` | Folder: ${activity.folderRef}` : ""}
                  {activity.folderSelectionRule ? ` | ${activity.folderSelectionRule}` : ""}
                </div>
                <div className="mt-2 rounded-lg bg-white px-2 py-2 font-mono text-[11px] leading-5 text-slate-700">
                  {activity.rule || "(no rule)"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
