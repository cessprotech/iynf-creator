export const CACHE_KEYS = {
    FIND_ALL: 'FIND_ALL',
    FIND_ONE: 'FIND_ONE'
}

export const CreateCacheModifiedKey = (key: string) => `${key}-modified`;

export const CACHE_DEFAULT_TTL = 60 * 60;