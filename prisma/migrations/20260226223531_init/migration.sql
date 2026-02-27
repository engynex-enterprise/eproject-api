-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "phone" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "locale" TEXT NOT NULL DEFAULT 'es',
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_accounts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oauth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "website" TEXT,
    "is_personal" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_members" (
    "id" SERIAL NOT NULL,
    "org_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_invitations" (
    "id" SERIAL NOT NULL,
    "org_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "invited_by_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_sso_configs" (
    "id" SERIAL NOT NULL,
    "org_id" INTEGER NOT NULL,
    "google_enabled" BOOLEAN NOT NULL DEFAULT false,
    "google_client_id" TEXT,
    "google_secret" TEXT,
    "github_enabled" BOOLEAN NOT NULL DEFAULT false,
    "github_client_id" TEXT,
    "github_secret" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_sso_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_appearances" (
    "id" SERIAL NOT NULL,
    "org_id" INTEGER NOT NULL,
    "primary_color" TEXT,
    "secondary_color" TEXT,
    "accent_color" TEXT,
    "font_family" TEXT,
    "favicon_url" TEXT,
    "custom_css" TEXT,
    "dark_mode" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_appearances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_storage_configs" (
    "id" SERIAL NOT NULL,
    "org_id" INTEGER NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'supabase',
    "storage_bucket" TEXT,
    "max_file_size_mb" INTEGER NOT NULL DEFAULT 25,
    "allowed_mime_types" TEXT[],
    "total_quota_gb" DECIMAL(10,2) NOT NULL DEFAULT 5,
    "used_storage_bytes" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_storage_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_notification_configs" (
    "id" SERIAL NOT NULL,
    "org_id" INTEGER NOT NULL,
    "email_enabled" BOOLEAN NOT NULL DEFAULT true,
    "email_from_name" TEXT,
    "email_from_address" TEXT,
    "smtp_host" TEXT,
    "smtp_port" INTEGER,
    "smtp_user" TEXT,
    "smtp_password" TEXT,
    "sms_enabled" BOOLEAN NOT NULL DEFAULT false,
    "sms_provider" TEXT,
    "sms_api_key" TEXT,
    "whatsapp_enabled" BOOLEAN NOT NULL DEFAULT false,
    "whatsapp_api_key" TEXT,
    "internal_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_notification_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "org_id" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT NOT NULL DEFAULT 'organization',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,
    "conditions" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "org_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "avatar_url" TEXT,
    "lead_id" INTEGER,
    "default_assignee_id" INTEGER,
    "issue_counter" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_members" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_settings" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "default_status_id" INTEGER,
    "default_priority_id" INTEGER,
    "default_issue_type_id" INTEGER,
    "allow_subtasks" BOOLEAN NOT NULL DEFAULT true,
    "require_estimation" BOOLEAN NOT NULL DEFAULT false,
    "enable_sprints" BOOLEAN NOT NULL DEFAULT true,
    "enable_versions" BOOLEAN NOT NULL DEFAULT true,
    "enable_backlog" BOOLEAN NOT NULL DEFAULT true,
    "enable_timeline" BOOLEAN NOT NULL DEFAULT true,
    "enable_reports" BOOLEAN NOT NULL DEFAULT true,
    "enable_automations" BOOLEAN NOT NULL DEFAULT true,
    "apply_config_to_all_spaces" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_working_days" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "monday" BOOLEAN NOT NULL DEFAULT true,
    "tuesday" BOOLEAN NOT NULL DEFAULT true,
    "wednesday" BOOLEAN NOT NULL DEFAULT true,
    "thursday" BOOLEAN NOT NULL DEFAULT true,
    "friday" BOOLEAN NOT NULL DEFAULT true,
    "saturday" BOOLEAN NOT NULL DEFAULT false,
    "sunday" BOOLEAN NOT NULL DEFAULT false,
    "work_start_time" TEXT NOT NULL DEFAULT '09:00',
    "work_end_time" TEXT NOT NULL DEFAULT '18:00',
    "holidays" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_working_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_estimations" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "estimation_type" TEXT NOT NULL DEFAULT 'story_points',
    "story_point_scale" JSONB,
    "custom_scale" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_estimations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_appearances" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "color" TEXT,
    "icon_name" TEXT,
    "cover_image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_appearances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_notification_settings" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "event_type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spaces" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon_name" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_settings" (
    "id" SERIAL NOT NULL,
    "space_id" INTEGER NOT NULL,
    "inherits_project" BOOLEAN NOT NULL DEFAULT true,
    "default_status_id" INTEGER,
    "default_priority_id" INTEGER,
    "default_issue_type_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "space_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_working_days" (
    "id" SERIAL NOT NULL,
    "space_id" INTEGER NOT NULL,
    "inherits_project" BOOLEAN NOT NULL DEFAULT true,
    "monday" BOOLEAN NOT NULL DEFAULT true,
    "tuesday" BOOLEAN NOT NULL DEFAULT true,
    "wednesday" BOOLEAN NOT NULL DEFAULT true,
    "thursday" BOOLEAN NOT NULL DEFAULT true,
    "friday" BOOLEAN NOT NULL DEFAULT true,
    "saturday" BOOLEAN NOT NULL DEFAULT false,
    "sunday" BOOLEAN NOT NULL DEFAULT false,
    "work_start_time" TEXT NOT NULL DEFAULT '09:00',
    "work_end_time" TEXT NOT NULL DEFAULT '18:00',
    "holidays" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "space_working_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_estimations" (
    "id" SERIAL NOT NULL,
    "space_id" INTEGER NOT NULL,
    "inherits_project" BOOLEAN NOT NULL DEFAULT true,
    "estimation_type" TEXT NOT NULL DEFAULT 'story_points',
    "story_point_scale" JSONB,
    "custom_scale" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "space_estimations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_board_configs" (
    "id" SERIAL NOT NULL,
    "space_id" INTEGER NOT NULL,
    "inherits_project" BOOLEAN NOT NULL DEFAULT true,
    "columns" JSONB,
    "swimlanes" JSONB,
    "card_color_field" TEXT,
    "card_display_fields" JSONB,
    "quick_filters" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "space_board_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_groups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "status_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statuses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status_group_id" INTEGER NOT NULL,
    "color" TEXT,
    "icon_name" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_statuses" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "status_id" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon_name" TEXT,
    "color" TEXT,
    "is_subtask" BOOLEAN NOT NULL DEFAULT false,
    "hierarchy_level" INTEGER NOT NULL DEFAULT 0,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "issue_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_issue_types" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "issue_type_id" INTEGER NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_issue_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "priorities" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon_name" TEXT,
    "color" TEXT,
    "value" INTEGER NOT NULL DEFAULT 0,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "priorities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_priorities" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "priority_id" INTEGER NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_priorities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issues" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "space_id" INTEGER,
    "issue_type_id" INTEGER NOT NULL,
    "status_id" INTEGER NOT NULL,
    "priority_id" INTEGER,
    "parent_id" INTEGER,
    "epic_id" INTEGER,
    "sprint_id" INTEGER,
    "version_id" INTEGER,
    "issue_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignee_id" INTEGER,
    "reporter_id" INTEGER NOT NULL,
    "story_points" DECIMAL(5,1),
    "estimated_hours" DECIMAL(8,2),
    "logged_hours" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "start_date" DATE,
    "due_date" DATE,
    "completed_at" TIMESTAMP(3),
    "board_position" INTEGER NOT NULL DEFAULT 0,
    "backlog_position" INTEGER NOT NULL DEFAULT 0,
    "environment" TEXT,
    "resolution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_relations" (
    "id" SERIAL NOT NULL,
    "from_issue_id" INTEGER NOT NULL,
    "to_issue_id" INTEGER NOT NULL,
    "relation_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "issue_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_watchers" (
    "id" SERIAL NOT NULL,
    "issue_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "issue_watchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_history" (
    "id" SERIAL NOT NULL,
    "issue_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "field" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "old_value_id" INTEGER,
    "new_value_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "issue_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "org_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_tags" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_tags" (
    "id" SERIAL NOT NULL,
    "issue_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "issue_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_fields" (
    "id" SERIAL NOT NULL,
    "org_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "field_type" TEXT NOT NULL,
    "options" JSONB,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_custom_field_values" (
    "id" SERIAL NOT NULL,
    "issue_id" INTEGER NOT NULL,
    "custom_field_id" INTEGER NOT NULL,
    "text_value" TEXT,
    "number_value" DECIMAL(15,4),
    "date_value" DATE,
    "json_value" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "issue_custom_field_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sprints" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "goal" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "start_date" DATE,
    "end_date" DATE,
    "completed_at" TIMESTAMP(3),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sprints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "versions" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'unreleased',
    "release_date" DATE,
    "start_date" DATE,
    "released_at" TIMESTAMP(3),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boards" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'kanban',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "columns" JSONB,
    "swimlanes" JSONB,
    "filter_query" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflows" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_transitions" (
    "id" SERIAL NOT NULL,
    "workflow_id" INTEGER NOT NULL,
    "from_status_id" INTEGER NOT NULL,
    "to_status_id" INTEGER NOT NULL,
    "name" TEXT,
    "conditions" JSONB,
    "validators" JSONB,
    "post_functions" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_transitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_issue_type_mappings" (
    "id" SERIAL NOT NULL,
    "workflow_id" INTEGER NOT NULL,
    "issue_type_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_issue_type_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" SERIAL NOT NULL,
    "issue_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "parent_id" INTEGER,
    "body" TEXT NOT NULL,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" SERIAL NOT NULL,
    "issue_id" INTEGER NOT NULL,
    "uploaded_by_id" INTEGER NOT NULL,
    "file_name" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size_bytes" BIGINT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_entries" (
    "id" SERIAL NOT NULL,
    "issue_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "hours" DECIMAL(6,2) NOT NULL,
    "description" TEXT,
    "logged_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "resource_type" TEXT,
    "resource_id" INTEGER,
    "channel" TEXT NOT NULL DEFAULT 'internal',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "event_type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automations" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "trigger" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "run_count" INTEGER NOT NULL DEFAULT 0,
    "last_run_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_executions" (
    "id" SERIAL NOT NULL,
    "automation_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'success',
    "trigger_data" JSONB,
    "result_data" JSONB,
    "error_message" TEXT,
    "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_filters" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "filter_query" JSONB NOT NULL,
    "is_shared" BOOLEAN NOT NULL DEFAULT false,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_filters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "org_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" INTEGER,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE INDEX "oauth_accounts_user_id_idx" ON "oauth_accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_accounts_provider_provider_user_id_key" ON "oauth_accounts"("provider", "provider_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_slug_idx" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_deleted_at_idx" ON "organizations"("deleted_at");

-- CreateIndex
CREATE INDEX "organization_members_org_id_idx" ON "organization_members"("org_id");

-- CreateIndex
CREATE INDEX "organization_members_user_id_idx" ON "organization_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_members_org_id_user_id_key" ON "organization_members"("org_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_invitations_token_key" ON "organization_invitations"("token");

-- CreateIndex
CREATE INDEX "organization_invitations_org_id_idx" ON "organization_invitations"("org_id");

-- CreateIndex
CREATE INDEX "organization_invitations_email_idx" ON "organization_invitations"("email");

-- CreateIndex
CREATE INDEX "organization_invitations_token_idx" ON "organization_invitations"("token");

-- CreateIndex
CREATE UNIQUE INDEX "organization_sso_configs_org_id_key" ON "organization_sso_configs"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_appearances_org_id_key" ON "organization_appearances"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_storage_configs_org_id_key" ON "organization_storage_configs"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_notification_configs_org_id_key" ON "organization_notification_configs"("org_id");

-- CreateIndex
CREATE INDEX "roles_org_id_idx" ON "roles"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_org_id_name_scope_key" ON "roles"("org_id", "name", "scope");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_resource_action_key" ON "permissions"("resource", "action");

-- CreateIndex
CREATE INDEX "role_permissions_role_id_idx" ON "role_permissions"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE INDEX "projects_org_id_idx" ON "projects"("org_id");

-- CreateIndex
CREATE INDEX "projects_key_idx" ON "projects"("key");

-- CreateIndex
CREATE INDEX "projects_deleted_at_idx" ON "projects"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "projects_org_id_key_key" ON "projects"("org_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "project_members_project_id_user_id_key" ON "project_members"("project_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_settings_project_id_key" ON "project_settings"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_working_days_project_id_key" ON "project_working_days"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_estimations_project_id_key" ON "project_estimations"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_appearances_project_id_key" ON "project_appearances"("project_id");

-- CreateIndex
CREATE INDEX "project_notification_settings_project_id_idx" ON "project_notification_settings"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_notification_settings_project_id_event_type_channel_key" ON "project_notification_settings"("project_id", "event_type", "channel");

-- CreateIndex
CREATE INDEX "spaces_project_id_idx" ON "spaces"("project_id");

-- CreateIndex
CREATE INDEX "spaces_deleted_at_idx" ON "spaces"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "spaces_project_id_key_key" ON "spaces"("project_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "space_settings_space_id_key" ON "space_settings"("space_id");

-- CreateIndex
CREATE UNIQUE INDEX "space_working_days_space_id_key" ON "space_working_days"("space_id");

-- CreateIndex
CREATE UNIQUE INDEX "space_estimations_space_id_key" ON "space_estimations"("space_id");

-- CreateIndex
CREATE UNIQUE INDEX "space_board_configs_space_id_key" ON "space_board_configs"("space_id");

-- CreateIndex
CREATE UNIQUE INDEX "status_groups_name_key" ON "status_groups"("name");

-- CreateIndex
CREATE INDEX "statuses_status_group_id_idx" ON "statuses"("status_group_id");

-- CreateIndex
CREATE INDEX "project_statuses_project_id_idx" ON "project_statuses"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_statuses_project_id_status_id_key" ON "project_statuses"("project_id", "status_id");

-- CreateIndex
CREATE INDEX "project_issue_types_project_id_idx" ON "project_issue_types"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_issue_types_project_id_issue_type_id_key" ON "project_issue_types"("project_id", "issue_type_id");

-- CreateIndex
CREATE INDEX "project_priorities_project_id_idx" ON "project_priorities"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_priorities_project_id_priority_id_key" ON "project_priorities"("project_id", "priority_id");

-- CreateIndex
CREATE INDEX "issues_project_id_idx" ON "issues"("project_id");

-- CreateIndex
CREATE INDEX "issues_space_id_idx" ON "issues"("space_id");

-- CreateIndex
CREATE INDEX "issues_status_id_idx" ON "issues"("status_id");

-- CreateIndex
CREATE INDEX "issues_assignee_id_idx" ON "issues"("assignee_id");

-- CreateIndex
CREATE INDEX "issues_reporter_id_idx" ON "issues"("reporter_id");

-- CreateIndex
CREATE INDEX "issues_parent_id_idx" ON "issues"("parent_id");

-- CreateIndex
CREATE INDEX "issues_epic_id_idx" ON "issues"("epic_id");

-- CreateIndex
CREATE INDEX "issues_sprint_id_idx" ON "issues"("sprint_id");

-- CreateIndex
CREATE INDEX "issues_version_id_idx" ON "issues"("version_id");

-- CreateIndex
CREATE INDEX "issues_priority_id_idx" ON "issues"("priority_id");

-- CreateIndex
CREATE INDEX "issues_issue_type_id_idx" ON "issues"("issue_type_id");

-- CreateIndex
CREATE INDEX "issues_deleted_at_idx" ON "issues"("deleted_at");

-- CreateIndex
CREATE INDEX "issues_created_at_idx" ON "issues"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "issues_project_id_issue_number_key" ON "issues"("project_id", "issue_number");

-- CreateIndex
CREATE INDEX "issue_relations_from_issue_id_idx" ON "issue_relations"("from_issue_id");

-- CreateIndex
CREATE INDEX "issue_relations_to_issue_id_idx" ON "issue_relations"("to_issue_id");

-- CreateIndex
CREATE UNIQUE INDEX "issue_relations_from_issue_id_to_issue_id_relation_type_key" ON "issue_relations"("from_issue_id", "to_issue_id", "relation_type");

-- CreateIndex
CREATE INDEX "issue_watchers_issue_id_idx" ON "issue_watchers"("issue_id");

-- CreateIndex
CREATE UNIQUE INDEX "issue_watchers_issue_id_user_id_key" ON "issue_watchers"("issue_id", "user_id");

-- CreateIndex
CREATE INDEX "issue_history_issue_id_idx" ON "issue_history"("issue_id");

-- CreateIndex
CREATE INDEX "issue_history_created_at_idx" ON "issue_history"("created_at");

-- CreateIndex
CREATE INDEX "tags_org_id_idx" ON "tags"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_org_id_name_key" ON "tags"("org_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "project_tags_project_id_tag_id_key" ON "project_tags"("project_id", "tag_id");

-- CreateIndex
CREATE INDEX "issue_tags_issue_id_idx" ON "issue_tags"("issue_id");

-- CreateIndex
CREATE UNIQUE INDEX "issue_tags_issue_id_tag_id_key" ON "issue_tags"("issue_id", "tag_id");

-- CreateIndex
CREATE INDEX "custom_fields_org_id_idx" ON "custom_fields"("org_id");

-- CreateIndex
CREATE INDEX "issue_custom_field_values_issue_id_idx" ON "issue_custom_field_values"("issue_id");

-- CreateIndex
CREATE INDEX "issue_custom_field_values_custom_field_id_idx" ON "issue_custom_field_values"("custom_field_id");

-- CreateIndex
CREATE UNIQUE INDEX "issue_custom_field_values_issue_id_custom_field_id_key" ON "issue_custom_field_values"("issue_id", "custom_field_id");

-- CreateIndex
CREATE INDEX "sprints_project_id_idx" ON "sprints"("project_id");

-- CreateIndex
CREATE INDEX "sprints_status_idx" ON "sprints"("status");

-- CreateIndex
CREATE INDEX "versions_project_id_idx" ON "versions"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "versions_project_id_name_key" ON "versions"("project_id", "name");

-- CreateIndex
CREATE INDEX "boards_project_id_idx" ON "boards"("project_id");

-- CreateIndex
CREATE INDEX "workflows_project_id_idx" ON "workflows"("project_id");

-- CreateIndex
CREATE INDEX "workflow_transitions_workflow_id_idx" ON "workflow_transitions"("workflow_id");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_transitions_workflow_id_from_status_id_to_status_i_key" ON "workflow_transitions"("workflow_id", "from_status_id", "to_status_id");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_issue_type_mappings_workflow_id_issue_type_id_key" ON "workflow_issue_type_mappings"("workflow_id", "issue_type_id");

-- CreateIndex
CREATE INDEX "comments_issue_id_idx" ON "comments"("issue_id");

-- CreateIndex
CREATE INDEX "comments_user_id_idx" ON "comments"("user_id");

-- CreateIndex
CREATE INDEX "comments_parent_id_idx" ON "comments"("parent_id");

-- CreateIndex
CREATE INDEX "comments_deleted_at_idx" ON "comments"("deleted_at");

-- CreateIndex
CREATE INDEX "attachments_issue_id_idx" ON "attachments"("issue_id");

-- CreateIndex
CREATE INDEX "time_entries_issue_id_idx" ON "time_entries"("issue_id");

-- CreateIndex
CREATE INDEX "time_entries_user_id_idx" ON "time_entries"("user_id");

-- CreateIndex
CREATE INDEX "time_entries_logged_date_idx" ON "time_entries"("logged_date");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "notification_preferences_user_id_idx" ON "notification_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_event_type_channel_key" ON "notification_preferences"("user_id", "event_type", "channel");

-- CreateIndex
CREATE INDEX "automations_project_id_idx" ON "automations"("project_id");

-- CreateIndex
CREATE INDEX "automations_is_active_idx" ON "automations"("is_active");

-- CreateIndex
CREATE INDEX "automation_executions_automation_id_idx" ON "automation_executions"("automation_id");

-- CreateIndex
CREATE INDEX "automation_executions_executed_at_idx" ON "automation_executions"("executed_at");

-- CreateIndex
CREATE INDEX "saved_filters_user_id_idx" ON "saved_filters"("user_id");

-- CreateIndex
CREATE INDEX "saved_filters_project_id_idx" ON "saved_filters"("project_id");

-- CreateIndex
CREATE INDEX "audit_logs_org_id_idx" ON "audit_logs"("org_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_resource_type_resource_id_idx" ON "audit_logs"("resource_type", "resource_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- AddForeignKey
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_sso_configs" ADD CONSTRAINT "organization_sso_configs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_appearances" ADD CONSTRAINT "organization_appearances_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_storage_configs" ADD CONSTRAINT "organization_storage_configs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_notification_configs" ADD CONSTRAINT "organization_notification_configs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_settings" ADD CONSTRAINT "project_settings_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_working_days" ADD CONSTRAINT "project_working_days_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_estimations" ADD CONSTRAINT "project_estimations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_appearances" ADD CONSTRAINT "project_appearances_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_notification_settings" ADD CONSTRAINT "project_notification_settings_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_settings" ADD CONSTRAINT "space_settings_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_working_days" ADD CONSTRAINT "space_working_days_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_estimations" ADD CONSTRAINT "space_estimations_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_board_configs" ADD CONSTRAINT "space_board_configs_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statuses" ADD CONSTRAINT "statuses_status_group_id_fkey" FOREIGN KEY ("status_group_id") REFERENCES "status_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_statuses" ADD CONSTRAINT "project_statuses_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_statuses" ADD CONSTRAINT "project_statuses_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_issue_types" ADD CONSTRAINT "project_issue_types_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_issue_types" ADD CONSTRAINT "project_issue_types_issue_type_id_fkey" FOREIGN KEY ("issue_type_id") REFERENCES "issue_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_priorities" ADD CONSTRAINT "project_priorities_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_priorities" ADD CONSTRAINT "project_priorities_priority_id_fkey" FOREIGN KEY ("priority_id") REFERENCES "priorities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_issue_type_id_fkey" FOREIGN KEY ("issue_type_id") REFERENCES "issue_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_priority_id_fkey" FOREIGN KEY ("priority_id") REFERENCES "priorities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "issues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_epic_id_fkey" FOREIGN KEY ("epic_id") REFERENCES "issues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_sprint_id_fkey" FOREIGN KEY ("sprint_id") REFERENCES "sprints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_relations" ADD CONSTRAINT "issue_relations_from_issue_id_fkey" FOREIGN KEY ("from_issue_id") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_relations" ADD CONSTRAINT "issue_relations_to_issue_id_fkey" FOREIGN KEY ("to_issue_id") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_watchers" ADD CONSTRAINT "issue_watchers_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_watchers" ADD CONSTRAINT "issue_watchers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_history" ADD CONSTRAINT "issue_history_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tags" ADD CONSTRAINT "project_tags_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tags" ADD CONSTRAINT "project_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_tags" ADD CONSTRAINT "issue_tags_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_tags" ADD CONSTRAINT "issue_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_fields" ADD CONSTRAINT "custom_fields_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_custom_field_values" ADD CONSTRAINT "issue_custom_field_values_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_custom_field_values" ADD CONSTRAINT "issue_custom_field_values_custom_field_id_fkey" FOREIGN KEY ("custom_field_id") REFERENCES "custom_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "versions" ADD CONSTRAINT "versions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "boards_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_transitions" ADD CONSTRAINT "workflow_transitions_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_transitions" ADD CONSTRAINT "workflow_transitions_from_status_id_fkey" FOREIGN KEY ("from_status_id") REFERENCES "statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_transitions" ADD CONSTRAINT "workflow_transitions_to_status_id_fkey" FOREIGN KEY ("to_status_id") REFERENCES "statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_issue_type_mappings" ADD CONSTRAINT "workflow_issue_type_mappings_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_issue_type_mappings" ADD CONSTRAINT "workflow_issue_type_mappings_issue_type_id_fkey" FOREIGN KEY ("issue_type_id") REFERENCES "issue_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automations" ADD CONSTRAINT "automations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_executions" ADD CONSTRAINT "automation_executions_automation_id_fkey" FOREIGN KEY ("automation_id") REFERENCES "automations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_filters" ADD CONSTRAINT "saved_filters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_filters" ADD CONSTRAINT "saved_filters_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
