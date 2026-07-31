export default function GuideCard({

    title,
    children,

}) {

    return (

        <section className="guide-card">

            <header className="guide-card-header">

                {title}

            </header>

            <div className="guide-card-body">

                {children}

            </div>

        </section>

    );

}