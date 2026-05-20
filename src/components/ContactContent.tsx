"use client";

import { Mail, MessageCircle, Share2, User } from "lucide-react";
import { assetUrl } from "@/lib/asset";
import { AUTHOR } from "@/lib/books";

export function ContactContent() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-xl mx-auto">
        <h1
          className="text-2xl font-bold mb-8"
          style={{ color: "var(--text-primary)" }}
        >
          İletişim
        </h1>

        {/* Yazar kartı */}
        <div
          className="flex items-center gap-4 p-5 rounded-xl mb-8"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <img
            src={assetUrl(AUTHOR.photo)}
            alt={AUTHOR.name}
            className="w-16 h-16 rounded-full object-cover shrink-0"
            style={{ outline: "3px solid var(--accent-light)", outlineOffset: "2px" }}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2020/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='32' fill='%23ede9fe'/%3E%3Ctext x='32' y='40' text-anchor='middle' font-size='28' fill='%237c3aed'%3E✍%3C/text%3E%3C/svg%3E";
            }}
          />
          <div>
            <p className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
              {AUTHOR.name}
            </p>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {AUTHOR.bio}
            </p>
          </div>
        </div>

        {/* İletişim seçenekleri */}
        <div className="flex flex-col gap-3">
          {AUTHOR.email && (
            <ContactLink
              href={`mailto:${AUTHOR.email}`}
              icon={<Mail size={18} />}
              label="E-posta"
              value={AUTHOR.email}
            />
          )}

          {AUTHOR.whatsapp && (
            <ContactLink
              href={`https://wa.me/${AUTHOR.whatsapp}`}
              icon={<MessageCircle size={18} />}
              label="WhatsApp"
              value="Mesaj gönder"
              external
            />
          )}

          {AUTHOR.instagram && (
            <ContactLink
              href={`https://instagram.com/${AUTHOR.instagram}`}
              icon={<Share2 size={18} />}
              label="Instagram"
              value={`@${AUTHOR.instagram}`}
              external
            />
          )}

          {!AUTHOR.email && !AUTHOR.whatsapp && !AUTHOR.instagram && (
            <div
              className="flex items-center gap-3 p-4 rounded-xl"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
            >
              <User size={18} style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                İletişim bilgileri yakında eklenecek.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ContactLink({
  href,
  icon,
  label,
  value,
  external,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-center gap-4 p-4 rounded-xl transition-colors"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        color: "var(--text-primary)",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "var(--bg-card)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
      }}
    >
      <span style={{ color: "var(--accent)" }}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium mb-0.5" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
        <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
          {value}
        </p>
      </div>
    </a>
  );
}
