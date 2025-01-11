// Common task templates to help make tasks more concrete
export const taskTemplates = {
  development: {
    setup: [
      "Set up development environment",
      "Install required dependencies",
      "Configure development tools",
      "Set up version control"
    ],
    planning: [
      "Create technical specification",
      "Break down requirements",
      "Design system architecture",
      "Create test plan"
    ],
    implementation: [
      "Implement core functionality",
      "Add error handling",
      "Write unit tests",
      "Perform code review"
    ],
    testing: [
      "Run unit tests",
      "Perform integration testing",
      "Conduct user acceptance testing",
      "Document test results"
    ],
    deployment: [
      "Prepare deployment environment",
      "Deploy to staging",
      "Conduct final testing",
      "Deploy to production"
    ]
  },
  research: {
    preparation: [
      "Define research objectives",
      "Review existing literature",
      "Identify key resources",
      "Create research timeline"
    ],
    datacollection: [
      "Design data collection methods",
      "Create data collection tools",
      "Collect primary data",
      "Organize raw data"
    ],
    analysis: [
      "Clean and prepare data",
      "Perform initial analysis",
      "Identify patterns",
      "Draw conclusions"
    ],
    reporting: [
      "Create outline",
      "Write first draft",
      "Review and revise",
      "Prepare final report"
    ]
  },
  marketing: {
    planning: [
      "Define target audience",
      "Set campaign objectives",
      "Develop messaging strategy",
      "Create campaign timeline"
    ],
    content: [
      "Create content calendar",
      "Develop key messages",
      "Design creative assets",
      "Write copy"
    ],
    execution: [
      "Set up tracking",
      "Launch campaign",
      "Monitor performance",
      "Optimize based on data"
    ],
    reporting: [
      "Collect campaign data",
      "Analyze results",
      "Create performance report",
      "Present findings"
    ]
  }
};

export const taskTips = {
  development: {
    "Set up development environment": [
      "Document all installation steps",
      "Use version managers for languages/tools",
      "Create automated setup scripts",
      "Test setup on clean machine"
    ],
    "Create technical specification": [
      "Include clear acceptance criteria",
      "Define API contracts early",
      "Document assumptions",
      "Consider edge cases"
    ]
  },
  research: {
    "Define research objectives": [
      "Use SMART criteria",
      "Align with project goals",
      "Consider resource constraints",
      "Define success metrics"
    ],
    "Review existing literature": [
      "Use systematic search approach",
      "Create summary matrix",
      "Identify key themes",
      "Note contradictions"
    ]
  },
  marketing: {
    "Define target audience": [
      "Create detailed personas",
      "Use demographic data",
      "Consider psychographics",
      "Map customer journey"
    ],
    "Create content calendar": [
      "Align with key dates",
      "Balance content types",
      "Plan content clusters",
      "Include distribution channels"
    ]
  }
};

export const makeTaskConcrete = (task: string): string => {
  return task
    .replace(/improve/i, "increase specific metric by X%")
    .replace(/enhance/i, "add specific feature or functionality")
    .replace(/optimize/i, "reduce processing time by X seconds")
    .replace(/review/i, "analyze and document specific aspects")
    .replace(/update/i, "modify specific components with exact changes")
    .replace(/implement/i, "code specific feature with defined scope")
    .replace(/test/i, "verify specific functionality using defined test cases")
    .replace(/research/i, "investigate specific topic and document findings")
    .replace(/plan/i, "create detailed timeline with milestones")
    .replace(/analyze/i, "examine specific data and create report");
};