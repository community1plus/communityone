export default function WorkspaceFormView({

    section,

    form,

    editing,

}) {

    if (!section) {

        return null;

    }

    const fields =
        section.fields || [];


    return (

        <div className="workspace-form">

            {fields.map((field) => {

                const value =
                    form.values?.[field.name] ?? "";


                return (

                    <div
                        className="workspace-form-field"
                        key={field.name}
                    >

                        <label
                            className="workspace-form-label"
                        >

                            {field.label}

                        </label>


                        <input

                            className="workspace-form-input"

                            type={
                                field.type === "email"
                                    ? "email"
                                    : "text"
                            }

                            value={value}

                            readOnly={
                                field.readOnly ||
                                !editing
                            }

                            onChange={(event) => {

                                form.setValue(

                                    field.name,

                                    event.target.value

                                );

                            }}

                        />


                        {field.helperText && (

                            <div
                                className="workspace-form-helper"
                            >

                                {field.helperText}

                            </div>

                        )}

                    </div>

                );

            })}

        </div>

    );

}