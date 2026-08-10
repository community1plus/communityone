import WorkspaceGuide
from "../../../framework/Workspace/WorkspaceGuide";

import {

    createIdentityGuideModel,

} from "./models/IdentityGuideModel";

export default function IdentityGuide({

    section,

}) {

    return (

        <WorkspaceGuide

            model={

                createIdentityGuideModel(

                    section

                )

            }

        />

    );

}