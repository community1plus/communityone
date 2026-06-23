export default function ProfileCard({
  title,
  children,
}) {
  return (

    <section className="profile-card">

      {title && (
        <h2 className="profile-card-title">
          {title}
        </h2>
      )}

      {children}

    </section>

  );
}