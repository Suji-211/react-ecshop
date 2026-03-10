export default function Money({ cents }) {
  const value = (Number(cents || 0) / 100).toFixed(2);
  return <span>${value}</span>;
}