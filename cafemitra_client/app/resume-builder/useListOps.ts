import { useMemo, type Dispatch, type SetStateAction } from "react";
import type { ResumeData } from "./resumeModel";

export function useListOps<T extends { id: string }>(key: keyof ResumeData, setResume: Dispatch<SetStateAction<ResumeData>>) {
  return useMemo(
    () => ({
      add: (blank: T) => setResume((r) => ({ ...r, [key]: [...(r[key] as unknown as T[]), blank] })),
      update: (id: string, patch: Partial<T>) =>
        setResume((r) => ({ ...r, [key]: (r[key] as unknown as T[]).map((item) => (item.id === id ? { ...item, ...patch } : item)) })),
      remove: (id: string) => setResume((r) => ({ ...r, [key]: (r[key] as unknown as T[]).filter((item) => item.id !== id) })),
    }),
    [key, setResume],
  );
}
