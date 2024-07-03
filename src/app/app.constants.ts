import { mapKeysToValues } from '@core/common/utils/helpers';
import { AppEnvClass } from './app.config'; 

export const APP_CONFIG = mapKeysToValues(new AppEnvClass());
  