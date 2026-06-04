const withFallback = (value: string | undefined, fallback: string) => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
};

const defaultCore = 'http://localhost:3011';

export const env = {
  API_CORE: withFallback(import.meta.env.VITE_API_CORE as string | undefined, defaultCore),
  API_DEVICE_INFO: withFallback(
    import.meta.env.VITE_API_DEVICE_INFO as string | undefined,
    withFallback(import.meta.env.VITE_API_CORE as string | undefined, defaultCore)
  ),
  API_HMS: withFallback(
    import.meta.env.VITE_API_URL as string | undefined,
    withFallback(import.meta.env.VITE_API_CORE as string | undefined, defaultCore)
  ),
};
