/**
 * Seeded care instances for the multi-tenant demo.
 * Admin can switch between these in the dashboard.
 * The triage AI picks one per request based on each instance's instructions.
 */
export const SEED_INSTANCES = [
  {
    id: "az-sint-lucas",
    name: "AZ Sint-Lucas",
    generalInfo:
      "AZ Sint-Lucas Gent — general hospital with strong cardiology and emergency services. Prefer this instance for chest pain and cardiac pathways when the patient is in the Greater Ghent area and cardiology fit is clear.",
  },
  {
    id: "maria-middelares",
    name: "Maria Middelares",
    generalInfo:
      "AZ Maria Middelares Gent — modern hospital campus with strong focus on planned specialist care, gastroenterology and pulmonology. Prefer this when GI or respiratory pathways fit best and urgency is not emergency-only.",
  },
  {
    id: "uz-gent",
    name: "UZ Gent",
    generalInfo:
      "Universitair Ziekenhuis Gent — tertiary university hospital for complex, rare, or highly specialised cases, and when a university referral is the best match. Prefer for complex multi-system presentations.",
  },
] as const;

export type SeedInstance = (typeof SEED_INSTANCES)[number];

/** Default dashboard selection while auth is not wired up. */
export const DEFAULT_INSTANCE_ID = SEED_INSTANCES[0].id;

/** @deprecated Use DEFAULT_INSTANCE_ID / SEED_INSTANCES */
export const CURRENT_INSTANCE = {
  id: SEED_INSTANCES[0].id,
  name: SEED_INSTANCES[0].name,
} as const;
