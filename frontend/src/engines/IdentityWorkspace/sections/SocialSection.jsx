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

            <div className="social-section-header">

                <h2>
                    Connected Accounts
                </h2>

                <p>
                    Connect your social accounts to strengthen
                    your identity in Community One.
                </p>

            </div>


            <div className="social-account-grid">

                {SOCIAL_PROVIDERS.map((provider) => {

                    const connected =
                        form.getValue(
                            `social.${provider.id}.connected`
                        );

                    return (

                        <div
                            className="social-account"
                            key={provider.id}
                        >

                            <div className="social-account-info">

                                <strong>
                                    {provider.label}
                                </strong>

                                <span>
                                    {connected
                                        ? "Connected"
                                        : "Not connected"
                                    }
                                </span>

                            </div>


                            <button
                                type="button"
                                disabled={!editing}
                            >

                                {connected
                                    ? "Manage"
                                    : "Connect"
                                }

                            </button>

                        </div>

                    );

                })}

            </div>

        </div>

    );
}