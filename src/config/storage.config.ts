import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  supabase: {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    bucket: process.env.SUPABASE_STORAGE_BUCKET || 'attachments',
  },
}));
