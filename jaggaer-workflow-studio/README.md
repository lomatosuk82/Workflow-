# Jaggaer Approval Workflow Studio V7

A React application for generating Jaggaer approval workflow XML configurations. The app provides three different modes for creating workflows:

## Features

### Mode 1: Builder
Build workflow structure directly in the app with:
- Workflow type selection (requisition, receipt, contract)
- Approval step configuration (static, dynamic, ADW modes)
- Driver-based routing (department, commodity, amount, GL account)
- Threshold settings
- Custom rule overrides
- Visual workflow dashboard
- XML generation and export

### Mode 2: Template Import
Import customer spreadsheet templates to generate workflows:
- Excel file upload (.xlsx, .xls)
- Auto-detection of column mappings
- Multiple preset configurations (P2O validation, Order change, Monetary)
- Import diagnostics and preview
- XML generation from spreadsheet data

### Mode 3: Questionnaire
Generate workflows from customer questionnaire answers:
- Customer information capture
- Routing options (department, commodity, amount, GL)
- Industry vertical selection (Manufacturing, Healthcare, Higher Education, Public Sector, Life Sciences)
- Vertical-specific questions
- Workflow blueprint preview

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown in the terminal (typically http://localhost:5173)

## Build for Production

```bash
npm run build
```

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **xlsx** - Excel file parsing

## Project Structure

```
src/
├── components/
│   ├── BuilderMode.jsx      # Direct workflow builder
│   ├── TemplateMode.jsx     # Spreadsheet import mode
│   ├── QuestionnaireMode.jsx # Questionnaire-based generation
│   ├── Section.jsx          # Reusable section component
│   └── VisualWorkflowDashboard.jsx # Workflow visualization
├── utils/
│   └── workflowUtils.js     # Core workflow logic and XML generation
├── App.jsx                  # Main application component
├── main.jsx                 # Entry point
└── index.css               # Tailwind imports
```

## XML Output

The generated XML follows the Jaggaer ProcessDefinition DTD format and includes:
- WorkflowType and WorkflowSubType
- Steps with help attributes
- Activities (start, manual, automated, notification, end)
- Activity relationships
- Folder selection rules (Dummy, ExplicitFolder, MultiElementDynamic, Department)
- CDATA-wrapped rule expressions
