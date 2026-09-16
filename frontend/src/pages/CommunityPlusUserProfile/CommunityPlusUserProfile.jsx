import {
    getInitialProfileValues,
    calculateProfileCompletion,
    calculateProfileSectionCompletion,
} from "../../framework/Workspace/profile/profileHelpers";

import {
    useState,
    useEffect,
    useMemo,
    useCallback,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    useAuth,
} from "../../context/AuthContext";

import {
    useProfile,
} from "../../context/ProfileContext";

import useAPI
    from "../../hooks/useAPI";

import useForm
    from "../../hooks/useForm";

import IdentityWorkspace
    from "../../engines/IdentityWorkspace/IdentityWorkspace";

import EntityWorkspace
    from "../../engines/IdentityWorkspace/EntityWorkspace";

import {
    PERSONAL_STEPS,
    ENTITY_STEPS,
    COMMON_STEPS,
} from "../../framework/Workspace/profile/profileConstants";

import {
    buildProfilePayload,
} from "./profilePayload";

import {
    createWorkspaceSectionController,
} from "../../framework/Workspace/controllers/WorkspaceSectionController";

import "./CommunityPlusUserProfile.css";


/* =====================================================
   STORAGE
===================================================== */

const PERSON_SECTION_STORAGE_KEY =
    "profileCurrentSection:person";

const ENTITY_SECTION_STORAGE_KEY =
    "profileCurrentSection:entity";


/* =====================================================
   COMPONENT
===================================================== */

export default function CommunityPlusUserProfile({

    onComplete,

    editMode = true,

    initialCapability = "identity",

}) {

    /* =================================================
       NAVIGATION
    ================================================= */

    const navigate =
        useNavigate();


    /* =================================================
       CONTEXT
    ================================================= */

    const {
        user,
    } = useAuth();


    const {
        profile,
    } = useProfile();


    const {
        patchProfile,
    } = useAPI();


    /* =================================================
       LOCAL STATE
    ================================================= */

    const [
        savingSection,
        setSavingSection,
    ] = useState(false);


    const [
        editingSections,
        setEditingSections,
    ] = useState({});


    /* =================================================
       PROFILE → FORM
    =================================================

       ProfileContext owns the canonical profile.

       getInitialProfileValues converts the
       backend representation into the form
       representation expected by CPF.

    ================================================= */

    const profileInitialValues =
        useMemo(
            () =>
                getInitialProfileValues({
                    profile,
                    user,
                }),
            [
                profile,
                user,
            ]
        );


    /* =================================================
       FORM
    ================================================= */

    const form =
        useForm({
            initialValues:
                profileInitialValues,
        });


    const {
        values,
        setValues,
    } = form;


    /* =================================================
       PROFILE HYDRATION
    =================================================

       ProfileContext can update in stages:

           initial render
                ↓
           cached profile
                ↓
           /me
                ↓
           canonical profile
                ↓
           ProfileContext
                ↓
           form hydration

       Do not use a one-time hydration ref.

       The canonical ProfileContext value must be
       allowed to replace an earlier cached value.

    ================================================= */

    useEffect(() => {

        if (!profile) {
            return;
        }


        const hydratedValues =
            getInitialProfileValues({
                profile,
                user,
            });


        console.log(
            "🔥 PROFILE HYDRATION:",
            JSON.stringify(
                hydratedValues,
                null,
                2
            )
        );


        setValues(
            hydratedValues
        );

    }, [
        profile,
        user,
        setValues,
    ]);


    /* =================================================
       IDENTITY TYPE
    ================================================= */

    const isEntity =
        values.identityType === "ENTITY" ||
        values.capabilities?.entity;


    /* =================================================
       PROFILE SECTIONS
    =================================================

       PERSONAL:

           Personal Identity
           Location
           Contact
           Social
           Payment

       ENTITY:

           Person Identity
           Entity
           Entity Address
           Entity Contact
           Social
           Payment

       The authenticated person remains the identity
       operating the Entity.

    ================================================= */

    const sections =
        useMemo(() => {

            if (isEntity) {

                return [

                    /* -----------------------------
                       PERSON IDENTITY
                    ----------------------------- */

                    ...PERSONAL_STEPS.slice(0, 1),


                    /* -----------------------------
                       ENTITY
                    ----------------------------- */

                    ...ENTITY_STEPS,


                    /* -----------------------------
                       COMMON CAPABILITIES
                    ----------------------------- */

                    ...COMMON_STEPS,

                ];

            }


            return [

                /* -----------------------------
                   PERSONAL PROFILE
                ----------------------------- */

                ...PERSONAL_STEPS,


                /* -----------------------------
                   COMMON CAPABILITIES
                ----------------------------- */

                ...COMMON_STEPS,

            ];

        }, [
            isEntity,
        ]);


    /* =================================================
       SECTION STORAGE
    ================================================= */

    const storageKey =
        isEntity
            ? ENTITY_SECTION_STORAGE_KEY
            : PERSON_SECTION_STORAGE_KEY;


    /* =================================================
       DEFAULT SECTION
    ================================================= */

    const defaultSection =
        useMemo(() => {

            const defaultSectionId =
                isEntity
                    ? "entity"
                    : "identity";


            return sections.findIndex(
                section =>
                    section.id ===
                    defaultSectionId
            );

        }, [
            isEntity,
            sections,
        ]);


    /* =================================================
       CURRENT SECTION
    ================================================= */

    const [
        currentSection,
        setCurrentSection,
    ] = useState(() => {

        const saved =
            sessionStorage.getItem(
                storageKey
            );


        if (saved !== null) {

            const savedIndex =
                Number(saved);


            if (
                Number.isInteger(
                    savedIndex
                )
                &&
                savedIndex >= 0
            ) {

                return savedIndex;

            }

        }


        return defaultSection >= 0
            ? defaultSection
            : 0;

    });


    /* =================================================
       CAPABILITY SWITCH
    =================================================

       Person and Entity maintain independent
       navigation positions.

       If the saved position is no longer valid,
       move to the capability's default section.

    ================================================= */

    useEffect(() => {

        const saved =
            sessionStorage.getItem(
                storageKey
            );


        if (saved !== null) {

            const savedIndex =
                Number(saved);


            if (
                Number.isInteger(
                    savedIndex
                )
                &&
                savedIndex >= 0
                &&
                savedIndex < sections.length
            ) {

                setCurrentSection(
                    savedIndex
                );

                return;

            }

        }


        setCurrentSection(
            defaultSection >= 0
                ? defaultSection
                : 0
        );

    }, [
        storageKey,
        sections,
        defaultSection,
    ]);


    /* =================================================
       CURRENT SECTION STORAGE
    ================================================= */

    useEffect(() => {

        sessionStorage.setItem(
            storageKey,
            String(
                currentSection
            )
        );

    }, [
        storageKey,
        currentSection,
    ]);


    /* =================================================
       SECTION CONTROLLER
    ================================================= */

    const sectionController =
        useMemo(
            () =>
                createWorkspaceSectionController({
                    sections,

                    current:
                        currentSection,

                    setCurrent:
                        setCurrentSection,
                }),

            [
                sections,
                currentSection,
            ]
        );


    /* =================================================
       PROFILE COMPLETION
    ================================================= */

    const completion =
        useMemo(
            () =>
                calculateProfileCompletion(
                    values
                ),

            [
                values,
            ]
        );


    /* =================================================
       SECTION COMPLETION
    ================================================= */

    const sectionCompletion =
        useMemo(
            () =>
                Object.fromEntries(

                    sections.map(
                        section => [

                            section.id,

                            calculateProfileSectionCompletion(
                                values,
                                section.id
                            ),

                        ]
                    )

                ),

            [
                sections,
                values,
            ]
        );


    /* =================================================
       EDIT SECTION
    ================================================= */

    const setSectionEditing =
        useCallback(
            (
                sectionId,
                editing
            ) => {

                if (!sectionId) {
                    return;
                }


                setEditingSections(
                    previous => ({

                        ...previous,

                        [sectionId]:
                            Boolean(
                                editing
                            ),

                    })
                );

            },

            []
        );


    /* =================================================
       CLEAR SECTION
    ================================================= */

    const clearSection =
        useCallback(
            (sectionId) => {

                if (!sectionId) {
                    return;
                }


                const section =
                    sections.find(
                        item =>
                            item.id ===
                            sectionId
                    );


                if (!section) {
                    return;
                }


                section.fields?.forEach(
                    field => {

                        if (!field?.name) {
                            return;
                        }


                        form.setValue(
                            field.name,
                            ""
                        );

                    }
                );

            },

            [
                sections,
                form,
            ]
        );


    /* =================================================
       RESET SECTION
    =================================================

       useForm remains the authority for reset
       semantics.

       This deliberately resets the entire form,
       matching the existing behaviour.

    ================================================= */

    const resetSection =
        useCallback(
            (sectionId) => {

                if (!sectionId) {
                    return;
                }


                form.reset();


                setEditingSections(
                    previous => ({

                        ...previous,

                        [sectionId]:
                            false,

                    })
                );

            },

            [
                form,
            ]
        );


    /* =================================================
       SAVE SECTION
    =================================================

       Flow:

           CPF form values
                  ↓
           buildProfilePayload()
                  ↓
           PATCH /profile
                  ↓
           success
                  ↓
           exit edit mode

       We intentionally do NOT call loadProfile()
       after PATCH here.

       The active workspace already contains the
       values confirmed by the successful PATCH.

    ================================================= */

    const handleSaveSection =
        useCallback(
            async (sectionId) => {

                if (!sectionId) {
                    return;
                }


                try {

                    setSavingSection(
                        true
                    );


                    console.log(
                        "🔥 PROFILE SAVE SECTION:",
                        sectionId
                    );


                    console.log(
                        "🔥 PROFILE SAVE VALUES:",
                        JSON.stringify(
                            values,
                            null,
                            2
                        )
                    );


                    const payload =
                        buildProfilePayload({
                            values,

                            userEmail:
                                user?.email,

                            homeLocation:
                                values.homeLocation,
                        });


                    console.log(
                        "🔥 PROFILE SAVE PAYLOAD:",
                        JSON.stringify(
                            payload,
                            null,
                            2
                        )
                    );


                    await patchProfile(
                        payload
                    );


                    setEditingSections(
                        previous => ({

                            ...previous,

                            [sectionId]:
                                false,

                        })
                    );


                    console.log(
                        "✅ PROFILE SAVE SUCCESS:",
                        sectionId
                    );


                    if (onComplete) {
                        onComplete();
                    }

                } catch (error) {

                    console.error(
                        "[PROFILE SAVE] FAILED:",
                        error
                    );

                } finally {

                    setSavingSection(
                        false
                    );

                }

            },

            [
                values,
                user?.email,
                patchProfile,
                onComplete,
            ]
        );


    /* =================================================
       CLOSE PROFILE
    ================================================= */

    const closeProfile =
        useCallback(
            () => {

                navigate(
                    "/communityplus",
                    {
                        replace: true,
                    }
                );

            },

            [
                navigate,
            ]
        );


    /* =================================================
       WORKSPACE STATE
    ================================================= */

    const workspaceState = {

        values,

        form,

        editingSections,

        savingSection,

        sections,

        currentSection,

        completion,

        sectionCompletion,

    };


    /* =================================================
       WORKSPACE ACTIONS
    ================================================= */

    const workspaceActions = {

        goToSection:
            sectionController.goTo,

        setSectionEditing,

        handleSaveSection,

        clearSection,

        resetSection,

        closeProfile,

    };


    /* =================================================
       WORKSPACE
    ================================================= */

    if (isEntity) {

        return (

            <EntityWorkspace

                initialCapability="entity"

                state={
                    workspaceState
                }

                actions={
                    workspaceActions
                }

            />

        );

    }


    return (

        <IdentityWorkspace

            initialCapability={
                initialCapability
            }

            state={
                workspaceState
            }

            actions={
                workspaceActions
            }

        />

    );

}