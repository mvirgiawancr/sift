"use client";
import type { Dataset } from "./types";

/* Imported datasets live in this browser only (localStorage); the sample is always available. */
const KEY = "sift.datasets.v1";
const EMPTY: Dataset[] = [];
const listeners = new Set<() => void>();
let cacheRaw: string | null = null;
let cache: Dataset[] = EMPTY;

function read(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** Stable snapshot for useSyncExternalStore. */
export function getDatasets(): Dataset[] {
  const raw = read();
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      cache = raw ? (JSON.parse(raw) as Dataset[]) : EMPTY;
    } catch {
      cache = EMPTY;
    }
  }
  return cache;
}

export const getServerDatasets = () => EMPTY;

export function subscribe(fn: () => void) {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => e.key === KEY && fn();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

function write(list: Dataset[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage full or blocked — the analysis still shows for this session */
  }
  listeners.forEach((l) => l());
}

export function saveDataset(ds: Dataset) {
  write([ds, ...getDatasets().filter((d) => d.id !== ds.id)].slice(0, 10));
}

export function deleteDataset(id: string) {
  write(getDatasets().filter((d) => d.id !== id));
}
