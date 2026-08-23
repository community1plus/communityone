import "./WorkspaceSectionHeader.css";

import {
    Pencil,
    Eraser,
    RotateCcw,
    Save,
} from "lucide-react";


export default function WorkspaceSectionHeader({

    model,

}) {

    if (!model?.visible) {

        return null;

    }

    return (

        <div className="workspace-section-header">

            <div className="workspace-section-identity">

                <span className="workspace-section-title">
                    {model.title}
                </span>

                <span className="workspace-section-completion">
                    [{model.completion}%]
                </span>

            </div>

            <div className="workspace-section-actions">

                {model.actions?.map((action) => (

                    <button
                        key={action.id}
                        type="button"
                        onClick={() =>
                            action.onClick?.()
                        }
                    >

                        {action.icon}

                        {action.title}

                    </button>

                ))}

            </div>

        </div>

    );

}