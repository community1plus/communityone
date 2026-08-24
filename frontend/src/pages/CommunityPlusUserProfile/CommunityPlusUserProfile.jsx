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
    ENTITY_SECTIONS,
    COMMON_SECTIONS,
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

const sectionCompletion =
    Object.fromEntries(

        sections.map(section => [

            section.id,

            calculateProfileSectionCompletion(
                values,
                section.id
            ),

        ])

    ); 


console.log(
    "[PROFILE COMPLETION] VALUE:",
    completion
);

console.log(
    "[PROFILE COMPLETION] USERNAME:",
    values.username
);

console.log(
    "[PROFILE COMPLETION] LOCATION:",
    values.homeLocation
);

console.log(
    "[PROFILE COMPLETION] PHONE:",
    values.phoneDisplay
);

console.log(
    "[PROFILE COMPLETION] PAYMENT:",
    values.payment
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

                    [sectionId]: false,

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

const handleSaveSection = async (sectionId) => {

    console.log(
        "[PROFILE SAVE] START",
        sectionId
    );

    try {

        setSavingSection(true);

        const payload =
            buildProfilePayload({
                values,
                userEmail: user?.email,
                homeLocation: values.homeLocation,
            });

        console.log(
            "[PROFILE SAVE] PAYLOAD",
            payload
        );

        console.log(
            "[PROFILE SAVE] PATCH START"
        );

await patchProfile(payload);

console.log(
    "[PROFILE SAVE] PATCH SUCCESS"
);

/*
 * Refresh the canonical profile state
 * after the backend accepts the update.
 */
await loadProfile();

console.log(
    "[PROFILE SAVE] PROFILE RELOADED"
);

setEditingSections(
    previous => ({
        ...previous,
        [sectionId]: false,
    })
);

    } catch (error) {

        console.error(
            "[PROFILE SAVE] FAILED",
            error
        );

    } finally {

        console.log(
            "[PROFILE SAVE] FINALLY"
        );

        setSavingSection(false);

    }

};


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