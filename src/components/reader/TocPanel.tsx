"use client";

import { X, List } from "lucide-react";
import type { NavItem } from "@/types/reader";

interface Props {
  toc: NavItem[];
  onClose: () => void;
  onNavigate: (href: string) => void;
}

export function TocPanel({ toc, onClose, onNavigate }: Props) {
  return (
    <div
      className="absolute inset-y-0 right-0 flex flex-col z-40 border-l"
      style={{
        width: "min(320px, 90vw)",
        background: "var(--bg-card)",
        borderColor: "var(--border)",
      }}
    >
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b shrink-0"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <List size={15} style={{ color: "var(--accent)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            İçindekiler
          </span>
          {toc.length > 0 && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: "var(--accent-light)", color: "var(--accent)" }}
            >
              {toc.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg"
          style={{ color: "var(--text-muted)" }}
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {toc.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              İçindekiler bulunamadı.
            </p>
          </div>
        ) : (
          <ul className="py-1">
            {toc.map((item) => (
              <TocItem key={item.id || item.href} item={item} onNavigate={onNavigate} onClose={onClose} depth={0} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function TocItem({
  item,
  onNavigate,
  onClose,
  depth,
}: {
  item: NavItem;
  onNavigate: (href: string) => void;
  onClose: () => void;
  depth: number;
}) {
  return (
    <>
      <li>
        <button
          onClick={() => { onNavigate(item.href); onClose(); }}
          className="w-full text-left px-3 py-2 text-sm transition-colors"
          style={{
            paddingLeft: `${12 + depth * 16}px`,
            color: depth === 0 ? "var(--text-primary)" : "var(--text-secondary)",
            fontWeight: depth === 0 ? 500 : 400,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          {item.label.trim()}
        </button>
      </li>
      {item.subitems?.map((sub: NavItem) => (
        <TocItem key={sub.id || sub.href} item={sub} onNavigate={onNavigate} onClose={onClose} depth={depth + 1} />
      ))}
    </>
  );
}
