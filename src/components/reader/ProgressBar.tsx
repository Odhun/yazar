interface Props {
  percent: number;
}

export function ProgressBar({ percent }: Props) {
  return (
    <div
      className="shrink-0 h-0.5 w-full"
      style={{ background: "var(--border)" }}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Okuma ilerlemesi: %${percent}`}
    >
      <div
        className="h-full transition-all duration-300 ease-out"
        style={{
          width: `${percent}%`,
          background: "var(--accent)",
        }}
      />
    </div>
  );
}
