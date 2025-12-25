"use client";

import { useEffect, useState } from "react";

type TagRow = {
  id: string;
  code: string;
  status: string;
  createdAt: string;
  home?: { id: string; label: string } | null;
};

type HomeRow = { id: string; label: string };

export default function AdminClient() {
  const [tags, setTags] = useState<TagRow[]>([]);
  const [homes, setHomes] = useState<HomeRow[]>([]);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [claimHomeByTag, setClaimHomeByTag] = useState<Record<string, string>>({});

  async function loadTags() {
    const res = await fetch("/api/admin/tags", { cache: "no-store" });
    const data = await res.json();
    setTags(data.tags ?? []);
  }

  async function loadHomes() {
    const res = await fetch("/api/admin/homes", { cache: "no-store" });
    const data = await res.json();
    setHomes(data.homes ?? []);
  }

  useEffect(() => {
    loadTags();
    loadHomes();
  }, []);

  async function createTag() {
    setLoading(true);
    setCreatedCode(null);
    try {
      const res = await fetch("/api/admin/tags", { method: "POST" });
      const data = await res.json();
      if (data?.tag?.code) {
        setCreatedCode(data.tag.code);
        await loadTags();
      } else {
        alert(data?.error ?? "Failed to create tag");
      }
    } finally {
      setLoading(false);
    }
  }

  async function claimTag(tagCode: string) {
    const homeId = claimHomeByTag[tagCode];
    if (!homeId) return alert("Pick a home first.");

    const res = await fetch(`/api/admin/tags/${tagCode}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeId }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data?.error ?? "Failed to claim tag");
    await loadTags();
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const createdUrl = createdCode ? `${origin}/t/${createdCode}` : null;

  return (
    <div style={{ marginTop: 16 }}>
      <button
        onClick={createTag}
        disabled={loading}
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #ddd",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Creating..." : "Create New Tag"}
      </button>

      {createdUrl ? (
        <div style={{ marginTop: 14, padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
          <div>
            <strong>New Tag Code:</strong> {createdCode}
          </div>
          <div style={{ marginTop: 6 }}>
            <strong>Program NFC with URL:</strong> <code>{createdUrl}</code>
          </div>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
            For phone tap, use the Network URL origin shown in your terminal if different.
          </div>
        </div>
      ) : null}

      <h2 style={{ marginTop: 22 }}>All Tags</h2>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>Code</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>Status</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>Home / Claim</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>Open</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((t) => (
              <tr key={t.id}>
                <td style={{ borderBottom: "1px solid #f5f5f5", padding: 8 }}>
                  <code>{t.code}</code>
                </td>
                <td style={{ borderBottom: "1px solid #f5f5f5", padding: 8 }}>{t.status}</td>

                <td style={{ borderBottom: "1px solid #f5f5f5", padding: 8 }}>
                  {t.home?.label ?? "—"}

                  {t.status === "UNCLAIMED" ? (
                    <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                      <select
                        value={claimHomeByTag[t.code] ?? ""}
                        onChange={(e) =>
                          setClaimHomeByTag((prev) => ({ ...prev, [t.code]: e.target.value }))
                        }
                        style={{ padding: 6, borderRadius: 8 }}
                      >
                        <option value="">Select home…</option>
                        {homes.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.label}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => claimTag(t.code)}
                        style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd" }}
                      >
                        Claim
                      </button>
                    </div>
                  ) : null}
                </td>

                <td style={{ borderBottom: "1px solid #f5f5f5", padding: 8 }}>
                  <a href={`/t/${t.code}`}>/t/{t.code}</a>
                </td>
              </tr>
            ))}

            {tags.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 12, opacity: 0.7 }}>
                  No tags yet. Click “Create New Tag”.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
