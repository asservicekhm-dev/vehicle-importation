import { InlineKeyboard, Keyboard } from 'grammy';

import type { LeadDetail, LeadListResult, LeadStatus, LeadSummary } from '../cms/leads.js';
import { ua } from '../i18n/ua.js';
import type { ChatSession } from '../session.js';
import {
  encodeFilterApply,
  encodeFilterBrand,
  encodeFilterDate,
  encodeFilterOrigin,
  encodeFilterReset,
  encodeFilterStatus,
  encodeFilterType,
  encodeLead,
  encodeStatus,
} from './callbacks.js';
import {
  FILTER_BRANDS,
  FILTER_DATES,
  FILTER_ORIGINS,
  FILTER_STATUSES,
  FILTER_TYPES,
} from './filterOptions.js';
import { leadOpenButtonText, statusLabelWithEmoji } from './format.js';

const STATUS_ORDER: LeadStatus[] = ['new', 'in-progress', 'won', 'lost'];

/** Max 2 buttons per row so labels stay readable on mobile. */
const COLS = 2;

function markSelected(label: string, selected: boolean): string {
  return selected ? `✓ ${label}` : label;
}

function addMultiRows(
  keyboard: InlineKeyboard,
  options: Array<{ value: string; label: string }>,
  selected: string[],
  encode: (value: string | undefined) => string,
): void {
  for (let i = 0; i < options.length; i += COLS) {
    const slice = options.slice(i, i + COLS);
    for (const opt of slice) {
      keyboard.text(
        markSelected(opt.label, selected.includes(opt.value)),
        encode(opt.value),
      );
    }
    keyboard.row();
  }
}

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

/**
 * Inline filter panel.
 * Status / type / origin / brand = multi-select; date = single-select.
 * Two columns so button text fits.
 */
export function filtersKeyboard(session: ChatSession): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  addMultiRows(
    keyboard,
    FILTER_STATUSES,
    session.statuses,
    (value) =>
      encodeFilterStatus(
        value as (typeof FILTER_STATUSES)[number]['value'] | undefined,
      ),
  );
  keyboard
    .text(
      markSelected(ua.filterAnyStatus, session.statuses.length === 0),
      encodeFilterStatus(undefined),
    )
    .row();

  addMultiRows(keyboard, FILTER_TYPES, session.types, encodeFilterType);
  keyboard
    .text(
      markSelected(ua.filterAnyType, session.types.length === 0),
      encodeFilterType(undefined),
    )
    .row();

  addMultiRows(keyboard, FILTER_ORIGINS, session.origins, encodeFilterOrigin);
  keyboard
    .text(
      markSelected(ua.filterAnyOrigin, session.origins.length === 0),
      encodeFilterOrigin(undefined),
    )
    .row();

  addMultiRows(keyboard, FILTER_BRANDS, session.carBrands, encodeFilterBrand);
  keyboard
    .text(
      markSelected(ua.filterAnyBrand, session.carBrands.length === 0),
      encodeFilterBrand(undefined),
    )
    .row();

  for (let i = 0; i < FILTER_DATES.length; i += COLS) {
    const slice = FILTER_DATES.slice(i, i + COLS);
    for (const opt of slice) {
      keyboard.text(
        markSelected(opt.label, session.datePreset === opt.value),
        encodeFilterDate(opt.value),
      );
    }
    keyboard.row();
  }

  keyboard
    .text(ua.filterApply, encodeFilterApply())
    .text(ua.filterReset, encodeFilterReset());

  return keyboard;
}
