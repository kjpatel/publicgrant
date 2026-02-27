// Standard proposal sections for grant applications
export const PROPOSAL_SECTIONS = [
  {
    key: "narrative",
    label: "Project Narrative",
    description:
      "Describe the project, its goals, and how it addresses the grant's priorities. Include the problem statement, proposed approach, and expected outcomes.",
  },
  {
    key: "need",
    label: "Statement of Need",
    description:
      "Describe the community need or problem your project addresses. Use data and evidence to support the urgency.",
  },
  {
    key: "approach",
    label: "Approach & Methods",
    description:
      "Detail the specific activities, timeline, and methods you will use to achieve project goals.",
  },
  {
    key: "capacity",
    label: "Organizational Capacity",
    description:
      "Demonstrate your organization's ability to execute this project, including relevant experience, staff qualifications, and partnerships.",
  },
  {
    key: "budget_justification",
    label: "Budget Justification",
    description:
      "Explain how the requested funds will be used and why each budget item is necessary for project success.",
  },
  {
    key: "evaluation",
    label: "Evaluation Plan",
    description:
      "Describe how you will measure project success, including metrics, data collection methods, and reporting.",
  },
] as const;
