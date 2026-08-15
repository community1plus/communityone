import { useNavigate } from "react-router-dom";

import {
    useCallback,
    useState,
    useEffect,
    useMemo,
} from "react";


import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";

import useAPI from "../../hooks/useAPI";
import useForm from "../../hooks/useForm";

import "./CommunityPlusUserProfile.css";

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


export default function CommunityPlusUserProfile({

    onComplete,

    editMode = true,

    initialCapability = "identity",

}) {

    const navigate = useNavigate();


    /* =====================================
       CONTEXT
    ===================================== */

    const { user } =
        useAuth();


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
        savingProfile,
        setSavingProfile,
    ] = useState(false);


    const [
        editingSections,
        setEditingSections,
    ] = useState({});


    const [
        savedSectionValues,
        setSavedSectionValues,
    ] = useState({});


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
       CURRENT SECTION PERSISTENCE
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
       FORM
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


    const form =
        useForm({

            initialValues,

        });


    const {
        values,
    } = form;


    /* =====================================
       SECTIONS
    ===================================== */

    const sections =
        useMemo(() => {

            const isEntity =
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

            values.capabilities?.entity,

        ]);


    /* =====================================
       SECTION CONTROLLER
    ===================================== */

    const sectionController =
        createWorkspaceSectionController({

            sections,

            current:
                currentSection,

            setCurrent:
                setCurrentSection,

        });


    /* =====================================
       SECTION VALUE HELPERS
    ===================================== */

const getSectionValues = (section) => {

    if (!section) {
        return {};
    }

    const sectionValues = {};

    section.fields?.forEach((field) => {

        sectionValues[field.name] =
            form.getValue(field.name);

    });

    return sectionValues;
};


const applySectionValues = (
    section,
    sectionValues
) => {

    if (!section) {
        return;
    }

    section.fields?.forEach((field) => {

        if (
            Object.prototype.hasOwnProperty.call(
                sectionValues,
                field.name
            )
        ) {

            form.setValue(
                field.name,
                sectionValues[field.name]
            );

        }

    });
};


    /* =====================================
       SECTION EDITING
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
       BEGIN SECTION EDIT
    ===================================== */

    const beginSectionEdit =
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


                const snapshot =
                    getSectionValues(
                        section
                    );


                setSavedSectionValues(
                    previous => ({

                        ...previous,

                        [sectionId]:
                            snapshot,

                    })
                );


                setSectionEditing(
                    sectionId,
                    true
                );

            },

            [
                sections,
                getSectionValues,
                setSectionEditing,
            ]

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
                    (field) => {

                        form.setValue(

                            field.name,

                            field.type === "location"
                                ? null
                                : ""

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

                const section =
                    sections.find(
                        item =>
                            item.id === sectionId
                    );


                if (!section) {
                    return;
                }


                const saved =
                    savedSectionValues[
                        sectionId
                    ];


                if (!saved) {
                    return;
                }


                applySectionValues(

                    section,

                    saved

                );

            },

            [
                sections,
                savedSectionValues,
                applySectionValues,
            ]

        );


    /* =====================================
       SAVE SECTION
    ===================================== */

const handleSaveSection =
    useCallback(

        async (sectionId) => {

            try {

                setSavingProfile(true);

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

                await loadProfile({
                    background: false,
                });

                setEditingSections(
                    previous => ({
                        ...previous,
                        [sectionId]: false,
                    })
                );

                onComplete?.();

            } catch (err) {

                console.error(
                    "Profile save failed:",
                    err
                );

            } finally {

                setSavingProfile(false);

            }

        },

        [
            values,
            user,
            patchProfile,
            loadProfile,
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
       PROFILE COMPLETION
    ===================================== */

    const completion =
        calculateProfileCompletion(
            values
        );


    /* =====================================
       WORKSPACE STATE
    ===================================== */

    const workspaceState = {

        values,

        form,

        editingSections,

        editMode,

        savingProfile,

        completion,

        sections,

        currentSection,

    };


    /* =====================================
       WORKSPACE ACTIONS
    ===================================== */

    const workspaceActions = {

        goToSection:
            sectionController.goTo,

        setSectionEditing,

        beginSectionEdit,

        handleSaveSection,

        clearSection,

        resetSection,

        closeProfile,

    };


    /* =====================================
       DEBUG
    ===================================== */

    console.log(

        "PROFILE SECTION",

        currentSection,

        sections[currentSection]?.id

    );


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