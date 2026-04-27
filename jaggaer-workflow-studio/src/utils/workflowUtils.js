export const verticals = {
  Manufacturing: {
    questions: [
      "Should direct materials, MRO, and capex follow different approval patterns?",
      "Do receipts require inventory creation or quality inspection automation?",
      "Which plants or departments require distinct approval chains?",
    ],
  },
  Healthcare: {
    questions: [
      "Which commodities require clinical, pharmacy, or patient-safety review?",
      "What urgent scenarios require accelerated routing?",
      "Which exceptions bypass standard routing?",
    ],
  },
  "Higher Education": {
    questions: [
      "Do grants or restricted funds override department approval?",
      "Do principal investigators approve by grant, department, or amount?",
      "Are there fiscal year-end hold requirements?",
    ],
  },
  "Public Sector": {
    questions: [
      "Which statutory thresholds require procurement intervention?",
      "Which categories require legal or policy review?",
      "How are overrides recorded for audit?",
    ],
  },
  "Life Sciences": {
    questions: [
      "Which categories require QA or EHS review?",
      "Which controlled items require separate notification or approval?",
      "What evidence is required for exception approval?",
    ],
  },
};

export const questionBank = {
  foundations: [
    "Which workflow type is being designed: requisition, receipt, contract approval, invoice, or another process?",
    "What business objective is the workflow solving: budget control, policy compliance, category oversight, inventory handling, legal review, or segregation of duties?",
    "Which approval dimensions materially change routing: department, commodity, amount, GL account, project, supplier, or custom field?",
    "Which conditions should create separate steps versus only different approvers within the same step?",
  ],
  governance: [
    "What are the approval thresholds by department, entity, or role?",
    "Which approvals expire, and is expiry driven by department, user, role, or specific GL accounts?",
    "Which exceptions bypass standard routing, and who is authorized to define or approve them?",
    "Are there mandatory reviewers for specific commodities or regulated categories?",
  ],
  technical: [
    "Which rules can be maintained by the customer in ADW versus hard-coded in XML?",
    "Which folders already exist, and which shared folders or robots must be created?",
    "Are there automated steps such as Create PO, Compile File, Create Inventory, or notification activities?",
    "What test cases are needed for positive, negative, exception, and expiry scenarios?",
  ],
};

export const worksheetPresets = [
  {
    id: "p2o_validation",
    label: "P2O validation",
    matchers: ["p2o", "validation"],
    defaultMode: "static",
    hints: {
      approval: ["approval name", "approvaluserid", "approver username", "approver"],
      ruleName: ["rule name", "mapping id", "ruleid"],
      commodity: ["commodity code", "category code", "commodity name", "updated category"],
      company: ["company code", "company name"],
      amount: ["total amount", "totalamount", "pr amount", "requisition amount", "requisitionamount"],
      amountDiff: ["amountdiff", "price increase", "orderprevordertotalamountdiff"],
      department: ["department"],
      costCenter: ["cost center"],
      glAccount: ["gl account", "account code"],
      internalOrder: ["internal order", "it internal order"],
      wbs: ["wbs element", "wbs"],
    },
  },
  {
    id: "order_change",
    label: "Order change",
    matchers: ["order", "change"],
    defaultMode: "static",
    hints: {
      approval: ["approval name", "approvaluserid", "approver username", "approver"],
      ruleName: ["rule name", "mapping id", "ruleid"],
      commodity: ["category code", "updated category"],
      company: ["company code", "company name"],
      amount: ["totalamount1", "pr amount", "total amount"],
      amountDiff: ["amountdiff1", "po price increase", "orderprevordertotalamountdiff"],
      department: ["department"],
      costCenter: ["cost center"],
      glAccount: ["gl account", "account code"],
      internalOrder: ["internal order", "it internal order"],
      wbs: ["wbs element", "wbs"],
    },
  },
  {
    id: "monetary",
    label: "Monetary",
    matchers: ["monetary"],
    defaultMode: "static",
    hints: {
      approval: ["approval name", "approvaluserid", "approver username", "approver"],
      ruleName: ["rule name", "mapping id", "ruleid"],
      commodity: ["category code"],
      company: ["company code", "company name"],
      amount: ["pr amount", "requisitionamount", "requisition amount", "total amount", "totalamount"],
      amountDiff: ["po price increase", "amountdiff1", "orderprevordertotalamountdiff"],
      department: ["department"],
      costCenter: ["cost center"],
      glAccount: ["gl account", "account code"],
      internalOrder: ["internal order", "it internal order"],
      wbs: ["wbs element", "wbs"],
    },
  },
];

export const EMPTY_MAPPING = {
  approval: "",
  ruleName: "",
  commodity: "",
  company: "",
  amount: "",
  amountDiff: "",
  department: "",
  costCenter: "",
  glAccount: "",
  internalOrder: "",
  wbs: "",
};

export const BUILDER_DEFAULTS = {
  workflowType: "requisition",
  versionDescription: "Generated by Jaggaer Approval Workflow Studio V7 Fixed",
  vertical: "Manufacturing",
  includeExpiration: true,
  expiryMode: "department",
  useInventoryRobot: false,
  sampleDepartment: "Operations",
  sampleCommodity: "Capex Equipment",
  sampleGl: "1505",
  approvals: [
    { id: 1, name: "Department Approval", mode: "dynamic", driver: "department", threshold: "0", folder: "" },
    { id: 2, name: "Commodity Specialist", mode: "adw", driver: "commodity", threshold: "0", folder: "" },
    { id: 3, name: "Capital Approval", mode: "adw", driver: "glAccount", threshold: "10000", folder: "" },
  ],
};

export const QUESTIONNAIRE_DEFAULTS = {
  customerName: "",
  workflowType: "requisition",
  vertical: "Manufacturing",
  versionDescription: "Generated from customer questionnaire",
  routeByDepartment: true,
  routeByCommodity: true,
  routeByAmount: true,
  routeByGl: false,
  includeExpiry: true,
  expiryMode: "department",
  highValueThreshold: "25000",
  departmentFolder: "Department Approval",
  commodityFolder: "Commodity Review",
  glFolder: "Finance Approval",
  needsInventoryRobot: false,
  notes: "",
};

export function normalizeHeader(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function pickHeader(headers, hints) {
  const normalized = headers.map((header) => ({ raw: header, norm: normalizeHeader(header) }));
  const found = normalized.find((item) => hints.some((hint) => item.norm.includes(hint)));
  return found ? found.raw : "";
}

export function detectPreset(sheetName) {
  const norm = normalizeHeader(sheetName);
  return worksheetPresets.find((preset) => preset.matchers.every((term) => norm.includes(term))) || worksheetPresets[0];
}

export function detectMapping(headers, preset) {
  const activePreset = preset || worksheetPresets[0];
  const next = { ...EMPTY_MAPPING };
  Object.keys(next).forEach((key) => {
    next[key] = activePreset.hints[key] ? pickHeader(headers, activePreset.hints[key]) : "";
  });
  return next;
}

export function parseThreshold(raw) {
  const text = String(raw || "").trim();
  if (!text) return "";
  const kMatch = text.match(/(\d+(?:\.\d+)?)\s*k/i);
  if (kMatch) return String(Math.round(Number(kMatch[1]) * 1000));
  const comparator = text.match(/(?:>=|=>|>|=)\s*(\d+(?:\.\d+)?)/);
  if (comparator) return String(Number(comparator[1]));
  const anyNum = text.match(/(\d+(?:\.\d+)?)/);
  return anyNum ? String(Number(anyNum[1])) : "";
}

export function isAllActive(value) {
  return /all\s*active/i.test(String(value || ""));
}

export function normalizeInternalOrder(raw) {
  const text = String(raw || "").trim();
  if (!text) return "";
  const startsWith = text.match(/starts\s+with\s+(.+)/i);
  if (startsWith) {
    return `Document.CustomFieldValues("Internal Order").StartsWith("${startsWith[1].trim()}") == true`;
  }
  return `[Document.CustomFieldValues("Internal Order") in {"${text}"}]`;
}

export function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function slugify(value) {
  return String(value || "")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join("") || "Activity";
}

export function recommendMode(step) {
  if (step.mode === "adw") return "ADW";
  if (step.mode === "dynamic") return "Dynamic";
  return "Static";
}

export function buildRuleFromForm(form, step) {
  const threshold = Number(step.threshold || 0);
  if (step.templateRule) return step.templateRule;
  if (step.mode === "adw") return `Document.RequiresRuleGroupEvaluation("${step.name}") == true`;
  if (step.mode === "dynamic" && step.driver === "department") {
    return threshold > 0
      ? `Document.RequiresDepartmentalApproval() == true && [Document.TotalAmount() >= ${threshold}]` 
      : `Document.RequiresDepartmentalApproval() == true`;
  }
  if (step.driver === "department") {
    return threshold > 0
      ? `[Document.CustomFieldValues("Department") in {"${form.sampleDepartment}"}] && [Document.TotalAmount() >= ${threshold}]` 
      : `[Document.CustomFieldValues("Department") in {"${form.sampleDepartment}"}]`;
  }
  if (step.driver === "commodity") {
    return `[Document.CustomFieldValues("Commodity Code") in {"${form.sampleCommodity}"}]`;
  }
  if (step.driver === "glAccount") {
    return threshold > 0
      ? `[Document.AccountCode() in {"${form.sampleGl}"}] && [Document.TotalAmount() >= ${threshold}]` 
      : `[Document.AccountCode() in {"${form.sampleGl}"}]`;
  }
  return `Document.TotalAmount() >= ${threshold || 1}`;
}

export function buildWorkflowModel(form) {
  const steps = [];
  const activities = [];
  const relationships = [];
  const folders = [];

  const addStep = (name, help) => {
    if (name && !steps.some((step) => step.name === name)) {
      steps.push({ name, help });
    }
  };

  const addFolder = (name, type) => {
    if (name && !folders.some((folder) => folder.name === name)) {
      folders.push({ name, type });
    }
  };

  activities.push({ name: "START", type: "start", folderSelectionRule: "Dummy", rule: "" });

  form.approvals.forEach((step) => {
    const folderSelectionRule = step.mode === "adw"
      ? "MultiElementDynamic"
      : step.mode === "dynamic" && step.driver === "department"
        ? "Department"
        : "ExplicitFolder";
    const folderRef = folderSelectionRule === "ExplicitFolder" ? (step.folder || "") : "";
    const attrs = [];

    if (step.mode === "adw") {
      attrs.push({ name: "RuleGroupInternalName", value: step.name });
    }
    attrs.push({
      name: "wfActivityHelp",
      value: step.templateRule ? "Spreadsheet-driven approval activity." : `${recommendMode(step)} approval driven by ${step.driver}.`,
    });
    if (form.includeExpiration) {
      attrs.push({
        name: "wfActivitySupportNote",
        value: step.templateRule
          ? `Imported rows: ${step.importedRows || 1}. Approver group: ${step.importedApprover || step.folder || step.name}.` 
          : `Validate delegation and expiry handling by ${form.expiryMode}.`,
      });
    }

    activities.push({
      name: slugify(step.name),
      type: "manual",
      stepName: step.name,
      folderRef,
      folderSelectionRule,
      rule: buildRuleFromForm(form, step),
      attrs,
    });

    addStep(step.name, `Workflow step for ${step.name}.`);
    if (folderRef) addFolder(folderRef, "shared");
  });

  if (["Healthcare", "Life Sciences"].includes(form.vertical)) {
    activities.push({
      name: "SafetyNotification",
      type: "notification",
      folderRef: "Safety Notification",
      folderSelectionRule: "ExplicitFolder",
      rule: `[Product.HazMat = true || Product.Controlled = true]`,
      attrs: [{ name: "wfActivityHelp", value: "Notification for regulated or hazardous items." }],
    });
    addFolder("Safety Notification", "shared");
  }

  if (form.workflowType === "receipt" && form.useInventoryRobot) {
    activities.push({
      name: "CreateInventory",
      type: "automated",
      stepName: "Create Inventory Receipts",
      folderRef: "Create Inventory",
      folderSelectionRule: "ExplicitFolder",
      rule: "true",
      attrs: [{ name: "wfActivityHelp", value: "Automated inventory receipt creation." }],
    });
    addStep("Create Inventory Receipts", "System step to create inventory receipts.");
    addFolder("Create Inventory", "automated");
  }

  activities.push({ name: "END", type: "end", folderSelectionRule: "Dummy", rule: "" });

  for (let index = 0; index < activities.length - 1; index += 1) {
    relationships.push({ previous: activities[index].name, next: activities[index + 1].name });
  }

  return { steps, activities, relationships, folders };
}

export function buildXmlFromForm(form) {
  const model = buildWorkflowModel(form);
  const subtype = form.workflowType === "contract" ? "  <WorkflowSubType>Approval</WorkflowSubType>\n" : "";
  const stepsXml = model.steps
    .map((step) => `  <Step name="${escapeXml(step.name)}">\n    <Attribute name="wfActivityHelp">\n      <AttrValue lang="default">${escapeXml(step.help)}</AttrValue>\n    </Attribute>\n  </Step>`)
    .join("\n");
  const activitiesXml = model.activities
    .map((activity) => {
      const stepRef = activity.stepName ? `\n    <StepRef name="${escapeXml(activity.stepName)}" />` : "";
      const folderRef = activity.folderRef ? `\n    <FolderRef name="${escapeXml(activity.folderRef)}" />` : "";
      const attrs = (activity.attrs || [])
        .map((attr) => `\n    <Attribute name="${escapeXml(attr.name)}">\n      <AttrValue lang="default">${escapeXml(attr.value)}</AttrValue>\n    </Attribute>`)
        .join("");
      const ruleXml = activity.rule ? `<![CDATA[${activity.rule}]]>` : "";
      return `  <Activity name="${escapeXml(activity.name)}">\n    <ActivityType>${escapeXml(activity.type)}</ActivityType>${stepRef}${folderRef}\n    <Rule>${ruleXml}</Rule>\n    <FolderSelectionRule>${escapeXml(activity.folderSelectionRule)}</FolderSelectionRule>${attrs}\n  </Activity>`;
    })
    .join("\n");
  const relationshipsXml = model.relationships
    .map((rel) => `  <ActivityRelationship previous="${escapeXml(rel.previous)}" next="${escapeXml(rel.next)}" />`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE ProcessDefinition SYSTEM "https://usertest.sciquest.com/app_docs/dtd/workflow/WorkflowDefinition.dtd">\n<ProcessDefinition>\n  <WorkflowType>${escapeXml(form.workflowType)}</WorkflowType>\n${subtype}  <Usable>true</Usable>\n  <Version>1</Version>\n  <VersionDescription>${escapeXml(form.versionDescription)}</VersionDescription>\n  <!--====== Steps ======-->\n${stepsXml}\n  <!--====== Activities ======-->\n${activitiesXml}\n  <!--====== Activity relationships ======-->\n${relationshipsXml}\n</ProcessDefinition>`;
}

export function questionnaireToForm(questionnaire) {
  const approvals = [];
  if (questionnaire.routeByDepartment) {
    approvals.push({ id: 1, name: "Department Approval", mode: "dynamic", driver: "department", threshold: "0", folder: questionnaire.departmentFolder || "" });
  }
  if (questionnaire.routeByCommodity) {
    approvals.push({ id: 2, name: "Commodity Review", mode: "static", driver: "commodity", threshold: "0", folder: questionnaire.commodityFolder || "Commodity Review" });
  }
  if (questionnaire.routeByAmount) {
    approvals.push({ id: 3, name: "High Value Approval", mode: "adw", driver: "amount", threshold: questionnaire.highValueThreshold || "25000", folder: "" });
  }
  if (questionnaire.routeByGl) {
    approvals.push({ id: 4, name: "GL Approval", mode: "static", driver: "glAccount", threshold: "0", folder: questionnaire.glFolder || "Finance Approval" });
  }
  return {
    workflowType: questionnaire.workflowType,
    versionDescription: questionnaire.versionDescription || "Generated from customer questionnaire",
    vertical: questionnaire.vertical,
    includeExpiration: questionnaire.includeExpiry,
    expiryMode: questionnaire.expiryMode,
    useInventoryRobot: questionnaire.needsInventoryRobot,
    sampleDepartment: "Customer Department",
    sampleCommodity: "Customer Commodity",
    sampleGl: "Customer GL",
    approvals,
  };
}

export function validateXml(xml) {
  const issues = [];
  if (!xml.includes("<ProcessDefinition>")) issues.push("Missing <ProcessDefinition> root.");
  if (!xml.includes("<WorkflowType>")) issues.push("Missing <WorkflowType>.");
  if (!xml.includes('<Activity name="START">')) issues.push("Missing START activity.");
  if (!xml.includes('<Activity name="END">')) issues.push("Missing END activity.");
  if (!xml.includes("<ActivityRelationship")) issues.push("Missing activity relationships section.");
  const validSelections = ["Dummy", "ExplicitFolder", "MultiElementDynamic", "Department"];
  Array.from(xml.matchAll(/<FolderSelectionRule>([^<]+)<\/FolderSelectionRule>/g)).forEach((match) => {
    if (!validSelections.includes(match[1])) {
      issues.push(`Unsupported FolderSelectionRule: ${match[1]}`);
    }
  });
  return issues;
}

export function buildImportedRowCondition(row, mapping, diagnostics) {
  const parts = [];
  const commodity = mapping.commodity ? row[mapping.commodity] : "";
  const company = mapping.company ? row[mapping.company] : "";
  const department = mapping.department ? row[mapping.department] : "";
  const costCenter = mapping.costCenter ? row[mapping.costCenter] : "";
  const glAccount = mapping.glAccount ? row[mapping.glAccount] : "";
  const internalOrder = mapping.internalOrder ? row[mapping.internalOrder] : "";
  const wbs = mapping.wbs ? row[mapping.wbs] : "";
  const amount = mapping.amount ? row[mapping.amount] : "";
  const amountDiff = mapping.amountDiff ? row[mapping.amountDiff] : "";

  if (commodity) parts.push(`[Document.CustomFieldValues("Commodity Code") in {"${commodity}"}]`);
  if (company) {
    if (isAllActive(company)) diagnostics.allActiveCount += 1;
    else parts.push(`[Document.CustomFieldValues("Company Code") in {"${company}"}]`);
  }
  if (department) parts.push(`[Document.CustomFieldValues("Department") in {"${department}"}]`);
  if (costCenter) parts.push(`[Document.CustomFieldValues("Cost Center") in {"${costCenter}"}]`);
  if (glAccount) parts.push(`[Document.AccountCode() in {"${glAccount}"}]`);
  if (wbs) parts.push(`[Document.CustomFieldValues("WBS Element") in {"${wbs}"}]`);
  if (internalOrder) {
    const condition = normalizeInternalOrder(internalOrder);
    if (condition.includes("StartsWith")) diagnostics.startsWithCount += 1;
    parts.push(condition);
  }
  const threshold = parseThreshold(amount);
  if (threshold) parts.push(`[Document.TotalAmount() >= ${threshold}]`);
  if (amountDiff) {
    diagnostics.changeAmountCount += 1;
    parts.push(`[${String(amountDiff).replace(/=>/g, ">=")}]`);
  }
  return parts.length ? parts.join(" && ") : "true";
}

export function importApprovalsFromSheet(rows, mapping, preset) {
  const diagnostics = {
    rowCount: rows.length,
    allActiveCount: 0,
    startsWithCount: 0,
    changeAmountCount: 0,
    missingApproverRows: 0,
  };

  if (!rows.length || !mapping.approval) {
    return { approvals: [], summary: null };
  }

  const groups = new Map();
  rows.forEach((row, idx) => {
    const approver = String(row[mapping.approval] || "").trim();
    const key = approver || `Imported Approver ${idx + 1}`;
    if (!approver) diagnostics.missingApproverRows += 1;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  });

  const approvals = Array.from(groups.entries()).slice(0, 25).map(([approver, groupRows], index) => {
    const first = groupRows[0];
    const ruleName = mapping.ruleName ? first[mapping.ruleName] : "";
    const amountValue = mapping.amount ? first[mapping.amount] : "";
    const templateRule = groupRows
      .map((row) => buildImportedRowCondition(row, mapping, diagnostics))
      .map((condition) => `(${condition})`)
      .join(" || ") || "true";

    let driver = "amount";
    if (mapping.commodity && first[mapping.commodity]) driver = "commodity";
    else if ((mapping.department && first[mapping.department]) || (mapping.company && first[mapping.company]) || (mapping.costCenter && first[mapping.costCenter])) driver = "department";
    else if (mapping.glAccount && first[mapping.glAccount]) driver = "glAccount";

    return {
      id: Date.now() + index,
      name: String(ruleName || approver).slice(0, 90),
      mode: preset.defaultMode || "static",
      driver,
      threshold: parseThreshold(amountValue) || "0",
      folder: String(approver).slice(0, 90),
      templateRule,
      importedRows: groupRows.length,
      importedApprover: approver || `Imported Approver ${index + 1}`,
    };
  });

  return {
    approvals,
    summary: {
      rowCount: diagnostics.rowCount,
      groupCount: approvals.length,
      allActiveCount: diagnostics.allActiveCount,
      startsWithCount: diagnostics.startsWithCount,
      changeAmountCount: diagnostics.changeAmountCount,
      missingApproverRows: diagnostics.missingApproverRows,
      groups: approvals.slice(0, 8).map((item) => ({
        name: item.name,
        rows: item.importedRows,
        driver: item.driver,
        folder: item.folder,
      })),
    },
  };
}

export function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
