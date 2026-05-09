export default function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete = "off",
  ...props
}) {
  return (
    <input
      className="input"
      type={type}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      {...props}
    />
  );
}