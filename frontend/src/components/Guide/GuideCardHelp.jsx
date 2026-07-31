export default function GuideCardHelp({

    model,

}){

    return(

        <GuideCard title={model.title}>

            {model.paragraphs.map(...)}

        </GuideCard>

    );

}