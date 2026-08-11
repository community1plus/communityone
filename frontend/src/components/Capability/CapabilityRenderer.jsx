export default function CapabilityRenderer({

    section,

    form,

    editing,

}) {

    if (!section) {
        return null;
    }

    const Component =
        section.component;

    if (!Component) {
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