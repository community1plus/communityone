import "./WorkspaceFormView.css";

import FieldRenderer
    from "../Form/FieldRenderer";


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
                    key={field.name}
                    className="workspace-form-field"
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