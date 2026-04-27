import React, { useMemo } from "react";
import { Section } from "./Section";
import { VisualWorkflowDashboard } from "./VisualWorkflowDashboard";
import {
  buildWorkflowModel,
  buildXmlFromForm,
  validateXml,
  recommendMode,
  downloadText,
} from "../utils/workflowUtils";

export function BuilderMode({ form, setForm, xmlDraft, setXmlDraft }) {
  const model = useMemo(() => buildWorkflowModel(form), [form]);
  const blueprint = useMemo(() => {
    const lines = [];
    lines.push(`Workflow Type: ${form.workflowType}`);
    lines.push(`Vertical: ${form.vertical}`);
    lines.push(`Strategy: ${form.approvals.map((approval) => `${approval.name}=${approval.templateRule ? "SpreadsheetTemplate" : recommendMode(approval)}`).join(" | ")}`);
    lines.push("");
    lines.push("Folders");
    if (!model.folders.length) lines.push("- None required for current configuration");
    model.folders.forEach((folder) => lines.push(`- ${folder.name} [${folder.type}]`));
    lines.push("");
    lines.push("Steps");
    model.steps.forEach((step, index) => lines.push(`${index + 1}. ${step.name}`));
    lines.push("");
    lines.push("Activities");
    model.activities.forEach((activity) => {
      lines.push(`- ${activity.name} | type=${activity.type}${activity.folderRef ? ` | folder=${activity.folderRef}` : ""} | selection=${activity.folderSelectionRule}`);
      lines.push(`  rule: ${activity.rule || "(none)"}`);
    });
    lines.push("");
    lines.push("Relationships");
    model.relationships.forEach((rel) => lines.push(`- ${rel.previous} -> ${rel.next}`));
    return lines.join("\n");
  }, [form, model]);
  const validationIssues = useMemo(() => validateXml(xmlDraft), [xmlDraft]);

  const updateApproval = (id, patch) => {
    setForm((current) => ({
      ...current,
      approvals: current.approvals.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  };

  const regenerateXml = () => setXmlDraft(buildXmlFromForm(form));

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr,1fr]">
      <div className="space-y-6">
        <Section title="Builder: workflow structure" subtitle="Build folders, approvers, steps, and routing directly in the app.">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              <div className="mb-1 font-medium">Workflow type</div>
              <select value={form.workflowType} onChange={(event) => setForm((current) => ({ ...current, workflowType: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none">
                <option value="requisition">requisition</option>
                <option value="receipt">receipt</option>
                <option value="contract">contract</option>
              </select>
            </label>
            <label className="text-sm">
              <div className="mb-1 font-medium">Version description</div>
              <input value={form.versionDescription} onChange={(event) => setForm((current) => ({ ...current, versionDescription: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none" />
            </label>
            <label className="text-sm">
              <div className="mb-1 font-medium">Sample department</div>
              <input value={form.sampleDepartment} onChange={(event) => setForm((current) => ({ ...current, sampleDepartment: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none" />
            </label>
            <label className="text-sm">
              <div className="mb-1 font-medium">Sample commodity</div>
              <input value={form.sampleCommodity} onChange={(event) => setForm((current) => ({ ...current, sampleCommodity: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none" />
            </label>
            <label className="text-sm">
              <div className="mb-1 font-medium">Sample GL</div>
              <input value={form.sampleGl} onChange={(event) => setForm((current) => ({ ...current, sampleGl: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none" />
            </label>
            <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm mt-6">
              <input type="checkbox" checked={form.useInventoryRobot} onChange={(event) => setForm((current) => ({ ...current, useInventoryRobot: event.target.checked }))} /> Include inventory automation
            </label>
          </div>
          <div className="mt-4 space-y-4">
            {form.approvals.map((approval) => (
              <div key={approval.id} className="rounded-3xl border border-slate-200 p-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                  <label className="text-sm xl:col-span-2">
                    <div className="mb-1 font-medium">Step name</div>
                    <input value={approval.name} onChange={(event) => updateApproval(approval.id, { name: event.target.value })} className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none" />
                  </label>
                  <label className="text-sm">
                    <div className="mb-1 font-medium">Mode</div>
                    <select value={approval.mode} onChange={(event) => updateApproval(approval.id, { mode: event.target.value, folder: event.target.value === "adw" ? "" : approval.folder })} className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none">
                      <option value="static">static</option>
                      <option value="dynamic">dynamic</option>
                      <option value="adw">adw</option>
                    </select>
                  </label>
                  <label className="text-sm">
                    <div className="mb-1 font-medium">Driver</div>
                    <select value={approval.driver} onChange={(event) => updateApproval(approval.id, { driver: event.target.value })} className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none">
                      <option value="department">department</option>
                      <option value="commodity">commodity</option>
                      <option value="amount">amount</option>
                      <option value="glAccount">gl account</option>
                    </select>
                  </label>
                  <label className="text-sm">
                    <div className="mb-1 font-medium">Threshold</div>
                    <input value={approval.threshold} onChange={(event) => updateApproval(approval.id, { threshold: event.target.value })} className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none" />
                  </label>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <label className="text-sm">
                    <div className="mb-1 font-medium">Folder / approver group</div>
                    <input value={approval.folder} onChange={(event) => updateApproval(approval.id, { folder: event.target.value })} disabled={approval.mode === "adw" || (approval.mode === "dynamic" && approval.driver === "department")} className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none disabled:bg-slate-100" placeholder={approval.mode === "adw" ? "Not used for ADW" : approval.mode === "dynamic" && approval.driver === "department" ? "Not used for departmental routing" : "Folder name"} />
                  </label>
                  <label className="text-sm">
                    <div className="mb-1 font-medium">Custom rule override</div>
                    <input value={approval.templateRule || ""} onChange={(event) => updateApproval(approval.id, { templateRule: event.target.value })} className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none" placeholder="Optional raw rule expression" />
                  </label>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => setForm((current) => ({ ...current, approvals: [...current.approvals, { id: Date.now(), name: `Approval ${current.approvals.length + 1}`, mode: "adw", driver: "amount", threshold: "0", folder: "" }] }))} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">Add step</button>
            <button type="button" onClick={regenerateXml} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800">Generate XML from builder</button>
          </div>
        </Section>
      </div>
      <div className="space-y-6">
        <VisualWorkflowDashboard
          form={form}
          title="Builder: workflow dashboard"
          subtitle="Visualize the workflow steps and activities built from the XML model before export."
        />
        <Section title="Builder: workflow blueprint" subtitle="Visible folders, steps, activities, and relationships before export.">
          <pre className="max-h-[360px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-emerald-300">{blueprint}</pre>
        </Section>
        <Section title="Builder: XML" subtitle="Edit, validate, and export the builder output.">
          <textarea value={xmlDraft} onChange={(event) => setXmlDraft(event.target.value)} rows={18} className="w-full rounded-2xl border border-slate-200 bg-slate-950 px-3 py-3 font-mono text-xs leading-6 text-emerald-300 outline-none" />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => downloadText(`${form.workflowType}-builder.xml`, xmlDraft)} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">Export XML</button>
            <button type="button" onClick={() => downloadText(`${form.workflowType}-builder-blueprint.txt`, blueprint)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800">Export blueprint</button>
          </div>
          <div className="mt-4 space-y-2">
            {validationIssues.length === 0
              ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">No structural issues detected.</div>
              : validationIssues.map((issue) => <div key={issue} className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{issue}</div>)}
          </div>
        </Section>
      </div>
    </div>
  );
}
