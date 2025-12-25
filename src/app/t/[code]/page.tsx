import AddServiceClient from "./AddServiceClient";

export default async function TagPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const res = await fetch(`/api/tags/${code}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Tag not found</h1>
        <p>Code: {code}</p>
      </main>
    );
  }

  const data = await res.json();

  if (data.status === "UNCLAIMED") {
    return (
      <main style={{ padding: 24 }}>
        <h1>Unclaimed Tag</h1>
        <p>This tag exists, but it isn’t linked to a home yet.</p>
        <p>Code: {code}</p>
      </main>
    );
  }

  const home = data.home;

  return (
    <main style={{ padding: 24, maxWidth: 900 }}>
      <h1>{home.label}</h1>
      {home.address ? <p>{home.address}</p> : null}
      {home.notes ? <p>{home.notes}</p> : null}

      <h2 style={{ marginTop: 24 }}>Service History</h2>
      <ul style={{ display: "grid", gap: 12, padding: 0, listStyle: "none" }}>
        {home.events.map((e: any) => (
          <li key={e.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
            <div>
              <strong>{e.serviceType}</strong> — {new Date(e.performedOn).toLocaleDateString()}
            </div>
            <div>{e.company?.name ?? "Unknown company"}</div>
            {e.notes ? <div style={{ marginTop: 6 }}>{e.notes}</div> : null}

            {e.materials?.length ? (
              <div style={{ marginTop: 10 }}>
                <div>
                  <strong>Materials</strong>
                </div>
                <ul>
                  {e.materials.map((m: any) => (
                    <li key={m.id}>
                      {m.category}: {m.brand}
                      {m.productLine ? ` / ${m.productLine}` : ""}
                      {m.colorName ? ` / ${m.colorName}` : ""}
                      {m.colorCode ? ` (Code: ${m.colorCode})` : ""}
                      {m.batchLot ? ` / Lot: ${m.batchLot}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      <AddServiceClient tagCode={code} />
    </main>
  );
}
