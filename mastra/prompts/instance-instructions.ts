import { getInstance } from "@/lib/instances";
import { listInstructions } from "@/lib/instructions";
import {
  DEFAULT_CONSULTATION_INSTRUCTIONS,
  DEFAULT_PATHWAY_INSTRUCTIONS,
} from "@/lib/pathways";
import { CURRENT_INSTANCE } from "@/lib/instance";
import { buildBaseInstructions } from "./base-instructions";

export type InstancePromptData = {
  id: string;
  name: string;
  generalInfo: string;
  pathways: { name: string; description: string }[];
  consultations: { name: string; description: string }[];
  /** True when pathways/consultations came from DB defaults fallback, not live rows. */
  usedFallbackCatalog: boolean;
};

/**
 * Resolve which care instance drives this triage run.
 * Today there is only one seeded instance; later this can pick the best match.
 */
export async function resolveTriageInstanceId(): Promise<string> {
  return CURRENT_INSTANCE.id;
}

export async function loadInstancePromptData(
  instanceId: string,
): Promise<InstancePromptData | null> {
  const instance = await getInstance(instanceId);
  if (!instance) return null;

  const [pathwayRows, consultationRows] = await Promise.all([
    listInstructions(instanceId, "pathway"),
    listInstructions(instanceId, "consultation"),
  ]);

  const pathways =
    pathwayRows.length > 0
      ? pathwayRows.map((row) => ({
          name: row.name.trim() || "Unnamed pathway",
          description: row.description.trim(),
        }))
      : DEFAULT_PATHWAY_INSTRUCTIONS.map((row) => ({
          name: row.name,
          description: row.description,
        }));

  const consultations =
    consultationRows.length > 0
      ? consultationRows.map((row) => ({
          name: row.name.trim() || "Unnamed consultation type",
          description: row.description.trim(),
        }))
      : DEFAULT_CONSULTATION_INSTRUCTIONS.map((row) => ({
          name: row.name,
          description: row.description,
        }));

  return {
    id: instance.id,
    name: instance.name,
    generalInfo: instance.generalInfo.trim(),
    pathways,
    consultations,
    usedFallbackCatalog:
      pathwayRows.length === 0 || consultationRows.length === 0,
  };
}

function formatNamedList(
  items: { name: string; description: string }[],
): string {
  return items
    .map((item) => {
      const description = item.description
        ? item.description
        : "(no description provided)";
      return `- "${item.name}": ${description}`;
    })
    .join("\n");
}

/** Instance-specific block appended on top of the base instructions. */
export function formatInstanceInstructions(data: InstancePromptData): string {
  const general =
    data.generalInfo.length > 0
      ? data.generalInfo
      : "(No additional general information provided for this instance.)";

  const fallbackNote = data.usedFallbackCatalog
    ? "\nSome lists below use the built-in default catalog because this instance had no saved pathways and/or consultation types yet."
    : "";

  return `
## Active care instance
You are currently triaging for: **${data.name}** (id: ${data.id}).
Use only this instance's configuration for pathway and consultationType choices.${fallbackNote}

### General information
${general}

### Pathways (choose exactly one)
${formatNamedList(data.pathways)}

### Consultation types (choose exactly one)
${formatNamedList(data.consultations)}
`.trim();
}

/**
 * Full agent instructions: absolute clinical base + instance overlay.
 * Falls back to the default pathway/consultation catalog when the instance
 * has no saved instruction rows.
 */
export async function buildTriageInstructions(
  instanceId?: string,
): Promise<string> {
  const resolvedId = instanceId ?? (await resolveTriageInstanceId());
  const base = buildBaseInstructions();
  const instanceData = await loadInstancePromptData(resolvedId);

  if (!instanceData) {
    // Absolute last resort if the instance row is missing entirely.
    const fallback: InstancePromptData = {
      id: CURRENT_INSTANCE.id,
      name: CURRENT_INSTANCE.name,
      generalInfo: "",
      pathways: DEFAULT_PATHWAY_INSTRUCTIONS.map((row) => ({
        name: row.name,
        description: row.description,
      })),
      consultations: DEFAULT_CONSULTATION_INSTRUCTIONS.map((row) => ({
        name: row.name,
        description: row.description,
      })),
      usedFallbackCatalog: true,
    };
    return `${base}\n\n${formatInstanceInstructions(fallback)}`;
  }

  return `${base}\n\n${formatInstanceInstructions(instanceData)}`;
}
