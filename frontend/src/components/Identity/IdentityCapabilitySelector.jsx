import { WorkspaceSegmentedControl } from "../../framework/Workspace";
import IdentityCapabilitySelector from "../../components/Identity/IdentityCapabilitySelector";

export default function IdentityCapabilitySelector({

    values = {},

    setValue,

    readOnly = false,

}) {

    const identityType =
        values?.identityType ||
        values?.activeIdentityType ||
        "PERSONAL";

    return (

        <section className="profile-capabilities">

            <WorkspaceSegmentedControl

                value={
                    identityType === "ENTITY"
                        ? "entity"
                        : "person"
                }

                onChange={(value) => {

                    setValue(
                        "identityType",
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