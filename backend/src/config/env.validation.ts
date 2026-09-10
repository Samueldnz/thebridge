export function validate(config: Record<string, unknown>) {
  const requiredVariables = ['DATABASE_URL'];

  for (const variable of requiredVariables) {
    if (!config[variable]) {
      throw new Error(`Missing required environment variable: ${variable}`);
    }
  }

  return {
    ...config,
    PORT: Number(config.PORT ?? 3000),
    NODE_ENV: config.NODE_ENV ?? 'development',
  };
}