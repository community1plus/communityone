export default function Select({ value, onChange, children }) {
  return (
    <select className="input" value={value} onChange={onChange}>
      {children}
    </select>
  );
}