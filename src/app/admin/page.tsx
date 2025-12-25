import AdminClient from "./AdminClient";

export default function AdminPage() {
  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <h1>Admin</h1>
      <p>Create NFC tags and claim them to homes.</p>
      <AdminClient />
    </main>
  );
}
