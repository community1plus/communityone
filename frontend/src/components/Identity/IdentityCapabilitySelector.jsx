import { WorkspaceSegmentedControl } from "../../framework/Workspace";

export default function IdentityCapabilitySelector({
    value = "PERSONAL",
    onChange,
    readOnly = false,
}) {

    return (

        <section className="profile-capabilities">

            <WorkspaceSegmentedControl

                value={
                    value === "ENTITY"
                        ? "entity"
                        : "person"
                }

                onChange={(value) => {

                    onChange(
                        value === "entity"
                            ? "ENTITY"
                            : "PERSONAL"
                    );

                }}

                disabled={readOnly}

                options={[

                    {
                        label: "Person",
                        value: "person",
                    },

                    {
                        label: "Entity",
                        value: "entity",
                    },

                ]}

            />

        </section>

    );

}