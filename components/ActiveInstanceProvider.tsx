"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_INSTANCE_ID } from "@/lib/instance";
import type { Instance } from "@/lib/instances";

const STORAGE_KEY = "nimblecare.activeInstanceId";

type ActiveInstanceContextValue = {
  instances: Instance[];
  activeInstanceId: string;
  activeInstance: Instance | null;
  setActiveInstanceId: (id: string) => void;
  refreshInstances: () => Promise<void>;
  loading: boolean;
};

const ActiveInstanceContext =
  createContext<ActiveInstanceContextValue | null>(null);

function pickActiveId(data: Instance[], preferred?: string | null) {
  if (preferred && data.some((row) => row.id === preferred)) return preferred;
  if (data.some((row) => row.id === DEFAULT_INSTANCE_ID)) {
    return DEFAULT_INSTANCE_ID;
  }
  return data[0]?.id ?? DEFAULT_INSTANCE_ID;
}

export function ActiveInstanceProvider({ children }: { children: ReactNode }) {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [activeInstanceId, setActiveInstanceIdState] = useState<string>(
    DEFAULT_INSTANCE_ID,
  );
  const [loading, setLoading] = useState(true);

  const refreshInstances = useCallback(async () => {
    const res = await fetch("/api/instances");
    if (!res.ok) throw new Error("Failed to load instances");
    const data = (await res.json()) as Instance[];
    setInstances(data);

    const stored = window.localStorage.getItem(STORAGE_KEY);
    const nextId = pickActiveId(data, stored);
    setActiveInstanceIdState(nextId);
    window.localStorage.setItem(STORAGE_KEY, nextId);
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setActiveInstanceIdState(stored);

    let cancelled = false;
    (async () => {
      try {
        await refreshInstances();
      } catch {
        if (!cancelled) setInstances([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshInstances]);

  const setActiveInstanceId = useCallback((id: string) => {
    setActiveInstanceIdState(id);
    window.localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const activeInstance = useMemo(
    () => instances.find((row) => row.id === activeInstanceId) ?? null,
    [instances, activeInstanceId],
  );

  const value = useMemo(
    () => ({
      instances,
      activeInstanceId,
      activeInstance,
      setActiveInstanceId,
      refreshInstances,
      loading,
    }),
    [
      instances,
      activeInstanceId,
      activeInstance,
      setActiveInstanceId,
      refreshInstances,
      loading,
    ],
  );

  return (
    <ActiveInstanceContext.Provider value={value}>
      {children}
    </ActiveInstanceContext.Provider>
  );
}

export function useActiveInstance() {
  const ctx = useContext(ActiveInstanceContext);
  if (!ctx) {
    throw new Error(
      "useActiveInstance must be used within ActiveInstanceProvider",
    );
  }
  return ctx;
}
