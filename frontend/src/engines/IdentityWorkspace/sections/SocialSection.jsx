import "./SocialSection.css";

import { useState } from "react";

import useSocialVerification from "../../../hooks/useSocialVerification";
import useAPI from "../../../hooks/useAPI";
import { useProfile } from "../../../context/ProfileContext";
import { API_BASE } from "../../../services/api";


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
     * OAuth callback completion.
     *
     * The hook is responsible for detecting the
     * verification callback and rehydrating the
     * profile after OAuth succeeds.
     */
    useSocialVerification();


    /*
     * ProfileContext is the authoritative source
     * for persisted profile state.
     */
    const {
        loadProfile,
    } = useProfile();


    const {
        post,
        delete: deleteRequest,
    } = useAPI();


    const [
        busyProvider,
        setBusyProvider,
    ] = useState(null);


    /*
     * ---------------------------------------------------------
     * VERIFY
     * ---------------------------------------------------------
     *
     * 1. Establish authenticated backend session.
     * 2. Redirect to OAuth provider.
     * 3. OAuth callback persists verification.
     * 4. useSocialVerification() reloads the profile.
     */
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


    /*
     * ---------------------------------------------------------
     * DISCONNECT
     * ---------------------------------------------------------
     *
     * Backend is authoritative.
     *
     * DELETE removes the provider from the persisted
     * profile. Once that succeeds, reload ProfileContext.
     *
     * Do NOT manually modify:
     *
     *     social.youtube
     *
     * in the form.
     *
     * The profile reload will flow back through:
     *
     * ProfileContext
     *      ↓
     * profile
     *      ↓
     * getInitialProfileValues()
     *      ↓
     * useForm()
     *      ↓
     * SocialSection
     *
     */
    const handleDisconnect = async (provider) => {

        if (!editing) {
            return;
        }


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


            /*
             * Persist the disconnect on the backend.
             */
            await deleteRequest(
                `/${provider.id}/disconnect`
            );


            /*
             * Rehydrate the authoritative profile.
             *
             * The backend has now removed the
             * provider from persisted social state.
             */
            await loadProfile({
                background: false,
            });


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

                        /*
                         * Read persisted state through the
                         * form/workspace model.
                         */

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