import GuideCardProgress from "../Guide/GuideCardProgress";
import GuideCardAI from "../Guide/GuideCardAI";
import GuideCardHelp from "../Guide/GuideCardHelp";
import GuideCardNext from "../Guide/GuideCardNext";

export default function WorkspaceGuide({

    model,

}) {

    if (!model) {

        return null;

    }

    return (

        <>

            <GuideCardProgress
                model={model.progress}
            />

            <GuideCardAI
                model={model.ai}
            />

            <GuideCardHelp
                model={model.help}
            />

            <GuideCardNext
                model={model.next}
            />

        </>

    );

}