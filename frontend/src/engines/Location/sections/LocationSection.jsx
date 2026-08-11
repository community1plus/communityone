import FieldRenderer
    from "../../../framework/Form/FieldRenderer";

import "./LocationSection.css";

export default function LocationSection({

    section,

    form,

    editing,

}) {

    if (!section) {
        return null;
    }

    return (

        <div className="location-section">

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