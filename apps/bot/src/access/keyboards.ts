import { Keyboard } from 'grammy';

import { ua } from '../i18n/ua.js';

export function requestAccessKeyboard(): Keyboard {
  return new Keyboard().text(ua.requestAccess).resized().persistent();
}

export function mainMenuKeyboard(): Keyboard {
  return new Keyboard()
    .text(ua.menuLeads)
    .text(ua.menuSearch)
    .row()
    .text(ua.menuFilters)
    .text(ua.menuHelp)
    .resized()
    .persistent();
}

export function clearKeyboard(): { remove_keyboard: true } {
  return { remove_keyboard: true };
}
