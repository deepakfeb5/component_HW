export default function ResultsTable({ rows }: { rows: any[] }) {
  const fmt = (v: any) =>
    v === null || v === undefined || v === "" || v === "None"
      ? "None"
      : v;

  const fmtNum = (n: any) =>
    n === null || n === undefined || n === "None"
      ? "None"
      : Number(n).toLocaleString("en-US");

  const fmtPrice = (p: any) => {
    if (!p || p === "None") return "None";
    const num = parseFloat(String(p).replace(/[$,]/g, ""));
    return `$${num.toLocaleString("en-US")}`;
  };

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
      <thead style={{ background: "#f5f5f5" }}>
        <tr>
          <th>Part Number</th>
          <th>Quantity</th>
          <th>Manufacturer</th>
          <th>Lifecycle</th>
          <th>Stock Info</th>
          <th>Unit Price</th>
          <th>Total Price</th>
          <th>Alternates</th>
          <th>Error</th>
        </tr>
      </thead>

      <tbody>
        {rows.map((r, i) => (
          <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
            <td>{fmt(r.PartNumber)}</td>
            <td>{fmtNum(r.Quantity)}</td>
            <td>{fmt(r.Manufacturer)}</td>
            <td>{fmt(r.Lifecycle)}</td>
            <td>{fmt(r.Stock)}</td>
            <td>{fmtPrice(r.UnitPrice)}</td>
            <td>{fmtNum(r.TotalPrice)}</td>
            <td>{r.Alternates?.length ? r.Alternates.join(", ") : "None"}</td>
            <td>{fmt(r.Error)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
