import { CLASSIC_TEMPLATE_SLOTS, timelineDefaults } from './classic';
import type { TimelineSlot } from '../types';

export type TemplateId = 'classic';

export function getTemplateSlots(templateId: TemplateId = 'classic'): TimelineSlot[] {
  switch (templateId) {
    case 'classic':
    default:
      return CLASSIC_TEMPLATE_SLOTS;
  }
}

export { CLASSIC_TEMPLATE_SLOTS, timelineDefaults };
