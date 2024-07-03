import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

export const GET_ENV_VARS = <T>(
  env_vars_keys: string[],
  env_vars: T,
): Readonly<Record<keyof T, string>> => {
  for (const key of env_vars_keys) {
    env_vars[key] = configService.get(key);
  }

  return env_vars as unknown as Record<keyof T, string>;
};
