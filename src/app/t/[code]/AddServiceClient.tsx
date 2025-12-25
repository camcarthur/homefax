"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Company = { id: string; name: string };

export default function AddServiceClient({ tagCode }: { tagCode: string }) {
  const router = useRouter();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [serviceType, setServiceType] = useState("RESTAIN");
  const [performedOn, setPerformedOn] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [notes, setNotes] = useState("");

  // optional stain fields
  const [brand, setBrand] = useState("");
  const [productLine, setProductLine] = useState("");
  const [colorName, setColorName] = useState("");
  const [colorCode, setColorCode] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/companies", { cache: "no-store" });
      const data = await res.json();
      setCompanies(data.companies ?? []);
      if ((data.companies ?? []).length) setCompanyId(data.companies[0].id);
    })();
  }, []);

  async function submit() {
    if (!companyId) return alert("Pick a company.");

    setSaving(true);
    try {
      const material =
        brand.trim().length > 0
          ? { category: "STAIN", brand, productLine, colorName, colorCode }
          : undefined;

      const res = await fetch(`/api/tags/${tagCode}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          serviceType,
          performedOn,
          notes,
          material,
        }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data?.error ?? "Failed to save");

      setNotes("");
      setBrand("");
      setProductLine("");
      setColorName("");
      setColorCode("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <section style={{ marginTop: 24, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
      <h3 style={{ marginTop: 0 }}>Add Service</h3>

      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <label>
          Company
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 8 }}
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Service Type
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 8 }}
          >
            <option value="MEDIA_BLAST">MEDIA_BLAST</option>
            <option value="RESTAIN">RESTAIN</option>
            <option value="RECHINK">RECHINK</option>
            <option value="WASH">WASH</option>
            <option value="INSPECTION">INSPECTION</option>
            <option value="OTHER">OTHER</option>
          </select>
        </label>

        <label>
          Performed On
          <input
            type="date"
            value={performedOn}
            onChange={(e) => setPerformedOn(e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 8 }}
          />
        </label>
      </div>

      <label style={{ display: "block", marginTop: 10 }}>
        Notes
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ width: "100%", padding: 8, borderRadius: 8, minHeight: 70 }}
        />
      </label>

      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f0f0f0" }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Optional: Stain details (for RESTAIN)</div>

        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <label>
            Brand
            <input value={brand} onChange={(e) => setBrand(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 8 }} />
          </label>
          <label>
            Product Line
            <input
              value={productLine}
              onChange={(e) => setProductLine(e.target.value)}
              style={{ width: "100%", padding: 8, borderRadius: 8 }}
            />
          </label>
          <label>
            Color Name
            <input value={colorName} onChange={(e) => setColorName(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 8 }} />
          </label>
          <label>
            Color Code / Number
            <input value={colorCode} onChange={(e) => setColorCode(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 8 }} />
          </label>
        </div>
      </div>

      <button
        onClick={submit}
        disabled={saving}
        style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd" }}
      >
        {saving ? "Saving..." : "Save Service"}
      </button>
    </section>
  );
}
