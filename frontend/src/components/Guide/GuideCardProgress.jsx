import GuideCard from "../Guide/GuideCard";
export default function GuideCardProgress({

    model,

}){

    return(

<GuideCard title="Progress">

    <div className="guide-progress">

        <div className="guide-progress-value">

            {model.percentage}%

        </div>

        <div className="guide-progress-label">

            {model.label}

        </div>

    </div>

</GuideCard>

    );

}