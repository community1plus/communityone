import IdentityActions
from "../Identity/IdentityActions";

export default function CapabilityActions({

    capability,

    editing,
    savingProfile,

    form,

    setEditing,

    handleSaveProfile,

}) {

    switch (capability) {

        case "identity":

        default:

            return (

                <IdentityActions

                    editing={editing}

                    savingProfile={savingProfile}

                    form={form}

                    setEditing={setEditing}

                    handleSaveProfile={handleSaveProfile}

                />

            );

    }

}