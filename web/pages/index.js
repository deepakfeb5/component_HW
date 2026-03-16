import { useState } from "react";

export default function Home() {
  const [items, setItems] = useState([]);

  async function handleUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/mouser", {
      method: "POST",
      body: form
    });

    const data = await res.json();
    setItems(data.items || []);
  }

  return (
    <div style={{ fontFamily: "Arial", padding: 20 }}>
      <h2>Mouser BOM Lookup</h2>

      <input type="file" accept=".csv" onChange={handleUpload} />

      {items.length > 0 && (
        <table
          border="1"
          cellPadding="8"
          style={{ marginTop: 20, borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Part Number</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.part}</td>
                <td>{item.qty}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>${item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
