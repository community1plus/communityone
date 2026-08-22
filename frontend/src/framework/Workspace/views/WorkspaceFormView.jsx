import "./WorkspaceFormView.css";
import FieldRenderer from "../Form/FieldRenderer";


export default function WorkspaceFormView({
    section,
    form,
    editing,
}) {

    if (!section) {
        return null;
    }


    return (
        <div className="workspace-form">

            {section.fields?.map((field) => (
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