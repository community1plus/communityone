import { useMemo } from "react";

import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import { apiFetch } from "../services/api";


export default function useAPI() {

    const {
        token,
        refreshAuth,
    } = useAuth();

    const ui =
        useUI();


    const startSaving =
        ui?.startSaving;

    const stopSaving =
        ui?.stopSaving;


    /* =========================================
       REQUEST
    ========================================= */

    const request =
        useMemo(() => {

            return async (
                method,
                path,
                body = null,
                options = {}
            ) => {

                startSaving?.();


                try {

                    /* =====================================
                       FIRST REQUEST
                    ===================================== */

                    try {

                        return await apiFetch(
                            path,
                            {
                                method,
                                token,
                                body,
                                ...options,
                            }
                        );

                    } catch (error) {

                        /* =================================
                           AUTH FAILURE
                        ================================= */

                        if (
                            error?.status !== 401 ||
                            !refreshAuth
                        ) {

                            throw error;

                        }


                        console.warn(
                            "[API] 401 received — refreshing Cognito session"
                        );


                        /* =================================
                           REFRESH TOKEN
                        ================================= */

                        const refreshed =
                            await refreshAuth({
                                forceRefresh: true,
                            });


                        if (
                            !refreshed?.token
                        ) {

                            console.error(
                                "[API] Cognito token refresh failed"
                            );

                            throw error;

                        }


                        console.log(
                            "[API] Cognito token refreshed"
                        );


                        /* =================================
                           RETRY ONCE
                        ================================= */

                        return await apiFetch(
                            path,
                            {
                                method,

                                token:
                                    refreshed.token,

                                body,

                                ...options,
                            }
                        );

                    }

                } finally {

                    stopSaving?.();

                }

            };

        }, [
            token,
            refreshAuth,
            startSaving,
            stopSaving,
        ]);


    /* =========================================
       GET
    ========================================= */

    const get =
        useMemo(() => {

            return async (
                path,
                options = {}
            ) => {

                return apiFetch(
                    path,
                    {
                        method: "GET",
                        token,
                        ...options,
                    }
                );

            };

        }, [
            token,
        ]);


    /* =========================================
       API METHODS
    ========================================= */

    const api =
        useMemo(() => ({

            get,

            post:
                (
                    path,
                    body = null,
                    options = {}
                ) =>
                    request(
                        "POST",
                        path,
                        body,
                        options
                    ),

            patch:
                (
                    path,
                    body = null,
                    options = {}
                ) =>
                    request(
                        "PATCH",
                        path,
                        body,
                        options
                    ),

            put:
                (
                    path,
                    body = null,
                    options = {}
                ) =>
                    request(
                        "PUT",
                        path,
                        body,
                        options
                    ),

            delete:
                (
                    path,
                    body = null,
                    options = {}
                ) =>
                    request(
                        "DELETE",
                        path,
                        body,
                        options
                    ),

        }), [
            get,
            request,
        ]);


    /* =========================================
       PROFILE
    ========================================= */

    const patchProfile =
        (
            body,
            options = {}
        ) => {

            return api.patch(
                "/profile",
                body,
                options
            );

        };


    /* =========================================
       RETURN
    ========================================= */

    return {

        ...api,

        patchProfile,

    };

}