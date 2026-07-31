import GuideCardProgress from "../Guide/GuideCardProgress";
import GuideCardAI from "../Guide/GuideCardAI";
import GuideCardHelp from "../Guide/GuideCardHelp";
import GuideCardNext from "../Guide/GuideCardNext";
import GuideCardTips from "../Guide/GuideCardTips";

export default function IdentityGuide({

    section,

}) {

    return (

        <>

            <GuideCardProgress />

            <GuideCardAI />

            <GuideCardHelp
                section={section}
            />

            <GuideCardNext />

        </>

    );

}