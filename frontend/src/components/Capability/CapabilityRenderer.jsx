export default function CapabilityRenderer({

    section,

    form,

    editing,

}) {

    console.log(
        "CAPABILITY RENDERER SECTION",
        section
    );

    if (!section) {

        console.log(
            "CAPABILITY RENDERER: NO SECTION"
        );

        return null;

    }

    const Component =
        section.component;

    console.log(
        "CAPABILITY RENDERER COMPONENT",
        Component
    );

    console.log(
        "CAPABILITY RENDERER FIELDS",
        section.fields
    );

    if (!Component) {

        console.log(
            "CAPABILITY RENDERER: NO COMPONENT"
        );

        return null;

    }

    return (

        <Component

            section={section}

            form={form}

            editing={editing}

        />

    );

}