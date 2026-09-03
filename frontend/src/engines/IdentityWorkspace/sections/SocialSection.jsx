import "./SocialSection.css";


const SOCIAL_PROVIDERS = [

    {
        id: "facebook",
        label: "Facebook",
    },

    {
        id: "instagram",
        label: "Instagram",
    },

    {
        id: "youtube",
        label: "YouTube",
    },

    {
        id: "x",
        label: "X",
    },

];


export default function SocialSection({

    form,
    editing,

}) {

    return (

        <div className="social-section">


            {/* =================================================
               SECTION INTRO
            ================================================= */}

            <div className="social-section-header">

                <h2>
                    Connected Accounts
                </h2>

            </div>


            {/* =================================================
               SOCIAL ACCOUNTS
            ================================================= */}

            <div className="social-account-list">

                {SOCIAL_PROVIDERS.map((provider) => {


                    const connected =
                        Boolean(
                            form.getValue(
                                `social.${provider.id}.connected`
                            )
                        );


                    const verified =
                        Boolean(
                            form.getValue(
                                `social.${provider.id}.verified`
                            )
                        );


                    return (

                        <div
                            className="social-account-row"
                            key={provider.id}
                        >


                            {/* =================================
                               SOCIAL MEDIA
                            ================================= */}

                            <div className="social-account-name">

                                {provider.label}

                            </div>


                            {/* =================================
                               STATE / ACTION
                            ================================= */}

                            <div className="social-account-action">

                                {verified ? (

                                    <span className="social-account-verified">

                                        ✓ Verified

                                    </span>

                                ) : (

                                    <button
                                        type="button"
                                        className="social-account-verify"
                                        disabled={!editing}
                                    >

                                        Verify

                                    </button>

                                )}

                            </div>

                        </div>

                    );

                })}

            </div>

        </div>

    );

}