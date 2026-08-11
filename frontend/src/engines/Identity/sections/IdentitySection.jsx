import FieldRenderer from "../../../framework/Workspace/Form/FieldRenderer";
import "./IdentitySection.css";
export default function IdentitySection({

    section,

    form,

    editing,

}) {

    if (!section) {
        return null;
    }


    return (

        <div className="identity-section">

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