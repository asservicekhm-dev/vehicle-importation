---
domain: autosearch.km.ua
audited_at: 2026-11-16T17:25:00Z
pages_audited: 0
pages_discovered: 1
capture_complete: false
critical: 1
high: 3
medium: 0
low: 0
---

# Audit — autosearch.km.ua

Crawled origin: https://autosearch.km.ua at 2026-11-16T17:22:49.362Z (`evidence.md`). **0 of 1 discovered page was captured.** Every rollup in `evidence.md` is a lower bound. No on-page claim (title, meta, canonical, H1, JSON-LD, alt text, robots rules, sitemap URL count) is Confirmed, present or absent.

Indexing coverage not verified (needs the free `seoagent login`, which connects Search Console). No GSC export is in the repo, so no migration plan was run.

## Critical

- [ ] **`autosearch.km.ua` is inactive and in RedemptionPeriod — the site does not resolve** — Google, browsers, and this crawl cannot open the homepage, so nothing on the site can be indexed or cited. (Confirmed)
  - URL: https://autosearch.km.ua/
  - Evidence: whois `autosearch.km.ua` on 2026-11-16 — `status: inactive`, `status: RedemptionPeriod`, `expires: 2026-10-15 09:40:57+03`, `modified: 2026-11-12 14:49:52+02`, registrar NIC.UA (`ua.nic`). Authoritative `dig @ns.km.ua` (193.201.116.1) TXT answer `"inactive,RedemptionPeriod"`; A query AA NOERROR with zero answers. `dig @8.8.8.8 www.autosearch.km.ua A` is NXDOMAIN. Crawl: evidence.md § Pages NOT captured — `fetch failed (ENOTFOUND)`.
  - Recommendation: Restore the name at NIC.UA before redemption ends, then publish A/AAAA (and HTTPS) for the apex. Re-run `seoagent crawl` only after `https://autosearch.km.ua/` returns a page. Until then, titles, schema, and content work cannot affect search.

## High

- [ ] **1 discovered page could not be crawled — evidence is incomplete** — the only discovered URL returned no HTTP response, so this audit cannot see titles, canonicals, or content. (Confirmed)
  - URL: https://autosearch.km.ua/
  - Linked from: none (no crawled page links to it; it was the origin itself)
  - Evidence: evidence.md § Pages NOT captured — `https://autosearch.km.ua/ — network error: fetch failed (ENOTFOUND)`. findings.md check `crawl_incomplete`.
  - Recommendation: Same root cause as the critical finding. After the domain resolves, re-run `seoagent crawl` before treating any on-page check as passed or failed.

- [ ] **robots.txt is missing or unreachable** — the fetch never reached a server, so crawlers get no directives and no sitemap pointer from this host. Absence of the file inside the app is not Confirmed. (Confirmed)
  - URL: https://autosearch.km.ua/robots.txt
  - Evidence: evidence.md § robots.txt — `Not fetched (HTTP network error). Do NOT assert any robots.txt rule`. findings.md check `robots_txt_missing`.
  - Recommendation: After DNS is restored, confirm the live `/robots.txt` returns 200 with `User-agent: *`, `Allow: /`, and an absolute `Sitemap: https://autosearch.km.ua/sitemap.xml`. Do not treat the file as missing from the repo until that fetch succeeds.

- [ ] **sitemap.xml is missing or unreachable** — the fetch never reached a server, so search engines cannot discover URLs from a sitemap on this host. A missing generator in the app is not Confirmed. (Confirmed)
  - URL: https://autosearch.km.ua/sitemap.xml
  - Evidence: evidence.md § sitemap.xml — `Not fetched (HTTP network error). Do NOT assert a sitemap URL count`. findings.md check `sitemap_missing`.
  - Recommendation: After DNS is restored, confirm `/sitemap.xml` is valid XML listing canonical public URLs, then submit it in Google Search Console.

## Not verified (no live HTML)

These checks were not run as Confirmed, because the origin did not resolve. Do not add titles, meta descriptions, canonicals, Open Graph, Twitter cards, or JSON-LD from this audit.

- Indexing coverage — not verified (no `seoagent login` / Search Console).
- `/llms.txt` and `/.well-known/okf/index.md` — not fetched (same ENOTFOUND). A bundle that exists only in `.seoagent/okf/` is not served.
- Core Web Vitals, viewport, heading outline, image alt, word count, internal links — no captured HTML.
- HTTP→HTTPS redirect — not checked; there is no A record to connect to.

## What's Working

- The name still exists at the registrar (created 2023-10-15, status RedemptionPeriod rather than deleted), so a restore is still the registrar's process, not a brand-new registration. Evidence: whois on 2026-11-16.
- Public DNS matches the registrar: authoritative `ns.km.ua` publishes the redemption TXT and no A record, and Google Public DNS (`8.8.8.8`) agrees. This is not a local resolver glitch. Evidence: `dig @ns.km.ua` and `dig @8.8.8.8` on 2026-11-16.
- The crawl did not invent on-page gaps. With 0 pages captured, `evidence.md` refuses canonical, meta, H1, JSON-LD, and alt claims. Evidence: evidence.md § Site-wide rollup and § https://autosearch.km.ua/ — `No claims about this page are Confirmed.`
