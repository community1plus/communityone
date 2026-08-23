import "./WorkspaceSectionHeader.css";

import {
    Pencil,
    Eraser,
    RotateCcw,
    Save,
} from "lucide-react";


export default function WorkspaceSectionHeader({

    title,
    completion = 0,

    editing = false,
    saving = false,

    onEdit,
    onClear,
    onReset,
    onSave,

}) {

    return (

        <header className="workspace-section-header">

            {/* =================================
               SECTION TITLE
            ================================= */}

            <div className="workspace-section-heading">

                <h2>
                    {title}
                </h2>

<span className="workspace-section-completion">
    [{completion}%]
</span>

            </div>


            {/* =================================
               ACTIONS
            ================================= */}

            <div className="workspace-section-actions">

                {!editing && (

                    <button
                        type="button"
                        className="workspace-section-action"
                        onClick={onEdit}
                        aria-label="Edit section"
                        title="Edit"
                    >

                        <Pencil
                            size={15}
                            strokeWidth={1.8}
                        />

                        <span>
                            Edit
                        </span>

                    </button>

                )}


                {editing && (

                    <>

                        <button
                            type="button"
                            className="workspace-section-action"
                            onClick={onClear}
                            aria-label="Clear section"
                            title="Clear"
                        >

                            <Eraser
                                size={15}
                                strokeWidth={1.8}
                            />

                            <span>
                                Clear
                            </span>

                        </button>


                        <button
                            type="button"
                            className="workspace-section-action"
                            onClick={onReset}
                            aria-label="Reset section"
                            title="Reset"
                        >

                            <RotateCcw
                                size={15}
                                strokeWidth={1.8}
                            />

                            <span>
                                Reset
                            </span>

                        </button>


                        <button
                            type="button"
                            className="workspace-section-action workspace-section-action-primary"
                            onClick={onSave}
                            disabled={saving}
                            aria-label="Save section"
                            title="Save"
                        >

                            <Save
                                size={15}
                                strokeWidth={1.8}
                            />

                            <span>
                                {saving ? "Saving..." : "Save"}
                            </span>

                        </button>

                    </>

                )}

            </div>

        </header>

    );

}