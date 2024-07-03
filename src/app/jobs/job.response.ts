import { BaseResponses } from "@app/common/helpers";

export const JOB_RESPONSE = {
  ...BaseResponses('Job'),

  ERROR: {
    NOT_FOUND: 'Job not found.',
    EXIST: 'Job exists.',
  },

  LOG: {
    CREATE: 'Job created.'
  }
};