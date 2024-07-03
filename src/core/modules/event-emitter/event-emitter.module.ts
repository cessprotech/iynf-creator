import { EventEmitterModule } from '@nestjs/event-emitter';
import EVENTS_CONFIG from './event-emitter.config';

export const EventEmitModule = EventEmitterModule.forRoot(EVENTS_CONFIG);
