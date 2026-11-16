# Roadmap — autosearch.km.ua

Audit 2026-11-16. The live origin does not resolve. No content cluster until a crawl captures real HTML.

## Critical

- [ ] Restore `autosearch.km.ua` at NIC.UA (status `inactive` / `RedemptionPeriod`, expiry 2026-10-15) and publish DNS so `https://autosearch.km.ua/` answers

## High

- [ ] Re-run `seoagent crawl` after the apex resolves, then finish the on-page audit (titles, canonicals, schema, robots, sitemap)
- [ ] Confirm live `/robots.txt` (absolute `Sitemap:` line) and `/sitemap.xml` — both were unreachable, not proven absent in the app

## Medium

- [ ] After the site responds: check `/llms.txt` and `/.well-known/okf/index.md` (AI-search files were not fetched)
- [ ] Connect Search Console (`seoagent login` then `seoagent gsc connect`) so indexing coverage is a verdict, not a guess

## Content plan

Blocked. No keyword or article work until the origin returns HTML. The 2026-11-16 crawl captured 0 pages.
