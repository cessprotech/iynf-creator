import { BaseResponses } from "@app/common/helpers";

export const CREATOR_RESPONSE = {
  ...BaseResponses('Creator'),

  ERROR: {
    NOT_FOUND: 'Creator not found.',
    EXIST: 'Creator exists.',
  },

  LOG: {
    CREATE: 'Creator created.'
  }
};