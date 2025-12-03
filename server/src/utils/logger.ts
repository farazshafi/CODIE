import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
    level: isDev ? "debug" : "info",
    transport: isDev
        ? {
              target: "pino-pretty",
              options: {
                  colorize: true,
                  translateTime: "yyyy-mm-dd HH:MM:ss.l",
                  ignore: "pid,hostname",
              },
          }
        : undefined,
    base: {
        service: process.env.SERVICE_NAME || "my-service",
    },
});
