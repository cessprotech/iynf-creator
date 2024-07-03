import * as Joi from 'joi';
import { ObjectPropertiesSchema } from 'joi';
import { registerAs } from '@nestjs/config';
import { GET_ENV_VARS } from './index';
import '@core/common/constants';

// import JJ = require('joi');

export interface ConfigEnv {
  readonly [key: string]: ObjectPropertiesSchema;
}

let configValidators: ConfigEnv = {};

/**
 * @variable contains all environmental variables validations injected with InjectConfigValidation function.
 */
export let CONFIG_VALIDATORS = Joi.object(configValidators);

/**
 * @param configValidationName - Name of the module that owns the configuration object
 * @param configValidation - Must be a Joi object schema validating it's configuration variables
 * @returns Void
 */
export function InjectConfigValidation<T>(
  configValidationName: string,
  configValidation: T,
) {
  const ownKeys = Object.keys(configValidation);

  ownKeys.forEach(
    (key) =>
      (configValidation[key] = configValidation[key].messages({
        'string.empty': `"${key}" Cannot Be An Empty Environmental Variable In ${configValidationName} Module.`,
        'any.required': `"${key}" Is A Required Environmental Variable For ${configValidationName.capitalize()} Module.`,
      })),
  );

  const sharedKeys = Object.keys(configValidators);

  const duplicateKeys = ownKeys.filter((key) => sharedKeys.includes(key));

  if (duplicateKeys.length > 0) {
    throw Error(
      `Duplicate Environmental(.env) Variables Found - ${duplicateKeys}.\n These .env variable names found in '${configValidationName} config file' already exists in the global .env file. Remove or Modify the variable names.`,
    );
  }

  configValidators = {
    ...configValidators,
    ...configValidation,
  };

  CONFIG_VALIDATORS = Joi.object(configValidators);

  return registerAs(configValidationName, () =>
    GET_ENV_VARS<T>(ownKeys, { ...configValidation }),
  );
  // return registerAs(configValidationName, () => configValidation);
}
