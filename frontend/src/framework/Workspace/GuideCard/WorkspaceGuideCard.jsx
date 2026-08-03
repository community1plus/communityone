import "./WorkspaceGuideCard.css";

export default function WorkspaceGuideCard({

    title,

    children,

}) {

    return (

        <section className="workspace-guide-card">

            {title && (

                <header className="workspace-guide-card-header">

                    <h4>{title}</h4>

                </header>

            )}

            <div className="workspace-guide-card-body">

                {children}

            </div>

        </section>

    );

}