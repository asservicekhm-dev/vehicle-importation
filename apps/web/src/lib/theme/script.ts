import { THEME_COLOR } from './constants';

/**
 * Inline no-flash script. Keep in sync with `client.ts` resolve logic.
 * Reads `data-theme-pref` on `<html>` and resolves `system` via matchMedia before paint.
 */
export const themeInitScript = `(function(){try{var p=document.documentElement.getAttribute('data-theme-pref')||'system';var t=p==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p;document.documentElement.setAttribute('data-theme',t);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='dark'?'${THEME_COLOR.dark}':'${THEME_COLOR.light}');}catch(e){}})();`;
