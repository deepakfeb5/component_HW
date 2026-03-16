import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState("");

  async function handleUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    // When hosted on Vercel, /api/mouser calls your FastAPI backend
    const res = await fetch("/api/mouser", {
      method: "POST",
      body: form
    });

    const data = await res.json();
    setResult(JSON.stringify(data, null, 2));
  }

  return (
    <div style={{ fontFamily: "Arial", padding: 20 }}>
      <h2>Mouser BOM Lookup</h2>

      <input type="file" accept=".csv" onChange={handleUpload} />

      <h3>Result:</h3>
      <pre
        style={{
          marginTop: 10,
          padding: 10,
          background: "#f4f4f4",
          whiteSpace: "pre-wrap"
        }}
      >
        {result}
      </pre>
    </div>
  );
}
