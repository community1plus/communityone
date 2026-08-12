import "./SocialSection.css";

export default function SocialSection({
    section,
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


            <div className="social-account-list">

                <div className="social-account">

                    <div className="social-account-info">

                        <strong>
                            Facebook
                        </strong>

                        <span>
                            Not connected
                        </span>

                    </div>


                    <button
                        type="button"
                        disabled={!editing}
                    >
                        Connect
                    </button>

                </div>


                <div className="social-account">

                    <div className="social-account-info">

                        <strong>
                            Instagram
                        </strong>

                        <span>
                            Not connected
                        </span>

                    </div>


                    <button
                        type="button"
                        disabled={!editing}
                    >
                        Connect
                    </button>

                </div>


                <div className="social-account">

                    <div className="social-account-info">

                        <strong>
                            YouTube
                        </strong>

                        <span>
                            Not connected
                        </span>

                    </div>


                    <button
                        type="button"
                        disabled={!editing}
                    >
                        Connect
                    </button>

                </div>


                <div className="social-account">

                    <div className="social-account-info">

                        <strong>
                            X
                        </strong>

                        <span>
                            Not connected
                        </span>

                    </div>


                    <button
                        type="button"
                        disabled={!editing}
                    >
                        Connect
                    </button>

                </div>

            </div>

        </div>
    );
}