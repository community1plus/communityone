import "./WorkspaceSection.css";

export default function WorkspaceSection({
    title,
    description,
    children,
}) {
    return (
<section className="workspace-section">

    <div className="workspace-section-header">

        <div className="workspace-section-identity">
            <span className="workspace-section-title">
                Identity
            </span>

            <span className="workspace-section-completion">
                [100%]
            </span>
        </div>

        <div className="workspace-section-actions">

            <button type="button" onClick={onEdit}>
                Edit
            </button>

            <button type="button" onClick={onClear}>
                Clear
            </button>

            <button type="button" onClick={onReset}>
                Reset
            </button>

            <button type="button" onClick={onSave}>
                Save
            </button>

        </div>

    </div>

    <div className="workspace-section-body">

        {/* Name, Email, etc. */}

    </div>

</section>
    );
}