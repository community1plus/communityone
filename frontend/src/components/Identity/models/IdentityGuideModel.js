import WorkspaceGuide
    from "../../../framework/Workspace/WorkspaceGuide";

import {
    createIdentityGuideModel,
} from "./models/IdentityGuideModel";


export default function IdentityGuide({

    section,

    completion = 0,

}) {

    const model =
        createIdentityGuideModel(

            section,

            completion

        );


    return (

        <WorkspaceGuide

            model={model}

        />

    );

}