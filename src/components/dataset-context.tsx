"use client";
import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sampleDataset, SAMPLE_ID } from "@/lib/sample";
import { deleteDataset, getDatasets, getServerDatasets, saveDataset, subscribe } from "@/lib/store";
import type { Dataset } from "@/lib/types";

interface Ctx {
  dataset: Dataset;
  datasets: Dataset[];
  select: (id: string) => void;
  add: (ds: Dataset) => void;
  remove: (id: string) => void;
  /** href helper that keeps the current dataset in the URL */
  href: (path: string) => string;
}

const DatasetContext = createContext<Ctx | null>(null);

export function DatasetProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useSearchParams();
  const saved = useSyncExternalStore(subscribe, getDatasets, getServerDatasets);

  const datasets = useMemo(() => [sampleDataset, ...saved], [saved]);
  const id = params.get("d") ?? SAMPLE_ID;
  const dataset = datasets.find((d) => d.id === id) ?? sampleDataset;

  const href = useCallback(
    (path: string) => (dataset.id === SAMPLE_ID ? path : `${path}?d=${dataset.id}`),
    [dataset.id],
  );

  const value: Ctx = {
    dataset,
    datasets,
    href,
    select: (next) => router.push(next === SAMPLE_ID ? "/app" : `/app?d=${next}`),
    add: saveDataset,
    remove: (rid) => {
      deleteDataset(rid);
      if (rid === dataset.id) router.push("/app");
    },
  };

  return <DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>;
}

export function useDataset() {
  const ctx = useContext(DatasetContext);
  if (!ctx) throw new Error("useDataset must be used inside DatasetProvider");
  return ctx;
}
