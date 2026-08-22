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

        <div className="workspace-section-header">

            {/* ==========================
               SECTION TITLE
            ========================== */}

            <div className="workspace-section-title">

                <h2>
                    {title}
                </h2>

            </div>


            {/* ==========================
               SECTION ACTIONS
            ========================== */}

            <div className="workspace-section-actions">

                <span className="workspace-section-completion">
                    {completion}%
                </span>


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
                                {saving
                                    ? "Saving..."
                                    : "Save"
                                }
                            </span>

                        </button>

                    </>

                )}

            </div>

        </div>

    );

}