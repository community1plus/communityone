import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { fetchAuthSession } from "aws-amplify/auth";

import { useAuth } from "./AuthContext";
import useAPI from "../hooks/useAPI";
import { buildUrl } from "../services/api";

const ProfileContext =
    createContext(null);


const PROFILE_CACHE_PREFIX =
    "communityone_profile_cache";

const PROFILE_CACHE_TTL =
    1000 * 60 * 10;


/* =====================================================
   USER KEY
===================================================== */

function getUserKey(user) {

    if (!user) {
        return null;
    }


    if (typeof user === "string") {
        return user;
    }


    return (
        user?.id ||
        user?.userId ||
        user?.username ||
        user?.sub ||
        user?.attributes?.sub ||
        user?.attributes?.email ||
        user?.signInDetails?.loginId ||
        user?.email ||
        null
    );
}


/* =====================================================
   CACHE
===================================================== */

function getProfileCacheKey(userKey) {

    return `${PROFILE_CACHE_PREFIX}:${userKey}`;

}


function readProfileCache(userKey) {

    if (!userKey) {
        return null;
    }

    try {

        const raw =
            localStorage.getItem(
                getProfileCacheKey(userKey)
            );


        if (!raw) {
            return null;
        }


        const cached =
            JSON.parse(raw);


        if (!cached?.cachedAt) {
            return null;
        }


        const isFresh =
            Date.now() - cached.cachedAt <
            PROFILE_CACHE_TTL;


        return isFresh
            ? cached
            : null;

    } catch {

        return null;

    }

}


function writeProfileCache(
    userKey,
    profile,
    providers
) {

    if (!userKey) {
        return;
    }

    try {

        localStorage.setItem(

            getProfileCacheKey(userKey),

            JSON.stringify({

                profile,

                providers,

                cachedAt:
                    Date.now(),

            })

        );

    } catch {

        // Ignore cache failures.

    }

}


function clearProfileCache(userKey) {

    try {

        if (userKey) {

            localStorage.removeItem(
                getProfileCacheKey(userKey)
            );

            return;
        }


        Object.keys(localStorage)
            .forEach((key) => {

                if (
                    key.startsWith(
                        PROFILE_CACHE_PREFIX
                    )
                ) {

                    localStorage.removeItem(
                        key
                    );

                }

            });

    } catch {

        // Ignore cache failures.

    }

}


/* =====================================================
   PROVIDERS
===================================================== */

function normaliseProviders(
    providers = {}
) {

    return {

        facebook:
            typeof providers.facebook === "object"
                ? !!providers.facebook?.verified
                : !!providers.facebook,

        instagram:
            typeof providers.instagram === "object"
                ? !!providers.instagram?.verified
                : !!providers.instagram,

        youtube:
            typeof providers.youtube === "object"
                ? !!providers.youtube?.verified
                : !!providers.youtube,

        x:
            typeof providers.x === "object"
                ? !!providers.x?.verified
                : !!providers.x,

    };

}


/* =====================================================
   COMPLETION
===================================================== */

function getCompletedSections(
    profile,
    providers = {}
) {

    return {

        identity:
            !!profile?.username,

        location:
            !!(
                profile?.homeLocation?.lat &&
                profile?.homeLocation?.lng
            ),

        contact:
            !!(
                profile?.phone ||
                profile?.phoneDisplay
            ),

        social:
            !!(
                providers.facebook ||
                providers.instagram ||
                providers.youtube ||
                providers.x
            ),

        payment:
            !!profile?.paymentVerified,

        entity:
            !!(
                profile?.organisationProfile
                    ?.organisation_name ||

                profile?.organisation
                    ?.organisation_name
            ),

    };

}


function calculateCompletion(
    profile,
    providers
) {

    const sections =
        getCompletedSections(
            profile,
            providers
        );


    const values =
        Object.values(sections);


    const completed =
        values.filter(Boolean).length;


    return values.length
        ? Math.round(
            (completed / values.length) * 100
        )
        : 0;

}


function calculateBasicProfileCompletion(
    profile
) {

    if (!profile) {
        return 0;
    }


    const checks = [

        Boolean(
            profile.username?.trim()
        ),

        Boolean(
            profile.phone ||
            profile.phoneDisplay
        ),

        Boolean(
            profile.homeLocation &&
            typeof profile.homeLocation.lat ===
                "number" &&
            typeof profile.homeLocation.lng ===
                "number"
        ),

    ];


    const completed =
        checks.filter(Boolean).length;


    return Math.round(
        (completed / checks.length) * 100
    );

}


/* =====================================================
   API
===================================================== */

function normaliseApiResponse(res) {

    return res?.data || res || {};

}


function isNotFoundError(err) {

    const status =
        err?.response?.status ||
        err?.status;


    const data =
        err?.response?.data;


    return (
        status === 404 ||
        data?.error ===
            "Profile not found" ||
        data?.profile === null
    );

}


/* =====================================================
   CLIENT ENDPOINT
===================================================== */

function getClientEndpointDetails() {

    return {

        deviceName:
            navigator.platform || "",

        deviceType:
            /Mobi|Android|iPhone|iPad/i.test(
                navigator.userAgent
            )
                ? "mobile"
                : "desktop",

        userAgent:
            navigator.userAgent || "",

        platform:
            navigator.platform || "",

        language:
            navigator.language || "",

        timezone:
            Intl.DateTimeFormat()
                .resolvedOptions()
                .timeZone || "",

        screen: {

            width:
                window.screen?.width || null,

            height:
                window.screen?.height || null,

        },

        viewport: {

            width:
                window.innerWidth || null,

            height:
                window.innerHeight || null,

        },

        capturedAt:
            new Date().toISOString(),

    };

}


/* =====================================================
   PROVIDER
===================================================== */

export function ProfileProvider({
    children,
}) {

    const api =
        useAPI();


    const {
    user,
    meData,
    participationError,
    isAuthenticated,
    loading,
    authLoading,
    isGuest,
} = useAuth();


    /* =================================================
       AUTH STATE
    ================================================= */

    const userKey =
        getUserKey(user);


    const authSettled =
        !loading &&
        !authLoading;


    const waitingForUserKey =
        authSettled &&
        isAuthenticated &&
        !isGuest &&
        !userKey;


    const profileShouldWait =
        !authSettled ||
        waitingForUserKey;


    /* =================================================
       CACHE
    ================================================= */

    const cachedOnRender =
        isAuthenticated && userKey
            ? readProfileCache(userKey)
            : null;


    /* =================================================
       REFS
    ================================================= */

    const apiRef =
        useRef(api);


    const loadingRef =
        useRef(false);


    const currentUserKeyRef =
        useRef(userKey);


    /*
     * Tracks whether the current authenticated user
     * has already completed profile bootstrap.
     *
     * IMPORTANT:
     * This prevents profile state changes from
     * re-triggering the bootstrap lifecycle.
     */

    const profileBootstrapUserRef =
        useRef(null);



useEffect(() => {
    if (profileShouldWait) {
        setProfileLoading(true);
        return;
    }

    if (!isAuthenticated || isGuest) {
        profileBootstrapUserRef.current = null;
        currentUserKeyRef.current = userKey;

        clearProfileState({ loading: false });
        clearProfileCache();

        return;
    }

    if (!userKey || !meData) {
        if (!userKey) return;

        // The shared request failed or returned no data.
        setProfileError(
            participationError || "Unable to load account profile."
        );
        setProfileLoading(false);
        return;
    }

    if (profileBootstrapUserRef.current === userKey) {
        return;
    }

    profileBootstrapUserRef.current = userKey;

    currentUserKeyRef.current = userKey;

    const rawProfile = meData.profile || {};

    const hasUsername = Object.prototype.hasOwnProperty.call(
        rawProfile,
        "username"
    );

    const nextProfile = {
        ...rawProfile,
        username: hasUsername
            ? rawProfile.username
            : (meData.user?.username || ""),
    };

    const nextProviders = meData.providers || {};

    setAccountUser(meData.user || null);

    setProfile(nextProfile);

    setProviders(normaliseProviders(nextProviders));

    setProfileMissing(!meData.profile);

    setProfileError(null);

    setProfileLoading(false);

    writeProfileCache(
        userKey,
        nextProfile,
        nextProviders
    );

}, [
    profileShouldWait,
    isAuthenticated,
    isGuest,
    userKey,
    meData,
    participationError,
    clearProfileState,
]);



    /* =================================================
       STATE
    ================================================= */

    const [
        profile,
        setProfile,
    ] = useState(
        cachedOnRender?.profile || null
    );

    
const [
    accountUser,
    setAccountUser,
] = useState(null);


    const [
        providers,
        setProviders,
    ] = useState(
        normaliseProviders(
            cachedOnRender?.providers || {}
        )
    );


    const [
        profileLoading,
        setProfileLoading,
    ] = useState(

        Boolean(
            profileShouldWait ||

            (
                isAuthenticated &&
                !cachedOnRender
            )
        )

    );


    const [
        profileSaving,
        setProfileSaving,
    ] = useState(false);


    const [
        profileError,
        setProfileError,
    ] = useState(null);


    const [
        profileMissing,
        setProfileMissing,
    ] = useState(false);


    /* =================================================
       STATE HELPERS
    ================================================= */

    const clearProfileState =
        useCallback(
            ({
                loading = true,
                missing = false,
            } = {}) => {

                setProfile(null);
                setAccountUser(null);

                setProviders(
                    normaliseProviders()
                );

                setProfileMissing(
                    missing
                );

                setProfileError(null);

                setProfileLoading(
                    loading
                );

            },
            []
        );


    const markProfileReady =
        useCallback(
            (
                nextProfile = null,
                nextProviders = {},
                missing = false
            ) => {

                setProfile(
                    nextProfile
                );

                setProviders(
                    normaliseProviders(
                        nextProviders
                    )
                );

                setProfileMissing(
                    missing
                );

                setProfileError(
                    null
                );

                setProfileLoading(
                    false
                );

            },
            []
        );


    /* =================================================
       AUTH HEADERS
    ================================================= */



const getAuthHeaders = useCallback(
  async (extraHeaders = {}) => {
    const session = await fetchAuthSession({
      forceRefresh: true,
    });

    const idToken = session.tokens?.idToken;
    const accessToken = session.tokens?.accessToken;
    const idTokenString = idToken?.toString();

    if (import.meta.env.DEV) {
      console.log("[AMPLIFY AUTH DIAGNOSTIC]", {
        hasTokensObject: Boolean(session.tokens),
        hasIdToken: Boolean(idToken),
        idTokenType: typeof idToken,
        idTokenStringLength: idTokenString?.length ?? 0,
        hasAccessToken: Boolean(accessToken),
        isAuthenticated,
        isGuest,
      });
    }

    if (!idTokenString || idTokenString === "undefined") {
      throw new Error(
        "No ID token available in the Amplify session"
      );
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idTokenString}`,
      ...extraHeaders,
    };
  },
  [isAuthenticated, isGuest]
);


const testAccountEmailVerification = useCallback(async () => {
    try {
        const headers = await getAuthHeaders();

        const response = await fetch(
    buildUrl("/account-email-verification/start"),
    {
        method: "POST",
        headers,
    }
);

        const result = await response.json();

        if (!response.ok || result.success !== true) {
    throw new Error(
        result.error ||
        result.message ||
        `Unable to send verification code (HTTP ${response.status}).`
    );
}
        console.log("Account verification test:", {
            status: response.status,
            result,
        });

        return result;
    } catch (error) {
        console.error("Account verification test failed:", error);
        throw error;
    }
}, [getAuthHeaders]);


const confirmAccountEmailVerification = useCallback(
    async (code) => {
        const normalizedCode = String(code || "").trim();

        if (!/^\d{6}$/.test(normalizedCode)) {
            throw new Error("Enter the six-digit verification code.");
        }

        const headers = await getAuthHeaders();

        const response = await fetch(
    buildUrl("/account-email-verification/confirm"),
    {
        method: "POST",
        headers,
        body: JSON.stringify({
            code: normalizedCode,
        }),
    }
);

        const result = await response.json().catch(() => ({}));

        if (!response.ok || result.success !== true || result.verified !== true) {
            throw new Error(
                result.error ||
                result.message ||
                `Email verification failed (HTTP ${response.status}).`
            );
        }

        return result;
    },
    [getAuthHeaders]
);
    /* =================================================
       LOAD PROFILE
    ================================================= */

    const loadProfile =
        useCallback(
            async ({
                background = false,
            } = {}) => {

                /*
                 * Do not attempt API calls until
                 * authentication has settled.
                 */

                if (profileShouldWait) {

                    return null;

                }


                /*
                 * Signed out / guest.
                 */

                if (
                    !isAuthenticated ||
                    isGuest
                ) {

                    clearProfileState({
                        loading: false,
                    });

                    clearProfileCache();

                    return null;

                }


                /*
                 * Prevent overlapping profile requests.
                 */

                if (loadingRef.current) {
                    return null;
                }


                loadingRef.current =
                    true;


                if (!background) {

                    setProfileLoading(
                        true
                    );

                }


                try {

                    const headers =
                        await getAuthHeaders();


const res =
    await apiRef.current.get(
        "/me",
        {
            headers,
            params: {
                _refresh: Date.now(),
            },
        }
    );


                    const payload =
                        normaliseApiResponse(
                            res
                        );

                    setAccountUser(payload?.user || null);

                    console.log("[PROFILE EMAIL STATUS RECEIVED]", {
    email: payload?.user?.email,
    emailVerified: payload?.user?.emailVerified,
});    
                    /*
                     * Preserve the backend profile
                     * as authoritative.
                     *
                     * Only fall back to the user
                     * username if the profile object
                     * does not actually contain a
                     * username property.
                     */

                    const rawProfile =
                        payload?.profile || {};


                    const hasUsername =
                        Object.prototype
                            .hasOwnProperty
                            .call(
                                rawProfile,
                                "username"
                            );


                    const nextProfile = {

                        ...rawProfile,

                        username:
                            hasUsername
                                ? rawProfile.username
                                : (
                                    payload
                                        ?.user
                                        ?.username ||
                                    ""
                                ),

                    };


                    const nextProviders =
                        payload?.providers || {};


                    writeProfileCache(
                        userKey,
                        nextProfile,
                        nextProviders
                    );


                    markProfileReady(
                        nextProfile,
                        nextProviders,
                        !payload?.profile
                    );


                    return nextProfile;

                } catch (err) {

                    if (
                        isNotFoundError(err)
                    ) {

                        clearProfileCache(
                            userKey
                        );

                        setAccountUser(null);


                        markProfileReady(
                            null,
                            {},
                            true
                        );


                        return null;

                    }


                    console.error(
                        "Profile load failed:",
                        err
                    );


                    setProfileError(
                        err?.message ||
                        "Profile load failed"
                    );


                    setProfileLoading(
                        false
                    );


                    return null;

                } finally {

                    loadingRef.current =
                        false;

                }

            },
            [
                profileShouldWait,
                isAuthenticated,
                isGuest,
                userKey,
                getAuthHeaders,
                markProfileReady,
                clearProfileState,
            ]
        );


    /* =================================================
       PROFILE BOOTSTRAP
    ================================================= */

    useEffect(() => {

        /*
         * -------------------------------------------------
         * WAIT FOR AUTH
         * -------------------------------------------------
         */

        if (profileShouldWait) {

            setProfileLoading(true);

            return;
        }


        /*
         * -------------------------------------------------
         * SIGNED OUT / GUEST
         * -------------------------------------------------
         */

        if (
            !isAuthenticated ||
            isGuest
        ) {

            profileBootstrapUserRef.current =
                null;

            currentUserKeyRef.current =
                userKey;

            clearProfileState({
                loading: false,
            });

            clearProfileCache();

            return;
        }


        /*
         * -------------------------------------------------
         * AUTHENTICATED BUT NO USER KEY
         * -------------------------------------------------
         */

        if (!userKey) {
            return;
        }


        /*
         * -------------------------------------------------
         * BOOTSTRAP GUARD
         *
         * This is the key protection against:
         *
         * profile change
         *      ↓
         * bootstrap
         *      ↓
         * loadProfile
         *      ↓
         * setProfile
         *      ↓
         * bootstrap
         *
         * The same authenticated user can only
         * bootstrap once during this auth lifecycle.
         * -------------------------------------------------
         */

        if (
            profileBootstrapUserRef.current ===
            userKey
        ) {

            return;
        }


        /*
         * Mark BEFORE starting async work.
         */

        profileBootstrapUserRef.current =
            userKey;


        /*
         * -------------------------------------------------
         * USER CHANGE
         * -------------------------------------------------
         */

        const userChanged =
            currentUserKeyRef.current !==
            userKey;


        currentUserKeyRef.current =
            userKey;


        /*
         * -------------------------------------------------
         * CACHE
         * -------------------------------------------------
         */

        const cached =
            readProfileCache(userKey);


        /*
         * -------------------------------------------------
         * NEW USER
         * -------------------------------------------------
         */

        if (userChanged) {
            setAccountUser(null);

            setProfile(
                cached?.profile || null
            );

            setProviders(
                normaliseProviders(
                    cached?.providers || {}
                )
            );

            setProfileMissing(
                !cached?.profile
            );

            setProfileError(null);

            setProfileLoading(
                !cached?.profile
            );


            if (cached) {

                loadProfile({
                    background: true,
                });

            } else {

                loadProfile({
                    background: false,
                });

            }

            return;
        }


        /*
         * -------------------------------------------------
         * EXISTING USER + CACHE
         * -------------------------------------------------
         *
         * Show cached profile immediately and refresh
         * from the server in the background.
         */

        if (cached) {

            setProfile(
                cached.profile || null
            );

            setProviders(
                normaliseProviders(
                    cached.providers || {}
                )
            );

            setProfileMissing(
                !cached.profile
            );

            setProfileError(null);

            setProfileLoading(false);


            loadProfile({
                background: true,
            });


            return;
        }


        /*
         * -------------------------------------------------
         * EXISTING USER + NO CACHE
         * -------------------------------------------------
         *
         * If a profile is already in React state,
         * preserve it while refreshing.
         */

        if (!profile) {

            setProfile(null);
            setAccountUser(null);
            setProviders(
                normaliseProviders()
            );

            setProfileMissing(false);

            setProfileError(null);

            setProfileLoading(true);

        }


        loadProfile({
            background: Boolean(profile),
        });


    }, [
        profileShouldWait,
        isAuthenticated,
        isGuest,
        userKey,
        loadProfile,
        clearProfileState,
    ]);


    /* =================================================
       SAVE PROFILE
    ================================================= */

    const saveProfile =
        useCallback(
            async (nextProfile) => {

                if (
                    !isAuthenticated ||
                    isGuest
                ) {

                    throw new Error(
                        "User is not authenticated"
                    );

                }


                setProfileSaving(true);

                setProfileError(null);


                const previousProfile =
                    profile;


                try {

                    const headers =
                        await getAuthHeaders({

                            "x-version":
                                previousProfile?.version
                                    ? String(
                                        previousProfile.version
                                    )
                                    : "",

                        });


                    const payloadToSave = {

                        ...nextProfile,

                        endpoint:
                            getClientEndpointDetails(),

                    };


                    const res =
                        await apiRef.current.put(
                            "/profile",
                            payloadToSave,
                            { headers }
                        );


                    const payload =
                        normaliseApiResponse(
                            res
                        );


                    const savedProfile =
                        payload?.profile ||
                        {
                            ...profile,
                            ...nextProfile,
                        };


                    const nextProviders =
                        savedProfile?.social || {};


                    setProfile(
                        savedProfile
                    );

                    setProviders(
                        normaliseProviders(
                            nextProviders
                        )
                    );

                    setProfileMissing(
                        false
                    );

                    setProfileLoading(
                        false
                    );


                    writeProfileCache(
                        userKey,
                        savedProfile,
                        nextProviders
                    );


                    return savedProfile;

                } catch (err) {

                    const status =
                        err?.response?.status ||
                        err?.status;


                    if (status === 409) {

                        const serverProfile =
                            err?.response?.data
                                ?.serverProfile;


                        if (serverProfile) {

                            setProfile(
                                serverProfile
                            );

                            setProfileMissing(
                                false
                            );

                            setProfileLoading(
                                false
                            );


                            writeProfileCache(
                                userKey,
                                serverProfile,
                                providers
                            );


                            return serverProfile;

                        }

                    }


                    console.error(
                        "Profile save failed:",
                        err
                    );


                    setProfileError(
                        err?.message ||
                        "Profile save failed"
                    );


                    throw err;

                } finally {

                    setProfileSaving(
                        false
                    );

                }

            },
            [
                isAuthenticated,
                isGuest,
                userKey,
                profile,
                providers,
                getAuthHeaders,
            ]
        );


    /* =================================================
       PATCH PROFILE
    ================================================= */

    const patchProfile =
        useCallback(
            async (patch) => {

                if (
                    !isAuthenticated ||
                    isGuest
                ) {

                    throw new Error(
                        "User is not authenticated"
                    );

                }


                setProfileSaving(true);

                setProfileError(null);


                try {

                    const headers =
                        await getAuthHeaders({

                            "x-version":
                                profile?.version
                                    ? String(
                                        profile.version
                                    )
                                    : "",

                        });


                    const payloadToPatch = {

                        ...patch,

                        endpoint:
                            getClientEndpointDetails(),

                    };


                    const res =
                        await apiRef.current.patch(
                            "/profile",
                            payloadToPatch,
                            { headers }
                        );


                    const payload =
                        normaliseApiResponse(
                            res
                        );


                    const savedProfile =
                        payload?.profile;


                    const nextProviders =
                        savedProfile?.social || {};


                    setProfile(
                        savedProfile
                    );

                    setProviders(
                        normaliseProviders(
                            nextProviders
                        )
                    );

                    setProfileMissing(
                        false
                    );

                    setProfileLoading(
                        false
                    );


                    writeProfileCache(
                        userKey,
                        savedProfile,
                        nextProviders
                    );


                    return savedProfile;

                } catch (err) {

                    console.error(
                        "Profile patch failed:",
                        err
                    );


                    setProfileError(
                        err?.message ||
                        "Profile patch failed"
                    );


                    throw err;

                } finally {

                    setProfileSaving(
                        false
                    );

                }

            },
            [
                isAuthenticated,
                isGuest,
                userKey,
                profile,
                getAuthHeaders,
            ]
        );


    /* =================================================
       DERIVED STATE
    ================================================= */

    const completionPercent =
        useMemo(
            () =>
                calculateCompletion(
                    profile,
                    providers
                ),
            [
                profile,
                providers,
            ]
        );


    const basicProfileCompletion =
        useMemo(
            () =>
                calculateBasicProfileCompletion(
                    profile
                ),
            [profile]
        );


    /*
     * Basic account access is based only on:
     *
     * username
     * phone
     * home location
     */

    const hasProfile =
        !profileMissing &&
        basicProfileCompletion === 100;


    const profileReady =
        authSettled &&
        !waitingForUserKey &&
        !profileLoading;


    /* =================================================
       CONTEXT VALUE
    ================================================= */

const value = useMemo(
    () => ({
        profile,
        setProfile,

        accountUser,

        providers,
        setProviders,

        profileLoading,
        profileReady,
        profileSaving,
        profileError,
        profileMissing,

        completionPercent,
        basicProfileCompletion,
        hasProfile,

        loadProfile,
        saveProfile,
        patchProfile,
        testAccountEmailVerification,
        confirmAccountEmailVerification,
    }),
    [
        profile,
        accountUser,
        providers,
        profileLoading,
        profileReady,
        profileSaving,
        profileError,
        profileMissing,
        completionPercent,
        basicProfileCompletion,
        hasProfile,
        loadProfile,
        saveProfile,
        patchProfile,
        testAccountEmailVerification,
        confirmAccountEmailVerification,
    ]
);

    /* =================================================
       DEVELOPMENT DIAGNOSTIC
    ================================================= */

    useEffect(() => {

        if (
            import.meta.env?.DEV
        ) {

            console.log(
                "PROFILE CONTEXT STATE",
                {
                    userKey,
                    profile,
                    hasProfile,
                    profileMissing,
                    profileLoading,
                    profileReady,
                    completionPercent,
                    basicProfileCompletion,
                }
            );

        }

    }, [
        userKey,
        profile,
        hasProfile,
        profileMissing,
        profileLoading,
        profileReady,
        completionPercent,
        basicProfileCompletion,
    ]);


    return (

        <ProfileContext.Provider
            value={value}
        >

            {children}

        </ProfileContext.Provider>

    );

}


/* =====================================================
   CONSUMER HOOK
===================================================== */

export function useProfile() {

    const context =
        useContext(
            ProfileContext
        );


    if (!context) {

        throw new Error(
            "useProfile must be used within ProfileProvider"
        );

    }


    return context;

}