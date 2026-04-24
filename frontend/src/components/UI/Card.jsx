export default function Card({ children, variant = "primary", className = "" }) {
  const classes = [
    "card",
    variant === "primary" ? "card-primary" : "",
    variant === "soft" ? "card-soft" : "",
    className,
  ].join(" ");

  return <div className={classes}>{children}</div>;
}