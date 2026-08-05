import { WorkspaceSegmentedControl } from "../../framework/Workspace";

export default function IdentityCapabilitySelector({

    values = {},

    setValue,

    readOnly = false,

}) {

    return (

        <section className="profile-capabilities">

            <WorkspaceSegmentedControl

                value={

                    values?.capabilities?.organisation
                        ? "entity"
                        : "person"

                }

                onChange={(value) =>

                    setValue(

                        "capabilities.organisation",

                        value === "entity"

                    )

                }

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