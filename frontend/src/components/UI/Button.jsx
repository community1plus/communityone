export default function Button({
  children,
  variant = "primary",
  size = "md",
  active = false,
  className = "",
  type = "button",
  ...props
}) {
  const classes = [
    "btn",
    `btn-${variant}`,
    `btn-${size}`,
    active && "active",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}