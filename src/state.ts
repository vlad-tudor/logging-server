// maybe persist? or use a better cache
const LOGGING_CACHE: Record<string, any> = {};

export const getCache = (uid: string) => LOGGING_CACHE[uid];
export const getFullCache = () => LOGGING_CACHE;
export const setCache = (uid: string, data: Record<string, any> = {}) => {
  LOGGING_CACHE[uid] = { ...LOGGING_CACHE[uid], ...data };
};
