import React, { useMemo } from "react";
import { Section } from "./Section";
import { VisualWorkflowDashboard } from "./VisualWorkflowDashboard";
import {
  verticals,
  questionBank,
  questionnaireToForm,
  buildWorkflowModel,
  buildXmlFromForm,
  validateXml,
  downloadText,
} from "../utils/workflowUtils";

export function QuestionnaireMode({ questionnaire, setQuestionnaire, questionnaireXml, setQuestionnaireXml }) {
  const formFromQuestions = useMemo(() => questionnaireToForm(questionnaire), [questionnaire]);
  const blueprint = useMemo(() => {
    const model = buildWorkflowModel(formFromQuestions);
    const lines = [];
    lines.push(`Customer: ${questionnaire.customerName || "(not set)"}`);
    lines.push(`Workflow Type: ${questionnaire.workflowType}`);
    lines.push(`Vertical: ${questionnaire.vertical}`);
    lines.push(`Department routing: ${questionnaire.routeByDepartment ? "Yes" : "No"}`);
    lines.push(`Commodity routing: ${questionnaire.routeByCommodity ? "Yes" : "No"}`);
    lines.push(`Amount routing: ${questionnaire.routeByAmount ? `Yes, threshold ${questionnaire.highValueThreshold}` : "No"}`);
    lines.push(`GL routing: ${questionnaire.routeByGl ? "Yes" : "No"}`);
    lines.push("");
    lines.push("Generated steps");
    model.steps.forEach((step, index) => lines.push(`${index + 1}. ${step.name}`));
    return lines.join("\n");
  }, [questionnaire, formFromQuestions]);
  const validationIssues = useMemo(() => validateXml(questionnaireXml), [questionnaireXml]);
  const questions = useMemo(() => [
    ...questionBank.foundations,
    ...questionBank.governance,
    ...(verticals[questionnaire.vertical]?.questions || []),
    ...questionBank.technical,
  ], [questionnaire.vertical]);

  const generateFromQuestions = () => setQuestionnaireXml(buildXmlFromForm(formFromQuestions));

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr,1fr]">
      <div className="space-y-6">
        <Section title="Questionnaire: customer answers" subtitle="Use questions to capture customer decisions and generate workflow XML from their answers.">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              <div className="mb-1 font-medium">Customer name</div>
              <input value={questionnaire.customerName} onChange={(event) => setQuestionnaire((current) => ({ ...current, customerName: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none" />
            </label>
            <label className="text-sm">
              <div className="mb-1 font-medium">Workflow type</div>
              <select value={questionnaire.workflowType} onChange={(event) => setQuestionnaire((current) => ({ ...current, workflowType: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none">
                <option value="requisition">requisition</option>
                <option value="receipt">receipt</option>
                <option value="contract">contract</option>
              </select>
            </label>
            <label className="text-sm">
              <div className="mb-1 font-medium">Vertical</div>
              <select value={questionnaire.vertical} onChange={(event) => setQuestionnaire((current) => ({ ...current, vertical: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none">
                {Object.keys(verticals).map((vertical) => <option key={vertical} value={vertical}>{vertical}</option>)}
              </select>
            </label>
            <label className="text-sm">
              <div className="mb-1 font-medium">High value threshold</div>
              <input value={questionnaire.highValueThreshold} onChange={(event) => setQuestionnaire((current) => ({ ...current, highValueThreshold: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none" />
            </label>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"><input type="checkbox" checked={questionnaire.routeByDepartment} onChange={(event) => setQuestionnaire((current) => ({ ...current, routeByDepartment: event.target.checked }))} /> Route by department</label>
            <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"><input type="checkbox" checked={questionnaire.routeByCommodity} onChange={(event) => setQuestionnaire((current) => ({ ...current, routeByCommodity: event.target.checked }))} /> Route by commodity</label>
            <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"><input type="checkbox" checked={questionnaire.routeByAmount} onChange={(event) => setQuestionnaire((current) => ({ ...current, routeByAmount: event.target.checked }))} /> Route by amount</label>
            <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"><input type="checkbox" checked={questionnaire.routeByGl} onChange={(event) => setQuestionnaire((current) => ({ ...current, routeByGl: event.target.checked }))} /> Route by GL</label>
            <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"><input type="checkbox" checked={questionnaire.includeExpiry} onChange={(event) => setQuestionnaire((current) => ({ ...current, includeExpiry: event.target.checked }))} /> Include expiry logic</label>
            <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"><input type="checkbox" checked={questionnaire.needsInventoryRobot} onChange={(event) => setQuestionnaire((current) => ({ ...current, needsInventoryRobot: event.target.checked }))} /> Include inventory automation</label>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <label className="text-sm">
              <div className="mb-1 font-medium">Department folder</div>
              <input value={questionnaire.departmentFolder} onChange={(event) => setQuestionnaire((current) => ({ ...current, departmentFolder: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none" />
            </label>
            <label className="text-sm">
              <div className="mb-1 font-medium">Commodity folder</div>
              <input value={questionnaire.commodityFolder} onChange={(event) => setQuestionnaire((current) => ({ ...current, commodityFolder: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none" />
            </label>
            <label className="text-sm">
              <div className="mb-1 font-medium">GL folder</div>
              <input value={questionnaire.glFolder} onChange={(event) => setQuestionnaire((current) => ({ ...current, glFolder: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none" />
            </label>
          </div>
          <textarea value={questionnaire.notes} onChange={(event) => setQuestionnaire((current) => ({ ...current, notes: event.target.value }))} rows={4} className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none" placeholder="Customer answers, assumptions, exceptions, and notes" />
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={generateFromQuestions} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">Generate XML from questionnaire</button>
          </div>
        </Section>
        <Section title="Questionnaire: prompts" subtitle="A customer-facing question list the consultant can use in a workshop.">
          <div className="space-y-2">
            {questions.map((question, index) => <div key={question} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"><span className="mr-2 font-semibold text-slate-900">Q{index + 1}.</span>{question}</div>)}
          </div>
        </Section>
      </div>
      <div className="space-y-6">
        <VisualWorkflowDashboard
          form={formFromQuestions}
          title="Questionnaire: workflow dashboard"
          subtitle="Visualize the workflow generated from customer answers before exporting XML."
        />
        <Section title="Questionnaire: generated workflow" subtitle="Preview the workflow shape before exporting XML.">
          <pre className="max-h-[260px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-emerald-300">{blueprint}</pre>
        </Section>
        <Section title="Questionnaire: XML" subtitle="Review, validate, and export XML generated from customer answers.">
          <textarea value={questionnaireXml} onChange={(event) => setQuestionnaireXml(event.target.value)} rows={18} className="w-full rounded-2xl border border-slate-200 bg-slate-950 px-3 py-3 font-mono text-xs leading-6 text-emerald-300 outline-none" />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => downloadText(`${questionnaire.workflowType}-questionnaire.xml`, questionnaireXml)} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">Export XML</button>
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
