import React, { useState } from "react";
import { SmallTag } from "./components/Section";
import { BuilderMode } from "./components/BuilderMode";
import { TemplateMode } from "./components/TemplateMode";
import { QuestionnaireMode } from "./components/QuestionnaireMode";
import {
  BUILDER_DEFAULTS,
  QUESTIONNAIRE_DEFAULTS,
  buildXmlFromForm,
  questionnaireToForm,
} from "./utils/workflowUtils";

export default function App() {
  const [mode, setMode] = useState("builder");
  const [builderForm, setBuilderForm] = useState(BUILDER_DEFAULTS);
  const [builderXml, setBuilderXml] = useState(buildXmlFromForm(BUILDER_DEFAULTS));
  const [templateForm, setTemplateForm] = useState(BUILDER_DEFAULTS);
  const [templateXml, setTemplateXml] = useState(buildXmlFromForm(BUILDER_DEFAULTS));
  const [questionnaire, setQuestionnaire] = useState(QUESTIONNAIRE_DEFAULTS);
  const [questionnaireXml, setQuestionnaireXml] = useState(buildXmlFromForm(questionnaireToForm(QUESTIONNAIRE_DEFAULTS)));

  const recommendation = (() => {
    if (mode === "builder") return "Mode 1: build workflow structure directly in the app, then export XML.";
    if (mode === "template") return "Mode 2: use the customer spreadsheet template to generate XML for export.";
    return "Mode 3: use questionnaire answers to generate XML for export.";
  })();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl p-4 md:p-6">
        <div className="mb-6 rounded-[28px] bg-slate-900 p-6 text-white shadow-xl">
          <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
            <div>
              <div className="mb-2 text-sm text-slate-300">Jaggaer Approval Workflow Studio V7 Fixed</div>
              <h1 className="text-3xl font-semibold tracking-tight">Three workflow-generation options in one app.</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                This version separates the app into three explicit modes: direct workflow builder, customer template import, and customer questionnaire. Each mode can generate and export XML independently.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <SmallTag>Mode 1: app builder</SmallTag>
                <SmallTag>Mode 2: customer template</SmallTag>
                <SmallTag>Mode 3: questionnaire</SmallTag>
                <SmallTag>XML export</SmallTag>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-slate-300">Current focus</div>
              <div className="mt-2 text-lg font-semibold">{recommendation}</div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <button type="button" onClick={() => setMode("builder")} className={mode === "builder" ? "rounded-2xl bg-white px-3 py-3 text-sm font-medium text-slate-900" : "rounded-2xl bg-white/10 px-3 py-3 text-sm font-medium text-white"}>Builder</button>
                <button type="button" onClick={() => setMode("template")} className={mode === "template" ? "rounded-2xl bg-white px-3 py-3 text-sm font-medium text-slate-900" : "rounded-2xl bg-white/10 px-3 py-3 text-sm font-medium text-white"}>Template</button>
                <button type="button" onClick={() => setMode("questionnaire")} className={mode === "questionnaire" ? "rounded-2xl bg-white px-3 py-3 text-sm font-medium text-slate-900" : "rounded-2xl bg-white/10 px-3 py-3 text-sm font-medium text-white"}>Questionnaire</button>
              </div>
            </div>
          </div>
        </div>

        {mode === "builder" && <BuilderMode form={builderForm} setForm={setBuilderForm} xmlDraft={builderXml} setXmlDraft={setBuilderXml} />}
        {mode === "template" && <TemplateMode form={templateForm} setForm={setTemplateForm} templateXml={templateXml} setTemplateXml={setTemplateXml} />}
        {mode === "questionnaire" && <QuestionnaireMode questionnaire={questionnaire} setQuestionnaire={setQuestionnaire} questionnaireXml={questionnaireXml} setQuestionnaireXml={setQuestionnaireXml} />}
      </div>
    </div>
  );
}
