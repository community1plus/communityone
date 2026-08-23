import "./WorkspaceSection.css";

export default function WorkspaceSection({
    children,
}) {

    return (

        <section
            className="workspace-section"
            style={{
                background: "blue",
            }}
        >

            {children}

        </section>

    );

}