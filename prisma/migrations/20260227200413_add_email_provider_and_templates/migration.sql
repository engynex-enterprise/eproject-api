-- AlterTable
ALTER TABLE "organization_notification_configs" ADD COLUMN     "aws_access_key_id" TEXT,
ADD COLUMN     "aws_region" TEXT DEFAULT 'us-east-1',
ADD COLUMN     "aws_secret_access_key" TEXT,
ADD COLUMN     "email_provider" TEXT NOT NULL DEFAULT 'smtp',
ADD COLUMN     "email_templates" JSONB,
ADD COLUMN     "gmail_client_id" TEXT,
ADD COLUMN     "gmail_client_secret" TEXT,
ADD COLUMN     "gmail_refresh_token" TEXT,
ADD COLUMN     "sendgrid_api_key" TEXT,
ADD COLUMN     "smtp_secure" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "email_enabled" SET DEFAULT false;
