/**
 * Inline no-flash script for scroll entrances.
 * Sets `data-ac` on `<html>` before paint so AnimatedContent / deferred shells
 * start hidden (CSS), then React plays the entrance once. Skips when the user
 * prefers reduced motion — content stays visible with no JS class.
 */
export const animInitScript = `(function(){try{if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;document.documentElement.setAttribute('data-ac','');}catch(e){}})();`;
