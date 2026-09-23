import { listInstances } from "@/lib/instances";
import { listInstructions } from "@/lib/instructions";
import {
  DEFAULT_CONSULTATION_INSTRUCTIONS,
  DEFAULT_PATHWAY_INSTRUCTIONS,
} from "@/lib/pathways";
import { DEFAULT_INSTANCE_ID, SEED_INSTANCES } from "@/lib/instance";
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

export async function loadInstancePromptData(
  instanceId: string,
): Promise<InstancePromptData | null> {
  const instances = await listInstances();
  const instance = instances.find((row) => row.id === instanceId);
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

export async function loadAllInstancePromptData(): Promise<
  InstancePromptData[]
> {
  const instances = await listInstances();
  if (instances.length === 0) {
    return SEED_INSTANCES.map((seed) => ({
      id: seed.id,
      name: seed.name,
      generalInfo: seed.generalInfo,
      pathways: DEFAULT_PATHWAY_INSTRUCTIONS.map((row) => ({
        name: row.name,
        description: row.description,
      })),
      consultations: DEFAULT_CONSULTATION_INSTRUCTIONS.map((row) => ({
        name: row.name,
        description: row.description,
      })),
      usedFallbackCatalog: true,
    }));
  }

  const loaded = await Promise.all(
    instances.map((instance) => loadInstancePromptData(instance.id)),
  );
  return loaded.filter((row): row is InstancePromptData => row !== null);
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

/** Multi-instance catalog appended on top of the base instructions. */
export function formatAvailableInstances(
  instances: InstancePromptData[],
): string {
  const blocks = instances.map((data) => {
    const general =
      data.generalInfo.length > 0
        ? data.generalInfo
        : "(No additional general information provided for this instance.)";

    return `
### ${data.name}
- instanceId: "${data.id}"
- General information: ${general}
- Pathways (choose exactly one from this instance if selected):
${formatNamedList(data.pathways)}
- Consultation types (choose exactly one from this instance if selected):
${formatNamedList(data.consultations)}
`.trim();
  });

  return `
## Available care instances
Pick exactly one instance below for the triage result. Set result.instanceId to that instance's id. Then choose pathway and consultationType only from that same instance.

${blocks.join("\n\n")}
`.trim();
}

/**
 * Full agent instructions: absolute clinical base + all instance overlays.
 * The model selects the best instanceId from the catalog.
 */
export async function buildTriageInstructions(): Promise<string> {
  const base = buildBaseInstructions();
  const instances = await loadAllInstancePromptData();
  return `${base}\n\n${formatAvailableInstances(instances)}`;
}

/** Validates / normalises an AI-chosen instance id against known instances. */
export async function resolveChosenInstanceId(
  candidate?: string | null,
): Promise<string> {
  const instances = await loadAllInstancePromptData();
  const ids = new Set(instances.map((row) => row.id));
  if (candidate && ids.has(candidate)) return candidate;
  if (ids.has(DEFAULT_INSTANCE_ID)) return DEFAULT_INSTANCE_ID;
  return instances[0]?.id ?? DEFAULT_INSTANCE_ID;
}
