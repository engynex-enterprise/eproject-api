-- AlterTable
ALTER TABLE "organization_notification_configs" ADD COLUMN     "sileo_config" JSONB,
ADD COLUMN     "ui_alert_provider" TEXT NOT NULL DEFAULT 'sileo';
