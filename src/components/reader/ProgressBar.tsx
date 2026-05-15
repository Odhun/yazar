"use client";

import { useState } from "react";

interface Props {
  percent: number;
  currentPage?: number;
  totalPages?: number;
  onPageJump?: (page: number) => void;
}

export function ProgressBar({ percent, currentPage, totalPages, onPageJump }: Props) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");

  const startEdit = () => {
    setInputVal(String(currentPage ?? 1));
    setEditing(true);
  };

  const commit = () => {
    const n = parseInt(inputVal, 10);
    if (!isNaN(n) && totalPages && n >= 1 && n <= totalPages) {
      onPageJump?.(n);
    }
    setEditing(false);
    setInputVal("");
  };

  const showPageInfo = totalPages && totalPages > 0 && currentPage && currentPage > 0;

  return (
    <div className="shrink-0">
      <div
        className="h-0.5 w-full"
        style={{ background: "var(--border)" }}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Okuma ilerlemesi: %${percent}`}
      >
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{ width: `${percent}%`, background: "var(--accent)" }}
        />
      </div>

      {showPageInfo && (
        <div className="flex justify-center py-0.5">
          {editing ? (
            <div className="flex items-center gap-1">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Sayfa
              </span>
              <input
                type="number"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commit();
                  if (e.key === "Escape") {
                    setEditing(false);
                    setInputVal("");
                  }
                }}
                min={1}
                max={totalPages}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                className="w-16 text-xs text-center rounded outline-none tabular-nums"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--accent)",
                  color: "var(--text-primary)",
                  padding: "1px 4px",
                }}
              />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                / {totalPages}
              </span>
            </div>
          ) : (
            <button
              onClick={startEdit}
              className="text-xs tabular-nums"
              style={{ color: "var(--text-muted)" }}
              title="Sayfaya atla"
            >
              Sayfa {currentPage} / {totalPages}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
