import {
  createIdentity,
} from "./services/identityService.js"; 

export async function createIdentityController(
  req,
  res
) {
  try {

    const identity =
      await createIdentity(req.body);

    return res.status(201).json(identity);

  } catch (error) {

    console.error(
      "createIdentityController",
      error
    );

    return res.status(500).json({
      error: "Failed to create identity"
    });

  }
}