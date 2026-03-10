export default function VariantSelector({ variants, value, onChange }) {
  if (!variants || variants.length === 0) {
    return <div className="muted">No variants</div>;
  }

  return (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      {variants.map((v) => (
        <option key={v.id} value={v.id}>
          {v.label}
        </option>
      ))}
    </select>
  );
}