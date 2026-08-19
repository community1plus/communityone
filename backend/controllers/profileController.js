import {
  fetchProfileByUserId,
  saveProfile,
} from "../repositories/profileRepository.js";

import {
  fetchOrganisationByProfileId,
  saveOrganisationProfile,
} from "../repositories/organisationRepository.js";

import {
  getUserId,
  pickProfileFields,
  pickOrganisationFields,
  normaliseOrganisationProfile,
} from "../services/profileService.js";

import {
  isBusinessType,
} from "../services/accountTypeService.js";


/* =====================================================
   PATCH PROFILE
===================================================== */

export async function patchProfile(req, res) {

  try {

    /* =================================================
       AUTHENTICATED USER
    ================================================= */

    const userId =
      getUserId(req);

    console.log(
      "[PROFILE PATCH] AUTH:",
      {
        userId,

        cognitoSub:
          req.user?.cognitoSub,

        email:
          req.user?.email,

        username:
          req.user?.username,
      }
    );


    if (!userId) {

      return res.status(401).json({
        error:
          "Authentication required.",
      });

    }


    /* =================================================
       EXISTING PROFILE
    ================================================= */

    const existing =
      await fetchProfileByUserId(
        userId
      );


    if (!existing) {

      return res.status(404).json({
        error:
          "Profile not found",
      });

    }


    /* =================================================
       REQUEST BODY
    ================================================= */

    const body =
      req.body || {};


    console.log(
      "[PROFILE PATCH] INCOMING BODY:",
      JSON.stringify(
        body,
        null,
        2
      )
    );


    /* =================================================
       PROFILE FIELDS
    ================================================= */

    const incoming =
      pickProfileFields(
        body.profile || {}
      );


    /* =================================================
       ENDPOINT
    ================================================= */

    incoming.endpoint = {

      ...(incoming.endpoint || {}),

      ...(body.endpoint || {}),

    };


    /* =================================================
       ORGANISATION
    ================================================= */

    const organisation =
      pickOrganisationFields(
        body.organisationProfile || {}
      );


    /* =================================================
       SAVE PROFILE
    ================================================= */

    const saved =
      await saveProfile({

        userId,

        incoming,

      });


    if (!saved?.id) {

      throw new Error(
        "Profile save returned no profile"
      );

    }


    /* =================================================
       ORGANISATION PROFILE
    ================================================= */

    let savedOrganisation = null;


    if (
      isBusinessType(
        saved.userType
      )
    ) {

      /*
       * Only write organisation data when
       * the account is actually business/entity
       * based on the current account type.
       */

      if (
        Object.keys(
          organisation
        ).length > 0
      ) {

        savedOrganisation =
          await saveOrganisationProfile({

            userProfileId:
              saved.id,

            organisation,

          });

      } else {

        savedOrganisation =
          await fetchOrganisationByProfileId(
            saved.id
          );

      }

    } else {

      /*
       * Personal accounts should not
       * manufacture organisation state.
       */

      savedOrganisation =
        await fetchOrganisationByProfileId(
          saved.id
        );

    }


    /* =================================================
       RESPONSE
    ================================================= */

    const response = {

      profile:
        saved,

      organisationProfile:
        normaliseOrganisationProfile(
          savedOrganisation
        ),

      version:
        saved.version,

    };


    console.log(
      "[PROFILE PATCH] SUCCESS:",
      {
        userId,

        profileId:
          saved.id,

        version:
          saved.version,

        userType:
          saved.userType,
      }
    );


    return res.status(200).json(
      response
    );


  } catch (err) {

    console.error(
      "[PROFILE PATCH] ERROR:",
      {
        message:
          err.message,

        name:
          err.name,

        stack:
          process.env.NODE_ENV ===
          "development"
            ? err.stack
            : undefined,
      }
    );


    return res.status(500).json({

      error:
        "Profile update failed",

      detail:
        process.env.NODE_ENV ===
        "development"
          ? err.message
          : undefined,

    });

  }

}