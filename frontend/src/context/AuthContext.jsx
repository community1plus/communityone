import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  fetchAuthSession,
  getCurrentUser,
  signInWithRedirect,
  signOut,
} from "aws-amplify/auth";


const AuthContext =
  createContext(null);


const GUEST_KEY =
  "community_guest";


/* =========================================
   NORMALISE USER
========================================= */

function normaliseUser(
  amplifyUser,
  tokens
) {

  if (!amplifyUser) {
    return null;
  }


  const idPayload =
    tokens?.idToken?.payload || {};


  const email =
    idPayload.email ||
    amplifyUser.signInDetails?.loginId ||
    "";


  const name =
    idPayload.name || "";


  const username =
    amplifyUser.username ||
    email ||
    "";


  const fallback =
    email?.split("@")[0] ||
    username ||
    "User";


  const displayName =
    name || fallback;


  const initials =
    displayName
      .split(/[\s._-]+/)
      .filter(Boolean)
      .map(
        part => part[0]
      )
      .join("")
      .slice(0, 2)
      .toUpperCase();


  return {

    id:
      amplifyUser.userId ||
      idPayload.sub ||
      amplifyUser.username ||
      email,

    sub:
      idPayload.sub ||
      amplifyUser.userId ||
      null,

    username,

    email,

    name,

    displayName,

    initials,

    raw:
      amplifyUser,

  };

}


/* =========================================
   AUTH PROVIDER
========================================= */

export function AuthProvider({
  children,
}) {

  const mountedRef =
    useRef(true);


  const [
    user,
    setUser,
  ] = useState(null);


  const [
    token,
    setToken,
  ] = useState(null);


  const [
    tokens,
    setTokens,
  ] = useState(null);


  const [
    isGuest,
    setIsGuest,
  ] = useState(() => {

    return (
      localStorage.getItem(
        GUEST_KEY
      ) === "true"
    );

  });


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    hydrating,
    setHydrating,
  ] = useState(false);


  /* =========================================
     MOUNT
  ========================================= */

  useEffect(() => {

    mountedRef.current = true;


    return () => {

      mountedRef.current = false;

    };

  }, []);


  /* =========================================
     CLEAR AUTH
  ========================================= */

  const clearAuth =
    useCallback(() => {

      if (!mountedRef.current) {
        return;
      }


      setUser(null);

      setToken(null);

      setTokens(null);

    }, []);


  /* =========================================
     REFRESH AUTH
  ========================================= */

  const refreshAuth =
    useCallback(
      async ({
        forceRefresh = false,
      } = {}) => {

        if (mountedRef.current) {

          setHydrating(true);

        }


        try {

          const amplifyUser =
            await getCurrentUser();


          const session =
            await fetchAuthSession({
              forceRefresh,
            });


          const accessToken =
            session.tokens?.idToken?.toString();


          if (!accessToken) {

            clearAuth();

            return null;

          }


          const normalisedUser =
            normaliseUser(
              amplifyUser,
              session.tokens
            );


          if (mountedRef.current) {

            setUser(
              normalisedUser
            );

            setToken(
              accessToken
            );

            setTokens(
              session.tokens
            );


            localStorage.removeItem(
              GUEST_KEY
            );

            setIsGuest(false);

          }


          /*
          =====================================
          IMPORTANT

          Return the NEW token as well as the
          normalised user.

          useAPI needs this immediately when
          retrying a request after a 401.
          =====================================
          */

          return {

            user:
              normalisedUser,

            token:
              accessToken,

          };

        } catch (err) {

          if (
            err?.name !==
              "UserUnAuthenticatedException" &&
            err?.name !==
              "NotAuthorizedException"
          ) {

            console.warn(
              "Auth refresh failed:",
              err?.name ||
              err?.message ||
              err
            );

          }


          clearAuth();

          return null;

        } finally {

          if (mountedRef.current) {

            setHydrating(false);

          }

        }

      },
      [
        clearAuth,
      ]
    );


  /* =========================================
     INITIAL AUTH
  ========================================= */

  useEffect(() => {

    async function initAuth() {

      try {

        await refreshAuth();

      } finally {

        if (mountedRef.current) {

          setLoading(false);

        }

      }

    }


    initAuth();

  }, [
    refreshAuth,
  ]);


  /* =========================================
     LOGIN
  ========================================= */

  const login =
    useCallback(
      async () => {

        localStorage.removeItem(
          GUEST_KEY
        );

        setIsGuest(false);


        await signInWithRedirect();

      },
      []
    );


  /* =========================================
     GUEST
  ========================================= */

  const continueAsGuest =
    useCallback(
      async () => {

        try {

          await signOut({
            global: false,
          });

        } catch (err) {

          console.warn(
            "Guest mode signOut warning:",
            err?.message || err
          );

        }


        clearAuth();


        localStorage.setItem(
          GUEST_KEY,
          "true"
        );


        setIsGuest(true);

        setLoading(false);

        setHydrating(false);

      },
      [
        clearAuth,
      ]
    );


  /* =========================================
     LOGOUT
  ========================================= */

  const logout =
    useCallback(
      async () => {

        try {

          await signOut({
            global: true,
          });

        } catch (err) {

          console.warn(
            "Logout warning:",
            err?.message || err
          );

        } finally {

          clearAuth();

          localStorage.removeItem(
            GUEST_KEY
          );

          setIsGuest(false);

          window.location.assign("/");

        }

      },
      [
        clearAuth,
      ]
    );


  /* =========================================
     AUTH STATE
  ========================================= */

  const isAuthenticated =
    Boolean(
      user &&
      token
    );


  const authLoading =
    loading ||
    hydrating;


  const role =
    isAuthenticated
      ? "member"
      : isGuest
      ? "guest"
      : "anonymous";


  /* =========================================
     CONTEXT VALUE
  ========================================= */

  const value =
    useMemo(
      () => ({

        user,

        token,

        tokens,

        loading,

        hydrating,

        authLoading,

        isAuthenticated,

        isGuest,

        role,

        login,

        logout,

        continueAsGuest,

        refreshAuth,

        clearAuth,

      }),
      [

        user,

        token,

        tokens,

        loading,

        hydrating,

        authLoading,

        isAuthenticated,

        isGuest,

        role,

        login,

        logout,

        continueAsGuest,

        refreshAuth,

        clearAuth,

      ]
    );


  return (

    <AuthContext.Provider
      value={value}
    >

      {children}

    </AuthContext.Provider>

  );

}


/* =========================================
   USE AUTH
========================================= */

export function useAuth() {

  const context =
    useContext(
      AuthContext
    );


  if (!context) {

    throw new Error(
      "useAuth must be used within AuthProvider"
    );

  }


  return context;

}