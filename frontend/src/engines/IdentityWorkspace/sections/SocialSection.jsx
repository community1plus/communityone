import "./SocialSection.css";

import { useState } from "react";

import useSocialVerification from "../../hooks/useSocialVerification";
import useAPI from "../../hooks/useAPI";
import { API_BASE } from "../../services/api";


const SOCIAL_PROVIDERS = [

    {
        id: "facebook",
        label: "Facebook",
        begin: "/facebook/begin",
        route: "/facebook/start",
    },

    {
        id: "instagram",
        label: "Instagram",
        begin: "/instagram/begin",
        route: "/instagram/start",
    },

    {
        id: "youtube",
        label: "YouTube",
        begin: "/youtube/begin",
        route: "/youtube/start",
    },

    {
        id: "x",
        label: "X",
        begin: "/x/begin",
        route: "/x/start",
    },

];


export default function SocialSection({

    form,
    editing,

}) {

    /*
     * Mount the existing OAuth callback handler.
     *
     * This is the legacy verification engine.
     */
    useSocialVerification();


    const {
        post,
        delete: deleteRequest,
    } = useAPI();


    const [
        busyProvider,
        setBusyProvider,
    ] = useState(null);


    const handleVerify = async (provider) => {

        if (!editing) {
            return;
        }


        if (
            !provider?.route ||
            !provider?.begin
        ) {
            return;
        }


        try {

            setBusyProvider(
                provider.id
            );


            /*
             * Establish the authenticated
             * user/session before OAuth starts.
             */
            await post(
                provider.begin
            );


            /*
             * Hand control to the provider.
             */
            window.location.assign(
                `${API_BASE}${provider.route}`
            );


        } catch (err) {

            console.error(
                `${provider.label} verification failed`,
                err
            );


            setBusyProvider(
                null
            );

        }

    };


    const handleDisconnect = async (provider) => {

        const confirmed =
            window.confirm(
                `Disconnect ${provider.label}?`
            );


        if (!confirmed) {
            return;
        }


        try {

            setBusyProvider(
                provider.id
            );


            await deleteRequest(
                `/${provider.id}/disconnect`
            );


            /*
             * Do not manually manufacture the
             * social state here.
             *
             * ProfileContext remains authoritative.
             *
             * If the existing useAPI/profile architecture
             * refreshes the profile, the form will rehydrate.
             */

        } catch (err) {

            console.error(
                `${provider.label} disconnect failed`,
                err
            );


        } finally {

            setBusyProvider(
                null
            );

        }

    };


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

                {SOCIAL_PROVIDERS.map(
                    (provider) => {

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


                        const busy =
                            busyProvider ===
                            provider.id;


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

                                        <>

                                            <span
                                                className="social-account-verified"
                                            >

                                                ✓ Verified

                                            </span>


                                            {editing && (

                                                <button
                                                    type="button"
                                                    className="social-account-disconnect"
                                                    disabled={busy}
                                                    onClick={() =>
                                                        handleDisconnect(
                                                            provider
                                                        )
                                                    }
                                                >

                                                    {busy
                                                        ? "Disconnecting..."
                                                        : "Disconnect"}

                                                </button>

                                            )}

                                        </>

                                    ) : (

                                        <button
                                            type="button"
                                            className="social-account-verify"
                                            disabled={
                                                !editing ||
                                                busy
                                            }
                                            onClick={() =>
                                                handleVerify(
                                                    provider
                                                )
                                            }
                                        >

                                            {busy
                                                ? "Connecting..."
                                                : "Verify"}

                                        </button>

                                    )}

                                </div>

                            </div>

                        );

                    }
                )}

            </div>

        </div>

    );

}