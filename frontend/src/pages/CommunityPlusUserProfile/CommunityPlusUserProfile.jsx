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
        loadProfile,
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
       PROFILE VALUES
    ===================================== */

    const initialValues =
        useMemo(

            () =>
                getInitialProfileValues(
                    profile,
                    user
                ),

            [
                profile,
                user,
            ]

        );


    /* =====================================
       FORM
    ===================================== */

    const form =
        useForm({

            initialValues,

        });


    const {
        values,
    } = form;


    /* =====================================
       CURRENT SECTION
       
       NOTE:
       The underlying Workspace runtime is
       still section-based. The profile
       configuration is now step-based.
    ===================================== */

    const [
        currentSection,
        setCurrentSection,
    ] = useState(() => {

        const saved =
            sessionStorage.getItem(
                "profileCurrentSection"
            );


        return saved
            ? Number(saved)
            : 0;

    });


    /* =====================================
       CURRENT SECTION STORAGE
    ===================================== */

    useEffect(() => {

        sessionStorage.setItem(
            "profileCurrentSection",
            currentSection
        );

    }, [
        currentSection,
    ]);


    /* =====================================
       PROFILE STEPS
       
       These are converted into the existing
       Workspace section runtime contract.
    ===================================== */

    const sections =
        useMemo(() => {

            const isEntity =
                values.identityType === "ENTITY" ||
                values.capabilities?.entity;


            if (isEntity) {

                return [

                    /*
                     * Personal identity remains
                     * the first step for an Entity.
                     */

                    ...PERSONAL_STEPS.slice(0, 1),

                    ...ENTITY_STEPS,

                    ...COMMON_STEPS,

                ];

            }


            return [

                ...PERSONAL_STEPS,

                ...COMMON_STEPS,

            ];

        }, [

            values.identityType,

            values.capabilities,

        ]);


    /* =====================================
       SECTION CONTROLLER
       
       Existing runtime controller retained
       until Workspace section → step
       migration is completed.
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
       STEP / SECTION COMPLETION
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

                setEditingSections(
                    previous => ({

                        ...previous,

                        [sectionId]:
                            editing,

                    })
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
    ===================================== */

    const resetSection =
        useCallback(

            (sectionId) => {

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
    ===================================== */

    const handleSaveSection =
        useCallback(

            async (sectionId) => {

                if (!sectionId) {
                    return;
                }


                try {

                    setSavingSection(true);


                    const payload =
                        buildProfilePayload({

                            values,

                            userEmail:
                                user?.email,

                            homeLocation:
                                values.homeLocation,

                        });


                    await patchProfile(
                        payload
                    );


                    /*
                     * Refresh canonical
                     * profile state.
                     */

                    await loadProfile();


                    /*
                     * Exit edit mode for
                     * the saved section.
                     */

                    setEditingSections(
                        previous => ({

                            ...previous,

                            [sectionId]:
                                false,

                        })
                    );


                    /*
                     * Notify parent when
                     * supplied.
                     */

                    if (onComplete) {
                        onComplete();
                    }

                } catch (error) {

                    console.error(
                        "[PROFILE SAVE] FAILED",
                        error
                    );

                } finally {

                    setSavingSection(false);

                }

            },

            [
                values,
                user?.email,
                patchProfile,
                loadProfile,
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