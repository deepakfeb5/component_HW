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
      body: form
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

  async function exportCSV() {
    // Dynamic import only when needed (client-side)
    const { saveAs } = await import("file-saver");

    const header = ["Part Number", "Qty", "Price", "Total"];
    const rows = filteredItems.map((i) => [i.part, i.qty, i.price, i.total]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "mouser_bom.csv");
  }

  async function exportExcel() {
    // Dynamic imports for browser-only usage
    const XLSX = await import("xlsx");
    const { saveAs } = await import("file-saver");

    const worksheet = XLSX.utils.json_to_sheet(filteredItems);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BOM");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    saveAs(blob, "mouser_bom.xlsx");
  }

  return (
    <div style={{ fontFamily: "Arial", padding: 20 }}>
      <h2>Mouser BOM Lookup</h2>

      {/* File Upload */}
      <input type="file" accept=".csv" onChange={handleUpload} />

      {/* Filter/Search Box */}
      <div style={{ marginTop: 20 }}>
        <input
          type="text"
          placeholder="Filter results..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{ width: "250px", padding: "6px" }}
        />
      </div>

      {/* Export Buttons */}
      {items.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <button onClick={exportCSV} style={{ marginRight: 10 }}>
            Export CSV
          </button>
          <button onClick={exportExcel}>Export Excel (.xlsx)</button>
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
              <th onClick={() => sortBy("price")} style={{ cursor: "pointer" }}>
                Price {sortConfig.key === "price" ? "↕" : ""}
              </th>
              <th onClick={() => sortBy("total")} style={{ cursor: "pointer" }}>
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
