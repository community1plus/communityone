import GuideCard from "./GuideCard";


export default function GuideCardHelp({ section }) {

    const guide =
        guideContent[section] || guideContent.default;

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