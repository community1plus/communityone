/* =====================================================
   GET USER + PROFILE BY INTERNAL USER ID
===================================================== */

export async function getUserByIdWithProfile(
  userId
) {

  if (!userId) {

    throw new Error(
      "Missing Community One userId"
    );

  }


  const client =
    await pool.connect();


  try {

    /* =========================================
       USER
    ========================================= */

    const userResult =
      await client.query(
        `
          SELECT
            id,
            cognito_sub,
            email,
            created_at,
            updated_at,
            last_login
          FROM users
          WHERE id = $1
          LIMIT 1
        `,
        [userId]
      );


    const user =
      userResult.rows[0] ||
      null;


    if (!user) {

      throw new Error(
        "Community One user not found"
      );

    }


    /* =========================================
       PROFILE
    ========================================= */

    const profileResult =
      await client.query(
        `
          SELECT *
          FROM user_profiles
          WHERE user_id = $1
          LIMIT 1
        `,
        [user.id]
      );


    const profile =
      profileResult.rows[0] ||
      null;


    return {

      user,
      profile,

    };


  } finally {

    client.release();

  }

}