export default function ProfileSectionCard({
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