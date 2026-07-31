import GuideCardProgress from "../Guide/GuideCardProgress";
import GuideCardAI from "../Guide/GuideCardAI";
import GuideCardHelp from "../Guide/GuideCardHelp";
import GuideCardNext from "../Guide/GuideCardNext";

import { createIdentityGuideModel }
    from "../../components/Identity/models/IdentityGuideModel";

export default function IdentityGuide({

    section,

}) {

    const guide =
        createIdentityGuideModel(section);

    return (

        <>

            <GuideCardProgress
                model={guide.progress}
            />

            <GuideCardAI
                model={guide.ai}
            />

            <GuideCardHelp
                guide={guide.help}
            />

            <GuideCardNext
                model={guide.next}
            />

        </>

    );

}