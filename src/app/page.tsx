export default function HomePage() {
  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>HomeFax (PoC)</h1>
      <p style={{ marginTop: 0 }}>
        NFC tags open a URL like <code>/t/ABC123</code> to show a home’s maintenance passport.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
        <a
          href="/admin"
          style={{
            border: "1px solid #ddd",
            padding: "12px 16px",
            borderRadius: 10,
            textDecoration: "none",
          }}
        >
          Admin
        </a>

        <a
          href="/contractor"
          style={{
            border: "1px solid #ddd",
            padding: "12px 16px",
            borderRadius: 10,
            textDecoration: "none",
          }}
        >
          Contractor
        </a>

        <a
          href="/t/ABC123"
          style={{
            border: "1px solid #ddd",
            padding: "12px 16px",
            borderRadius: 10,
            textDecoration: "none",
          }}
        >
          Demo Tag (/t/ABC123)
        </a>
      </div>

      <hr style={{ margin: "24px 0" }} />

      <h2 style={{ marginBottom: 8 }}>Phone NFC tap testing</h2>
      <ol style={{ marginTop: 0 }}>
        <li>Make sure your phone is on the same Wi-Fi as your dev machine.</li>
        <li>
          Use the “Network” URL shown by Next (example:{" "}
          <code>http://10.0.0.177:3000/t/ABC123</code>) when programming the NFC tag.
        </li>
      </ol>
    </main>
  );
}
