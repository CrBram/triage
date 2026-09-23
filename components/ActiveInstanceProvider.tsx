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
  loading: boolean;
};

const ActiveInstanceContext =
  createContext<ActiveInstanceContextValue | null>(null);

export function ActiveInstanceProvider({ children }: { children: ReactNode }) {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [activeInstanceId, setActiveInstanceIdState] = useState<string>(
    DEFAULT_INSTANCE_ID,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setActiveInstanceIdState(stored);

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/instances");
        if (!res.ok) throw new Error("Failed to load instances");
        const data = (await res.json()) as Instance[];
        if (cancelled) return;
        setInstances(data);

        const preferred =
          (stored && data.some((row) => row.id === stored) && stored) ||
          data.find((row) => row.id === DEFAULT_INSTANCE_ID)?.id ||
          data[0]?.id ||
          DEFAULT_INSTANCE_ID;
        setActiveInstanceIdState(preferred);
      } catch {
        if (!cancelled) setInstances([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
      loading,
    }),
    [instances, activeInstanceId, activeInstance, setActiveInstanceId, loading],
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
