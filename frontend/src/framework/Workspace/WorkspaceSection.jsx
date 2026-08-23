import "./WorkspaceSection.css";

export default function WorkspaceSection({
    title,
    description,
    children,
}) {
    return (
        <section className="workspace-section">

            {(title || description) && (
                <header className="workspace-section-header">

                    {title && (
                        <h2 className="workspace-section-title">
                            {title}
                        </h2>
                    )}

                    {description && (
                        <p className="workspace-section-description">
                            {description}
                        </p>
                    )}

                </header>
            )}

            <div className="workspace-section-content">
                {children}
            </div>

        </section>
    );
}