export default function Card({
  children,
  variant = "primary",
  active = false,
  clickable = false,
  className = "",
  as: Component = "div",
  ...props
}) {
  const classes = [
    "card",
    `card-${variant}`,
    active && "active",
    clickable && "clickable",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}