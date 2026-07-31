import GuideCardProgress from "../Guide/GuideCardProgress";
import GuideCardAI from "../Guide/GuideCardAI";
import GuideCardHelp from "../Guide/GuideCardHelp";
import GuideCardNext from "../Guide/GuideCardNext";
import GuideCardTips from "../Guide/GuideCardTips";
import { guideContent } from "../Guide/GuideContent";
import { createIdentityGuideModel } from "../../components/Identity/models/IdentityGuideModel";

export default function IdentityGuide({

    section,

}) {

    const guide =
    guideContent[section] ??
    guideContent.default;
    
const guide =
    createIdentityGuideModel();

return(

    <>

        <GuideCardProgress
            model={guide.progress}
        />

        <GuideCardAI
            model={guide.ai}
        />

<GuideCardHelp
    guide={guide}
/>

        <GuideCardNext
            model={guide.next}
        />

    </>

);

}