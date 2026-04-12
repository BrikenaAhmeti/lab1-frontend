const withFallback = (value: string | undefined, fallback: string) => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
};

export const env = {
  API_CORE: withFallback(import.meta.env.VITE_API_CORE as string | undefined, 'http://localhost:3006'),
  API_DEVICE_INFO: withFallback(import.meta.env.VITE_API_DEVICE_INFO as string | undefined, 'http://localhost:3006'),
};
