import GuideCardProgress from "../Guide/GuideCardProgress";
import GuideCardAI from "../Guide/GuideCardAI";
import GuideCardHelp from "../Guide/GuideCardHelp";
import GuideCardNext from "../Guide/GuideCardNext";
import GuideCardTips from "../Guide/GuideCardTips";

export default function IdentityGuide({

    section,

}) {

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
            model={guide.help}
        />

        <GuideCardNext
            model={guide.next}
        />

    </>

);

}