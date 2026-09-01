"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";

// One field or section selected at a time, scoped to a single builder
// instance. fieldKey === null means "the section itself is selected" (its
// heading was clicked) rather than one field inside it.
type Selection = { sectionId: string; fieldKey: string | null } | null;

type SelectionCtx = { selected: Selection; select: (sectionId: string, fieldKey: string | null) => void; clear: () => void };

const Ctx = createContext<SelectionCtx | null>(null);

// Click-to-select-then-remove-from-the-topbar editing pattern shared by the
// Biodata and Resume builders: rather than a trash icon on every single
// field row, each section's header carries one icon that only lights up
// once something inside that section (a field, a custom entry, or the
// section's own heading) has been clicked.
export function FieldSelectionProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Selection>(null);
  return (
    <Ctx.Provider value={{ selected, select: (sectionId, fieldKey) => setSelected({ sectionId, fieldKey }), clear: () => setSelected(null) }}>
      {children}
    </Ctx.Provider>
  );
}

function useSelection() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSelection must be used within a FieldSelectionProvider");
  return ctx;
}

// A fieldset whose header carries the one remove icon for everything inside
// it. `onRemove` receives the selected fieldKey (null for "remove the whole
// section") and decides what that means for this particular section - hide a
// built-in field, hide the whole built-in section, or delete a custom
// field/section outright.
export function SelectableSection({
  sectionId,
  title,
  titleSlot,
  onRemove,
  children,
}: {
  sectionId: string;
  title?: string;
  titleSlot?: ReactNode;
  onRemove: (fieldKey: string | null) => void;
  children: ReactNode;
}) {
  const { selected, select, clear } = useSelection();
  const active = selected?.sectionId === sectionId;

  return (
    <fieldset className="resbuild-section">
      <div className="resbuild-section-head" onClick={() => select(sectionId, null)}>
        {titleSlot ?? <h2 className={active && selected?.fieldKey === null ? "resbuild-section-title-selected" : undefined}>{title}</h2>}
        <button
          type="button"
          className={`resbuild-icon-btn${active ? " resbuild-icon-btn-active" : ""}`}
          disabled={!active}
          onClick={(e) => {
            e.stopPropagation();
            if (!active) return;
            onRemove(selected!.fieldKey);
            clear();
          }}
          aria-label={active && selected?.fieldKey ? "Remove selected field" : "Remove section"}
        >
          <Trash2 size={15} />
        </button>
      </div>
      {children}
    </fieldset>
  );
}

// A field wrapper that highlights and arms its section's remove icon when
// clicked, instead of carrying its own delete affordance.
export function SelectableField({ sectionId, fieldKey, label, children }: { sectionId: string; fieldKey: string; label: string; children: ReactNode }) {
  const { selected, select } = useSelection();
  const isSelected = selected?.sectionId === sectionId && selected.fieldKey === fieldKey;
  return (
    <label className={`resbuild-field${isSelected ? " resbuild-field-selected" : ""}`} onClickCapture={() => select(sectionId, fieldKey)}>
      <span>{label}</span>
      {children}
    </label>
  );
}

// Same idea for a whole custom-field entry (label + value together are one
// removable unit) - wraps the existing "resbuild-entry" box.
export function SelectableEntry({ sectionId, fieldKey, children }: { sectionId: string; fieldKey: string; children: ReactNode }) {
  const { selected, select } = useSelection();
  const isSelected = selected?.sectionId === sectionId && selected.fieldKey === fieldKey;
  return (
    <div className={`resbuild-entry${isSelected ? " resbuild-entry-selected" : ""}`} onClickCapture={() => select(sectionId, fieldKey)}>
      {children}
    </div>
  );
}
