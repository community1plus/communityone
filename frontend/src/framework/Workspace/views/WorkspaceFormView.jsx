import FieldRenderer
    from "../Form/FieldRenderer";

import WorkspaceFormView from "./WorkspaceFormView.css";

export default function WorkspaceFormView({

    section,

    form,

    editing,

    sectionCompletion,

}) {

    if (!section) {
        return null;
    }


    return (

        <div className="workspace-form">

            {section.fields?.map((field) => (

                <div
                    className="workspace-form-field"
                    key={field.name}
                >

                    <FieldRenderer

                        field={field}

                        form={form}

                        editing={editing}

                    />

                </div>

            ))}

        </div>

    );

}