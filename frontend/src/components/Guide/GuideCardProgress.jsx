import GuideCard from "../Guide/GuideCard";
export default function GuideCardProgress({

    model,

}){

    return(

        <GuideCard title="Progress">

<div className="guide-progress">

    <strong className="guide-progress-value">

        {model.percentage}%

    </strong>

    <span className="guide-progress-label">

        {model.label}

    </span>

</div>

            {model.label}

        </GuideCard>

    );

}