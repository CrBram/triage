import { PATHWAYS, type Pathway } from "@/mastra/schemas/triage";

export type PathwayInstruction = {
  pathway: Pathway;
  description: string;
};

/** Default pathway copy for an instance — editable in the dashboard UI. */
export const DEFAULT_PATHWAY_INSTRUCTIONS: PathwayInstruction[] = PATHWAYS.map(
  (pathway) => ({
    pathway,
    description: defaultDescription(pathway),
  }),
);

function defaultDescription(pathway: Pathway): string {
  switch (pathway) {
    case "Emergency Care":
      return "Life-threatening or rapidly worsening symptoms that need immediate emergency assessment (e.g. chest pain with collapse, severe breathing difficulty, stroke signs).";
    case "Cardiology":
      return "Heart-related complaints such as chest pain, palpitations, known cardiac history, or suspected cardiac symptoms that are not immediately life-threatening.";
    case "Pulmonology":
      return "Respiratory complaints such as persistent cough, shortness of breath, wheezing, or known lung disease without acute emergency features.";
    case "Gastroenterology":
      return "Digestive symptoms such as abdominal pain, nausea, vomiting, reflux, or bowel changes that warrant specialist GI assessment.";
    case "General Practice":
      return "Common, non-specialist complaints suitable for first-line GP assessment when no clear specialty pathway fits.";
  }
}
