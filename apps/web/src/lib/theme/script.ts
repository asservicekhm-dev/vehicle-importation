import { THEME_COLOR } from './constants';
import { APPLE_TOUCH_LINK_ID, FAVICON_LINK_ID } from './icons';

/**
 * Inline no-flash script. Keep in sync with `client.ts` / `icons.ts` resolve logic.
 * Reads `data-theme-pref` on `<html>` and resolves `system` via matchMedia before paint.
 * Also swaps favicon / apple-touch links from `data-favicon-*` / `data-apple-touch-*`.
 */
export const themeInitScript = `(function(){try{var r=document.documentElement;var p=r.getAttribute('data-theme-pref')||'system';var t=p==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p;r.setAttribute('data-theme',t);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='dark'?'${THEME_COLOR.dark}':'${THEME_COLOR.light}');var f=t==='dark'?(r.getAttribute('data-favicon-dark')||r.getAttribute('data-favicon-light')):(r.getAttribute('data-favicon-light')||r.getAttribute('data-favicon-dark'));var a=t==='dark'?(r.getAttribute('data-apple-touch-dark')||r.getAttribute('data-apple-touch-light')):(r.getAttribute('data-apple-touch-light')||r.getAttribute('data-apple-touch-dark'));var fl=document.getElementById('${FAVICON_LINK_ID}');if(fl&&f)fl.setAttribute('href',f);var al=document.getElementById('${APPLE_TOUCH_LINK_ID}');if(al&&a)al.setAttribute('href',a);}catch(e){}})();`;
