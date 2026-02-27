import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'events';

@Injectable()
export class EventEmitterService {
  private readonly logger = new Logger(EventEmitterService.name);
  private readonly emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  emit(event: string, payload: unknown): void {
    this.logger.debug(`Emitting event: ${event}`);
    this.emitter.emit(event, payload);
  }

  on(event: string, listener: (...args: unknown[]) => void): void {
    this.emitter.on(event, listener);
  }

  off(event: string, listener: (...args: unknown[]) => void): void {
    this.emitter.off(event, listener);
  }

  once(event: string, listener: (...args: unknown[]) => void): void {
    this.emitter.once(event, listener);
  }
}
