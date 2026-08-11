import { useNavigate } from "react-router-dom";

import {
    useState,
    useEffect,
    useMemo,
    useCallback,
} from "react";

import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";

import useAPI from "../../hooks/useAPI";
import useForm from "../../hooks/useForm";

import "./CommunityPlusUserProfile.css";

import IdentityWorkspace
    from "../../engines/IdentityWorkspace/IdentityWorkspace";

import {
    IDENTITY_SECTIONS,
    ENTITY_SECTIONS,
} from "./profileConstants";

import {
    getInitialProfileValues,
    calculateProfileCompletion,
} from "./profileHelpers";

import {
    buildProfilePayload,
} from "./profilePayload";

import {
    createWorkspaceSectionController,
} from "../../framework/Workspace/controllers/WorkspaceSectionController";


export default function CommunityPlusUserProfile({

    onComplete,

    editMode = false,

    initialCapability = "identity",

}) {

    const navigate = useNavigate();


    /* =====================================
       CONTEXT
    ===================================== */

    const { user } = useAuth();

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

    const [savingProfile, setSavingProfile] =
        useState(false);


    const [editing, setEditing] =
        useState(!profile?.id);


    const [currentSection, setCurrentSection] =
        useState(() => {

            const saved =
                sessionStorage.getItem(
                    "profileCurrentSection"
                );

            return saved
                ? Number(saved)
                : 0;

        });


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

    const initialValues = useMemo(

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


    const form = useForm({

        initialValues,

    });


    const {
        values,
    } = form;


    /* =====================================
       SECTIONS
    ===================================== */

    const sections = useMemo(() => {

        const items = [
            ...IDENTITY_SECTIONS,
        ];


        if (
            values.capabilities?.organisation
        ) {

            items.splice(

                3,

                0,

                ...ENTITY_SECTIONS

            );

        }


        return items;

    }, [

        values.capabilities,

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


    const current =
        sectionController.currentSection();


    const sectionId =
        current?.id ?? null;


    /* =====================================
       PROFILE COMPLETION
    ===================================== */

    const completion =
        calculateProfileCompletion(
            values
        );


    /* =====================================
       ACTIONS
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


    const handleSaveProfile =
        useCallback(

            async () => {

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

                        background:
                            false,

                    });


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
       WORKSPACE STATE
    ===================================== */

    const workspaceState = {

        values,

        form,

        editing,

        editMode,

        savingProfile,

        completion,

        sections,

        currentSection,

        sectionId,

    };


    /* =====================================
       WORKSPACE ACTIONS
    ===================================== */

    const workspaceActions = {

        goToSection:
            sectionController.goTo,

        setEditing,

        handleSaveProfile,

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