export default function GuideCard({

    title,
    children,
    footer,

}) {

    return (

        <section className="guide-card">

            <header className="guide-card-header">

                {title}

            </header>

            <div className="guide-card-body">

                {children}

            </div>

            {footer && (

                <footer className="guide-card-footer">

                    {footer}

                </footer>

            )}

        </section>

    );

}