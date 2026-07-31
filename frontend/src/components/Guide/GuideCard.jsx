export default function GuideCard({

    title,
    children,

}) {

    return (

        <div className="guide-card">

            <div className="guide-card-title">

                {title}

            </div>

            <div className="guide-card-body">

                {children}

            </div>

        </div>

    );

}