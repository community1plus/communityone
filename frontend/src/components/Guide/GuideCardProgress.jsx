export default function GuideCardProgress({

    model,

}){

    return(

        <GuideCard title="Progress">

            <strong>

                {model.percentage}%

            </strong>

            <br/>

            {model.label}

        </GuideCard>

    );

}