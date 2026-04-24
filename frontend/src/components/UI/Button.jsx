export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const classes = [
    variant === "primary" ? "btn-primary" : "btn-ghost",
    className,
  ].join(" ");

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}