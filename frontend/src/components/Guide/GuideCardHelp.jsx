export default function GuideCardHelp({

    guide,

}) {

    return (

        <GuideCard title={guide.title}>

            {guide.paragraphs.map((paragraph, index) => (

                <p key={index}>

                    {paragraph}

                </p>

            ))}

        </GuideCard>

    );

}