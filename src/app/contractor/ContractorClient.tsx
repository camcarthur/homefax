"use client";

import { useEffect, useMemo, useState } from "react";

type Company = { id: string; name: string };

type ContractorTag = {
  tag: { code: string; status: string };
  home: { id: string; label: string; address: string | null };
  nextDue: Record<string, { last?: string; due?: string; overdue: boolean }>;
};

function fmt(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString();
}

export default function ContractorClient() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState<string>("");
  const [rows, setRows] = useState<ContractorTag[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/companies", { cache: "no-store" });
      const data = await res.json();
      setCompanies(data.companies ?? []);
      if ((data.companies ?? []).length > 0) setCompanyId(data.companies[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!companyId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/contractor/${companyId}/tags`, { cache: "no-store" });
        const data = await res.json();
        setRows(data.tags ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, [companyId]);

  const serviceColumns = useMemo(
    () => ["RESTAIN", "RECHINK", "WASH", "INSPECTION", "MEDIA_BLAST"],
    []
  );

  return (
    <div style={{ marginTop: 16 }}>
      <label style={{ display: "block", marginBottom: 8 }}>
        Company:
        <select
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          style={{ marginLeft: 10, padding: 8, borderRadius: 8 }}
        >
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      {loading ? <p>Loading…</p> : null}

      <div style={{ overflowX: "auto", marginTop: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>Tag</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>Home</th>
              {serviceColumns.map((s) => (
                <th key={s} style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>
                  {s}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.tag.code}>
                <td style={{ borderBottom: "1px solid #f5f5f5", padding: 8 }}>
                  <a href={`/t/${r.tag.code}`}>
                    <code>{r.tag.code}</code>
                  </a>
                </td>

                <td style={{ borderBottom: "1px solid #f5f5f5", padding: 8 }}>
                  <div>
                    <strong>{r.home.label}</strong>
                  </div>
                  <div style={{ opacity: 0.75, fontSize: 13 }}>{r.home.address ?? ""}</div>
                </td>

                {serviceColumns.map((s) => {
                  const v = r.nextDue[s];
                  const overdue = v?.overdue;
                  return (
                    <td
                      key={s}
                      style={{
                        borderBottom: "1px solid #f5f5f5",
                        padding: 8,
                        color: overdue ? "crimson" : "inherit",
                      }}
                    >
                      <div>Due: {fmt(v?.due)}</div>
                      <div style={{ opacity: 0.75, fontSize: 12 }}>Last: {fmt(v?.last)}</div>
                      {overdue ? (
                        <div style={{ fontSize: 12 }}>
                          <strong>OVERDUE</strong>
                        </div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}

            {rows.length === 0 && !loading ? (
              <tr>
                <td colSpan={2 + serviceColumns.length} style={{ padding: 12, opacity: 0.7 }}>
                  No associated tags found for this company yet. (Association is based on service history.)
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
