import type React from "react";
import type { LucideIcon } from "lucide-react";

type UiStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  tone?: "default" | "danger";
};

export function UiState({ icon: Icon, title, description, action, tone = "default" }: UiStateProps) {
  return (
    <div className={`ui-state ${tone === "danger" ? "danger" : ""}`}>
      <span className="ui-state-icon">
        <Icon size={22} />
      </span>
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
      {action ? <div className="ui-state-action">{action}</div> : null}
    </div>
  );
}

export function SkeletonBlock({ lines = 3 }: { lines?: number }) {
  return (
    <div className="skeleton-block" aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}
