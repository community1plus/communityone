import "./WorkspaceSectionHeader.css";

export default function WorkspaceSectionHeader({

    title,
    description,

}) {

    return (

<div className="workspace-section-header">

    <div className="workspace-section-title">

        <span>
            {section?.title ?? ""}
        </span>

        <span className="workspace-section-completion">
            {sectionCompletion ?? 0}%
        </span>

        <button
            className="workspace-section-edit"
            onClick={handleEdit}
        >
            Edit
        </button>

    </div>

</div>

    );

}