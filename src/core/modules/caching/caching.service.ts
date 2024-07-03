import { checkType, objectIsEmpty } from '@core/common/utils/helpers';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

interface CacheOptions {
    firstKey: string;
    secondKey?: string;
    value: unknown;
    ttl?: number;
}

@Injectable()
export class CachingService {
    constructor(
        @Inject(CACHE_MANAGER) private cache: Cache,
    ){}

    private async getRootData(key: string): Promise<unknown> {
        let str_value = await this.cache.get(key) as string;

        if (!str_value) return null;

        return JSON.parse(str_value);
    }

    public async get(firstKey: string, secondKey?: string) {
        let value = await this.getRootData(firstKey);
        
        if (checkType(value, 'object') && secondKey) {

            if (objectIsEmpty(value as Record<string, unknown>)) return null;

            return value[secondKey];
        }

        return value;
    }

    public async set(data: CacheOptions) {
        let rootData: Record<string, unknown> | unknown;

        let options = { ttl: data?.ttl || 3600 };
        
        if (data.secondKey) {
            rootData = await this.getRootData(data.firstKey);

            if (rootData === null) {
                rootData = {
                    [data.secondKey]: data.value
                }
            }

            else rootData[data.secondKey] = data.value;

            return await this.cache.set(data.firstKey, JSON.stringify(rootData), options);

        }

        await this.cache.set(data.firstKey, JSON.stringify(data.value), options);
    }

    public async del(firstKey: string, secondKey?: string) {
        let rootData: Record<string, unknown>;

        if (secondKey) {
            rootData = await this.getRootData(firstKey) as typeof rootData;

            if (!objectIsEmpty(rootData)) {
                delete rootData[secondKey];
            }

            await this.cache.set(firstKey, rootData);

            return;
        }

        await this.cache.del(firstKey);
    }
}
