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
    PERSONAL_SECTIONS,
    ENTITY_SECTIONS,
    COMMON_SECTIONS,
} from "../../framework/Workspace/profile/profileConstants";


import {
    getInitialProfileValues,
    calculateProfileCompletion,
} from "../../framework/Workspace/profile/profileHelpers";


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
       WORKSPACE STATE
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


    const [
        editingSections,
        setEditingSections,
    ] = useState({});


    const [
        savingSection,
        setSavingSection,
    ] = useState(null);


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
       SECTIONS
    ===================================== */

    const sections =
        useMemo(() => {

            const isEntity =
                values.identityType === "ENTITY" ||
                values.capabilities?.entity;


            if (isEntity) {

                return [

                    ...PERSONAL_SECTIONS.slice(0, 1),

                    ...ENTITY_SECTIONS,

                    ...COMMON_SECTIONS,

                ];

            }


            return [

                ...PERSONAL_SECTIONS,

                ...COMMON_SECTIONS,

            ];

        }, [

            values.identityType,

            values.capabilities,

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
       COMPLETION
    ===================================== */

    const completion =
        calculateProfileCompletion(
            values
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

            (
                sectionId
            ) => {

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

            (
                sectionId
            ) => {

                /*
                 * Reset the complete form to the
                 * last loaded profile.
                 */
                form.reset();


                setSectionEditing(
                    sectionId,
                    false
                );

            },

            [
                form,
                setSectionEditing,
            ]

        );


    /* =====================================
       SAVE SECTION
    ===================================== */

    const handleSaveSection =
        useCallback(

            async (
                sectionId
            ) => {

                if (
                    !sectionId ||
                    savingSection
                ) {

                    return;

                }


                try {

                    setSavingSection(
                        sectionId
                    );


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
                     * Reload the canonical
                     * profile from the API.
                     */
                    await loadProfile({

                        background:
                            false,

                    });


                    /*
                     * THIS IS THE IMPORTANT PART.
                     *
                     * Only leave edit mode after
                     * the save has succeeded.
                     */
                    setEditingSections(
                        previous => ({

                            ...previous,

                            [sectionId]:
                                false,

                        })
                    );


                    onComplete?.();


                } catch (error) {

                    console.error(

                        "Profile section save failed:",

                        error

                    );

                } finally {

                    setSavingSection(
                        null
                    );

                }

            },

            [
                values,
                user?.email,
                patchProfile,
                loadProfile,
                savingSection,
                onComplete,
            ]

        );


    /* =====================================
       CLOSE
    ===================================== */

    const closeProfile =
        useCallback(() => {

            navigate(
                "/communityplus",
                {
                    replace: true,
                }
            );

        }, [
            navigate,
        ]);


    /* =====================================
       WORKSPACE STATE
    ===================================== */

    const workspaceState = {

        values,

        form,

        editMode,

        completion,

        sections,

        currentSection,

        editingSections,

        savingSection,

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