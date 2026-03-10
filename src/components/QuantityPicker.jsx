export default function QuantityPicker({ value, min = 1, max = 99, onChange }) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <div className="row">
      <button className="btn" onClick={dec} disabled={value <= min}>-</button>
      <input
        className="input"
        style={{ width: 90, textAlign: "center" }}
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <button className="btn" onClick={inc} disabled={value >= max}>+</button>
    </div>
  );
}