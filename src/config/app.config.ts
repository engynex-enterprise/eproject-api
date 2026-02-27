import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.APP_PORT || '3000', 10),
  env: process.env.NODE_ENV || 'development',
  name: process.env.APP_NAME || 'eProject API',
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : ['http://localhost:3000'],
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
}));
