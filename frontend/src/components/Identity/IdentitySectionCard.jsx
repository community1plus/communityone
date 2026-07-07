export default function WorkspaceCard({
  title,
  children,
}) {
  return (
    <section className="profile-section-card">

      {title && (
        <h3 className="profile-section-title">
          {title}
        </h3>
      )}

      {children}

    </section>
  );
}