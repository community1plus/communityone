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
    PERSONAL_SECTIONS,
    ENTITY_SECTIONS,
    COMMON_SECTIONS,
} from "./profileConstants";

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
    useState(
        editMode || !profile?.id
    );


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

        console.log(
    "PROFILE SECTION",
    currentSection,
    sections[currentSection]?.id
);

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