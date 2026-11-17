import { InlineKeyboard, Keyboard } from 'grammy';

import type { LeadDetail, LeadListResult, LeadStatus, LeadSummary } from '../cms/leads.js';
import { ua } from '../i18n/ua.js';
import { encodeLead, encodeStatus } from './callbacks.js';
import { leadOpenButtonText, statusLabelWithEmoji } from './format.js';

const STATUS_ORDER: LeadStatus[] = ['new', 'in-progress', 'won', 'lost'];

/** One open button owned by a single lead card message. */
export function leadItemKeyboard(doc: LeadSummary): InlineKeyboard {
  return new InlineKeyboard().text(leadOpenButtonText(doc), encodeLead(doc.id));
}

/** Reply keyboard while browsing the leads list (replaces the main menu). */
export function leadsListReplyKeyboard(result: LeadListResult): Keyboard {
  const position = ua.listPosition(
    result.page,
    Math.max(result.totalPages, 1),
    result.totalDocs,
  );
  return new Keyboard()
    .text(ua.prevPage)
    .text(position)
    .text(ua.nextPage)
    .row()
    .text(ua.menuHome)
    .resized()
    .persistent();
}

export function isListPositionButton(text: string): boolean {
  return /^📄 \d+\/\d+ · \d+$/u.test(text);
}

export function leadStatusKeyboard(doc: LeadDetail): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  for (const status of STATUS_ORDER) {
    const label =
      status === doc.status
        ? `✓ ${statusLabelWithEmoji(status)}`
        : statusLabelWithEmoji(status);
    keyboard.text(label, encodeStatus(doc.id, status));
    if (status === 'in-progress' || status === 'lost') keyboard.row();
  }
  return keyboard;
}
