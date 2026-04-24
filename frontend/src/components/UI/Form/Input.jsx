export default function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  ...props
}) {
  return (
    <input
      className="input"
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  );
}