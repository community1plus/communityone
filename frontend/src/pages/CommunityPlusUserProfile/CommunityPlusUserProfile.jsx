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


export default function CommunityPlusUserProfile({

    onComplete,

    editMode = true,

    initialCapability = "identity",

}) {

    /* =====================================
       NAVIGATION
    ===================================== */

    const navigate =
        useNavigate();


    /* =====================================
       CONTEXT
    ===================================== */

    const {
        user,
    } = useAuth();


    const {
        profile,
    } = useProfile();


    const {
        patchProfile,
    } = useAPI();


    /* =====================================
       LOCAL STATE
    ===================================== */

    const [
        savingSection,
        setSavingSection,
    ] = useState(false);


    const [
        editingSections,
        setEditingSections,
    ] = useState({});


    /* =====================================
       PROFILE INITIAL VALUES

       Convert the canonical profile from
       ProfileContext into the workspace
       form structure.
    ===================================== */

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


    /* =====================================
       FORM

       useForm owns the active workspace
       editing state.

       initialValues establishes the initial
       form state. Hydration below handles
       subsequent ProfileContext updates.
    ===================================== */

    const form =
        useForm({
            initialValues:
                profileInitialValues,
        });


    const {
        values,
        setValues,
    } = form;


    /* =====================================
       PROFILE HYDRATION

       ProfileContext may provide profile
       data in stages.

       Example:

           render
             ↓
           cached profile
             ↓
           background /me request
             ↓
           canonical profile
             ↓
           ProfileContext update

       The previous implementation used
       hydratedProfileRef to hydrate only
       once.

       That meant the cached profile could
       become the "hydrated" state before
       the canonical API profile arrived.

       The workspace now hydrates whenever
       ProfileContext supplies a profile.

       IMPORTANT:

       handleSaveSection does NOT call
       loadProfile() after PATCH.

       Therefore a successful local save
       remains authoritative for the active
       workspace session.
    ===================================== */

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


    /* =====================================
       IDENTITY TYPE
    ===================================== */

    const isEntity =
        values.identityType === "ENTITY" ||
        values.capabilities?.entity;


    /* =====================================
       PROFILE SECTIONS

       PERSON
           Personal sections
           +
           Common capabilities

       ENTITY
           Person identity
           +
           Entity sections
           +
           Common capabilities
    ===================================== */

    const sections =
        useMemo(() => {

            if (isEntity) {

                return [

                    /*
                     * Person identity remains the
                     * identity of the authenticated
                     * user operating the Entity.
                     */

                    ...PERSONAL_STEPS.slice(0, 1),


                    /*
                     * Entity-owned workspace.
                     */

                    ...ENTITY_STEPS,


                    /*
                     * Shared capabilities.
                     */

                    ...COMMON_STEPS,

                ];

            }


            return [

                ...PERSONAL_STEPS,

                ...COMMON_STEPS,

            ];

        }, [
            isEntity,
        ]);


    /* =====================================
       CURRENT SECTION

       Person and Entity maintain
       independent workspace positions.
    ===================================== */

    const storageKey =
        isEntity
            ? "profileCurrentSection:entity"
            : "profileCurrentSection:person";


    const defaultSection =
        isEntity
            ? sections.findIndex(
                section =>
                    section.id === "entity"
            )
            : sections.findIndex(
                section =>
                    section.id === "identity"
            );


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


    /* =====================================
       CAPABILITY SWITCH

       When Person / Entity changes,
       restore that capability's last
       section where possible.

       Otherwise move to the capability's
       default starting section.
    ===================================== */

    useEffect(() => {

        const nextStorageKey =
            isEntity
                ? "profileCurrentSection:entity"
                : "profileCurrentSection:person";


        const saved =
            sessionStorage.getItem(
                nextStorageKey
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


        const nextSection =
            isEntity
                ? sections.findIndex(
                    section =>
                        section.id === "entity"
                )
                : sections.findIndex(
                    section =>
                        section.id === "identity"
                );


        setCurrentSection(
            nextSection >= 0
                ? nextSection
                : 0
        );

    }, [
        isEntity,
        sections,
    ]);


    /* =====================================
       CURRENT SECTION STORAGE
    ===================================== */

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


    /* =====================================
       SECTION CONTROLLER
    ===================================== */

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


    /* =====================================
       PROFILE COMPLETION
    ===================================== */

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


    /* =====================================
       SECTION COMPLETION
    ===================================== */

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


    /* =====================================
       EDIT SECTION
    ===================================== */

    const setSectionEditing =
        useCallback(
            (
                sectionId,
                editing
            ) => {

                console.log(
                    "🔥 SET SECTION EDITING:",
                    sectionId,
                    editing
                );


                setEditingSections(
                    previous => {

                        const next = {
                            ...previous,

                            [sectionId]:
                                editing,
                        };


                        console.log(
                            "🔥 EDITING SECTIONS NEXT:",
                            next
                        );


                        return next;

                    }
                );

            },

            []
        );


    /* =====================================
       CLEAR SECTION
    ===================================== */

    const clearSection =
        useCallback(
            (sectionId) => {

                const section =
                    sections.find(
                        item =>
                            item.id === sectionId
                    );


                if (!section) {
                    return;
                }


                section.fields?.forEach(
                    field => {

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


    /* =====================================
       RESET SECTION

       Current behaviour deliberately uses
       useForm's canonical reset behaviour.

       Nested Entity reset semantics remain
       unchanged.
    ===================================== */

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


    /* =====================================
       SAVE SECTION

       IMPORTANT:

       Do NOT call loadProfile() here.

       PATCH success means the local
       workspace values have successfully
       been persisted.

       Reloading the profile immediately
       after PATCH can cause an incomplete
       or legacy canonical representation
       to replace the active Entity state.
    ===================================== */

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


                    console.log(
                        "🔥 PROFILE SAVE IDENTITY TYPE:",
                        values.identityType
                    );


                    console.log(
                        "🔥 PROFILE SAVE USER TYPE:",
                        values.userType
                    );


                    console.log(
                        "🔥 PROFILE SAVE ENTITY:",
                        values.entity
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


                    /*
                     * Persist to API.
                     */

                    await patchProfile(
                        payload
                    );


                    /*
                     * IMPORTANT:
                     *
                     * Do NOT call:
                     *
                     * await loadProfile();
                     *
                     * here.
                     *
                     * The workspace already has
                     * the successfully saved values.
                     */


                    /*
                     * Exit edit mode only after
                     * API confirms success.
                     */

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


                    /*
                     * Notify parent.
                     */

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


    /* =====================================
       CLOSE PROFILE
    ===================================== */

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


    /* =====================================
       WORKSPACE STATE
    ===================================== */

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


    /* =====================================
       WORKSPACE ACTIONS
    ===================================== */

    const workspaceActions = {

        goToSection:
            sectionController.goTo,

        setSectionEditing,

        handleSaveSection,

        clearSection,

        resetSection,

        closeProfile,

    };


    /* =====================================
       RENDER
    ===================================== */

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