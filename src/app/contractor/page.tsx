import ContractorClient from "./ContractorClient";

export default function ContractorPage() {
  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1>Contractor</h1>
      <p>Select your company to see all tags/homes you’re associated with and upcoming service due dates.</p>
      <ContractorClient />
    </main>
  );
}
