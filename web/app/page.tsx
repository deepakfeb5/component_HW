"use client";

import { useState } from "react";
import ResultsTable from "../components/ResultsTable";

export default function Home() {
  const [results, setResults] = useState<any[]>([]);
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function uploadCsv(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/process", {
      method: "POST",
      body: form
    });

    const data = await res.json();

    setResults(data.results || []);
    setTotalCost(data.total_cost || 0);
    setLoading(false);
  }

  return (
    <div>
      <h1>Mouser BOM Processor</h1>

      <input type="file" accept=".csv" onChange={uploadCsv} />

      {loading && <p>Processing…</p>}

      {results.length > 0 && (
        <>
          <ResultsTable rows={results} />
          <h2>Total Cost: ${totalCost}</h2>
        </>
      )}
    </div>
  );
}
