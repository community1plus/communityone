import GuideCard from "./GuideCard";

export default function GuideCardAI({

    model,

}) {

    return (

        <GuideCard title="AI Assistant">

            <p>

                {model.message}

            </p>

        </GuideCard>

    );

}