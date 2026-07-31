export default function GuideCardAI({

    model,

}) {

    return (

        <GuideCard title="AI Assistant">

            {model.message}

        </GuideCard>

    );

}