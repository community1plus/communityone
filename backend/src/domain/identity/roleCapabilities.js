import { Capabilities }
from "./capabilities.js";

export const RoleCapabilities = {

  RESIDENT: [
    Capabilities.CREATE_SIGNAL,
  ],

  OWNER: [
    Capabilities.CREATE_SIGNAL,
    Capabilities.MANAGE_LOCATION,
    Capabilities.MANAGE_ORGANIZATION,
  ],

  STAFF: [
    Capabilities.CREATE_SIGNAL,
  ],

  MODERATOR: [
    Capabilities.CREATE_SIGNAL,
    Capabilities.MODERATE_SIGNALS,
  ],

};