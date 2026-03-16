import { useState } from "react";

export default function Home() {
  const [items, setItems] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filterText, setFilterText] = useState("");

  async function handleUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/mouser", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    setItems(data.items || []);
  }

  function sortBy(key) {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sorted = [...items].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setItems(sorted);
    setSortConfig({ key, direction });
  }

  const filteredItems = items.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(filterText.toLowerCase())
  );

  // CSV Export (pure browser, no libraries)
  function exportCSV() {
    const header = ["Part Number", "Qty", "Price", "Total"];
    const rows = filteredItems.map((item) => [
      item.part,
      item.qty,
      item.price,
      item.total,
    ]);

    const csvContent =
      [header, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "mouser_bom.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div style={{ fontFamily: "Arial", padding: 20 }}>
      <h2>Mouser BOM Lookup</h2>

      {/* File Upload */}
      <input type="file" accept=".csv" onChange={handleUpload} />

      {/* Filter Box */}
      <div style={{ marginTop: 20 }}>
        <input
          type="text"
          placeholder="Filter results..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{ width: "250px", padding: "6px" }}
        />
      </div>

      {/* Export CSV */}
      {filteredItems.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <button onClick={exportCSV}>Export CSV</button>
        </div>
      )}

      {/* Table */}
      {filteredItems.length > 0 && (
        <table
          border="1"
          cellPadding="8"
          style={{ marginTop: 20, borderCollapse: "collapse", width: "100%" }}
        >
          <thead>
            <tr>
              <th onClick={() => sortBy("part")} style={{ cursor: "pointer" }}>
                Part Number {sortConfig.key === "part" ? "↕" : ""}
              </th>
              <th onClick={() => sortBy("qty")} style={{ cursor: "pointer" }}>
                Qty {sortConfig.key === "qty" ? "↕" : ""}
              </th>
              <th
                onClick={() => sortBy("price")}
                style={{ cursor: "pointer" }}
              >
                Price {sortConfig.key === "price" ? "↕" : ""}
              </th>
              <th
                onClick={() => sortBy("total")}
                style={{ cursor: "pointer" }}
              >
                Total {sortConfig.key === "total" ? "↕" : ""}
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredItems.map((item, idx) => (
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
