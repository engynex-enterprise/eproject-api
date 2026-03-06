import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  provider: process.env.MAIL_PROVIDER || 'smtp',
  fromName: process.env.MAIL_FROM_NAME || 'eProject',
  fromAddress: process.env.MAIL_FROM_ADDRESS || 'noreply@eproject.com',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
  },
  aws: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_SES_REGION || 'us-east-1',
  },
  gcp: {
    projectId: process.env.GCP_PROJECT_ID || '',
    clientEmail: process.env.GCP_CLIENT_EMAIL || '',
    privateKey: (process.env.GCP_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },
}));
