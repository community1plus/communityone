import pool from "../db/pool.js";

import { identityToRow } from "./identityToRow.js";
import { rowToIdentity } from "./rowToIdentity.js";

export async function createIdentityRecord(identity) {

  const row =
    identityToRow(identity);

  const result =
    await pool.query(
      `
        INSERT INTO identities (

          display_name,

          identity_type,

          avatar_url

        )

        VALUES ($1,$2,$3)

        RETURNING *

      `,
      [

        row.display_name,

        row.identity_type,

        row.avatar_url,

      ]
    );

  return rowToIdentity(
    result.rows[0]
  );

}