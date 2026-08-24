import "./WorkspaceFormView.css";

import FieldRenderer
    from "../Form/FieldRenderer";


export default function WorkspaceFormView({

    section,

    form,

    editing,

}) {

    if (!section) {
        return null;
    }


    const fields =
        section.fields ?? [];


    return (

        <div className="workspace-form">

            {fields.map((field) => (

                <FieldRenderer

                    key={field.name}

                    field={field}

                    form={form}

                    editing={editing}

                />

            ))}

        </div>

    );

}