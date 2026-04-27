import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Section } from "./Section";
import { VisualWorkflowDashboard } from "./VisualWorkflowDashboard";
import {
  worksheetPresets,
  EMPTY_MAPPING,
  detectPreset,
  detectMapping,
  importApprovalsFromSheet,
  buildXmlFromForm,
  validateXml,
  downloadText,
} from "../utils/workflowUtils";

export function TemplateMode({ form, setForm, templateXml, setTemplateXml }) {
  const [workbookName, setWorkbookName] = useState("");
  const [sheets, setSheets] = useState({});
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [sheetRows, setSheetRows] = useState([]);
  const [presetId, setPresetId] = useState(worksheetPresets[0].id);
  const [mapping, setMapping] = useState({ ...EMPTY_MAPPING });
  const [importSummary, setImportSummary] = useState(null);
  const headers = useMemo(() => (sheetRows.length ? Object.keys(sheetRows[0]) : []), [sheetRows]);
  const activePreset = useMemo(() => worksheetPresets.find((preset) => preset.id === presetId) || worksheetPresets[0], [presetId]);
  const validationIssues = useMemo(() => validateXml(templateXml), [templateXml]);

  const applyRows = (sheetName, workbookSheets, forcedPresetId) => {
    const rows = workbookSheets[sheetName] || [];
    const preset = forcedPresetId ? (worksheetPresets.find((item) => item.id === forcedPresetId) || worksheetPresets[0]) : detectPreset(sheetName);
    setSelectedSheet(sheetName);
    setSheetRows(rows);
    setPresetId(preset.id);
    setMapping(rows.length ? detectMapping(Object.keys(rows[0]), preset) : { ...EMPTY_MAPPING });
    setImportSummary(null);
  };

  const uploadWorkbook = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const nextSheets = {};
    (workbook.SheetNames || []).forEach((name) => {
      nextSheets[name] = XLSX.utils.sheet_to_json(workbook.Sheets[name], { defval: "" });
    });
    const firstSheet = workbook.SheetNames[0] || "";
    setWorkbookName(file.name);
    setSheets(nextSheets);
    setSheetNames(workbook.SheetNames || []);
    if (firstSheet) applyRows(firstSheet, nextSheets, "");
  };

  const buildFromSpreadsheet = () => {
    const result = importApprovalsFromSheet(sheetRows, mapping, activePreset);
    setImportSummary(result.summary);
    if (!result.approvals.length) return;
    const nextForm = { ...form, approvals: result.approvals };
    setForm(nextForm);
    setTemplateXml(buildXmlFromForm(nextForm));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr,1fr]">
      <div className="space-y-6">
        <Section title="Template import: spreadsheet source" subtitle="Use the customer data collection template to generate workflow XML.">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              <div className="mb-1 font-medium">Upload customer template</div>
              <input type="file" accept=".xlsx,.xls" onChange={uploadWorkbook} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
            </label>
            <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-medium text-slate-900">Loaded workbook</div>
              <div className="mt-1">{workbookName || "No workbook loaded yet"}</div>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <label className="text-sm">
              <div className="mb-1 font-medium">Worksheet</div>
              <select value={selectedSheet} onChange={(event) => applyRows(event.target.value, sheets, presetId)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none">
                <option value="">Select sheet</option>
                {sheetNames.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <label className="text-sm">
              <div className="mb-1 font-medium">Sheet preset</div>
              <select value={presetId} onChange={(event) => { const nextPresetId = event.target.value; const nextPreset = worksheetPresets.find((item) => item.id === nextPresetId) || worksheetPresets[0]; setPresetId(nextPresetId); setMapping(detectMapping(headers, nextPreset)); }} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none">
                {worksheetPresets.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
              </select>
            </label>
            <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-medium text-slate-900">Detected headers</div>
              <div className="mt-1">{headers.length ? headers.join(" | ") : "No rows loaded yet"}</div>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Object.keys(mapping).map((key) => (
              <label key={key} className="text-sm">
                <div className="mb-1 font-medium">{key}</div>
                <select value={mapping[key]} onChange={(event) => setMapping((current) => ({ ...current, [key]: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none">
                  <option value="">Not mapped</option>
                  {headers.map((header) => <option key={header} value={header}>{header}</option>)}
                </select>
              </label>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => setMapping(detectMapping(headers, activePreset))} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800">Auto-detect columns</button>
            <button type="button" onClick={buildFromSpreadsheet} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">Generate XML from customer template</button>
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
              <div className="font-medium text-slate-900">Sheet preview</div>
              <div className="mt-2 max-h-56 overflow-auto space-y-2">
                {sheetRows.length === 0
                  ? <div>No rows loaded yet.</div>
                  : sheetRows.slice(0, 6).map((row, index) => <div key={index} className="rounded-xl bg-slate-50 p-2 text-xs">{headers.slice(0, 6).map((header) => `${header}=${row[header]}`).join(" | ")}</div>)}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
              <div className="font-medium text-slate-900">Import diagnostics</div>
              {!importSummary
                ? <div className="mt-2">No import summary yet.</div>
                : <div className="mt-2 space-y-2">
                    <div>Rows processed: {importSummary.rowCount}</div>
                    <div>Approval groups built: {importSummary.groupCount}</div>
                    <div>All Active normalized: {importSummary.allActiveCount}</div>
                    <div>Starts With normalized: {importSummary.startsWithCount}</div>
                    <div>Change-amount rules: {importSummary.changeAmountCount}</div>
                    <div>Rows missing approver: {importSummary.missingApproverRows}</div>
                    <div className="pt-2">
                      <div className="font-medium text-slate-900">Group preview</div>
                      <div className="mt-2 max-h-40 overflow-auto space-y-2">
                        {importSummary.groups.map((group) => <div key={group.name} className="rounded-xl bg-slate-50 p-2 text-xs">{group.name} | rows={group.rows} | driver={group.driver} | folder={group.folder}</div>)}
                      </div>
                    </div>
                  </div>}
            </div>
          </div>
        </Section>
      </div>
      <div className="space-y-6">
        <VisualWorkflowDashboard
          form={form}
          title="Template import: workflow dashboard"
          subtitle="Visualize the workflow generated from the customer template before exporting XML."
        />
        <Section title="Template import: XML output" subtitle="Review, validate, and export the XML generated from the customer template.">
          <textarea value={templateXml} onChange={(event) => setTemplateXml(event.target.value)} rows={20} className="w-full rounded-2xl border border-slate-200 bg-slate-950 px-3 py-3 font-mono text-xs leading-6 text-emerald-300 outline-none" />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => downloadText(`${form.workflowType}-template.xml`, templateXml)} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">Export XML</button>
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
