export default function ResultsTable({ rows }: { rows: any[] }) {
  function fmt(value: any) {
    if (value === null || value === undefined || value === "None" || value === "") {
      return "None";
    }
    return value;
  }

  function fmtPrice(price: any) {
    if (!price || price === "None") return "None";
    const num = typeof price === "number" ? price : parseFloat(String(price).replace(/[$,]/g, ""));
    if (Number.isNaN(num)) return String(price);
    return `$${num.toLocaleString("en-US")}`;
  }

  function fmtNumber(num: any) {
    if (num === null || num === undefined || num === "None") return "None";
    const n = Number(num);
    return Number.isNaN(n) ? String(num) : n.toLocaleString("en-US");
  }

  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        marginTop: 20,
        fontSize: 14,
      }}
    >
      <thead>
        <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
          <th style={th}>Part Number</th>
          <th style={th}>Quantity</th>
          <th style={th}>Manufacturer</th>
          <th style={th}>Lifecycle</th>
          <th style={th}>Stock Info</th>
          <th style={th}>Unit Price</th>
          <th style={th}>Total Price</th>
          <th style={th}>Alternates</th>
          <th style={th}>Error</th>
        </tr>
      </thead>

      <tbody>
        {rows.map((r, i) => (
          <tr key={i} style={{ borderBottom: "1px solid #e0e0e0" }}>
            <td style={td}>{fmt(r.PartNumber)}</td>
            <td style={td}>{fmtNumber(r.Quantity)}</td>
            <td style={td}>{fmt(r.Manufacturer)}</td>
            <td style={td}>{fmt(r.Lifecycle)}</td>
            <td style={td}>{fmt(r.Stock)}</td>
            <td style={td}>{fmtPrice(r.UnitPrice)}</td>
            <td style={td}>{r.TotalPrice != null ? fmtNumber(r.TotalPrice) : "None"}</td>
            <td style={td}>{r.Alternates && r.Alternates.length ? r.Alternates.join(", ") : "None"}</td>
            <td style={td}>{fmt(r.Error)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const th: React.CSSProperties = {
  padding: "10px 8px",
  fontWeight: 600,
  borderBottom: "2px solid #ddd",
};

const td: React.CSSProperties = {
  padding: "8px 6px",
};
``
