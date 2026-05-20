interface Section {
  heading: string;
  body: string;
}

interface Props {
  title: string;
  sections: Section[];
}

export function LegalContent({ title, sections }: Props) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <h1
          className="text-2xl font-bold mb-8"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h1>

        <div className="flex flex-col gap-8">
          {sections.map((s) => (
            <div key={s.heading}>
              <h2
                className="text-base font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {s.heading}
              </h2>
              <p
                className="text-sm leading-relaxed whitespace-pre-line"
                style={{ color: "var(--text-secondary)" }}
              >
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
