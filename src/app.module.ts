import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

// Config & Database
import { ConfigModule } from './config/config.module.js';
import { DatabaseModule } from './database/database.module.js';

// Shared
import { EventsModule } from './shared/events/events.module.js';
import { CacheModule } from './shared/cache/cache.module.js';

// Guards
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';

// Interceptors
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor.js';

// App
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { OrganizationsModule } from './modules/organizations/organizations.module.js';
import { ProjectsModule } from './modules/projects/projects.module.js';
import { SpacesModule } from './modules/spaces/spaces.module.js';
import { IssuesModule } from './modules/issues/issues.module.js';
import { SprintsModule } from './modules/sprints/sprints.module.js';
import { VersionsModule } from './modules/versions/versions.module.js';
import { BoardsModule } from './modules/boards/boards.module.js';
import { WorkflowsModule } from './modules/workflows/workflows.module.js';
import { StatusesModule } from './modules/statuses/statuses.module.js';
import { RolesModule } from './modules/roles/roles.module.js';
import { PermissionsModule } from './modules/permissions/permissions.module.js';
import { TagsModule } from './modules/tags/tags.module.js';
import { CommentsModule } from './modules/comments/comments.module.js';
import { AttachmentsModule } from './modules/attachments/attachments.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { ReportsModule } from './modules/reports/reports.module.js';
import { AutomationsModule } from './modules/automations/automations.module.js';
import { TimelineModule } from './modules/timeline/timeline.module.js';
import { FiltersModule } from './modules/filters/filters.module.js';
import { AppearanceModule } from './modules/appearance/appearance.module.js';
import { NotificationConfigModule } from './modules/notification-config/notification-config.module.js';
import { AuditLogModule } from './modules/audit-log/audit-log.module.js';
import { WorkingDaysModule } from './modules/working-days/working-days.module.js';
import { EstimationsModule } from './modules/estimations/estimations.module.js';

@Module({
  imports: [
    // Infrastructure
    ConfigModule,
    DatabaseModule,
    EventsModule,
    CacheModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Feature Modules
    AuthModule,
    UsersModule,
    OrganizationsModule,
    ProjectsModule,
    SpacesModule,
    IssuesModule,
    SprintsModule,
    VersionsModule,
    BoardsModule,
    WorkflowsModule,
    StatusesModule,
    RolesModule,
    PermissionsModule,
    TagsModule,
    CommentsModule,
    AttachmentsModule,
    NotificationsModule,
    ReportsModule,
    AutomationsModule,
    TimelineModule,
    FiltersModule,
    AppearanceModule,
    NotificationConfigModule,
    AuditLogModule,
    WorkingDaysModule,
    EstimationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global JWT Auth Guard - all routes require auth by default
    // Use @Public() decorator to mark public endpoints
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global rate limiting
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global response wrapper: { success, data, timestamp }
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
  ],
})
export class AppModule {}
