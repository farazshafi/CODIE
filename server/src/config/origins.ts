const sanitizeOrigin = (value: string) => value.trim().replace(/\/+$/, "");

const fromCsv = (value?: string) =>
  (value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map(sanitizeOrigin);

export const getAllowedOrigins = (): string[] => {
  const primaryClientUrl = process.env.CLIENT_URL
    ? sanitizeOrigin(process.env.CLIENT_URL)
    : "";

  const extraOrigins = fromCsv(process.env.CORS_ORIGINS);

  const all = [primaryClientUrl, ...extraOrigins].filter(Boolean);
  return [...new Set(all)];
};

export const isOriginAllowed = (origin?: string): boolean => {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = sanitizeOrigin(origin);
  return getAllowedOrigins().includes(normalizedOrigin);
};
