import "./WorkspaceBannerSection.css";

export default function WorkspaceBannerSection({

    label,
    children,

}) {

    return (

        <section className="workspace-banner-section">

            {label && (

                <div className="workspace-meta-label">

                    {label}

                </div>

            )}

            <div className="workspace-banner-content">

                {children}

            </div>

        </section>

    );

}