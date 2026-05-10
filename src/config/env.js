const withFallback = (value, fallback) => {
    const trimmed = value?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : fallback;
};
const defaultCore = 'http://localhost:3006';
export const env = {
    API_CORE: withFallback(import.meta.env.VITE_API_CORE, defaultCore),
    API_DEVICE_INFO: withFallback(import.meta.env.VITE_API_DEVICE_INFO, withFallback(import.meta.env.VITE_API_CORE, defaultCore)),
    API_HMS: withFallback(import.meta.env.VITE_API_URL, withFallback(import.meta.env.VITE_API_CORE, defaultCore)),
};
