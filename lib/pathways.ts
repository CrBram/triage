import {
  CONSULTATION_TYPES,
  PATHWAYS,
  type ConsultationType,
  type Pathway,
} from "@/mastra/schemas/triage";

export type InstructionItem = {
  id: string;
  name: string;
  description: string;
};

/** Default pathway copy for an instance — editable in the dashboard UI. */
export const DEFAULT_PATHWAY_INSTRUCTIONS: InstructionItem[] = PATHWAYS.map(
  (pathway) => ({
    id: slugify(pathway),
    name: pathway,
    description: defaultPathwayDescription(pathway),
  }),
);

/** Default consultation-type copy for an instance — editable in the dashboard UI. */
export const DEFAULT_CONSULTATION_INSTRUCTIONS: InstructionItem[] =
  CONSULTATION_TYPES.map((type) => ({
    id: type,
    name: type,
    description: defaultConsultationDescription(type),
  }));

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function defaultPathwayDescription(pathway: Pathway): string {
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

function defaultConsultationDescription(type: ConsultationType): string {
  switch (type) {
    case "emergency-assessment":
      return "Immediate clinical assessment for emergency or high-urgency presentations.";
    case "first-appointment":
      return "Initial specialist or GP visit for a new complaint that needs scheduling.";
    case "check-up":
      return "Follow-up or routine review appointment for an existing condition.";
    case "cardiography":
      return "Cardiac diagnostics such as ECG or related heart investigations.";
    case "lung-function-test":
      return "Pulmonary function testing for respiratory assessment.";
    case "gastroscopy":
      return "Endoscopic examination of the upper digestive tract.";
  }
}
