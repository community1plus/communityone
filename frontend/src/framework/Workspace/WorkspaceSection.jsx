import "./WorkspaceSection.css";

export default function WorkspaceSection({
    title,
    description,
    children,
}) {
    return (
<section className="workspace-section">

    <div className="workspace-section-header">

        <span className="workspace-section-title">
            Identity
        </span>

        <span className="workspace-section-completion">
            [100%]
        </span>

        <button>Edit</button>
        <button>Clear</button>
        <button>Reset</button>
        <button>Save</button>

    </div>

    {/* existing section content */}

</section>
    );
}