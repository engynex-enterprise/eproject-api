import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { UpdateNotificationPreferencesDto } from './dto/update-preferences.dto.js';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findUserNotifications(userId: string) {
    const numUserId = Number(userId);

    return this.prisma.notification.findMany({
      where: { userId: numUserId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    const numNotificationId = Number(notificationId);
    const numUserId = Number(userId);

    const notification = await this.prisma.notification.findFirst({
      where: { id: numNotificationId, userId: numUserId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id: numNotificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    const numUserId = Number(userId);

    await this.prisma.notification.updateMany({
      where: { userId: numUserId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return { message: 'All notifications marked as read' };
  }

  async getPreferences(userId: string) {
    const numUserId = Number(userId);

    const preferences = await this.prisma.notificationPreference.findMany({
      where: { userId: numUserId },
    });

    return preferences;
  }

  async updatePreferences(userId: string, dto: UpdateNotificationPreferencesDto) {
    const numUserId = Number(userId);

    // dto is expected to contain eventType, channel, isEnabled
    // Upsert the preference record
    if (dto.eventType && dto.channel) {
      const existing = await this.prisma.notificationPreference.findFirst({
        where: {
          userId: numUserId,
          eventType: dto.eventType,
          channel: dto.channel,
        },
      });

      if (existing) {
        return this.prisma.notificationPreference.update({
          where: { id: existing.id },
          data: {
            isEnabled: dto.isEnabled ?? true,
          },
        });
      }

      return this.prisma.notificationPreference.create({
        data: {
          userId: numUserId,
          eventType: dto.eventType,
          channel: dto.channel,
          isEnabled: dto.isEnabled ?? true,
        },
      });
    }

    // If bulk preferences provided as an array
    if (dto.preferences && Array.isArray(dto.preferences)) {
      const results = [];
      for (const pref of dto.preferences) {
        const existing = await this.prisma.notificationPreference.findFirst({
          where: {
            userId: numUserId,
            eventType: pref.eventType,
            channel: pref.channel,
          },
        });

        if (existing) {
          results.push(
            await this.prisma.notificationPreference.update({
              where: { id: existing.id },
              data: { isEnabled: pref.isEnabled },
            }),
          );
        } else {
          results.push(
            await this.prisma.notificationPreference.create({
              data: {
                userId: numUserId,
                eventType: pref.eventType,
                channel: pref.channel,
                isEnabled: pref.isEnabled ?? true,
              },
            }),
          );
        }
      }
      return results;
    }

    return this.getPreferences(userId);
  }

  /**
   * Creates a notification (used internally by event handlers)
   */
  async createNotification(data: {
    userId: number;
    type: string;
    title: string;
    body?: string;
    resourceType?: string;
    resourceId?: number;
    channel?: string;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        channel: data.channel ?? 'internal',
      },
    });
  }
}
