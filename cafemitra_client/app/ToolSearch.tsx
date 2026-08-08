"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { toolsCatalog } from "./toolsCatalog";

const MAX_RESULTS = 8;

export function ToolSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    return toolsCatalog.filter((tool) => tool.name.toLowerCase().includes(trimmed)).slice(0, MAX_RESULTS);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = isOpen && query.trim().length > 0;

  return (
    <div className="topbar-search" ref={containerRef}>
      <Search size={16} className="topbar-search-icon" aria-hidden />
      <input
        type="text"
        value={query}
        placeholder="Search tools - try 'compress'"
        aria-label="Search tools"
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setQuery("");
            setIsOpen(false);
          }
        }}
      />
      {query ? (
        <button
          type="button"
          className="topbar-search-clear"
          aria-label="Clear search"
          onClick={() => {
            setQuery("");
            setIsOpen(false);
          }}
        >
          <X size={14} />
        </button>
      ) : null}

      {showDropdown ? (
        <div className="topbar-search-results" role="listbox">
          {results.length ? (
            results.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  href={tool.href}
                  key={tool.href}
                  className="topbar-search-result"
                  onClick={() => {
                    setQuery("");
                    setIsOpen(false);
                  }}
                >
                  <span className="topbar-search-result-icon">
                    <Icon size={16} />
                  </span>
                  <span>
                    <strong>{tool.name}</strong>
                    <small>{tool.group}</small>
                  </span>
                </Link>
              );
            })
          ) : (
            <p className="topbar-search-empty">No tools match &quot;{query}&quot;.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
